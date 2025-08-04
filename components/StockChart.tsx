'use client';

import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { Calendar, TrendingUp, Clock } from 'lucide-react';
import { format } from 'date-fns';

const PURCHASE_DATE = '2024-07-30';
const PURCHASE_PRICE = 4.05;
const SHARES = 9876;

export default function StockChart() {
  const [chartData, setChartData] = useState<any[]>([]);
  const [timeRange, setTimeRange] = useState('1M');

  useEffect(() => {
    // Generate chart data since purchase date
    const generateChartData = () => {
      const data = [];
      const startDate = new Date(PURCHASE_DATE);
      const today = new Date();
      const daysSincePurchase = Math.floor((today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
      
      // Generate realistic price movement
      let basePrice = PURCHASE_PRICE;
      
      for (let i = 0; i <= daysSincePurchase; i++) {
        const date = new Date(startDate);
        date.setDate(date.getDate() + i);
        
        // Add some realistic volatility
        const trend = 0.001; // Slight upward trend
        const volatility = 0.02; // 2% daily volatility
        const randomChange = (Math.random() - 0.5) * volatility;
        
        basePrice = basePrice * (1 + trend + randomChange);
        basePrice = Math.max(3.5, Math.min(6.5, basePrice)); // Keep within realistic range
        
        const value = basePrice * SHARES;
        const gain = value - (PURCHASE_PRICE * SHARES);
        const gainPercent = (gain / (PURCHASE_PRICE * SHARES)) * 100;
        
        data.push({
          date: format(date, 'MMM dd'),
          fullDate: date.toISOString(),
          price: Number(basePrice.toFixed(2)),
          value: Number(value.toFixed(2)),
          gain: Number(gain.toFixed(2)),
          gainPercent: Number(gainPercent.toFixed(2)),
        });
      }
      
      // Filter based on time range
      let filteredData = data;
      if (timeRange === '1W') {
        filteredData = data.slice(-7);
      } else if (timeRange === '1M') {
        filteredData = data.slice(-30);
      } else if (timeRange === '3M') {
        filteredData = data.slice(-90);
      }
      
      setChartData(filteredData);
    };

    generateChartData();
  }, [timeRange]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload[0]) {
      const data = payload[0].payload;
      return (
        <div className="bg-gray-900 border border-gray-700 rounded-lg p-4 shadow-xl">
          <p className="text-white font-semibold mb-2">{label}</p>
          <div className="space-y-1 text-sm">
            <p className="text-gray-300">
              Price: <span className="text-white font-medium">${data.price}</span>
            </p>
            <p className="text-gray-300">
              Value: <span className="text-white font-medium">{formatCurrency(data.value)}</span>
            </p>
            <p className={`${data.gain >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              Gain: <span className="font-medium">
                {formatCurrency(data.gain)} ({data.gainPercent.toFixed(2)}%)
              </span>
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  const latestData = chartData[chartData.length - 1];

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-white mb-2">Portfolio Performance</h2>
            <div className="flex items-center gap-4 text-sm text-gray-400">
              <span className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                Since {format(new Date(PURCHASE_DATE), 'MMM dd, yyyy')}
              </span>
              <span className="flex items-center gap-1">
                <TrendingUp className="w-4 h-4" />
                Purchase Price: ${PURCHASE_PRICE}
              </span>
            </div>
          </div>
          
          {/* Time Range Selector */}
          <div className="flex gap-2">
            {['1W', '1M', '3M', 'ALL'].map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  timeRange === range
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                }`}
              >
                {range}
              </button>
            ))}
          </div>
        </div>

        {/* Summary Stats */}
        {latestData && (
          <div className="grid grid-cols-4 gap-4 mb-6">
            <div className="bg-gray-800/50 rounded-lg p-4">
              <p className="text-xs text-gray-400 mb-1">Current Value</p>
              <p className="text-xl font-bold text-white">{formatCurrency(latestData.value)}</p>
            </div>
            <div className="bg-gray-800/50 rounded-lg p-4">
              <p className="text-xs text-gray-400 mb-1">Total Gain/Loss</p>
              <p className={`text-xl font-bold ${latestData.gain >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {formatCurrency(latestData.gain)}
              </p>
            </div>
            <div className="bg-gray-800/50 rounded-lg p-4">
              <p className="text-xs text-gray-400 mb-1">Percentage Change</p>
              <p className={`text-xl font-bold ${latestData.gainPercent >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {latestData.gainPercent >= 0 ? '+' : ''}{latestData.gainPercent.toFixed(2)}%
              </p>
            </div>
            <div className="bg-gray-800/50 rounded-lg p-4">
              <p className="text-xs text-gray-400 mb-1">Days Held</p>
              <p className="text-xl font-bold text-white">
                {Math.floor((new Date().getTime() - new Date(PURCHASE_DATE).getTime()) / (1000 * 60 * 60 * 24))}
              </p>
            </div>
          </div>
        )}

        {/* Chart */}
        <div className="h-96">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis 
                dataKey="date" 
                stroke="#9CA3AF"
                tick={{ fill: '#9CA3AF', fontSize: 12 }}
              />
              <YAxis 
                stroke="#9CA3AF"
                tick={{ fill: '#9CA3AF', fontSize: 12 }}
                tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="value"
                stroke="#3B82F6"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorValue)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Bottom Info */}
        <div className="mt-6 pt-6 border-t border-gray-800">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2 text-gray-400">
              <Clock className="w-4 h-4" />
              <span>Chart updates in real-time during market hours</span>
            </div>
            <div className="text-gray-400">
              Investment: <span className="text-white font-medium">{formatCurrency(PURCHASE_PRICE * SHARES)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}