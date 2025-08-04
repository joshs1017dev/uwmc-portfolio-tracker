'use client';

import React, { useState, useMemo } from 'react';
import { RSU_VESTING_SCHEDULE, TAX_CONFIG, VestingEvent } from '@/lib/config';
import { 
  Calendar, TrendingUp, DollarSign, Calculator, 
  AlertCircle, CheckCircle2, Clock, Percent,
  ChevronDown, ChevronUp, Lock, Unlock
} from 'lucide-react';
import { format, differenceInDays, isPast, isToday, addDays } from 'date-fns';

interface VestingScheduleProps {
  currentPrice: number;
}

export default function VestingSchedule({ currentPrice }: VestingScheduleProps) {
  const [expandedGrant, setExpandedGrant] = useState<string | null>(null);
  const [showTaxDetails, setShowTaxDetails] = useState(false);

  const vestingAnalytics = useMemo(() => {
    const today = new Date();
    const totalTaxRate = TAX_CONFIG.FEDERAL_RATE + TAX_CONFIG.STATE_RATE + TAX_CONFIG.FICA_RATE;

    const events = RSU_VESTING_SCHEDULE.map(event => {
      const vestDate = new Date(event.date);
      const daysUntilVest = differenceInDays(vestDate, today);
      const isVested = isPast(vestDate) || isToday(vestDate);
      const grossValue = event.shares * currentPrice;
      const taxWithholding = grossValue * totalTaxRate;
      const netValue = grossValue - taxWithholding;
      const sharesWithheld = Math.ceil(taxWithholding / currentPrice);
      const netShares = event.shares - sharesWithheld;

      return {
        ...event,
        vestDate,
        daysUntilVest,
        isVested,
        grossValue,
        taxWithholding,
        netValue,
        sharesWithheld,
        netShares,
        totalTaxRate
      };
    });

    const vestedEvents = events.filter(e => e.isVested);
    const unvestedEvents = events.filter(e => !e.isVested);
    const nextVesting = unvestedEvents[0];

    const totalVested = vestedEvents.reduce((sum, e) => sum + e.shares, 0);
    const totalUnvested = unvestedEvents.reduce((sum, e) => sum + e.shares, 0);
    const totalGrossValue = events.reduce((sum, e) => sum + e.grossValue, 0);
    const totalNetValue = events.reduce((sum, e) => sum + e.netValue, 0);
    const totalTaxes = totalGrossValue - totalNetValue;

    return {
      events,
      vestedEvents,
      unvestedEvents,
      nextVesting,
      totalVested,
      totalUnvested,
      totalShares: totalVested + totalUnvested,
      totalGrossValue,
      totalNetValue,
      totalTaxes,
      totalTaxRate
    };
  }, [currentPrice]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat('en-US').format(value);
  };

  return (
    <div className="bg-gray-900 rounded-xl p-6 shadow-xl border border-gray-800">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
          <Calendar className="w-6 h-6 text-purple-400" />
          RSU Vesting Schedule
        </h2>
        <p className="text-gray-400">Track your UWMC restricted stock units and tax implications</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400 text-sm">Total RSUs</span>
            <Lock className="w-4 h-4 text-gray-500" />
          </div>
          <div className="text-2xl font-bold text-white">{formatNumber(vestingAnalytics.totalShares)}</div>
          <div className="text-sm text-gray-400 mt-1">
            {formatNumber(vestingAnalytics.totalVested)} vested • {formatNumber(vestingAnalytics.totalUnvested)} unvested
          </div>
        </div>

        <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400 text-sm">Total Value</span>
            <TrendingUp className="w-4 h-4 text-green-500" />
          </div>
          <div className="text-2xl font-bold text-green-400">{formatCurrency(vestingAnalytics.totalGrossValue)}</div>
          <div className="text-sm text-gray-400 mt-1">
            @ ${currentPrice.toFixed(2)} per share
          </div>
        </div>

        <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400 text-sm">Est. Tax Withholding</span>
            <Calculator className="w-4 h-4 text-yellow-500" />
          </div>
          <div className="text-2xl font-bold text-yellow-400">{formatCurrency(vestingAnalytics.totalTaxes)}</div>
          <div className="text-sm text-gray-400 mt-1">
            {(vestingAnalytics.totalTaxRate * 100).toFixed(1)}% total rate
          </div>
        </div>

        <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400 text-sm">Net Value</span>
            <DollarSign className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-2xl font-bold text-blue-400">{formatCurrency(vestingAnalytics.totalNetValue)}</div>
          <div className="text-sm text-gray-400 mt-1">
            After tax withholding
          </div>
        </div>
      </div>

      {/* Next Vesting Alert */}
      {vestingAnalytics.nextVesting && (
        <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-4 mb-6">
          <div className="flex items-start gap-3">
            <Clock className="w-5 h-5 text-purple-400 mt-0.5" />
            <div className="flex-1">
              <h3 className="text-purple-400 font-semibold mb-1">Next Vesting Event</h3>
              <div className="text-gray-300">
                <span className="font-bold text-white">{formatNumber(vestingAnalytics.nextVesting.shares)} shares</span> vest on{' '}
                <span className="font-bold text-white">{format(vestingAnalytics.nextVesting.vestDate, 'MMMM d, yyyy')}</span>
              </div>
              <div className="text-sm text-gray-400 mt-1">
                {vestingAnalytics.nextVesting.daysUntilVest} days away • 
                Estimated value: {formatCurrency(vestingAnalytics.nextVesting.grossValue)} • 
                Net after taxes: {formatCurrency(vestingAnalytics.nextVesting.netValue)}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tax Details Toggle */}
      <button
        onClick={() => setShowTaxDetails(!showTaxDetails)}
        className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors mb-6"
      >
        {showTaxDetails ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        {showTaxDetails ? 'Hide' : 'Show'} Tax Calculation Details
      </button>

      {showTaxDetails && (
        <div className="bg-gray-800/30 rounded-lg p-4 mb-6 border border-gray-700">
          <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
            <Calculator className="w-4 h-4" />
            Tax Withholding Breakdown
          </h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-400">Federal Tax (Supplemental Rate)</span>
              <span className="text-white">{(TAX_CONFIG.FEDERAL_RATE * 100).toFixed(1)}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">State Tax</span>
              <span className="text-white">{(TAX_CONFIG.STATE_RATE * 100).toFixed(1)}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">FICA (Social Security + Medicare)</span>
              <span className="text-white">{(TAX_CONFIG.FICA_RATE * 100).toFixed(1)}%</span>
            </div>
            <div className="flex justify-between font-semibold pt-2 border-t border-gray-700">
              <span className="text-gray-300">Total Tax Rate</span>
              <span className="text-yellow-400">{(vestingAnalytics.totalTaxRate * 100).toFixed(1)}%</span>
            </div>
          </div>
          <div className="mt-3 text-xs text-gray-500">
            <AlertCircle className="w-3 h-3 inline mr-1" />
            Tax rates are estimates. Consult a tax professional for accurate calculations.
          </div>
        </div>
      )}

      {/* Vesting Events */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold text-white mb-3">Vesting Timeline</h3>
        {vestingAnalytics.events.map((event, index) => (
          <div
            key={`${event.grantId}-${index}`}
            className={`rounded-lg border transition-all ${
              event.isVested 
                ? 'bg-gray-800/30 border-gray-700' 
                : 'bg-gray-800/50 border-gray-700 hover:border-gray-600'
            }`}
          >
            <div
              className="p-4 cursor-pointer"
              onClick={() => setExpandedGrant(expandedGrant === event.grantId ? null : event.grantId)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {event.isVested ? (
                    <CheckCircle2 className="w-5 h-5 text-green-500" />
                  ) : (
                    <Clock className="w-5 h-5 text-yellow-500" />
                  )}
                  <div>
                    <div className="font-semibold text-white">
                      {formatNumber(event.shares)} shares
                      {event.isVested && <span className="text-green-500 text-sm ml-2">Vested</span>}
                    </div>
                    <div className="text-sm text-gray-400">
                      {format(event.vestDate, 'MMMM d, yyyy')}
                      {!event.isVested && ` • ${event.daysUntilVest} days remaining`}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-white font-semibold">{formatCurrency(event.grossValue)}</div>
                  <div className="text-sm text-gray-400">
                    Net: {formatCurrency(event.netValue)}
                  </div>
                </div>
              </div>

              {expandedGrant === event.grantId && (
                <div className="mt-4 pt-4 border-t border-gray-700 grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-400">Grant Date:</span>
                    <span className="text-white ml-2">{format(new Date(event.grantDate), 'MMM d, yyyy')}</span>
                  </div>
                  <div>
                    <span className="text-gray-400">Grant Price:</span>
                    <span className="text-white ml-2">${event.grantPrice.toFixed(2)}</span>
                  </div>
                  <div>
                    <span className="text-gray-400">Current Price:</span>
                    <span className="text-white ml-2">${currentPrice.toFixed(2)}</span>
                  </div>
                  <div>
                    <span className="text-gray-400">Price Change:</span>
                    <span className={`ml-2 ${currentPrice >= event.grantPrice ? 'text-green-400' : 'text-red-400'}`}>
                      {((currentPrice - event.grantPrice) / event.grantPrice * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-400">Shares Withheld:</span>
                    <span className="text-yellow-400 ml-2">{formatNumber(event.sharesWithheld)}</span>
                  </div>
                  <div>
                    <span className="text-gray-400">Net Shares:</span>
                    <span className="text-green-400 ml-2">{formatNumber(event.netShares)}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Disclaimer */}
      <div className="mt-6 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
        <div className="flex gap-2">
          <AlertCircle className="w-4 h-4 text-yellow-400 flex-shrink-0 mt-0.5" />
          <div className="text-xs text-gray-400">
            <p className="font-medium text-yellow-400 mb-1">Important Note</p>
            <p>This is an estimate based on current stock price and assumed tax rates. Actual tax withholding may vary based on your specific situation, state of residence, and company policies. Consult with a tax professional for accurate planning.</p>
          </div>
        </div>
      </div>
    </div>
  );
}