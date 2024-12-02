import { compareSync, hashSync } from "bcrypt";
import { randomBytes } from "crypto";
import { database } from "./firebase";

interface AuthCredentials {
  username: string;
  password: string;
}

interface TokenCredentials {
  username: string;
  token: string;
}

interface AuthorizedUser {
  username: string;
  token: string;
  valid: boolean;
}

// Used by any express endpoints that need user authorization
const getAuthentication = ({
  username,
  token
}: TokenCredentials): Promise<AuthorizedUser> => {
  return new Promise((resolve, reject) => {

    // Query the Firebase for the current token
    const ref = database.ref(`/users/${username}/token`);
    ref.once('value', (snap) => {
      const dbToken = snap.val();
      
      // Make sure the token exists in Firebase
      if(typeof dbToken === "undefined" || dbToken === "") {
        resolve({ username, token: "", valid: false });
      }

      // Make sure the provided token matches the one in the DB
      if(token !== dbToken) {
        resolve({ username, token: "", valid: false });
      } else {
        resolve({ username, token, valid: true });
      }
    });
  })
}

// Used to login users
const login = ({
  username,
  password
}: AuthCredentials): Promise<AuthorizedUser> => {
  return new Promise((resolve, reject) => {
    // Query the firebase for user password hash
    const ref = database.ref(`/users/${username}/password`);
    ref.once('value', (snap) => {
      const dbHash = snap.val();
      
      // Make sure the hash exists in the Firebase
      if(typeof dbHash === "undefined" || dbHash === "") {
        resolve({ username, token: "", valid: false });
      }

      // Check if the hash matches
      if(compareSync(password, dbHash) === true) {
        // Generate a token for the user session
        const token = randomBytes(32).toString('base64');

        // Store token in the Firebase
        const tokenRef = database.ref(`/users/${username}/token`);
        tokenRef.set(token);

        // return token to user
        resolve({ username, token, valid: true });
      } else {
        // Password is incorrect
        resolve({ username, token: "", valid: false });
      }
    })
  })
}

// Logs the current user out
const logout = async ({
  username,
  token
}: TokenCredentials) => {

}

// Used to create a new user account
const createAccount = async ({
  username,
  password
}: AuthCredentials) => {
  
}

export { getAuthentication, login, logout, createAccount }
export type { AuthorizedUser }