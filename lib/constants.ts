export interface CurrencyMeta {
  code: string;
  name: string;
  symbol: string;
  country: string;
}

// Initial focus set, per the product spec (section 9.2).
export const MAJOR_CURRENCIES: CurrencyMeta[] = [
  { code: "USD", name: "US Dollar", symbol: "$", country: "United States" },
  { code: "EUR", name: "Euro", symbol: "€", country: "Eurozone" },
  { code: "INR", name: "Indian Rupee", symbol: "₹", country: "India" },
  { code: "GBP", name: "British Pound", symbol: "£", country: "United Kingdom" },
  { code: "JPY", name: "Japanese Yen", symbol: "JPY", country: "Japan" },
  { code: "CNY", name: "Chinese Yuan", symbol: "CNY", country: "China" },
  { code: "CHF", name: "Swiss Franc", symbol: "Fr", country: "Switzerland" },
  { code: "CAD", name: "Canadian Dollar", symbol: "$", country: "Canada" },
  { code: "AUD", name: "Australian Dollar", symbol: "$", country: "Australia" },
  { code: "SGD", name: "Singapore Dollar", symbol: "$", country: "Singapore" }
  // NOTE: RUB and AED are in the original spec's list but are not carried
  // by Frankfurter/ECB, so they're left out here rather than silently
  // faked -- see the README "Known limitations" section.
];

export const DEFAULT_BASE = "USD";
export const HIGHLIGHT_CODE = "INR";

export interface CryptoMeta {
  id: string; // CoinGecko id
  symbol: string;
  name: string;
}

export const MAJOR_CRYPTO: CryptoMeta[] = [
  { id: "bitcoin", symbol: "BTC", name: "Bitcoin" },
  { id: "ethereum", symbol: "ETH", name: "Ethereum" },
  { id: "binancecoin", symbol: "BNB", name: "BNB" },
  { id: "solana", symbol: "SOL", name: "Solana" },
  { id: "ripple", symbol: "XRP", name: "XRP" },
  { id: "cardano", symbol: "ADA", name: "Cardano" },
  { id: "dogecoin", symbol: "DOGE", name: "Dogecoin" },
  { id: "tether", symbol: "USDT", name: "Tether (stablecoin)" }
];

export function currencyMeta(code: string): CurrencyMeta | undefined {
  return MAJOR_CURRENCIES.find((c) => c.code === code.toUpperCase());
}

export function cryptoMeta(id: string): CryptoMeta | undefined {
  return MAJOR_CRYPTO.find((c) => c.id === id || c.symbol === id.toUpperCase());
}
