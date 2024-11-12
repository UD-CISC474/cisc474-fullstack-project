import { initializeApp, cert, ServiceAccount } from "firebase-admin/app";
import { getDatabase, Database } from "firebase-admin/database";
import * as dotenv from 'dotenv';

dotenv.config();

const firebaseCredentials: ServiceAccount = JSON.parse(
  process.env.FIREBASE_ADMIN_KEY || "{}"
);
const firebase = initializeApp({
  credential: cert(firebaseCredentials),
  databaseURL: "https://super-trader-f8f83-default-rtdb.firebaseio.com/",
});
const database: Database = getDatabase(firebase);

export { database };
