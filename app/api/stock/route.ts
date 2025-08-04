import { NextResponse } from 'next/server';
import { UWMC_ACTUAL_DATA, calculateMarketCap } from '@/lib/config';

// Using Yahoo Finance API v8 endpoints (no API key needed for basic data)
async function fetchYahooFinance(symbol: string) {
  try {
    const response = await fetch(
      `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?range=1d&interval=1m`,
      {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Accept': 'application/json'
        },
        next: { revalidate: 30 } // Cache for 30 seconds
      }
    );
    
    if (!response.ok) {
      throw new Error(`Yahoo Finance API returned ${response.status}`);
    }
    
    const data = await response.json();
    
    if (!data.chart?.result?.[0]) {
      throw new Error('Invalid response structure from Yahoo Finance');
    }
    
    const result = data.chart.result[0];
    const quote = result.meta;
    
    // Extract real data from Yahoo Finance
    const regularMarketPrice = quote.regularMarketPrice || 0;
    const previousClose = quote.previousClose || quote.chartPreviousClose || regularMarketPrice;
    const change = regularMarketPrice - previousClose;
    const changePercent = previousClose !== 0 ? (change / previousClose) * 100 : 0;
    
    // Calculate real market cap based on actual shares outstanding
    const marketCap = calculateMarketCap(regularMarketPrice);
    
    return {
      symbol: symbol.toUpperCase(),
      price: regularMarketPrice,
      change,
      changePercent,
      dayHigh: quote.regularMarketDayHigh || regularMarketPrice,
      dayLow: quote.regularMarketDayLow || regularMarketPrice,
      volume: quote.regularMarketVolume || 0,
      previousClose,
      open: quote.regularMarketOpen || previousClose,
      marketCap,
      pe: quote.trailingPE || null, // Use null for N/A instead of 0
      week52High: quote.fiftyTwoWeekHigh || UWMC_ACTUAL_DATA.WEEK_52_HIGH,
      week52Low: quote.fiftyTwoWeekLow || UWMC_ACTUAL_DATA.WEEK_52_LOW,
      avgVolume: quote.averageDailyVolume10Day || UWMC_ACTUAL_DATA.AVG_VOLUME,
      bid: quote.bid || regularMarketPrice,
      ask: quote.ask || regularMarketPrice,
      bidSize: quote.bidSize || 0,
      askSize: quote.askSize || 0,
      timestamp: new Date().toISOString(),
      isMarketOpen: isMarketOpen(),
      dataSource: 'Yahoo Finance'
    };
  } catch (error) {
    console.error('Yahoo Finance API error:', error);
    throw error; // Propagate error to try alternative sources
  }
}

// Fallback to Alpha Vantage if Yahoo fails
async function fetchAlphaVantage(symbol: string) {
  const apiKey = process.env.ALPHA_VANTAGE_API_KEY || 'demo';
  
  try {
    const response = await fetch(
      `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${apiKey}`
    );
    
    if (!response.ok) {
      throw new Error(`Alpha Vantage API returned ${response.status}`);
    }
    
    const data = await response.json();
    
    if (data['Note'] || data['Information']) {
      throw new Error('API rate limit reached');
    }
    
    const quote = data['Global Quote'];
    if (!quote || !quote['05. price']) {
      throw new Error('Invalid response from Alpha Vantage');
    }
    
    const price = parseFloat(quote['05. price']);
    const previousClose = parseFloat(quote['08. previous close']);
    const change = parseFloat(quote['09. change']);
    const changePercent = parseFloat(quote['10. change percent']?.replace('%', '') || '0');
    
    return {
      symbol: symbol.toUpperCase(),
      price,
      change,
      changePercent,
      dayHigh: parseFloat(quote['03. high']),
      dayLow: parseFloat(quote['04. low']),
      volume: parseInt(quote['06. volume']),
      previousClose,
      open: parseFloat(quote['02. open']),
      marketCap: calculateMarketCap(price),
      pe: null,
      week52High: UWMC_ACTUAL_DATA.WEEK_52_HIGH,
      week52Low: UWMC_ACTUAL_DATA.WEEK_52_LOW,
      avgVolume: UWMC_ACTUAL_DATA.AVG_VOLUME,
      bid: price - 0.01,
      ask: price + 0.01,
      bidSize: 0,
      askSize: 0,
      timestamp: new Date().toISOString(),
      isMarketOpen: isMarketOpen(),
      dataSource: 'Alpha Vantage'
    };
  } catch (error) {
    console.error('Alpha Vantage API error:', error);
    throw error;
  }
}

function isMarketOpen() {
  const now = new Date();
  const nyTime = new Date(now.toLocaleString("en-US", {timeZone: "America/New_York"}));
  const day = nyTime.getDay();
  const hours = nyTime.getHours();
  const minutes = nyTime.getMinutes();
  
  // Market closed on weekends
  if (day === 0 || day === 6) return false;
  
  // Market hours: 9:30 AM - 4:00 PM ET
  const currentMinutes = hours * 60 + minutes;
  const marketOpen = 9 * 60 + 30; // 9:30 AM
  const marketClose = 16 * 60; // 4:00 PM
  
  return currentMinutes >= marketOpen && currentMinutes < marketClose;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const symbol = searchParams.get('symbol') || 'UWMC';
  
  let data;
  let error: any;
  
  // Try Yahoo Finance first
  try {
    data = await fetchYahooFinance(symbol);
  } catch (yahooError) {
    console.log('Yahoo Finance failed, trying Alpha Vantage...');
    error = yahooError;
    
    // Try Alpha Vantage as fallback
    try {
      data = await fetchAlphaVantage(symbol);
    } catch (alphaError) {
      console.error('All API sources failed');
      error = alphaError;
    }
  }
  
  // If all APIs fail, return error (no mock data!)
  if (!data) {
    return NextResponse.json(
      { 
        error: 'Unable to fetch stock data',
        message: 'All data sources are currently unavailable. Please try again later.',
        details: error?.message
      },
      { 
        status: 503,
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate'
        }
      }
    );
  }
  
  // Return successful data
  return NextResponse.json(data, {
    headers: {
      'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=60'
    }
  });
}