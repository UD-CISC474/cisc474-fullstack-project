import { database } from "./firebase";
import { getLastWeekday, queryCompanyData } from "./polygon";

interface Transaction {
  action: "buy" | "sell";
  ticker: string;
  numShares: number;
  cashValue: number;
  date: string;
}

interface Holdings {
  currentTotalValue: number;
  cash: number;
  stocks: Array<{
    ticker: string,
    numberOfShares: number,
    currentSharePrice: number,
    currentPositionValue: number
  }>;
  portfolioValue: Array<number>;
  totalChange: number;
}

class Tracker {
  private epoch: Date;
  private termination = getLastWeekday();
  private tickerSet = new Set<string>();
  private dailyPrices: {
    [key: string]: Array<number>;
  } = {};
  private dailyHoldings: {
    [key: string]: Array<number>;
  } = {};
  private dates: Array<string> = [];
  private transactions: Transaction[];

  constructor(initialCash: number, transactions: Transaction[]) {
    this.epoch = new Date(transactions[0].date);
    this.dailyHoldings.cash = [initialCash];

    this.transactions = transactions;
    for(const transaction of transactions) {
      this.tickerSet.add(transaction.ticker);
    }

    for(const ticker of this.tickerSet.values()) {
      this.dailyPrices[ticker] = [];
      this.dailyHoldings[ticker] = [0];
    }
  }

  private async queryStocks() {
    // Query all the stocks on polygon
    const tickers = Array.from(this.tickerSet.values());
    const companyResponses = await Promise.all(tickers.map(ticker => queryCompanyData({
        ticker,
        from: this.epoch.toISOString().substring(0, 10),
        to: this.termination.toISOString().substring(0, 10),
        interval: "day"
      })));

    // Create array of all responded dates
    this.dates = companyResponses[0].prices.map(priceObj => {
      const timestamp = new Date(priceObj.openTimestamp);
      return timestamp.toISOString().substring(0, 10)
    });

    // Populate daily prices of each ticker
    for(const company of companyResponses) {
      this.dailyPrices[company.ticker] = company.prices.map(price => price.close);
    }
  }

  private resolveTransactions() {
    // zero all except cash
    for(const [key, value] of Object.entries(this.dailyHoldings)) {
      this.dailyHoldings[key] = new Array(this.dates.length).fill(value[0]);
    }

    const length = this.dates.length;
    for(const transaction of this.transactions) {
      const startIndex = this.dates.indexOf(new Date(transaction.date).toISOString().substring(0, 10));
      const cost = this.dailyPrices[transaction.ticker][startIndex] * transaction.numShares;
      let cash = this.dailyHoldings.cash[startIndex];
      let shares = this.dailyHoldings[transaction.ticker][startIndex];
      cash += transaction.action === "buy" ? cost * -1 : cost;
      shares += transaction.action === "buy" ? transaction.numShares : transaction.numShares * -1;

      for(let i = startIndex; i < length; i++) {
        this.dailyHoldings.cash[i] = cash;
        this.dailyHoldings[transaction.ticker][i] = shares;
      }
    }
  }

  public async getHoldings(): Promise<Holdings> {
    const length = this.dates.length;
    await this.queryStocks();
    this.resolveTransactions();

    // Calculate portfolio value graph
    const portfolioValue = new Array<number>(length).fill(0);
    for(let i = 0; i < length; i++) {
      for(const [key, value] of Object.entries(this.dailyHoldings)) {
        if(key === "cash") {
          portfolioValue[i] += value[i];
        } else {
          portfolioValue[i] += value[i] * this.dailyPrices[key][i];
        }
      }
    }

    const stocks = new Array();
    for(const [key, value] of Object.entries(this.dailyHoldings)) {
      if(key !== "cash") {
        stocks.push({
          ticker: key,
          numberOfShares: value[length - 1],
          currentSharePrice: this.dailyPrices[key][length - 1],
          currentPositionValue: value[length - 1] * this.dailyPrices[key][length - 1]
        });
      }
    }

    return {
      cash: this.dailyHoldings.cash[length - 1],
      stocks,
      portfolioValue,
      currentTotalValue: portfolioValue[length - 1],
      totalChange: portfolioValue[length - 1] - portfolioValue[0],
    }
  }
}
  

const getTransactions = (username: string): Promise<Transaction[]> => {
  return new Promise((resolve, reject) => {
    const ref = database.ref(`/users/${username}/transactions`);
    ref.once('value', (snap) => {
      resolve(snap.exists() ? Object.values(snap.val()) : []);
    });
  });
}

const getHoldings = (username: string): Promise<Holdings> => {
  return new Promise((resolve, reject) => {
    const ref = database.ref(`/users/${username}`);
    ref.once('value', async (snap) => {
      if(snap.exists()) {
        const data = snap.val();
        const { cash, startingCash } = data.portfolio;
        const transactions: Transaction[] = Object.values(data.transactions);

        const tracker = new Tracker(startingCash, transactions);
        const result = await tracker.getHoldings();

        resolve(result);
      } else {
        reject();
      }
    })
  });
}

export {
  getTransactions,
  getHoldings
}