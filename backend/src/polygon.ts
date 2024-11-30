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

interface IndexData {
  symbol: string;
  date: string;
  open: number;
  close: number;
  high: number;
  low: number;
  volume: number;
}

interface IndicesResponse {
  nasdaq: IndexData;
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
  console.log(POLYGON_API_KEY);
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
      const successful = res.resultsCount && res.resultsCount > 0;
      return {
        successful: successful ? true : false,
        ticker,
        count: successful ? res.resultsCount : 0,
        start: new Date(from),
        end: new Date(to),
        prices: successful ? res.results.map(
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
        ) : [],
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

const queryIndices = async (date: string): Promise<IndicesResponse> => {
  const nasdaq_response = await fetch(
    `https://api.polygon.io/v1/open-close/I:COMP/${date}?apiKey=${POLYGON_API_KEY}`
  );

  const nasdaq_res = await nasdaq_response.json();

  console.log(nasdaq_res);

  const formatResponse = (data: any): IndexData => ({
    symbol: data.symbol,
    date: data.from,
    open: data.open,
    close: data.close,
    high: data.high,
    low: data.low,
    volume: data.volume,
  });

  return {
    nasdaq: formatResponse(nasdaq_res),
  };
};

export {
  queryCompanyData,
  queryCompanyDataNoCache,
  queryPortfolio,
  queryTickers,
  queryIndices,
};
export type { TickerResult, TickerResponse };
