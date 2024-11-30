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
  successful: boolean;
  ticker: string;
  count: number;
  start: Date;
  end: Date;
  prices: Price[];
}

const POLYGON_API_KEY = environment.POLYGON_API_KEY || "";

// Directly queries Polygon API for price information about a company/stock
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

// Retrieves price information about a company/stock (checks firebase as cache)
const queryCompanyData = async ({
  ticker,
  from = new Date().toISOString().substring(0, 10),
  to = new Date().toISOString().substring(0, 10),
  interval = "half-hour",
}: CompanyQueryParams): Promise<CompanyResponse> => {
  // TODO: Check firebase for company data before querying polygon
  return queryCompanyDataNoCache({ ticker, from, to, interval });
};

export {
  queryCompanyData,
};
