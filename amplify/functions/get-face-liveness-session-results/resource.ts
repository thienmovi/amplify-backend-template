import { defineFunction } from '@aws-amplify/backend';

export const getFaceLivenessSessionResults = defineFunction({
  name: 'get-face-liveness-session-results',
  entry: './handler.ts',
  timeoutSeconds: 30,
  runtime: 20,
  environment: {
    LIVENESS_CONFIDENCE_THRESHOLD: '90',
  },
});
