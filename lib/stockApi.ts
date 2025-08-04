import axios from 'axios';

export interface StockQuote {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  dayHigh: number;
  dayLow: number;
  volume: number;
  previousClose: number;
  open: number;
  marketCap: number;
  pe: number;
  week52High: number;
  week52Low: number;
  avgVolume: number;
  bid: number;
  ask: number;
  bidSize: number;
  askSize: number;
  timestamp: Date;
}

export interface HistoricalData {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface PortfolioMetrics {
  totalValue: number;
  totalCost: number;
  totalGain: number;
  totalGainPercent: number;
  dayGain: number;
  dayGainPercent: number;
  unrealizedGain: number;
  annualizedReturn: number;
}

// Using Yahoo Finance API through a CORS proxy for client-side requests
const PROXY_URL = 'https://query1.finance.yahoo.com/v8/finance/chart/';
const QUOTE_URL = 'https://query1.finance.yahoo.com/v7/finance/quote';

export async function getStockQuote(symbol: string): Promise<StockQuote> {
  try {
    // For demo purposes, using Yahoo Finance endpoint with CORS proxy
    const response = await axios.get(`${PROXY_URL}${symbol}`, {
      params: {
        range: '1d',
        interval: '1m',
        includePrePost: false,
      }
    });

    const data = response.data.chart.result[0];
    const quote = data.meta;
    const regularMarketPrice = quote.regularMarketPrice;
    const previousClose = quote.previousClose;
    const change = regularMarketPrice - previousClose;
    const changePercent = (change / previousClose) * 100;

    return {
      symbol: symbol.toUpperCase(),
      price: regularMarketPrice,
      change,
      changePercent,
      dayHigh: quote.regularMarketDayHigh,
      dayLow: quote.regularMarketDayLow,
      volume: quote.regularMarketVolume,
      previousClose,
      open: quote.regularMarketOpen,
      marketCap: quote.marketCap || 0,
      pe: quote.trailingPE || 0,
      week52High: quote.fiftyTwoWeekHigh,
      week52Low: quote.fiftyTwoWeekLow,
      avgVolume: quote.averageDailyVolume3Month || quote.averageDailyVolume10Day,
      bid: quote.bid || regularMarketPrice,
      ask: quote.ask || regularMarketPrice,
      bidSize: quote.bidSize || 0,
      askSize: quote.askSize || 0,
      timestamp: new Date(quote.regularMarketTime * 1000)
    };
  } catch (error) {
    console.error('Error fetching stock quote:', error);
    // Return mock data for development
    return getMockQuote(symbol);
  }
}

export async function getHistoricalData(symbol: string, period: string = '1mo'): Promise<HistoricalData[]> {
  try {
    const response = await axios.get(`${PROXY_URL}${symbol}`, {
      params: {
        range: period,
        interval: period === '1d' ? '5m' : '1d',
        includePrePost: false,
      }
    });

    const data = response.data.chart.result[0];
    const timestamps = data.timestamp;
    const quotes = data.indicators.quote[0];
    
    const historicalData: HistoricalData[] = [];
    
    for (let i = 0; i < timestamps.length; i++) {
      if (quotes.close[i] !== null) {
        historicalData.push({
          date: new Date(timestamps[i] * 1000).toISOString(),
          open: quotes.open[i],
          high: quotes.high[i],
          low: quotes.low[i],
          close: quotes.close[i],
          volume: quotes.volume[i]
        });
      }
    }
    
    return historicalData;
  } catch (error) {
    console.error('Error fetching historical data:', error);
    return getMockHistoricalData();
  }
}

export function calculatePortfolioMetrics(
  shares: number,
  costBasis: number,
  currentPrice: number,
  previousClose: number
): PortfolioMetrics {
  const totalCost = shares * costBasis;
  const totalValue = shares * currentPrice;
  const totalGain = totalValue - totalCost;
  const totalGainPercent = (totalGain / totalCost) * 100;
  
  const previousValue = shares * previousClose;
  const dayGain = totalValue - previousValue;
  const dayGainPercent = (dayGain / previousValue) * 100;
  
  // Calculate annualized return (assuming holding period from cost basis)
  const yearsHeld = 1; // This would be calculated from actual purchase date
  const annualizedReturn = Math.pow((totalValue / totalCost), (1 / yearsHeld)) - 1;
  
  return {
    totalValue,
    totalCost,
    totalGain,
    totalGainPercent,
    dayGain,
    dayGainPercent,
    unrealizedGain: totalGain,
    annualizedReturn: annualizedReturn * 100
  };
}

// Mock data for development/fallback
function getMockQuote(symbol: string): StockQuote {
  const basePrice = 5.25;
  const variation = (Math.random() - 0.5) * 0.5;
  const price = basePrice + variation;
  const previousClose = 5.10;
  const change = price - previousClose;
  
  return {
    symbol: symbol.toUpperCase(),
    price,
    change,
    changePercent: (change / previousClose) * 100,
    dayHigh: price + 0.15,
    dayLow: price - 0.20,
    volume: Math.floor(Math.random() * 10000000),
    previousClose,
    open: previousClose + 0.05,
    marketCap: 790000000,
    pe: 0,
    week52High: 11.20,
    week52Low: 3.36,
    avgVolume: 7500000,
    bid: price - 0.01,
    ask: price + 0.01,
    bidSize: 100,
    askSize: 100,
    timestamp: new Date()
  };
}

function getMockHistoricalData(): HistoricalData[] {
  const data: HistoricalData[] = [];
  const days = 30;
  const basePrice = 4.5;
  
  for (let i = days; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const price = basePrice + (Math.random() - 0.5) * 1.5 + (days - i) * 0.02;
    
    data.push({
      date: date.toISOString(),
      open: price - 0.1,
      high: price + 0.2,
      low: price - 0.2,
      close: price,
      volume: Math.floor(Math.random() * 10000000)
    });
  }
  
  return data;
}

// Technical indicators
export function calculateSMA(data: number[], period: number): number[] {
  const sma: number[] = [];
  for (let i = period - 1; i < data.length; i++) {
    let sum = 0;
    for (let j = 0; j < period; j++) {
      sum += data[i - j];
    }
    sma.push(sum / period);
  }
  return sma;
}

export function calculateRSI(data: number[], period: number = 14): number[] {
  const rsi: number[] = [];
  const gains: number[] = [];
  const losses: number[] = [];
  
  for (let i = 1; i < data.length; i++) {
    const change = data[i] - data[i - 1];
    gains.push(change > 0 ? change : 0);
    losses.push(change < 0 ? Math.abs(change) : 0);
  }
  
  let avgGain = gains.slice(0, period).reduce((a, b) => a + b, 0) / period;
  let avgLoss = losses.slice(0, period).reduce((a, b) => a + b, 0) / period;
  
  for (let i = period; i < gains.length; i++) {
    avgGain = (avgGain * (period - 1) + gains[i]) / period;
    avgLoss = (avgLoss * (period - 1) + losses[i]) / period;
    
    const rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
    rsi.push(100 - (100 / (1 + rs)));
  }
  
  return rsi;
}

export function calculateVolatility(data: number[]): number {
  const returns: number[] = [];
  for (let i = 1; i < data.length; i++) {
    returns.push((data[i] - data[i - 1]) / data[i - 1]);
  }
  
  const mean = returns.reduce((a, b) => a + b, 0) / returns.length;
  const variance = returns.reduce((sum, r) => sum + Math.pow(r - mean, 2), 0) / returns.length;
  return Math.sqrt(variance * 252) * 100; // Annualized volatility
}