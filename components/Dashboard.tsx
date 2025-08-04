'use client';

import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, TrendingDown, DollarSign, Activity, 
  BarChart3, Clock, AlertCircle, Target, Zap, 
  Calendar, PieChart, Percent, Award
} from 'lucide-react';
import { calculatePortfolioMetrics } from '@/lib/stockApi';
import { format } from 'date-fns';

interface StockData {
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
  timestamp: string;
  isMarketOpen: boolean;
  nextUpdate: number;
}

const SHARES = 9876;
const COST_BASIS = 4.05;

export default function Dashboard() {
  const [stockData, setStockData] = useState<StockData | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [metrics, setMetrics] = useState<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/stock?symbol=UWMC');
        const data = await response.json();
        setStockData(data);
        
        if (data.price) {
          const portfolioMetrics = calculatePortfolioMetrics(
            SHARES,
            COST_BASIS,
            data.price,
            data.previousClose
          );
          setMetrics(portfolioMetrics);
        }
        
        setLastUpdate(new Date());
        setLoading(false);
      } catch (error) {
        console.error('Error fetching stock data:', error);
        setLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 15000); // Update every 15 seconds (to avoid API rate limits)

    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-950">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-400">Loading portfolio data...</p>
        </div>
      </div>
    );
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  };

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat('en-US').format(value);
  };

  const formatPercent = (value: number) => {
    return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`;
  };

  const getColorClass = (value: number) => {
    return value >= 0 ? 'text-green-400' : 'text-red-400';
  };

  const getBgColorClass = (value: number) => {
    return value >= 0 ? 'bg-green-500/10' : 'bg-red-500/10';
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                UWMC Portfolio Tracker
              </h1>
              <p className="text-gray-400 mt-2">Real-time portfolio analytics and performance metrics</p>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <Clock className="w-4 h-4" />
                Last updated: {format(lastUpdate, 'HH:mm:ss')}
              </div>
              <div className="flex items-center gap-2 mt-1">
                {stockData?.isMarketOpen ? (
                  <span className="flex items-center gap-1 text-green-400 text-sm">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    Market Open
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-gray-400 text-sm">
                    <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                    Market Closed
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Main Portfolio Value Card */}
        <div className="bg-gradient-to-br from-blue-900/20 to-purple-900/20 border border-blue-500/20 rounded-2xl p-8 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <p className="text-gray-400 text-sm mb-2">Total Portfolio Value</p>
              <p className="text-5xl font-bold">{formatCurrency(metrics?.totalValue || 0)}</p>
              <div className={`flex items-center gap-2 mt-3 ${getColorClass(metrics?.totalGain || 0)}`}>
                {metrics?.totalGain >= 0 ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
                <span className="text-2xl font-semibold">{formatCurrency(metrics?.totalGain || 0)}</span>
                <span className="text-xl">({formatPercent(metrics?.totalGainPercent || 0)})</span>
              </div>
            </div>
            
            <div>
              <p className="text-gray-400 text-sm mb-2">Today's Performance</p>
              <div className={`text-3xl font-bold ${getColorClass(metrics?.dayGain || 0)}`}>
                {formatCurrency(metrics?.dayGain || 0)}
              </div>
              <div className={`text-xl mt-1 ${getColorClass(metrics?.dayGainPercent || 0)}`}>
                {formatPercent(metrics?.dayGainPercent || 0)}
              </div>
            </div>
            
            <div>
              <p className="text-gray-400 text-sm mb-2">Current Price</p>
              <div className="text-3xl font-bold">{formatCurrency(stockData?.price || 0)}</div>
              <div className={`flex items-center gap-2 mt-1 ${getColorClass(stockData?.change || 0)}`}>
                <span>{formatCurrency(stockData?.change || 0)}</span>
                <span>({formatPercent(stockData?.changePercent || 0)})</span>
              </div>
            </div>
          </div>
        </div>

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <MetricCard
            icon={<DollarSign className="w-5 h-5" />}
            title="Cost Basis"
            value={formatCurrency(COST_BASIS)}
            subtitle={`${formatNumber(SHARES)} shares`}
            color="blue"
          />
          <MetricCard
            icon={<Target className="w-5 h-5" />}
            title="Break Even"
            value={formatCurrency(COST_BASIS)}
            subtitle={`${((stockData?.price || 0) / COST_BASIS * 100 - 100).toFixed(1)}% from current`}
            color="purple"
          />
          <MetricCard
            icon={<Percent className="w-5 h-5" />}
            title="Annualized Return"
            value={`${metrics?.annualizedReturn.toFixed(2) || 0}%`}
            subtitle="Based on current price"
            color="green"
          />
          <MetricCard
            icon={<Award className="w-5 h-5" />}
            title="Total Investment"
            value={formatCurrency(metrics?.totalCost || 0)}
            subtitle="Initial capital"
            color="yellow"
          />
        </div>

        {/* Market Data Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Trading Stats */}
          <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
            <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Activity className="w-5 h-5 text-blue-400" />
              Trading Statistics
            </h3>
            <div className="space-y-3">
              <StatRow label="Open" value={formatCurrency(stockData?.open || 0)} />
              <StatRow label="Previous Close" value={formatCurrency(stockData?.previousClose || 0)} />
              <StatRow label="Day Range" value={`${formatCurrency(stockData?.dayLow || 0)} - ${formatCurrency(stockData?.dayHigh || 0)}`} />
              <StatRow label="52 Week Range" value={`${formatCurrency(stockData?.week52Low || 0)} - ${formatCurrency(stockData?.week52High || 0)}`} />
              <StatRow label="Volume" value={formatNumber(stockData?.volume || 0)} />
              <StatRow label="Avg Volume" value={formatNumber(stockData?.avgVolume || 0)} />
            </div>
          </div>

          {/* Order Book */}
          <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
            <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-purple-400" />
              Order Book & Spread
            </h3>
            <div className="space-y-3">
              <StatRow label="Bid" value={`${formatCurrency(stockData?.bid || 0)} x ${stockData?.bidSize || 0}`} color="text-red-400" />
              <StatRow label="Ask" value={`${formatCurrency(stockData?.ask || 0)} x ${stockData?.askSize || 0}`} color="text-green-400" />
              <StatRow label="Spread" value={formatCurrency((stockData?.ask || 0) - (stockData?.bid || 0))} />
              <StatRow label="Market Cap" value={`$${((stockData?.marketCap || 0) / 1000000).toFixed(0)}M`} />
              <StatRow label="P/E Ratio" value={stockData?.pe ? stockData.pe.toFixed(2) : 'N/A'} />
            </div>
          </div>
        </div>

        {/* Performance Indicators */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <PerformanceIndicator
            title="Price vs 52W High"
            value={((stockData?.price || 0) / (stockData?.week52High || 1) * 100).toFixed(1)}
            max={100}
            color="blue"
          />
          <PerformanceIndicator
            title="Price vs 52W Low"
            value={(((stockData?.price || 0) - (stockData?.week52Low || 0)) / ((stockData?.week52High || 1) - (stockData?.week52Low || 0)) * 100).toFixed(1)}
            max={100}
            color="purple"
          />
          <PerformanceIndicator
            title="Volume vs Average"
            value={((stockData?.volume || 0) / (stockData?.avgVolume || 1) * 100).toFixed(1)}
            max={200}
            color="green"
          />
        </div>

        {/* Advanced Metrics */}
        <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
          <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Zap className="w-5 h-5 text-yellow-400" />
            Portfolio Analytics
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <AnalyticCard
              label="Profit per Share"
              value={formatCurrency((stockData?.price || 0) - COST_BASIS)}
              change={((stockData?.price || 0) - COST_BASIS) / COST_BASIS * 100}
            />
            <AnalyticCard
              label="Daily Volatility"
              value={`${(Math.abs(stockData?.changePercent || 0)).toFixed(2)}%`}
              subtitle="Based on today's range"
            />
            <AnalyticCard
              label="Risk/Reward Ratio"
              value={(((stockData?.week52High || 0) - (stockData?.price || 0)) / ((stockData?.price || 0) - (stockData?.week52Low || 0))).toFixed(2)}
              subtitle="Upside vs downside"
            />
            <AnalyticCard
              label="Portfolio Weight"
              value="100%"
              subtitle="Single stock portfolio"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function MetricCard({ icon, title, value, subtitle, color }: any) {
  const colorClasses: { [key: string]: string } = {
    blue: 'from-blue-500/20 to-blue-600/20 border-blue-500/30',
    purple: 'from-purple-500/20 to-purple-600/20 border-purple-500/30',
    green: 'from-green-500/20 to-green-600/20 border-green-500/30',
    yellow: 'from-yellow-500/20 to-yellow-600/20 border-yellow-500/30',
  };

  return (
    <div className={`bg-gradient-to-br ${colorClasses[color]} border rounded-xl p-4`}>
      <div className="flex items-center gap-2 mb-2 text-gray-400">
        {icon}
        <span className="text-sm">{title}</span>
      </div>
      <p className="text-2xl font-bold">{value}</p>
      <p className="text-sm text-gray-400 mt-1">{subtitle}</p>
    </div>
  );
}

function StatRow({ label, value, color = 'text-white' }: any) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-gray-400">{label}</span>
      <span className={`font-medium ${color}`}>{value}</span>
    </div>
  );
}

function PerformanceIndicator({ title, value, max, color }: any) {
  const percentage = Math.min(parseFloat(value), max);
  const colorClasses: { [key: string]: string } = {
    blue: 'bg-blue-500',
    purple: 'bg-purple-500',
    green: 'bg-green-500',
  };

  return (
    <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-4">
      <p className="text-sm text-gray-400 mb-2">{title}</p>
      <div className="flex items-center gap-3">
        <div className="flex-1">
          <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
            <div
              className={`h-full ${colorClasses[color]} transition-all duration-500`}
              style={{ width: `${(percentage / max) * 100}%` }}
            />
          </div>
        </div>
        <span className="text-lg font-semibold">{value}%</span>
      </div>
    </div>
  );
}

function AnalyticCard({ label, value, change, subtitle }: any) {
  return (
    <div className="bg-gray-800/50 rounded-lg p-4">
      <p className="text-xs text-gray-400 mb-1">{label}</p>
      <p className="text-xl font-semibold">{value}</p>
      {change !== undefined && (
        <p className={`text-sm mt-1 ${change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
          {change >= 0 ? '+' : ''}{change.toFixed(2)}%
        </p>
      )}
      {subtitle && (
        <p className="text-xs text-gray-500 mt-1">{subtitle}</p>
      )}
    </div>
  );
}