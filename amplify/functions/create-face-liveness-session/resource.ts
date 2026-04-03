import { defineFunction } from '@aws-amplify/backend';

export const createFaceLivenessSession = defineFunction({
  name: 'create-face-liveness-session',
  entry: './handler.ts',
  timeoutSeconds: 30,
  runtime: 20,
});
