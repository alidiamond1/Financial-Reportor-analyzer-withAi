'use client';

import React, { useState } from 'react';
import { Insight } from '@/types';
import { 
  LightBulbIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ChartBarIcon,
  ArrowTrendingUpIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline';

interface InsightsDisplayProps {
  insights: Insight[];
  risks: string[];
  opportunities: string[];
  recommendations: string[];
  loading?: boolean;
}

interface InsightCardProps {
  insight: Insight;
}

interface ListSectionProps {
  title: string;
  items: string[];
  icon: React.ReactNode;
  type: 'risk' | 'opportunity' | 'recommendation';
  emptyMessage: string;
}

function InsightCard({ insight }: InsightCardProps) {
  const getInsightIcon = () => {
    switch (insight.type) {
      case 'positive':
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
      case 'negative':
        return <ExclamationTriangleIcon className="h-5 w-5 text-red-500" />;
      default:
        return <LightBulbIcon className="h-5 w-5 text-blue-500" />;
    }
  };

  const getInsightBorder = () => {
    switch (insight.type) {
      case 'positive':
        return 'border-l-green-400';
      case 'negative':
        return 'border-l-red-400';
      default:
        return 'border-l-blue-400';
    }
  };

  const getImportanceColor = () => {
    switch (insight.importance) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className={`bg-white rounded-lg border-l-4 ${getInsightBorder()} p-4 shadow-sm`}>
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0 mt-0.5">
          {getInsightIcon()}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-medium text-gray-900">{insight.title}</h4>
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getImportanceColor()}`}>
              {insight.importance}
            </span>
          </div>
          <p className="text-sm text-gray-700">{insight.description}</p>
        </div>
      </div>
    </div>
  );
}

function ListSection({ title, items, icon, type, emptyMessage }: ListSectionProps) {
  const [expanded, setExpanded] = useState(true);

  const getTypeColors = () => {
    switch (type) {
      case 'risk':
        return {
          bg: 'bg-red-50',
          border: 'border-red-200',
          text: 'text-red-900',
          icon: 'text-red-600'
        };
      case 'opportunity':
        return {
          bg: 'bg-green-50',
          border: 'border-green-200',
          text: 'text-green-900',
          icon: 'text-green-600'
        };
      default:
        return {
          bg: 'bg-blue-50',
          border: 'border-blue-200',
          text: 'text-blue-900',
          icon: 'text-blue-600'
        };
    }
  };

  const colors = getTypeColors();

  return (
    <div className={`rounded-lg border ${colors.border} ${colors.bg}`}>
      <div 
        className="px-4 py-3 cursor-pointer flex items-center justify-between"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center space-x-3">
          <div className={colors.icon}>
            {icon}
          </div>
          <h3 className={`font-medium ${colors.text}`}>
            {title} ({items.length})
          </h3>
        </div>
        <svg
          className={`h-5 w-5 ${colors.icon} transform transition-transform ${expanded ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>
      
      {expanded && (
        <div className="px-4 pb-4">
          {items.length === 0 ? (
            <p className="text-sm text-gray-600 italic">{emptyMessage}</p>
          ) : (
            <ul className="space-y-2">
              {items.map((item, index) => (
                <li key={index} className="flex items-start space-x-2">
                  <span className={`text-sm ${colors.icon} mt-0.5`}>•</span>
                  <span className="text-sm text-gray-700">{item}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

function LoadingInsights() {
  return (
    <div className="space-y-6">
      <div className="animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-white rounded-lg border-l-4 border-l-gray-200 p-4">
              <div className="flex items-start space-x-3">
                <div className="w-5 h-5 bg-gray-200 rounded"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-full"></div>
                  <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function InsightsDisplay({ 
  insights, 
  risks, 
  opportunities, 
  recommendations,
  loading = false 
}: InsightsDisplayProps) {
  if (loading) {
    return <LoadingInsights />;
  }

  const hasData = insights.length > 0 || risks.length > 0 || opportunities.length > 0 || recommendations.length > 0;

  if (!hasData) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
        <LightBulbIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No Insights Available</h3>
        <p className="text-gray-600">
          Insights will appear here once your financial analysis is complete.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">AI-Generated Insights</h2>
        <div className="text-sm text-gray-500">
          Analysis powered by AI
        </div>
      </div>

      {/* Key Insights */}
      {insights.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900 flex items-center">
            <LightBulbIcon className="h-5 w-5 text-blue-500 mr-2" />
            Key Insights
          </h3>
          <div className="space-y-3">
            {insights.map((insight, index) => (
              <InsightCard key={insight.id || index} insight={insight} />
            ))}
          </div>
        </div>
      )}

      {/* Risk, Opportunities, Recommendations Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <ListSection
          title="Identified Risks"
          items={risks}
          icon={<ExclamationTriangleIcon className="h-5 w-5" />}
          type="risk"
          emptyMessage="No significant risks identified in the analysis."
        />

        <ListSection
          title="Growth Opportunities"
          items={opportunities}
          icon={<ArrowTrendingUpIcon className="h-5 w-5" />}
          type="opportunity"
          emptyMessage="No specific opportunities identified at this time."
        />

        <ListSection
          title="Recommendations"
          items={recommendations}
          icon={<ShieldCheckIcon className="h-5 w-5" />}
          type="recommendation"
          emptyMessage="No specific recommendations available."
        />
      </div>

      {/* Summary Stats */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h4 className="text-sm font-medium text-gray-900 mb-2">Analysis Summary</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div className="text-center">
            <div className="text-lg font-bold text-blue-600">{insights.length}</div>
            <div className="text-gray-600">Key Insights</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-red-600">{risks.length}</div>
            <div className="text-gray-600">Risks</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-green-600">{opportunities.length}</div>
            <div className="text-gray-600">Opportunities</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-blue-600">{recommendations.length}</div>
            <div className="text-gray-600">Recommendations</div>
          </div>
        </div>
      </div>
    </div>
  );
}