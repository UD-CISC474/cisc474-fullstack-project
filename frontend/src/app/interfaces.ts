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
  n: number; // Number of trades
  o: number; // Open price
  t: number; // Timestamp
  v: number; // Volume
  vw: number; // Volume weighted average price
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
  currency: { [id: string]: Stock };
}

export interface TickerResult {
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
