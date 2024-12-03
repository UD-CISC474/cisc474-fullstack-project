export interface StockResponse {
  successful: boolean;
  ticker: string;
  count: number;
  start: string;
  end: string;
  prices: Array<{
    average: number;
    close: number;
    high: number;
    low: number;
    open: number;
    openTimestamp: number;
  }>;
}
