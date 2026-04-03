import { Amplify } from 'aws-amplify';
import { parseAmplifyConfig } from 'aws-amplify/utils';

export type BrowserAmplifyOutputs = {
  auth?: {
    user_pool_id?: string;
    user_pool_client_id?: string;
    identity_pool_id?: string;
    unauthenticated_identities_enabled?: boolean;
  };
  data?: {
    aws_region?: string;
    url?: string;
  };
};

let configured = false;

export async function loadAmplifyOutputs(): Promise<BrowserAmplifyOutputs> {
  const response = await fetch('/amplify_outputs.json', { cache: 'no-store' });

  if (!response.ok) {
    throw new Error('Missing amplify_outputs.json.');
  }

  const outputs = (await response.json()) as BrowserAmplifyOutputs;

  if (!outputs.auth?.identity_pool_id || !outputs.data?.aws_region) {
    throw new Error('Amplify outputs are not ready yet.');
  }

  return outputs;
}

export async function configureAmplify(): Promise<BrowserAmplifyOutputs> {
  const outputs = await loadAmplifyOutputs();

  if (!configured) {
    Amplify.configure(parseAmplifyConfig(outputs));
    configured = true;
  }

  return outputs;
}
