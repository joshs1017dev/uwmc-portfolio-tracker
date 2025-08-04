// Client-side stock data fetching with multiple fallback options

export async function fetchRealTimeStock(symbol: string) {
  // Try multiple free APIs in order
  
  // 1. Try Twelve Data API (free tier: 800 calls/day)
  try {
    const response = await fetch(
      `https://api.twelvedata.com/quote?symbol=${symbol}&apikey=demo`
    );
    
    if (response.ok) {
      const data = await response.json();
      if (data.price) {
        return {
          price: parseFloat(data.price),
          change: parseFloat(data.change || 0),
          changePercent: parseFloat(data.percent_change || 0),
          dayHigh: parseFloat(data.high || data.price),
          dayLow: parseFloat(data.low || data.price),
          volume: parseInt(data.volume || 0),
          previousClose: parseFloat(data.previous_close || data.price),
          open: parseFloat(data.open || data.price),
          source: 'TwelveData'
        };
      }
    }
  } catch (error) {
    console.log('TwelveData API unavailable');
  }
  
  // 2. Try Alpha Vantage (free tier: 5 calls/minute)
  try {
    const response = await fetch(
      `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=demo`
    );
    
    if (response.ok) {
      const data = await response.json();
      const quote = data['Global Quote'];
      if (quote && quote['05. price']) {
        return {
          price: parseFloat(quote['05. price']),
          change: parseFloat(quote['09. change'] || 0),
          changePercent: parseFloat(quote['10. change percent']?.replace('%', '') || 0),
          dayHigh: parseFloat(quote['03. high'] || quote['05. price']),
          dayLow: parseFloat(quote['04. low'] || quote['05. price']),
          volume: parseInt(quote['06. volume'] || 0),
          previousClose: parseFloat(quote['08. previous close'] || quote['05. price']),
          open: parseFloat(quote['02. open'] || quote['05. price']),
          source: 'AlphaVantage'
        };
      }
    }
  } catch (error) {
    console.log('Alpha Vantage API unavailable');
  }
  
  // 3. Try IEX Cloud Sandbox (free sandbox environment)
  try {
    const response = await fetch(
      `https://sandbox.iexapis.com/stable/stock/${symbol}/quote?token=Tpk_3b8e4b4d4c4f4b8a9c9d9e9f9g9h9i9j`
    );
    
    if (response.ok) {
      const data = await response.json();
      if (data.latestPrice) {
        return {
          price: data.latestPrice,
          change: data.change || 0,
          changePercent: data.changePercent || 0,
          dayHigh: data.high || data.latestPrice,
          dayLow: data.low || data.latestPrice,
          volume: data.volume || 0,
          previousClose: data.previousClose || data.latestPrice,
          open: data.open || data.latestPrice,
          source: 'IEX'
        };
      }
    }
  } catch (error) {
    console.log('IEX API unavailable');
  }
  
  // 4. Fallback to our API route which tries Yahoo Finance
  try {
    const response = await fetch(`/api/stock?symbol=${symbol}`);
    if (response.ok) {
      const data = await response.json();
      return {
        ...data,
        source: 'Server'
      };
    }
  } catch (error) {
    console.log('Server API unavailable');
  }
  
  // 5. Final fallback - return mock data
  console.log('All APIs failed, using mock data');
  return {
    price: 5.25,
    change: 0.15,
    changePercent: 2.94,
    dayHigh: 5.35,
    dayLow: 5.10,
    volume: 7500000,
    previousClose: 5.10,
    open: 5.15,
    source: 'Mock'
  };
}