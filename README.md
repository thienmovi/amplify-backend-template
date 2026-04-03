## Amplify Face Liveness Demo

This project turns the original Amplify Gen 2 starter into a minimal web app for Amazon Rekognition Face Liveness.

What it includes:

- Cognito auth with an identity pool for browser credentials.
- AppSync custom operations for creating a liveness session and reading the result.
- Lambda handlers that call `CreateFaceLivenessSession` and `GetFaceLivenessSessionResults`.
- A Vite + React frontend that uses Amplify UI `FaceLivenessDetector`.

## Prerequisites

- Node.js 20+
- An AWS account configured for Amplify Gen 2
- A Rekognition Face Liveness supported AWS region

Reference docs:

- [Amazon Rekognition Face Liveness API](https://docs.aws.amazon.com/rekognition/latest/dg/face-liveness-programming-api.html)
- [Amplify UI Face Liveness for React](https://ui.docs.amplify.aws/react/connected-components/liveness?platform=react)

## Local Setup

1. Install dependencies:

```bash
npm install
```

2. Start the Amplify sandbox and deploy the backend:

```bash
npm run sandbox
```

This generates `amplify_outputs.json` in the project root.

3. In a second terminal, start the web app:

```bash
npm run dev
```

Open the local Vite URL shown in the terminal.

## How It Works

1. The frontend calls the GraphQL mutation `createFaceLivenessSession`.
2. The backend Lambda creates a Rekognition Face Liveness session and returns `sessionId`.
3. The frontend passes that `sessionId` into `FaceLivenessDetector`.
4. Amplify UI performs `StartFaceLivenessSession` from the browser using Cognito identity-pool credentials.
5. When analysis completes, the frontend calls `getFaceLivenessSessionResults`.
6. The backend evaluates the confidence score against a `90` threshold and returns `isLive`.

## Notes

- Face liveness session IDs are single-use. Every retry must create a new session.
- The backend and frontend must use the same AWS region.
- If `amplify_outputs.json` was missing when `npm run dev` started, restart the dev server after the sandbox finishes.

## Security

See [CONTRIBUTING](CONTRIBUTING.md#security-issue-notifications) for more information.

## License

This library is licensed under the MIT-0 License. See the LICENSE file.
