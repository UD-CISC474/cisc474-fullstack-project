import express from "express";
import { newController } from "./controller";

export class ApiRouter {
  private router: express.Router = express.Router();
  private controller: newController = new newController();

  // Creates the routes for this router and returns a populated router object
  public getRouter(): express.Router {
    this.router.get("/stock/:ticker", this.controller.getTicker);
    this.router.get("/stock/:ticker/:start", this.controller.getTicker);
    this.router.get("/stock/:ticker/:start/:end", this.controller.getTicker);
    return this.router;
  }


  // public getRouter(): express.Router {
  //   this.router.get("/hello", this.controller.getHello);
  //   this.router.post("/hello", this.controller.postHello);
  //   this.router.get("/firebase", this.controller.firebaseTest);
  //   this.router.get("/stock", this.controller.stockTest);
  //   this.router.post("/all", this.controller.postAllStocks);
  //   this.router.get("/all", this.controller.getAllStocks);
  //   this.router.post("/firebase", this.controller.postFirebase);
  //   this.router.post("/user/stock", this.controller.postUserStock);
  //   this.router.get("/user/stock", this.controller.getUserStock);
  //   this.router.put("/user/stock", this.controller.updateUserStock);
  //   this.router.get("/polygon/indices", this.controller.queryIndicesExpress);
  //   this.router.get("/polygon/all", this.controller.queryAllTickers);
  //   this.router.put("/user", this.controller.updateCurrency);
  //   this.router.get("/user", this.controller.getUserCurrency);
  //   return this.router;
  // }
}
