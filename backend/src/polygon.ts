
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

interface PortfolioResponse {

}

const POLYGON_API_KEY = process.env.POLYGON_API_KEY || "";

const queryCompanyDataNoCache = async ({
    ticker,
    from = new Date().toISOString().substring(0, 10),
    to = new Date().toISOString().substring(0, 10),
    interval = "half-hour"
}: CompanyQueryParams): Promise<CompanyResponse> => {
    const timespan = interval === "half-hour" ? "minute" : interval;
    const multiplier = interval === "half-hour" ? 30 : 1;
    
    const data = await fetch(`https://api.polygon.io/v2/aggs/ticker/${ ticker }/range/${ multiplier }/${ timespan }/${ from }/${ to }`, {
        headers: {
            "Authorization": `Bearer ${ POLYGON_API_KEY }`
        }
    })
        .then(res => res.json())
        .then(res => {
            return {
                ticker,
                count: res.resultsCount,
                start: new Date(from),
                end: new Date(to),
                prices: res.results.map((e: {
                    c: number;  // close
                    h: number;  // high
                    l: number;  // low
                    o: number;  // open
                    t: number;  // timestamp
                    vw: number; // average
                }) => {
                    return {
                        average: e.vw,
                        close: e.c,
                        high: e.h,
                        low: e.l,
                        open: e.o,
                        openTimestamp: e.t
                    }
                })
            }
        });

    return data;
}

const queryCompanyData = async ({
    ticker,
    from = new Date().toISOString().substring(0, 10),
    to = new Date().toISOString().substring(0, 10),
    interval = "half-hour"
}: CompanyQueryParams): Promise<CompanyResponse> => {
    // TODO: Check firebase for company data before querying polygon
    return queryCompanyDataNoCache({ ticker, from, to, interval });
}

const queryPortfolio = async ({

}: QueryParams) => {

}

export { queryCompanyData, queryPortfolio }