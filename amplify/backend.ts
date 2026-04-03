import { defineBackend } from '@aws-amplify/backend';
import { PolicyStatement } from 'aws-cdk-lib/aws-iam';
import { auth } from './auth/resource';
import { data } from './data/resource';
import { createFaceLivenessSession } from './functions/create-face-liveness-session/resource';
import { getFaceLivenessSessionResults } from './functions/get-face-liveness-session-results/resource';

const backend = defineBackend({
  auth,
  data,
  createFaceLivenessSession,
  getFaceLivenessSessionResults,
});

const createClientStartSessionStatement = () =>
  new PolicyStatement({
    actions: ['rekognition:StartFaceLivenessSession'],
    resources: ['*'],
  });

backend.auth.resources.unauthenticatedUserIamRole.addToPrincipalPolicy(
  createClientStartSessionStatement(),
);
backend.auth.resources.authenticatedUserIamRole.addToPrincipalPolicy(
  createClientStartSessionStatement(),
);

backend.createFaceLivenessSession.resources.lambda.addToRolePolicy(
  new PolicyStatement({
    actions: [
      'rekognition:CreateFaceLivenessSession',
      'rekognition:GetFaceLivenessSessionResults',
    ],
    resources: ['*'],
  }),
);
backend.getFaceLivenessSessionResults.resources.lambda.addToRolePolicy(
  new PolicyStatement({
    actions: [
      'rekognition:CreateFaceLivenessSession',
      'rekognition:GetFaceLivenessSessionResults',
    ],
    resources: ['*'],
  }),
);
