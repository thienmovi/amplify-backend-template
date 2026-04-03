import {
  GetFaceLivenessSessionResultsCommand,
  RekognitionClient,
} from '@aws-sdk/client-rekognition';
import type { Schema } from '../../data/resource';

const rekognition = new RekognitionClient({
  region: process.env.AWS_REGION,
});

const threshold = Number(process.env.LIVENESS_CONFIDENCE_THRESHOLD ?? '90');

export const handler: Schema['getFaceLivenessSessionResults']['functionHandler'] =
  async (event) => {
    const sessionId = event.arguments.sessionId;

    const response = await rekognition.send(
      new GetFaceLivenessSessionResultsCommand({
        SessionId: sessionId,
      }),
    );

    const confidence = response.Confidence ?? 0;
    const status = response.Status ?? 'UNKNOWN';

    return {
      sessionId,
      confidence,
      status,
      isLive: status === 'SUCCEEDED' && confidence >= threshold,
    };
  };
