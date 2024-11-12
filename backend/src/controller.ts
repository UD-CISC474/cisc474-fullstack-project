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

    public async postFirebase(req: express.Request, res: express.Response): Promise<void>{
        try{
            const ref = database.ref("/Apple");
            const message = req.body.message;
            await ref.set({
                message: message,
                timestamp: new Date().toISOString(),
            });

            res.send({ success: true, message: "Posted to Firebase!"});
        } catch (error) {
            const err = error as Error;
            console.log("Error posting to Firebase: ", err);
            res.status(500).send({ success: false, error: err.message });
        }
    }

    public async stockTest(req: express.Request, res: express.Response): Promise<void> {
        //const quote = await yahooFinance.quote('AAPL');
        //res.send({ quote });
    }
}