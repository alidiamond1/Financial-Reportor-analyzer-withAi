'use client';

import React, { useState, useEffect } from 'react';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { KPICards } from '@/components/dashboard/KPICards';
import { FinancialCharts } from '@/components/dashboard/FinancialCharts';
import { InsightsDisplay } from '@/components/dashboard/InsightsDisplay';
import { ChatInterface } from '@/components/chat/ChatInterface';
import { Button } from '@/components/ui/Button';
import { 
  ChartBarIcon,
  DocumentArrowDownIcon,
  ChatBubbleLeftRightIcon,
  ArrowLeftIcon
} from '@heroicons/react/24/outline';

interface AnalysisData {
  id: string;
  summary: string;
  kpis: any;
  risks: string[];
  opportunities: string[];
  recommendations: string[];
  chartData: any[];
  insights: any[];
  file: {
    file_name: string;
    upload_date: string;
  };
}

export default function AnalysisPage({ params }: { params: { id: string } }) {
  const [analysis, setAnalysis] = useState<AnalysisData | null>(null);
  const [dashboard, setDashboard] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showChat, setShowChat] = useState(false);
  const [exporting, setExporting] = useState(false);

  const analysisId = params?.id;

  useEffect(() => {
    if (analysisId) {
      fetchAnalysisData();
    }
  }, [analysisId]);

  const fetchAnalysisData = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data: { session } } = await import('@/lib/supabase').then(m => m.supabase.auth.getSession());
      const token = session?.access_token;

      if (!token) {
        throw new Error('Authentication required');
      }

      // Fetch analysis data
      const analysisResponse = await fetch(`/api/analysis/${analysisId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!analysisResponse.ok) {
        throw new Error('Failed to fetch analysis');
      }

      const analysisResult = await analysisResponse.json();
      setAnalysis(analysisResult.data);

      // Fetch dashboard data
      const dashboardResponse = await fetch(`/api/dashboard/${analysisId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (dashboardResponse.ok) {
        const dashboardResult = await dashboardResponse.json();
        setDashboard(dashboardResult.data);
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load analysis');
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async (format: 'pdf' | 'word' | 'notion') => {
    try {
      setExporting(true);

      const { data: { session } } = await import('@/lib/supabase').then(m => m.supabase.auth.getSession());
      const token = session?.access_token;

      if (!token) {
        throw new Error('Authentication required');
      }

      const response = await fetch('/api/dashboard/export', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          analysisId,
          format
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Export failed');
      }

      const result = await response.json();
      
      // Open download URL
      window.open(result.data.downloadUrl, '_blank');
      
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Export failed');
    } finally {
      setExporting(false);
    }
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <DashboardLayout currentPage="analysis">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading analysis...</p>
          </div>
        </DashboardLayout>
      </ProtectedRoute>
    );
  }

  if (error || !analysis) {
    return (
      <ProtectedRoute>
        <DashboardLayout currentPage="analysis">
          <div className="text-center py-12">
            <ChartBarIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {error || 'Analysis not found'}
            </h3>
            <Button variant="secondary">
              <a href="/dashboard" className="flex items-center">
                <ArrowLeftIcon className="h-4 w-4 mr-2" />
                Back to Dashboard
              </a>
            </Button>
          </div>
        </DashboardLayout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <DashboardLayout currentPage="analysis">
        <div className="space-y-8">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center space-x-3 mb-2">
                <Button variant="ghost" size="sm">
                  <a href="/dashboard" className="flex items-center">
                    <ArrowLeftIcon className="h-4 w-4 mr-2" />
                    Back
                  </a>
                </Button>
                <h1 className="text-2xl font-bold text-gray-900">
                  Financial Analysis Report
                </h1>
              </div>
              <p className="text-gray-600">
                Analysis of {analysis.file.file_name} • Generated on{' '}
                {new Date(analysis.file.upload_date).toLocaleDateString()}
              </p>
            </div>
            
            <div className="flex items-center space-x-3">
              <Button
                variant="ghost"
                onClick={() => setShowChat(!showChat)}
              >
                <ChatBubbleLeftRightIcon className="h-4 w-4 mr-2" />
                {showChat ? 'Hide Chat' : 'Ask AI'}
              </Button>
              
              <div className="relative">
                <Button variant="secondary" disabled={exporting}>
                  <DocumentArrowDownIcon className="h-4 w-4 mr-2" />
                  {exporting ? 'Exporting...' : 'Export'}
                </Button>
                {/* Export dropdown would go here */}
              </div>
            </div>
          </div>

          {/* Executive Summary */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Executive Summary</h2>
            <p className="text-gray-700 leading-relaxed">{analysis.summary}</p>
          </div>

          {/* Layout with Chat Sidebar */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            <div className={`space-y-8 ${showChat ? 'lg:col-span-3' : 'lg:col-span-4'}`}>
              {/* KPI Cards */}
              <KPICards kpis={analysis.kpis} />

              {/* Charts */}
              {dashboard?.chart_data && (
                <FinancialCharts chartData={dashboard.chart_data} />
              )}

              {/* Insights */}
              <InsightsDisplay
                insights={dashboard?.insights || []}
                risks={analysis.risks}
                opportunities={analysis.opportunities}
                recommendations={analysis.recommendations}
              />
            </div>

            {/* Chat Sidebar */}
            {showChat && (
              <div className="lg:col-span-1">
                <div className="sticky top-8">
                  <ChatInterface
                    analysisId={analysis.id}
                    analysisContext={{
                      fileName: analysis.file.file_name,
                      summary: analysis.summary
                    }}
                    className="h-96"
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}