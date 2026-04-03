import { type ClientSchema, a, defineData } from "@aws-amplify/backend";
import { createFaceLivenessSession } from "../functions/create-face-liveness-session/resource";
import { getFaceLivenessSessionResults } from "../functions/get-face-liveness-session-results/resource";

/*== STEP 1 ===============================================================
The section below creates a Todo database table with a "content" field. Try
adding a new "isDone" field as a boolean. The authorization rule below
specifies that any user authenticated via an API key can "create", "read",
"update", and "delete" any "Todo" records.
=========================================================================*/
const schema = a.schema({
  CreateFaceLivenessSessionResponse: a.customType({
    sessionId: a.string().required(),
  }),
  GetFaceLivenessSessionResultsResponse: a.customType({
    sessionId: a.string().required(),
    confidence: a.float(),
    status: a.string().required(),
    isLive: a.boolean().required(),
  }),
  createFaceLivenessSession: a
    .mutation()
    .returns(a.ref("CreateFaceLivenessSessionResponse"))
    .authorization((allow) => [
      allow.guest(),
      allow.authenticated("identityPool"),
    ])
    .handler(a.handler.function(createFaceLivenessSession)),
  getFaceLivenessSessionResults: a
    .query()
    .arguments({
      sessionId: a.string().required(),
    })
    .returns(a.ref("GetFaceLivenessSessionResultsResponse"))
    .authorization((allow) => [
      allow.guest(),
      allow.authenticated("identityPool"),
    ])
    .handler(a.handler.function(getFaceLivenessSessionResults)),
  Todo: a
    .model({
      content: a.string(),
    })
    .authorization((allow) => [allow.publicApiKey()]),
});

export type Schema = ClientSchema<typeof schema>;

export const data = defineData({
  schema,
  authorizationModes: {
    defaultAuthorizationMode: "apiKey",
    // API Key is used for a.allow.public() rules
    apiKeyAuthorizationMode: {
      expiresInDays: 30,
    },
  },
});

/*== STEP 2 ===============================================================
Go to your frontend source code. From your client-side code, generate a
Data client to make CRUDL requests to your table. (THIS SNIPPET WILL ONLY
WORK IN THE FRONTEND CODE FILE.)

Using JavaScript or Next.js React Server Components, Middleware, Server 
Actions or Pages Router? Review how to generate Data clients for those use
cases: https://docs.amplify.aws/gen2/build-a-backend/data/connect-to-API/
=========================================================================*/

/*
"use client"
import { generateClient } from "aws-amplify/data";
import type { Schema } from "@/amplify/data/resource";

const client = generateClient<Schema>() // use this Data client for CRUDL requests
*/

/*== STEP 3 ===============================================================
Fetch records from the database and use them in your frontend component.
(THIS SNIPPET WILL ONLY WORK IN THE FRONTEND CODE FILE.)
=========================================================================*/

/* For example, in a React component, you can use this snippet in your
  function's RETURN statement */
// const { data: todos } = await client.models.Todo.list()

// return <ul>{todos.map(todo => <li key={todo.id}>{todo.content}</li>)}</ul>
