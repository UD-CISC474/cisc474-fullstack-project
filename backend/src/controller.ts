import express from "express";
import { database } from "./firebase";
import { queryCompanyData } from "./polygon";


// HELPER FUNCTIONS -- DO NOT EXPORT THESE

// shorthand type aliases for express functions
type Req = express.Request;
type Res = express.Response;

// Used by any express endpoints that need user authorization
const getAuthentication = async () => {

}

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

}

export { getStock, getPortfolio, buyStock, sellStock, login }