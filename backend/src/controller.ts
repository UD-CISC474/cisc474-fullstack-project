import express from "express";
import { database } from "./firebase";
import { queryCompanyData } from "./polygon";
import {
  getAuthentication,
  login as authLogin,
  logout as authLogout,
  createAccount as authCreateAccount
} from "./auth";


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

}

// Express route for purchasing a stock
const buyStock = async (req: Req, res: Res): Promise<void> => {

}

// Express route for selling a stock
const sellStock = async (req: Req, res: Res): Promise<void> => {

}

// Express route to sign-in a user
const login = async (req: Req, res: Res): Promise<void> => {
  const { username, password } = req.body;
  const response = await authLogin({ username, password });
  res.send(response);
}

// Express route to logout a user
const logout = (req: Req, res: Res): void => {
  const { username, token } = req.body;
  const response = authLogout({ username, token });
  res.send(response);
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
  const { username, token } = req.params;
  const response = await getAuthentication({ username, token });
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