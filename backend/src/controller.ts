import express from "express";
import { database } from "./firebase";
import { queryCompanyDataNoCache, queryTickers, TickerResult } from "./polygon";

class MyObject {
  constructor(public msg: string, public value: number = 42) {}
}

export class Controller {
  //returns something.
  public getHello(req: express.Request, res: express.Response): void {
    res.send(new MyObject("hello world"));
  }

  //returns whatever you post to it.  You can use the contents of req.body to extract information being sent to the server
  public postHello(req: express.Request, res: express.Response): void {
    res.send({ body: req.body });
  }

  public async firebaseTest(
    req: express.Request,
    res: express.Response
  ): Promise<void> {
    const ref = database.ref("/test-key");
    const value = (await ref.get()).val();
    res.send({ value });
  }

  public async postFirebase(
    req: express.Request,
    res: express.Response
  ): Promise<void> {
    try {
      const ref = database.ref("/Apple");
      const message = req.body.message;
      await ref.set({
        message: message,
        timestamp: new Date().toISOString(),
      });
      res.send({ success: true, message: "Posted to Firebase!" });
    } catch (error) {
      const err = error as Error;
      console.log("Error posting to Firebase: ", err);
      res.status(500).send({ success: false, error: err.message });
    }
  }

  public async stockTest(
    req: express.Request,
    res: express.Response
  ): Promise<void> {
    try {
      // Extract parameters from the request body, with defaults
      const ticker = req.body.ticker || "AAPL"; // Default to "AAPL"
      const from = req.body.from || "2024-11-11"; // Default to "2024-11-10"
      const to = req.body.to || "2024-11-15"; // Default to "2024-11-15"
      const interval = req.body.interval || "day"; // Default to "day"

      // Fetch stock data
      const result = await queryCompanyDataNoCache({
        ticker,
        from,
        to,
        interval,
      });

      // Write data to Firebase
      const ref = database.ref(`/stocks/${ticker}`);
      await ref.set({ data: result });

      // Send success response
      res.send({
        success: true,
        message: `Posted ${ticker} stock data to Firebase!`,
      });
    } catch (error) {
      const err = error as Error;
      console.error("Error posting stocks to Firebase: ", err);
      res.status(500).send({ success: false, error: err.message });
    }
  }

  public async postAllStocks(
    req: express.Request,
    res: express.Response
  ): Promise<void> {
    try {
      const date = req.body.date || "2024-11-15";
      const result = await queryTickers(date);
      const sanitizedResults = result.results.map((ticker) => {
        const sanitizedTicker: Record<string, any> = { ...ticker };
        Object.keys(sanitizedTicker).forEach((key) => {
          if (sanitizedTicker[key] === undefined) {
            delete sanitizedTicker[key];
          }
        });
        return sanitizedTicker as TickerResult;
      });

      const sanitizedResult = { ...result, results: sanitizedResults };

      const ref = database.ref(`/all`);
      await ref.set({ stocks: sanitizedResult });
      res.send({ success: true, message: `Posted all stocks to the Firebase` });
    } catch (error) {
      const err = error as Error;
      console.error("Error posting all stocks to Firebase: ", err);
      res.status(500).send({ success: false, error: err.message });
    }
  }

  public async getAllStocks(
    req: express.Request,
    res: express.Response
  ): Promise<void> {
    try {
      const ref = database.ref(`/all/stocks/results`);
      const snapshot = await ref.once("value");
      if (snapshot.exists()) {
        const stockData = snapshot.val();
        res.send({ success: true, data: stockData });
      } else {
        res
          .status(404)
          .send({ success: false, message: "No stock data found." });
      }
    } catch (error) {
      const err = error as Error;
      console.error("Error retrieving stock data:", err);
      res.status(500).send({ success: false, error: err.message });
    }
  }

  public async postUserStock(
    req: express.Request,
    res: express.Response
  ): Promise<void> {
    try {
      const { userId, stockSymbol, shares, price } = req.body;

      if (!userId || !stockSymbol || !shares || !price) {
        res.status(400).send({
          success: false,
          message:
            "Missing required fields: userId, stockSymbol, shares, or price",
        });
      }

      const ref = database.ref(`/users/${userId}/stocks`);

      const stockPurchase = {
        stockSymbol,
        shares,
        price,
        timestamp: new Date().toISOString(),
      };

      await ref.push(stockPurchase);

      res.send({
        success: true,
        message: "Stock purchase recorded successfully!",
        stockPurchase,
      });
    } catch (error) {
      const err = error as Error;
      console.error("Error posting stock to Firebase: ", err);
      res.status(500).send({ success: false, error: err.message });
    }
  }

  public async deleteUserStock(
    req: express.Request,
    res: express.Response
  ): Promise<void> {
    try {
      const { userId } = req.query;

      if (!userId) {
        res.status(400).send({
          success: false,
          message: "Missing required field: userId",
        });
        return;
      }

      const ref = database.ref(`/users/${userId}/stocks`);
      const stocksSnapshot = await ref.get();
      const stocks = stocksSnapshot.val();

      if (!stocks) {
        res.status(404).send({
          success: false,
          message: "No stocks found for the given userId",
        });
        return;
      }

      res.send({
        success: true,
        message: "Stocks fetched successfully!",
        stocks,
      });
    } catch (error) {
      const err = error as Error;
      console.error("Error fetching user stocks: ", err);
      res.status(500).send({ success: false, error: err.message });
    }
  }
}
