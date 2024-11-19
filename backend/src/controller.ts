import express from "express";
import { database } from "./firebase";

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
    //const quote = await yahooFinance.quote('AAPL');
    //res.send({ quote });
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
}
