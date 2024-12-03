import express from "express";
import {
  getStock,
  getPortfolio,
  buyStock,
  sellStock,
  login,
  logout,
  testFirebase,
  testTokenAuth,
  createAccount
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
    this.router.post("/logout", logout);
    this.router.post("/create-account", createAccount);

    // Retireve user portfolio (start/end specify date range)
    // Auth token required (hence why using post)
    this.router.post("/portfolio", getPortfolio);
    this.router.post("/portfolio/:start/:end", getPortfolio);

    // Buy/sell stock (auth token required)
    this.router.post("/buy", buyStock);
    this.router.post("/sell", sellStock);

    // Test routes (can delete)
    this.router.get("/test-firebase", testFirebase);
    this.router.post("/authtoken/", testTokenAuth)

    return this.router;
  }
}
