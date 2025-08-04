'use client';

import React, { useState, useEffect } from 'react';
import { DollarSign, TrendingUp, Calendar, Target, Percent, AlertCircle } from 'lucide-react';

const SHARES = 9876;
const PURCHASE_PRICE = 4.05;
const PURCHASE_DATE = '2024-07-30'; // July 30, 2024

export default function AdvancedAnalytics() {
  const [stockData, setStockData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/stock?symbol=UWMC');
        const data = await response.json();
        setStockData(data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching stock data:', error);
        setLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 30000); // Update every 30 seconds
    return () => clearInterval(interval);
  }, []);

  if (loading || !stockData) {
    return (
      <div className="max-w-7xl mx-auto px-6 pb-8">
        <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-6">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-800 rounded w-1/3 mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="h-32 bg-gray-800 rounded"></div>
              <div className="h-32 bg-gray-800 rounded"></div>
              <div className="h-32 bg-gray-800 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const currentPrice = stockData.price || 5.25;
  const totalInvestment = SHARES * PURCHASE_PRICE;
  const currentValue = SHARES * currentPrice;
  const totalGain = currentValue - totalInvestment;
  const percentGain = (totalGain / totalInvestment) * 100;
  
  // Calculate actual days since purchase (July 30, 2024)
  const purchaseDate = new Date(PURCHASE_DATE);
  const today = new Date();
  const daysSincePurchase = Math.floor((today.getTime() - purchaseDate.getTime()) / (1000 * 60 * 60 * 24));
  
  // Calculate realistic annualized return based on actual performance
  const yearsHeld = daysSincePurchase / 365;
  const actualAnnualizedReturn = yearsHeld > 0 ? 
    (Math.pow(currentValue / totalInvestment, 1 / yearsHeld) - 1) * 100 : 
    percentGain;
  
  // Cap annualized return at reasonable levels
  const displayedAnnualizedReturn = Math.min(actualAnnualizedReturn, 50);
  
  // Use conservative projections based on realistic annual returns
  const conservativeAnnualReturn = 0.08; // 8% annual return
  const moderateAnnualReturn = 0.12; // 12% annual return
  const optimisticAnnualReturn = 0.20; // 20% annual return
  
  // Calculate projections using compound interest formula
  const projectedValue30Days = currentValue * Math.pow(1 + (moderateAnnualReturn / 365), 30);
  const projectedValue90Days = currentValue * Math.pow(1 + (moderateAnnualReturn / 365), 90);
  const projectedValue1Year = currentValue * Math.pow(1 + moderateAnnualReturn, 1);
  
  // Calculate daily average gain (for display only)
  const dailyGainDollars = daysSincePurchase > 0 ? totalGain / daysSincePurchase : 0;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  const formatPercent = (value: number) => {
    return `${value >= 0 ? '+' : ''}${value.toFixed(1)}%`;
  };

  return (
    <div className="max-w-7xl mx-auto px-6 pb-8">
      <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-6">
        <h2 className="text-2xl font-bold text-white mb-6">Investment Summary & Projections</h2>
        
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gradient-to-br from-blue-500/10 to-blue-600/10 border border-blue-500/20 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-3">
              <DollarSign className="w-6 h-6 text-blue-400" />
              <h3 className="text-lg font-semibold text-white">Your Investment</h3>
            </div>
            <p className="text-3xl font-bold text-white mb-2">{formatCurrency(totalInvestment)}</p>
            <p className="text-sm text-gray-400">{SHARES.toLocaleString()} shares @ ${PURCHASE_PRICE}</p>
          </div>

          <div className="bg-gradient-to-br from-green-500/10 to-green-600/10 border border-green-500/20 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-3">
              <TrendingUp className="w-6 h-6 text-green-400" />
              <h3 className="text-lg font-semibold text-white">Current Value</h3>
            </div>
            <p className="text-3xl font-bold text-white mb-2">{formatCurrency(currentValue)}</p>
            <p className={`text-sm ${totalGain >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {formatCurrency(Math.abs(totalGain))} ({formatPercent(percentGain)})
            </p>
          </div>

          <div className="bg-gradient-to-br from-purple-500/10 to-purple-600/10 border border-purple-500/20 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-3">
              <Calendar className="w-6 h-6 text-purple-400" />
              <h3 className="text-lg font-semibold text-white">Performance</h3>
            </div>
            <p className="text-3xl font-bold text-white mb-2">{formatPercent(displayedAnnualizedReturn)}</p>
            <p className="text-sm text-gray-400">Annualized return</p>
          </div>
        </div>

        {/* Market Data */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-gray-800/50 rounded-lg p-4">
            <p className="text-xs text-gray-400 mb-1">Current Price</p>
            <p className="text-xl font-bold text-white">${currentPrice.toFixed(2)}</p>
            <p className={`text-xs mt-1 ${stockData?.change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {formatPercent(stockData?.changePercent || 0)}
            </p>
          </div>
          <div className="bg-gray-800/50 rounded-lg p-4">
            <p className="text-xs text-gray-400 mb-1">Day Range</p>
            <p className="text-sm font-medium text-white">
              ${stockData?.dayLow?.toFixed(2) || '0.00'} - ${stockData?.dayHigh?.toFixed(2) || '0.00'}
            </p>
          </div>
          <div className="bg-gray-800/50 rounded-lg p-4">
            <p className="text-xs text-gray-400 mb-1">Volume</p>
            <p className="text-xl font-bold text-white">
              {((stockData?.volume || 0) / 1000000).toFixed(1)}M
            </p>
          </div>
          <div className="bg-gray-800/50 rounded-lg p-4">
            <p className="text-xs text-gray-400 mb-1">52 Week Range</p>
            <p className="text-sm font-medium text-white">
              ${stockData?.week52Low?.toFixed(2) || '3.36'} - ${stockData?.week52High?.toFixed(2) || '11.20'}
            </p>
          </div>
        </div>

        {/* Realistic Projections */}
        <div className="mb-8">
          <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
            <Target className="w-5 h-5 text-yellow-400" />
            Conservative Projections
          </h3>
          <p className="text-sm text-gray-400 mb-4">Based on 12% annual return (moderate growth scenario)</p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gray-800/50 rounded-lg p-4">
              <p className="text-sm text-gray-400 mb-2">In 30 Days</p>
              <p className="text-2xl font-bold text-white">{formatCurrency(projectedValue30Days)}</p>
              <p className="text-sm text-green-400 mt-1">
                +{formatCurrency(projectedValue30Days - currentValue)} ({((projectedValue30Days - currentValue) / currentValue * 100).toFixed(1)}%)
              </p>
            </div>
            
            <div className="bg-gray-800/50 rounded-lg p-4">
              <p className="text-sm text-gray-400 mb-2">In 90 Days</p>
              <p className="text-2xl font-bold text-white">{formatCurrency(projectedValue90Days)}</p>
              <p className="text-sm text-green-400 mt-1">
                +{formatCurrency(projectedValue90Days - currentValue)} ({((projectedValue90Days - currentValue) / currentValue * 100).toFixed(1)}%)
              </p>
            </div>
            
            <div className="bg-gray-800/50 rounded-lg p-4">
              <p className="text-sm text-gray-400 mb-2">In 1 Year</p>
              <p className="text-2xl font-bold text-white">{formatCurrency(projectedValue1Year)}</p>
              <p className="text-sm text-green-400 mt-1">
                +{formatCurrency(projectedValue1Year - currentValue)} ({((projectedValue1Year - currentValue) / currentValue * 100).toFixed(1)}%)
              </p>
            </div>
          </div>
        </div>

        {/* Different Scenarios */}
        <div className="mb-8">
          <h3 className="text-xl font-semibold text-white mb-4">Projection Scenarios (1 Year)</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg">
              <div>
                <p className="text-white font-medium">Conservative (8% annual)</p>
                <p className="text-sm text-gray-400">Typical market return</p>
              </div>
              <p className="text-xl font-bold text-white">
                {formatCurrency(currentValue * (1 + conservativeAnnualReturn))}
              </p>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg border border-blue-500/20">
              <div>
                <p className="text-white font-medium">Moderate (12% annual)</p>
                <p className="text-sm text-gray-400">Good growth scenario</p>
              </div>
              <p className="text-xl font-bold text-white">
                {formatCurrency(currentValue * (1 + moderateAnnualReturn))}
              </p>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg">
              <div>
                <p className="text-white font-medium">Optimistic (20% annual)</p>
                <p className="text-sm text-gray-400">Best case scenario</p>
              </div>
              <p className="text-xl font-bold text-white">
                {formatCurrency(currentValue * (1 + optimisticAnnualReturn))}
              </p>
            </div>
          </div>
        </div>

        {/* Milestones */}
        <div>
          <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
            <Percent className="w-5 h-5 text-blue-400" />
            Return Milestones
          </h3>
          
          <div className="space-y-3">
            {[10, 25, 50, 100].map((milestone) => {
              const targetValue = totalInvestment * (1 + milestone / 100);
              const priceNeeded = targetValue / SHARES;
              const isAchieved = currentValue >= targetValue;
              
              return (
                <div 
                  key={milestone}
                  className={`flex items-center justify-between p-4 rounded-lg ${
                    isAchieved ? 'bg-green-500/10 border border-green-500/20' : 'bg-gray-800/50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      isAchieved ? 'bg-green-500' : 'bg-gray-700'
                    }`}>
                      {isAchieved ? '✓' : ''}
                    </div>
                    <div>
                      <p className="text-white font-medium">+{milestone}% Return</p>
                      <p className="text-sm text-gray-400">Stock price: ${priceNeeded.toFixed(2)}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-white font-medium">{formatCurrency(targetValue)}</p>
                    {!isAchieved && (
                      <p className="text-sm text-gray-400">
                        Need +{formatCurrency(targetValue - currentValue)}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Statistics */}
        <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-gray-800/50 rounded-lg p-3">
            <p className="text-xs text-gray-400 mb-1">Days Held</p>
            <p className="text-lg font-bold text-white">{daysSincePurchase}</p>
          </div>
          <div className="bg-gray-800/50 rounded-lg p-3">
            <p className="text-xs text-gray-400 mb-1">Avg Daily Gain</p>
            <p className={`text-lg font-bold ${dailyGainDollars >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {formatCurrency(Math.abs(dailyGainDollars))}
            </p>
          </div>
          <div className="bg-gray-800/50 rounded-lg p-3">
            <p className="text-xs text-gray-400 mb-1">Total Return</p>
            <p className={`text-lg font-bold ${percentGain >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {formatPercent(percentGain)}
            </p>
          </div>
          <div className="bg-gray-800/50 rounded-lg p-3">
            <p className="text-xs text-gray-400 mb-1">Per Share Gain</p>
            <p className={`text-lg font-bold ${(currentPrice - PURCHASE_PRICE) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              ${Math.abs(currentPrice - PURCHASE_PRICE).toFixed(2)}
            </p>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="mt-8 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
          <div className="flex gap-3">
            <AlertCircle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-gray-300">
              <p className="font-medium text-yellow-400 mb-1">Investment Disclaimer</p>
              <p>These projections use conservative estimates (8-20% annual returns). Actual results will vary based on market conditions. Past performance does not guarantee future results. UWMC is a mortgage REIT with inherent volatility.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}