import express from "express";
import { database } from "./firebase";
import { queryCompanyData } from "./polygon";
import {
  getAuthentication,
  login as authLogin,
  logout as authLogout,
  createAccount as authCreateAccount
} from "./auth";
import { getHoldings, getTransactions } from "./portfolio";


// HELPER FUNCTIONS -- DO NOT EXPORT THESE

// shorthand type aliases for express functions
type Req = express.Request;
type Res = express.Response;

// Used by buyStock & sellStock to execute trades
const exchangeStock = async () => {

}



// EXPRESS ROUTES -- EXPORT THESE

// Express route for retrieving price information about a stock
const getStock = async (req: Req, res: Res): Promise<void> => {
  const { ticker, start, end } = req.params;
  const stockData = await queryCompanyData({
    ticker,
    from: start,
    to: end
  });
  res.send(stockData);
}

// Express route for getting all information about a user's portfolio
const getPortfolio = async (req: Req, res: Res): Promise<void> => {
  const auth = await getAuthentication(req);

  if(auth.valid) {
    res.send({
      username: auth.username,
      valid: auth.valid,
      success: true,
      availableCash: 0,
      transactions: await getTransactions(auth.username),
      holdings: await getHoldings(auth.username)
    });
  } else {
    res.send(auth);
  }

  //res.send(`Token is: ${token}; Username is: ${username}`);
}

// Express route for purchasing a stock
const buyStock = async (req: Req, res: Res): Promise<void> => {
  const { username, token, valid } = await getAuthentication(req);
}

// Express route for selling a stock
const sellStock = async (req: Req, res: Res): Promise<void> => {
  const { username, token, valid } = await getAuthentication(req);
}

// Express route to sign-in a user
const login = async (req: Req, res: Res): Promise<void> => {
  const { username, password } = req.body;
  const response = await authLogin({ username, password });
  res.send(response);
}

// Express route to logout a user
const logout = async (req: Req, res: Res): Promise<void> => {
  const auth = await getAuthentication(req);
  if(auth.valid === true) {
    const response = authLogout({
      username: auth.username,
      token: auth.token
    });
    res.send(response);
  } else {
    res.send(auth);
  }
}

// Express route to create a new user
const createAccount = async (req: Req, res: Res): Promise<void> => {
  const { username, password } = req.body;
  const response = await authCreateAccount({ username, password });
  res.send(response);
}

// Test firebase route (can be deleted)
const testFirebase = async (req: Req, res: Res): Promise<void> => {
  const ref = database.ref("/test");
  const value = (await ref.get()).val();
  res.send({ value });
}

// Test auth route (can be deleted)
const testTokenAuth = async (req: Req, res: Res): Promise<void> => {
  const response = await getAuthentication(req);
  res.send(response);
}

export {
  getStock,
  getPortfolio,
  buyStock,
  sellStock,
  login,
  logout,
  createAccount,
  testFirebase,
  testTokenAuth
}