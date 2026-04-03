import { type ComponentProps, useEffect, useState } from 'react';
import { generateClient } from 'aws-amplify/data';
import { FaceLivenessDetector } from '@aws-amplify/ui-react-liveness';
import type { Schema } from '../amplify/data/resource';
import {
  type BrowserAmplifyOutputs,
  configureAmplify,
} from './amplify-config';

const client = generateClient<Schema>();

type ConfigState = 'loading' | 'ready' | 'missing' | 'error';

type LivenessResult = {
  sessionId: string;
  confidence?: number | null;
  status: string;
  isLive: boolean;
};

type DetectorErrorHandler = NonNullable<
  ComponentProps<typeof FaceLivenessDetector>['onError']
>;

export default function App() {
  const [configState, setConfigState] = useState<ConfigState>('loading');
  const [configError, setConfigError] = useState<string | null>(null);
  const [outputs, setOutputs] = useState<BrowserAmplifyOutputs | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [result, setResult] = useState<LivenessResult | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function initialize() {
      try {
        const nextOutputs = await configureAmplify();

        if (cancelled) {
          return;
        }

        setOutputs(nextOutputs);
        setConfigState('ready');
        setConfigError(null);
      } catch (error) {
        if (cancelled) {
          return;
        }

        const nextError =
          error instanceof Error ? error.message : 'Unknown configuration error.';

        setConfigError(nextError);
        setConfigState(
          nextError.includes('not ready') || nextError.includes('Missing')
            ? 'missing'
            : 'error',
        );
      }
    }

    void initialize();

    return () => {
      cancelled = true;
    };
  }, []);

  const region = outputs?.data?.aws_region ?? 'us-east-1';

  async function createSession() {
    setBusy(true);
    setMessage(null);
    setResult(null);

    try {
      const response = await client.mutations.createFaceLivenessSession({
        authMode: 'identityPool',
      });

      if (response.errors?.length) {
        throw new Error(response.errors[0]?.message ?? 'Could not create a liveness session.');
      }

      if (!response.data?.sessionId) {
        throw new Error('The backend did not return a session ID.');
      }

      setSessionId(response.data.sessionId);
    } catch (error) {
      const nextError =
        error instanceof Error ? error.message : 'Could not create a liveness session.';
      setMessage(nextError);
      setSessionId(null);
    } finally {
      setBusy(false);
    }
  }

  async function handleAnalysisComplete() {
    if (!sessionId) {
      return;
    }

    setBusy(true);
    setMessage('Analysis complete. Fetching server-side result...');

    try {
      const response = await client.queries.getFaceLivenessSessionResults(
        { sessionId },
        { authMode: 'identityPool' },
      );

      if (response.errors?.length) {
        throw new Error(
          response.errors[0]?.message ?? 'Could not read liveness results.',
        );
      }

      if (!response.data) {
        throw new Error('The backend returned an empty liveness result.');
      }

      setResult(response.data);
      setMessage(null);
      setSessionId(null);
    } catch (error) {
      const nextError =
        error instanceof Error ? error.message : 'Could not read liveness results.';
      setMessage(nextError);
    } finally {
      setBusy(false);
    }
  }

  function handleDetectorError(...[error]: Parameters<DetectorErrorHandler>) {
    setSessionId(null);
    setResult(null);
    setMessage(error.error.message);
    setBusy(false);
  }

  function handleCancel() {
    setSessionId(null);
    setMessage('The liveness check was cancelled.');
    setBusy(false);
  }

  return (
    <main className="shell">
      <section className="panel hero">
        <p className="eyebrow">AWS Rekognition</p>
        <h1>Face Liveness Web Demo</h1>
        <p className="lede">
          This app creates a backend liveness session, streams the browser camera
          challenge with Amplify UI, then reads the Rekognition result from the
          backend.
        </p>
      </section>

      <section className="workspace">
        <article className="panel controls">
          <h2>Session Control</h2>
          <p className="meta">
            Region: <strong>{region}</strong>
          </p>

          {configState === 'loading' && (
            <p className="status">Loading Amplify configuration...</p>
          )}

          {configState === 'missing' && (
            <div className="notice warning">
              <p>Amplify outputs are not available yet.</p>
              <ol>
                <li>Run <code>npm run sandbox</code> to deploy the backend.</li>
                <li>Restart <code>npm run dev</code> after <code>amplify_outputs.json</code> is generated.</li>
              </ol>
              {configError && <p className="status">{configError}</p>}
            </div>
          )}

          {configState === 'error' && (
            <div className="notice error">
              <p>Amplify configuration failed.</p>
              {configError && <p className="status">{configError}</p>}
            </div>
          )}

          {configState === 'ready' && !sessionId && (
            <button className="primary-button" disabled={busy} onClick={() => void createSession()}>
              {busy ? 'Creating session...' : 'Start face liveness check'}
            </button>
          )}

          {message && <p className="status">{message}</p>}

          {result && (
            <div className={`result-card ${result.isLive ? 'pass' : 'fail'}`}>
              <p className="result-label">{result.isLive ? 'Live face confirmed' : 'Verification failed'}</p>
              <h3>{result.confidence?.toFixed(2) ?? '0.00'}%</h3>
              <p>Status: {result.status}</p>
              <p>Session: {result.sessionId}</p>
              <button className="secondary-button" onClick={() => void createSession()}>
                Run another check
              </button>
            </div>
          )}
        </article>

        <article className="panel detector">
          <h2>Camera Flow</h2>
          {!sessionId && <p className="placeholder">Create a session to launch the detector.</p>}
          {sessionId && (
            <FaceLivenessDetector
              sessionId={sessionId}
              region={region}
              onAnalysisComplete={handleAnalysisComplete}
              onError={handleDetectorError}
              onUserCancel={handleCancel}
            />
          )}
        </article>
      </section>
    </main>
  );
}
