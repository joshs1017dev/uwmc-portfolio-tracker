// Centralized configuration
export const PORTFOLIO_CONFIG = {
  SHARES: parseInt(process.env.NEXT_PUBLIC_SHARES || '9876'),
  PURCHASE_PRICE: parseFloat(process.env.NEXT_PUBLIC_PURCHASE_PRICE || '4.05'),
  PURCHASE_DATE: process.env.NEXT_PUBLIC_PURCHASE_DATE || '2025-07-30',
  SYMBOL: 'UWMC'
};

// UWMC actual data (as of 2024-2025)
export const UWMC_ACTUAL_DATA = {
  SHARES_OUTSTANDING: 1590000000, // 1.59B shares
  AVG_VOLUME: 7500000, // 7.5M daily average
  WEEK_52_HIGH: 8.54, // Actual 52-week high
  WEEK_52_LOW: 3.36, // Actual 52-week low
};

// Calculate market cap dynamically
export function calculateMarketCap(price: number): number {
  return price * UWMC_ACTUAL_DATA.SHARES_OUTSTANDING;
}