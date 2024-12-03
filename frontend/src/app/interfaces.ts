export interface Stock {
  stockSymbol: string;
  shares: number;
  price: number;
}

export interface SelectedTicker {
  T: string; // Ticker symbol
  c: number; // Close price
  h: number; // High price
  l: number; // Low price
  o: number; // Open price
  t: number; // Timestamp
  uv: number; // total user value owned in this stock
  us: number; // total shares owned by user
}

export interface StocksResponse {
  success: boolean;
  message: string;
  stocks: { [id: string]: Stock };
}

export interface Transaction {
  price: number;
  shares: number;
  stockSymbol: string;
  timestamp: string;
  total: number;
}

export interface Stock {
  price: number;
  shares: number;
  stockSymbol: string;
  total: number;
  change: number;
}

export interface CurrencyResponse {
  success: boolean;
  message: string;
  currency: number;
}

interface Price {
  average: number;
  close: number;
  high: number;
  low: number;
  open: number;
  openTimestamp: number;
}

export interface CompanyResponse {
  successful: boolean;
  ticker: string;
  count: number;
  start: Date;
  end: Date;
  prices: Price[];
}
