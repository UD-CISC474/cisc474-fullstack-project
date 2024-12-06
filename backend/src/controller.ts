import express from "express";
import { database } from "./firebase";
import { queryCompanyData } from "./polygon";
import {
  getAuthentication,
  login as authLogin,
  logout as authLogout,
  createAccount as authCreateAccount,
} from "./auth";
import { getHoldings, getTransactions } from "./portfolio";

// HELPER FUNCTIONS -- DO NOT EXPORT THESE

// shorthand type aliases for express functions
type Req = express.Request;
type Res = express.Response;

// Used by buyStock & sellStock to execute trades
// const exchangeStock = async ({
//   username,
//   ticker,
//   amount,
//   price,
//   type,
// }: {
//   username: string;
//   ticker: string;
//   amount: number;
//   price: number;
//   type: "buy" | "sell";
// }) => {
//   const userRef = database.ref(`/users/${username}`);
//   const snapshot = await userRef.once("value");
//   const userData = snapshot.val();

//   if (!userData) {
//     throw new Error("User does not exist.");
//   }

//   const portfolio = userData.portfolio || {};
//   const transactions = portfolio.transactions || {};
//   const cash = portfolio.cash || 0;

//   const totalCostOrProceeds = price * amount;

//   if (type === "buy") {
//     if (cash < totalCostOrProceeds) {
//       throw new Error("Insufficient funds to complete the transaction.");
//     }

//     portfolio.cash = cash - totalCostOrProceeds;

//     transactions[ticker] = transactions[ticker] || [];
//     transactions[ticker].push({
//       type,
//       amount,
//       price,
//       timestamp: new Date().toISOString().split("T")[0],
//     });
//   } else if (type === "sell") {
//     const tickerTransactions = transactions[ticker] || [];

//     const currentHoldings = tickerTransactions.reduce((total: any, tx: any) => {
//       return tx.type === "buy" ? total + tx.amount : total - tx.amount;
//     }, 0);

//     if (currentHoldings < amount) {
//       throw new Error("Insufficient shares to sell.");
//     }

//     portfolio.cash = cash + totalCostOrProceeds;

//     transactions[ticker] = tickerTransactions;
//     transactions[ticker].push({
//       type,
//       amount,
//       price,
//       timestamp: new Date().toISOString().split("T")[0],
//     });
//   }

//   portfolio.transactions = transactions;
//   await userRef.update({ portfolio });

//   return portfolio;
// };

const exchangeStock = async ({
  username,
  ticker,
  amount,
  price,
  type,
}: {
  username: string;
  ticker: string;
  amount: number;
  price: number;
  type: "buy" | "sell";
}) => {
  const userRef = database.ref(`/users/${username}`);
  const snapshot = await userRef.once("value");
  const userData = snapshot.val();

  if (!userData) {
    throw new Error("User does not exist.");
  }

  const portfolio = userData.portfolio || {};
  const transactions = userData.transactions  || [];
  const cash = portfolio.cash || 0;

  const totalCostOrProceeds = price * amount;

  if (type === "buy") {
    if (cash < totalCostOrProceeds) {
      throw new Error("Insufficient funds to complete the transaction.");
    }

    portfolio.cash = cash - totalCostOrProceeds;

    transactions.push({
      action: type,
      cashValue: totalCostOrProceeds,
      date: new Date().toISOString().split("T")[0],
      numShares: amount,
      ticker,
    });
  } else if (type === "sell") {
    const currentHoldings = transactions.reduce((total: any, tx: any) => {
      return tx.type === "buy" ? total + tx.amount : total - tx.amount;
    }, 0);

    if (currentHoldings < amount) {
      throw new Error("Insufficient shares to sell.");
    }

    portfolio.cash = cash + totalCostOrProceeds;

    transactions.push({
      action: type,
      cashValue: totalCostOrProceeds,
      date: new Date().toISOString().split("T")[0],
      numShares: amount,
      ticker,
    });
  }

  await userRef.update({ 
    portfolio, 
    transactions 
  });

  return { portfolio, transactions };
};

// EXPRESS ROUTES -- EXPORT THESE

// Express route for retrieving price information about a stock
const getStock = async (req: Req, res: Res): Promise<void> => {
  const { ticker, start, end, interval } = req.params;
  const validIntervals =["day", "hour", "half-hour", "minute"] as const;
  const sanitizedInterval = validIntervals.includes(interval as typeof validIntervals[number])
    ? (interval as "day" | "hour" | "half-hour" | "minute")
    : "day";
  const stockData = await queryCompanyData({
    ticker,
    from: start,
    to: end,
    interval: sanitizedInterval,
  });
  res.send(stockData);
};

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

  if (!valid) {
    res.status(401).send("User could not be authenticated.");
    return;
  }

  const { user, ticker, price, amount } = req.body;

  if (!ticker) {
    res.status(400).send("Invalid or missing ticker.");
    return;
  }

  if (!price || price <= 0) {
    res.status(400).send("Invalid or missing price.");
    return;
  }

  if (!amount || amount <= 0) {
    res.status(400).send("Invalid or missing amount.");
    return;
  }

  try {
    const portfolio = await exchangeStock({
      username,
      ticker,
      amount,
      price,
      type: "buy",
    });

    res.status(200).send({
      message: "Stock purchase successful.",
      portfolio,
    });
  } catch (err) {
    res.status(400).send({ error: err });
  }
};

// Express route for selling a stock
const sellStock = async (req: Req, res: Res): Promise<void> => {
  const { username, token, valid } = await getAuthentication(req);

  if (!valid) {
    res.status(401).send("User could not be authenticated.");
    return;
  }

  const { ticker, price, amount } = req.body;

  if (!ticker) {
    res.status(400).send("Invalid or missing ticker.");
    return;
  }

  if (!price || price <= 0) {
    res.status(400).send("Invalid or missing price.");
    return;
  }

  if (!amount || amount <= 0) {
    res.status(400).send("Invalid or missing amount.");
    return;
  }

  try {
    const portfolio = await exchangeStock({
      username,
      ticker,
      amount,
      price,
      type: "sell",
    });

    res.status(200).send({
      message: "Stock sale successful.",
      portfolio,
    });
  } catch (err) {
    res.status(400).send({ error: err });
  }
};

// Express route to sign-in a user
const login = async (req: Req, res: Res): Promise<void> => {
  const { username, password } = req.body;
  const response = await authLogin({ username, password });
  res.send(response);
};

// Express route to logout a user
const logout = async (req: Req, res: Res): Promise<void> => {
  const auth = await getAuthentication(req);
  if (auth.valid === true) {
    const response = authLogout({
      username: auth.username,
      token: auth.token,
    });
    res.send(response);
  } else {
    res.send(auth);
  }
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
  const response = await getAuthentication(req);
  res.send(response);
};

export {
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