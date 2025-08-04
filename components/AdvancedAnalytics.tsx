'use client';

import React from 'react';
import { DollarSign, TrendingUp, Calendar, Target, Percent, AlertCircle } from 'lucide-react';

const SHARES = 9876;
const PURCHASE_PRICE = 4.05;
const PURCHASE_DATE = '2025-07-30';

export default function AdvancedAnalytics() {
  const currentPrice = 5.25; // This would come from API in real app
  const totalInvestment = SHARES * PURCHASE_PRICE;
  const currentValue = SHARES * currentPrice;
  const totalGain = currentValue - totalInvestment;
  const percentGain = (totalGain / totalInvestment) * 100;
  
  // Calculate days since purchase
  const daysSincePurchase = Math.floor((new Date().getTime() - new Date(PURCHASE_DATE).getTime()) / (1000 * 60 * 60 * 24));
  
  // Calculate realistic annualized return based on current performance
  const dailyReturn = percentGain / daysSincePurchase / 100;
  const annualizedReturn = Math.min((Math.pow(1 + dailyReturn, 365) - 1) * 100, 30); // Cap at 30% annually
  
  // Use conservative projections based on realistic annual returns
  const conservativeAnnualReturn = 0.08; // 8% annual return
  const moderateAnnualReturn = 0.12; // 12% annual return
  const optimisticAnnualReturn = Math.min(annualizedReturn / 100, 0.20); // Current trend or 20% max
  
  // Calculate projections using compound interest formula
  const projectedValue30Days = currentValue * Math.pow(1 + (moderateAnnualReturn / 365), 30);
  const projectedValue90Days = currentValue * Math.pow(1 + (moderateAnnualReturn / 365), 90);
  const projectedValue1Year = currentValue * Math.pow(1 + moderateAnnualReturn, 1);
  
  // Calculate daily average gain (for display only, not for projections!)
  const dailyGainDollars = totalGain / Math.max(daysSincePurchase, 1);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
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
            <p className="text-sm text-green-400">+{formatCurrency(totalGain)} ({percentGain.toFixed(1)}%)</p>
          </div>

          <div className="bg-gradient-to-br from-purple-500/10 to-purple-600/10 border border-purple-500/20 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-3">
              <Calendar className="w-6 h-6 text-purple-400" />
              <h3 className="text-lg font-semibold text-white">Performance</h3>
            </div>
            <p className="text-3xl font-bold text-white mb-2">{annualizedReturn.toFixed(1)}%</p>
            <p className="text-sm text-gray-400">Annualized return (if trend continues)</p>
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
                {formatCurrency(currentValue * 1.08)}
              </p>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg border border-blue-500/20">
              <div>
                <p className="text-white font-medium">Moderate (12% annual)</p>
                <p className="text-sm text-gray-400">Good growth scenario</p>
              </div>
              <p className="text-xl font-bold text-white">
                {formatCurrency(currentValue * 1.12)}
              </p>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg">
              <div>
                <p className="text-white font-medium">Optimistic (20% annual)</p>
                <p className="text-sm text-gray-400">Best case scenario</p>
              </div>
              <p className="text-xl font-bold text-white">
                {formatCurrency(currentValue * 1.20)}
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
            <p className="text-lg font-bold text-green-400">{formatCurrency(dailyGainDollars)}</p>
          </div>
          <div className="bg-gray-800/50 rounded-lg p-3">
            <p className="text-xs text-gray-400 mb-1">Total Return</p>
            <p className="text-lg font-bold text-green-400">{percentGain.toFixed(1)}%</p>
          </div>
          <div className="bg-gray-800/50 rounded-lg p-3">
            <p className="text-xs text-gray-400 mb-1">Per Share Gain</p>
            <p className="text-lg font-bold text-green-400">${((currentPrice - PURCHASE_PRICE)).toFixed(2)}</p>
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