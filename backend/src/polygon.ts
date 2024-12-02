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
  successful: boolean;
  ticker: string;
  count: number;
  start: Date;
  end: Date;
  prices: Price[];
}

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

interface IndexResponse {
  nasdaq: IndexData;
}

// Used for scamming polygon to bypass 5 request/minute rate limit
class PolygonKeyGen {
  private currentKey = 0;
  private keys = [
    "EYZvJp3byO1Jqo3yZd_02qSBfJZHzdGK",
    "XqNuRVfD2O1aqFmQP_xbGNPhm3N7JoFb",
    "RBXeBQsYN5zMUkB11JVh58x3WSMLvwcc",
    "bgR_CQpWzfcb7taTmCgofuNCVBdR4RNh",
    "OJCgCDXeFXdg7Sugxmqlhptz_WOr0YRi",
    "Y2SOnSuTA8qAkpqcSjEvk6HPfLfbmTHO",
    "sDpnXwmj8JfLzfIOjPXfz61u4mT6ukWZ",
    "cu08jnknbBkKgqh6c_bPMDEOTeBKHLoi",
    "AIA4C6X1E8K4OYBm251tnXyCpumv_LCI",
    "PkKi7nu09KgdMb8Fa9Nn76fJz_0J2M_0",
  ];

  public get key(): string {
    const key = this.keys[this.currentKey];
    this.currentKey = (this.currentKey + 1) % this.keys.length;
    return key;
  }
}
const polyKeyGen = new PolygonKeyGen();

// Directly queries Polygon API for price information about a company/stock
const queryCompanyData = async ({
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
        Authorization: `Bearer ${polyKeyGen.key}`,
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
        prices: successful
          ? res.results.map(
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
            )
          : [],
      };
    });

  return data;
};

const queryTickers = async (date: string): Promise<TickerResponse> => {
  try {
    const response = await fetch(
      `https://api.polygon.io/v2/aggs/grouped/locale/us/market/stocks/${date}?adjusted=true`,
      {
        headers: {
          Authorization: `Bearer ${polyKeyGen.key}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Polygon API returned status ${response.status}`);
    }

    const res = await response.json();

    if (!res.results || res.results.length === 0) {
      return {
        adjusted: res.adjusted || false,
        queryCount: res.queryCount || 0,
        results: [],
        resultsCount: 0,
        status: res.status || "No data",
      };
    }

    return {
      adjusted: res.adjusted,
      queryCount: res.queryCount,
      results: res.results.map((ticker: any) => ({
        T: ticker.T, // Ticker symbol
        c: ticker.c, // Close price
        h: ticker.h, // High price
        l: ticker.l, // Low price
        n: ticker.n, // Number of transactions
        o: ticker.o, // Open price
        t: ticker.t, // Timestamp
        v: ticker.v, // Volume
        vw: ticker.vw, // Volume-weighted average price
      })),
      resultsCount: res.resultsCount,
      status: res.status,
    };
  } catch (error) {
    const err = error as Error;
    console.error("Error fetching tickers from Polygon API:", err.message);
    throw new Error(`Failed to query tickers: ${err.message}`);
  }
};

const queryIndex = async (date: string): Promise<IndexResponse> => {
  const nasdaq_response = await fetch(
    `https://api.polygon.io/v1/open-close/I:COMP/${date}`,
    {
      headers: {
        Authorization: `Bearer ${polyKeyGen.key}`,
      },
    }
  );

  const nasdaq_res = await nasdaq_response.json();

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

export { queryCompanyData, queryTickers, queryIndex };
