import express from "express";
import { database } from "./firebase";

class MyObject{
    constructor(public msg:string,public value:number=42){}
}

export class Controller {
    //returns something.
    public getHello(req: express.Request, res: express.Response): void {
        res.send(new MyObject("hello world"));
    }

    //returns whatever you post to it.  You can use the contents of req.body to extract information being sent to the server
    public postHello(req: express.Request, res: express.Response): void {
        res.send({body: req.body});
    }

    public async firebaseTest(req: express.Request, res: express.Response): Promise<void> {
        const ref = database.ref("/test-key");
        const value = (await ref.get()).val();
        res.send({ value });
    }

    public async stockTest(req: express.Request, res: express.Response): Promise<void> {
        //const quote = await yahooFinance.quote('AAPL');
        //res.send({ quote });
    }
}