'use client';

import React from 'react';
import { KPIs } from '@/types';
import { 
  CurrencyDollarIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  ChartBarIcon,
  BanknotesIcon,
  BuildingLibraryIcon
} from '@heroicons/react/24/outline';

interface KPICardsProps {
  kpis: KPIs;
  loading?: boolean;
}

interface KPICardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  trend?: 'up' | 'down' | 'neutral';
  description?: string;
}

function KPICard({ title, value, icon, trend, description }: KPICardProps) {
  const getTrendIcon = () => {
    switch (trend) {
      case 'up':
        return <ArrowTrendingUpIcon className="h-4 w-4 text-green-500" />;
      case 'down':
        return <ArrowTrendingDownIcon className="h-4 w-4 text-red-500" />;
      default:
        return null;
    }
  };

  const getTrendColor = () => {
    switch (trend) {
      case 'up':
        return 'text-green-600';
      case 'down':
        return 'text-red-600';
      default:
        return 'text-gray-900';
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-blue-50 rounded-lg">
            {icon}
          </div>
          <div>
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <div className="flex items-center space-x-2">
              <p className={`text-2xl font-bold ${getTrendColor()}`}>
                {value === 'N/A' ? 'N/A' : value}
              </p>
              {getTrendIcon()}
            </div>
            {description && (
              <p className="text-xs text-gray-500 mt-1">{description}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export function KPICards({ kpis, loading = false }: KPICardsProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="animate-pulse">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gray-200 rounded-lg"></div>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-24"></div>
                  <div className="h-8 bg-gray-200 rounded w-32"></div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Determine trends based on values (simplified logic)
  const getValueTrend = (value: string | undefined): 'up' | 'down' | 'neutral' => {
    if (!value || value === 'N/A') return 'neutral';
    
    // Check for negative values (in parentheses or with minus)
    if (value.includes('(') || value.includes('-')) return 'down';
    
    // Check for growth rates
    if (value.includes('%')) {
      const numericValue = parseFloat(value.replace(/[^\d.-]/g, ''));
      return numericValue > 0 ? 'up' : numericValue < 0 ? 'down' : 'neutral';
    }
    
    return 'neutral';
  };

  const kpiData = [
    {
      title: 'Revenue',
      value: kpis.revenue,
      icon: <CurrencyDollarIcon className="h-6 w-6 text-blue-600" />,
      trend: getValueTrend(kpis.revenue),
      description: 'Total revenue generated'
    },
    {
      title: 'Expenses',
      value: kpis.expenses,
      icon: <BanknotesIcon className="h-6 w-6 text-blue-600" />,
      trend: getValueTrend(kpis.expenses),
      description: 'Total operational expenses'
    },
    {
      title: 'Net Profit',
      value: kpis.netProfit,
      icon: <ChartBarIcon className="h-6 w-6 text-blue-600" />,
      trend: getValueTrend(kpis.netProfit),
      description: 'Revenue minus expenses'
    },
    {
      title: 'Growth Rate',
      value: kpis.growthRate,
      icon: <ArrowTrendingUpIcon className="h-6 w-6 text-blue-600" />,
      trend: getValueTrend(kpis.growthRate),
      description: 'Period over period growth'
    },
    {
      title: 'Total Assets',
      value: kpis.totalAssets,
      icon: <BuildingLibraryIcon className="h-6 w-6 text-blue-600" />,
      trend: getValueTrend(kpis.totalAssets),
      description: 'Total company assets'
    },
    {
      title: 'Cash Flow',
      value: kpis.cashFlow,
      icon: <CurrencyDollarIcon className="h-6 w-6 text-blue-600" />,
      trend: getValueTrend(kpis.cashFlow),
      description: 'Operating cash flow'
    }
  ].filter(item => item.value !== 'N/A' || item.title === 'Revenue' || item.title === 'Net Profit');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">Key Performance Indicators</h2>
        <div className="text-sm text-gray-500">
          Financial metrics overview
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {kpiData.map((kpi, index) => (
          <KPICard
            key={index}
            title={kpi.title}
            value={kpi.value || 'N/A'}
            icon={kpi.icon}
            trend={kpi.trend}
            description={kpi.description}
          />
        ))}
      </div>

      {/* Additional KPIs Row */}
      {(kpis.profitMargin !== 'N/A' || kpis.returnOnInvestment !== 'N/A' || kpis.debtToEquityRatio !== 'N/A') && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {kpis.profitMargin !== 'N/A' && (
            <KPICard
              title="Profit Margin"
              value={kpis.profitMargin || 'N/A'}
              icon={<ChartBarIcon className="h-6 w-6 text-blue-600" />}
              trend={getValueTrend(kpis.profitMargin)}
              description="Profit as percentage of revenue"
            />
          )}
          {kpis.returnOnInvestment !== 'N/A' && (
            <KPICard
              title="Return on Investment"
              value={kpis.returnOnInvestment || 'N/A'}
              icon={<ArrowTrendingUpIcon className="h-6 w-6 text-blue-600" />}
              trend={getValueTrend(kpis.returnOnInvestment)}
              description="ROI percentage"
            />
          )}
          {kpis.debtToEquityRatio !== 'N/A' && (
            <KPICard
              title="Debt to Equity"
              value={kpis.debtToEquityRatio || 'N/A'}
              icon={<BuildingLibraryIcon className="h-6 w-6 text-blue-600" />}
              trend={getValueTrend(kpis.debtToEquityRatio)}
              description="Financial leverage ratio"
            />
          )}
        </div>
      )}
    </div>
  );
}