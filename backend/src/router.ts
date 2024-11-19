import express from "express";
import { Controller } from "./controller";

export class ApiRouter {
  private router: express.Router = express.Router();
  private controller: Controller = new Controller();

  // Creates the routes for this router and returns a populated router object
  public getRouter(): express.Router {
    this.router.get("/hello", this.controller.getHello);
    this.router.post("/hello", this.controller.postHello);
    this.router.get("/firebase", this.controller.firebaseTest);
    this.router.get("/stock", this.controller.stockTest);
    this.router.post("/firebase", this.controller.postFirebase);
    this.router.post("/user/stock", this.controller.postUserStock);
    return this.router;
  }
}
