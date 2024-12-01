import express from "express";
import {
  getStock,
  getPortfolio,
  buyStock,
  sellStock,
  login,
  testFirebase
} from "./controller";

export class ApiRouter {
  private router: express.Router = express.Router();

  // Creates the routes for this router and returns a populated router object
  public getRouter(): express.Router {

    // Retrieve price information about a stock/company (no auth required)
    // start/end specify date range for price info
    this.router.get("/stock/:ticker", getStock);
    this.router.get("/stock/:ticker/:start", getStock);
    this.router.get("/stock/:ticker/:start/:end", getStock);

    // User sign-in
    this.router.post("/login", login);

    // Retireve user portfolio (start/end specify date range)
    // Auth bearer token required
    this.router.get("/portfolio", getPortfolio);
    this.router.get("/portfolio/:start/:end", getPortfolio);

    // Buy/sell stock (auth bearer token required)
    this.router.post("/buy", buyStock);
    this.router.post("/sell", sellStock);

    // Test firebase route
    this.router.get("/test-firebase", testFirebase);

    return this.router;
  }
}
