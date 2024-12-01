# Project 2 : A REST API
This is a template for a starter API that sets up a basic server with a basic controller/router pair.

Launch backend with:
```bash
npx ts-node-dev src/app.ts
```

## Setup
For Firebase Admin to work, place the service account JSON file at `/backend/firebase-service-account.json`.

For Polygon to work, create the file `/backend/polygon-credentials.json` with the following contents:
```json
{
  "token": ""  // your Polygon API token goes here
}
```