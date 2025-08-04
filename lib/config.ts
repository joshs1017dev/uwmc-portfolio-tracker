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

// RSU Vesting Schedule Configuration
export interface VestingEvent {
  date: string;
  shares: number;
  grantId: string;
  grantDate: string;
  grantPrice: number;
}

export const RSU_VESTING_SCHEDULE: VestingEvent[] = [
  {
    date: '2025-09-15',
    shares: 2500,
    grantId: 'RSU-2024-001',
    grantDate: '2024-09-15',
    grantPrice: 5.25
  },
  {
    date: '2025-12-15',
    shares: 2500,
    grantId: 'RSU-2024-001',
    grantDate: '2024-09-15',
    grantPrice: 5.25
  },
  {
    date: '2026-03-15',
    shares: 2500,
    grantId: 'RSU-2024-001',
    grantDate: '2024-09-15',
    grantPrice: 5.25
  },
  {
    date: '2026-06-15',
    shares: 2469,
    grantId: 'RSU-2024-001',
    grantDate: '2024-09-15',
    grantPrice: 5.25
  }
];

// Tax withholding rates (adjust based on your situation)
export const TAX_CONFIG = {
  FEDERAL_RATE: 0.22, // 22% supplemental income rate
  STATE_RATE: 0.0925, // Example: CA state tax
  FICA_RATE: 0.0765, // Social Security + Medicare
  SELL_TO_COVER: true // Whether to sell shares for tax withholding
};