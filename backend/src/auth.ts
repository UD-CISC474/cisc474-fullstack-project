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
  message?: string;
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
      if(!snap.exists() || dbToken === "") {
        // token does not exist in database
        resolve({ username, token: "", valid: false });
        return;
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
      if(!snap.exists() || dbHash === "") {
        // hash does not exist in database
        resolve({ username, token: "", valid: false });
        return;
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
const createAccount = ({
  username,
  password
}: AuthCredentials): Promise<AuthorizedUser> => {
  return new Promise((resolve, reject) => {
    // check if the username exists in the Firebase
    const ref = database.ref(`/users/${username}`);
    ref.once('value', (snap) => {
      // const existingUser = snap.val();

      if(snap.exists()) {
        // user already exists
        resolve({ username, token: "", valid: false, message: "User already exists." });
        return;
      }

      if(password.length < 4) {
        // provided password is too short
        resolve({ username, token: "", valid: false, message: "Password too short." });
      }

      const passwordHash = hashSync(password, 8);
      const token = randomBytes(32).toString('base64');
      ref.set({
        token,
        password: passwordHash,
        portfolio: {
          cash: 10000
        }
      });

      resolve({ username, token, valid: true });
    })

  })
}

// const createAccount = async ({
//   username,
//   password
// }: AuthCredentials) => {

// }

export { getAuthentication, login, logout, createAccount }
export type { AuthorizedUser }