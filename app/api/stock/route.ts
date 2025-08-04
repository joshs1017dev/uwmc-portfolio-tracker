import { NextResponse } from 'next/server';
import axios from 'axios';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const symbol = searchParams.get('symbol') || 'UWMC';
  const range = searchParams.get('range') || '1d';
  
  try {
    // Using Alpha Vantage as a free alternative (get free API key from alphavantage.co)
    // For now, using mock data that simulates real market behavior
    const mockData = generateRealisticMockData(symbol);
    
    return NextResponse.json(mockData);
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch stock data' },
      { status: 500 }
    );
  }
}

function generateRealisticMockData(symbol: string) {
  const basePrice = 5.25; // Current approximate UWMC price
  const now = new Date();
  const marketOpen = new Date(now);
  marketOpen.setHours(9, 30, 0, 0);
  
  const isMarketOpen = now.getHours() >= 9 && now.getHours() < 16 && 
                       now.getDay() !== 0 && now.getDay() !== 6;
  
  // Generate realistic intraday movement
  const minutesSinceOpen = isMarketOpen ? 
    Math.floor((now.getTime() - marketOpen.getTime()) / 60000) : 390;
  
  const volatility = 0.02; // 2% daily volatility
  const trend = (Math.random() - 0.48) * volatility; // Slight upward bias
  
  const currentPrice = basePrice * (1 + trend + (Math.sin(minutesSinceOpen / 30) * volatility / 2));
  const previousClose = 5.10;
  const change = currentPrice - previousClose;
  const changePercent = (change / previousClose) * 100;
  
  return {
    symbol: symbol.toUpperCase(),
    price: Number(currentPrice.toFixed(2)),
    change: Number(change.toFixed(2)),
    changePercent: Number(changePercent.toFixed(2)),
    dayHigh: Number((currentPrice * 1.015).toFixed(2)),
    dayLow: Number((currentPrice * 0.985).toFixed(2)),
    volume: Math.floor(Math.random() * 5000000 + 5000000),
    previousClose,
    open: Number((previousClose + 0.05).toFixed(2)),
    marketCap: 790000000,
    pe: 0,
    week52High: 11.20,
    week52Low: 3.36,
    avgVolume: 7500000,
    bid: Number((currentPrice - 0.01).toFixed(2)),
    ask: Number((currentPrice + 0.01).toFixed(2)),
    bidSize: Math.floor(Math.random() * 500 + 100),
    askSize: Math.floor(Math.random() * 500 + 100),
    timestamp: now.toISOString(),
    isMarketOpen,
    nextUpdate: isMarketOpen ? 1000 : 60000 // Update every second during market hours
  };
}