import express from "express";
import { database } from "./firebase";
import { queryCompanyData, queryTickers } from "./polygon";
import {
  getAuthentication,
  login as authLogin,
  logout as authLogout,
  createAccount as authCreateAccount,
} from "./auth";

// HELPER FUNCTIONS -- DO NOT EXPORT THESE

// shorthand type aliases for express functions
type Req = express.Request;
type Res = express.Response;

// Used by buyStock & sellStock to execute trades
const exchangeStock = async () => {};

// EXPRESS ROUTES -- EXPORT THESE

// Express route for retrieving price information about a stock
const getStock = async (req: Req, res: Res): Promise<void> => {
  const { ticker, start, end } = req.params;
  const stockData = await queryCompanyData({
    ticker,
    from: start,
    to: end,
  });
  res.send(stockData);
};

const queryAllTickers = async (req: Req, res: Res): Promise<void> => {
  try {
    const { date } = req.query;

    if (!date) {
      res.status(400).send({
        success: false,
        message: "Missing required field: date",
      });
      return;
    }

    const response = await queryTickers(date.toString());

    if (!response) {
      res.status(400).send({
        success: false,
        message: "No response for the given date.",
      });
      return;
    }

    res.send({
      success: true,
      message: "Stocks fetched successfully!",
      data: response,
    });
  } catch (error) {
    const err = error as Error;
    console.error("Error fetching stock data:", err.message);
    res.status(500).send({
      success: false,
      message: "Internal server error",
      error: err.message,
    });
  }
};

// Express route for getting all information about a user's portfolio
const getPortfolio = async (req: Req, res: Res): Promise<void> => {};

// Express route for purchasing a stock
const buyStock = async (req: Req, res: Res): Promise<void> => {};

// Express route for selling a stock
const sellStock = async (req: Req, res: Res): Promise<void> => {};

// Express route to sign-in a user
const login = async (req: Req, res: Res): Promise<void> => {
  const { username, password } = req.body;
  const response = await authLogin({ username, password });
  res.send(response);
};

// Express route to logout a user
const logout = (req: Req, res: Res): void => {
  const { username, token } = req.body;
  const response = authLogout({ username, token });
  res.send(response);
};

// Express route to create a new user
const createAccount = async (req: Req, res: Res): Promise<void> => {
  const { username, password } = req.body;
  const response = await authCreateAccount({ username, password });
  res.send(response);
};

// Test firebase route (can be deleted)
const testFirebase = async (req: Req, res: Res): Promise<void> => {
  const ref = database.ref("/test");
  const value = (await ref.get()).val();
  res.send({ value });
};

// Test auth route (can be deleted)
const testTokenAuth = async (req: Req, res: Res): Promise<void> => {
  const { username, token } = req.params;
  const response = await getAuthentication({ username, token });
  res.send(response);
};

export {
  queryAllTickers,
  getStock,
  getPortfolio,
  buyStock,
  sellStock,
  login,
  logout,
  createAccount,
  testFirebase,
  testTokenAuth,
};
