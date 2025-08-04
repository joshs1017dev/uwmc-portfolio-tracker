'use client';

import { useState, useEffect } from 'react';
import Dashboard from '@/components/Dashboard';
import StockChart from '@/components/StockChart';
import AdvancedAnalytics from '@/components/AdvancedAnalytics';
import VestingSchedule from '@/components/VestingSchedule';

export default function Home() {
  const [currentPrice, setCurrentPrice] = useState<number>(0);

  useEffect(() => {
    const fetchPrice = async () => {
      try {
        const response = await fetch('/api/stock?symbol=UWMC');
        const data = await response.json();
        if (data.price) {
          setCurrentPrice(data.price);
        }
      } catch (error) {
        console.error('Error fetching stock price:', error);
      }
    };

    fetchPrice();
    const interval = setInterval(fetchPrice, 15000);

    return () => clearInterval(interval);
  }, []);

  return (
    <main>
      <Dashboard />
      <VestingSchedule currentPrice={currentPrice} />
      <StockChart />
      <AdvancedAnalytics />
    </main>
  );
}