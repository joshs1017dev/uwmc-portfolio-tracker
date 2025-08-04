'use client';

import React from 'react';
import { DollarSign, TrendingUp, Calendar, Target, Percent, AlertCircle } from 'lucide-react';

const SHARES = 9876;
const PURCHASE_PRICE = 4.05;
const PURCHASE_DATE = '2024-07-30';

export default function AdvancedAnalytics() {
  const currentPrice = 5.25; // This would come from API in real app
  const totalInvestment = SHARES * PURCHASE_PRICE;
  const currentValue = SHARES * currentPrice;
  const totalGain = currentValue - totalInvestment;
  const percentGain = (totalGain / totalInvestment) * 100;
  
  // Calculate days since purchase
  const daysSincePurchase = Math.floor((new Date().getTime() - new Date(PURCHASE_DATE).getTime()) / (1000 * 60 * 60 * 24));
  const dailyGainRate = totalGain / daysSincePurchase;
  
  // Simple projections
  const projectedValue30Days = currentValue + (dailyGainRate * 30);
  const projectedValue90Days = currentValue + (dailyGainRate * 90);
  const projectedValue1Year = currentValue + (dailyGainRate * 365);

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
              <h3 className="text-lg font-semibold text-white">Daily Average</h3>
            </div>
            <p className="text-3xl font-bold text-white mb-2">{formatCurrency(dailyGainRate)}</p>
            <p className="text-sm text-gray-400">Over {daysSincePurchase} days</p>
          </div>
        </div>

        {/* Simple Projections */}
        <div className="mb-8">
          <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
            <Target className="w-5 h-5 text-yellow-400" />
            Future Projections
          </h3>
          <p className="text-sm text-gray-400 mb-4">Based on your current average daily performance</p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gray-800/50 rounded-lg p-4">
              <p className="text-sm text-gray-400 mb-2">In 30 Days</p>
              <p className="text-2xl font-bold text-white">{formatCurrency(projectedValue30Days)}</p>
              <p className="text-sm text-green-400 mt-1">
                +{formatCurrency(projectedValue30Days - currentValue)}
              </p>
            </div>
            
            <div className="bg-gray-800/50 rounded-lg p-4">
              <p className="text-sm text-gray-400 mb-2">In 90 Days</p>
              <p className="text-2xl font-bold text-white">{formatCurrency(projectedValue90Days)}</p>
              <p className="text-sm text-green-400 mt-1">
                +{formatCurrency(projectedValue90Days - currentValue)}
              </p>
            </div>
            
            <div className="bg-gray-800/50 rounded-lg p-4">
              <p className="text-sm text-gray-400 mb-2">In 1 Year</p>
              <p className="text-2xl font-bold text-white">{formatCurrency(projectedValue1Year)}</p>
              <p className="text-sm text-green-400 mt-1">
                +{formatCurrency(projectedValue1Year - currentValue)}
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

        {/* Disclaimer */}
        <div className="mt-8 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
          <div className="flex gap-3">
            <AlertCircle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-gray-300">
              <p className="font-medium text-yellow-400 mb-1">Investment Disclaimer</p>
              <p>Projections are based on historical performance and do not guarantee future results. Stock prices can be volatile and you may lose money. Always do your own research.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}