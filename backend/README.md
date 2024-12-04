# Project 2 : A REST API
This is a template for a starter API that sets up a basic server with a basic controller/router pair.

Launch backend with:
```bash
npx ts-node-dev src/app.ts
```

## Setup
For Firebase Admin to work, place the service account JSON file at `/backend/firebase-service-account.json`.

## Example fetch request to endpoint requiring authentication
```typescript
const headers = new Headers();
headers.append("Content-Type", "application/json");
headers.append("Authorization", "some-auth-token");

const response = await fetch("http://localhost:3000/api/portfolio", {
    headers,
    method: "POST",
    body: JSON.stringify({ username: "bob" })
}).then(res => res.json());
```