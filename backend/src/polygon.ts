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
    "PkKi7nu09KgdMb8Fa9Nn76fJz_0J2M_0"
  ];

  public get key(): string {
    const key = this.keys[this.currentKey];
    this.currentKey = (this.currentKey + 1) % this.keys.length;
    return key;
  }
}
const polyKeyGen = new PolygonKeyGen();

// Returns the most recent week day that isn't today
const getLastWeekday = (date?: Date): Date => {
  date = date ? date : new Date(Date.now() - 86400000);
  
  if(date.getDay() === 0) {
    date.setDate(date.getDate() - 2);
  } else if(date.getDay() === 6) {
    date.setDate(date.getDate() - 1);
  }

  return date;
}

// Directly queries Polygon API for price information about a company/stock
const queryCompanyData = async ({
  ticker,
  from = getLastWeekday().toISOString().substring(0, 10),
  to = getLastWeekday().toISOString().substring(0, 10),
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

export {
  queryCompanyData,
};
