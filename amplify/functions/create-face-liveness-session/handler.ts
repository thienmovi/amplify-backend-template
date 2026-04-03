import {
  CreateFaceLivenessSessionCommand,
  RekognitionClient,
} from '@aws-sdk/client-rekognition';
import type { Schema } from '../../data/resource';

const rekognition = new RekognitionClient({
  region: process.env.AWS_REGION,
});

export const handler: Schema['createFaceLivenessSession']['functionHandler'] =
  async () => {
    const response = await rekognition.send(
      new CreateFaceLivenessSessionCommand({
        Settings: {
          AuditImagesLimit: 2,
        },
      }),
    );

    if (!response.SessionId) {
      throw new Error('Rekognition did not return a liveness session ID.');
    }

    return {
      sessionId: response.SessionId,
    };
  };
