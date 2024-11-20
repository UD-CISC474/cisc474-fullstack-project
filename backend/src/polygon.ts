import { environment } from "./environment";

interface QueryParams {
  from?: Date | string;
  to?: Date | string;
  interval?: "day" | "hour" | "half-hour" | "minute";
}

interface CompanyQueryParams extends QueryParams {
  ticker: string;
}

interface Price {
  average: number;
  close: number;
  high: number;
  low: number;
  open: number;
  openTimestamp: number;
}

interface CompanyResponse {
  ticker: string;
  count: number;
  start: Date;
  end: Date;
  prices: Price[];
}

interface PortfolioResponse {}

interface TickerResult {
  T: string; // Ticker symbol
  c: number; // Close price
  h: number; // High price
  l: number; // Low price
  n: number; // Number of trades
  o: number; // Open price
  t: number; // Timestamp
  v: number; // Volume
  vw: number; // Volume weighted average price
}

interface TickerResponse {
  adjusted: boolean;
  queryCount: number;
  results: TickerResult[];
  resultsCount: number;
  status: string;
}

const POLYGON_API_KEY = environment.POLYGON_API_KEY || "";

const queryCompanyDataNoCache = async ({
  ticker,
  from = new Date().toISOString().substring(0, 10),
  to = new Date().toISOString().substring(0, 10),
  interval = "half-hour",
}: CompanyQueryParams): Promise<CompanyResponse> => {
  const timespan = interval === "half-hour" ? "minute" : interval;
  const multiplier = interval === "half-hour" ? 30 : 1;

  const data = await fetch(
    `https://api.polygon.io/v2/aggs/ticker/${ticker}/range/${multiplier}/${timespan}/${from}/${to}`,
    {
      headers: {
        Authorization: `Bearer ${POLYGON_API_KEY}`,
      },
    }
  )
    .then((res) => res.json())
    .then((res) => {
      return {
        ticker,
        count: res.resultsCount,
        start: new Date(from),
        end: new Date(to),
        prices: res.results.map(
          (e: {
            c: number; // close
            h: number; // high
            l: number; // low
            o: number; // open
            t: number; // timestamp
            vw: number; // average
          }) => {
            return {
              average: e.vw,
              close: e.c,
              high: e.h,
              low: e.l,
              open: e.o,
              openTimestamp: e.t,
            };
          }
        ),
      };
    });

  return data;
};

const queryCompanyData = async ({
  ticker,
  from = new Date().toISOString().substring(0, 10),
  to = new Date().toISOString().substring(0, 10),
  interval = "half-hour",
}: CompanyQueryParams): Promise<CompanyResponse> => {
  // TODO: Check firebase for company data before querying polygon
  return queryCompanyDataNoCache({ ticker, from, to, interval });
};

const queryPortfolio = async ({}: QueryParams) => {};

// TODO: Figure out a way to list stocks for the current day. When the current day is input, this response is given:
//{"status":"NOT_AUTHORIZED","request_id":"889c5f07cc40f464b68f8a87098b170e","message":"Attempted to request today's data before end of day. Please upgrade your plan at https://polygon.io/pricing"}
const queryTickers = async (date: string): Promise<TickerResponse> => {
  const response = await fetch(
    `https://api.polygon.io/v2/aggs/grouped/locale/us/market/stocks/${date}?adjusted=true&apiKey=${POLYGON_API_KEY}`
  );

  const res = await response.json();
  console.log(res);
  return {
    adjusted: res.adjusted,
    queryCount: res.queryCount,
    results: res.results.map((ticker: any) => ({
      T: ticker.T,
      c: ticker.c,
      h: ticker.h,
      l: ticker.l,
      n: ticker.n,
      o: ticker.o,
      t: ticker.t,
      v: ticker.v,
      vw: ticker.vw,
    })),
    resultsCount: res.resultsCount,
    status: res.status,
  };
};

export {
  queryCompanyData,
  queryCompanyDataNoCache,
  queryPortfolio,
  queryTickers,
};
export type { TickerResult, TickerResponse };
