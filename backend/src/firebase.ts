import { initializeApp, cert, ServiceAccount } from "firebase-admin/app";
import { getDatabase, Database } from "firebase-admin/database";
import * as serviceAccount from "../firebase-service-account.json";


const firebase = initializeApp({
  credential: cert(serviceAccount as ServiceAccount),
  databaseURL: "https://super-trader-74ac9-default-rtdb.firebaseio.com/",
});
const database: Database = getDatabase(firebase);

export { database };
