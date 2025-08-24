'use client';

import React, { useState, useEffect } from 'react';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/contexts/AuthContext';
import { 
  DocumentIcon,
  ChartBarIcon,
  EyeIcon,
  CalendarIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

interface AnalysisItem {
  id: string;
  file_name: string;
  summary: string;
  created_at: string;
  status: 'completed' | 'pending' | 'failed';
  kpis?: {
    revenue?: string;
    expenses?: string;
    netProfit?: string;
    growthRate?: string;
  };
}

export default function AnalysisPage() {
  const [analyses, setAnalyses] = useState<AnalysisItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchAnalyses();
    }
  }, [user]);

  const fetchAnalyses = async () => {
    try {
      setLoading(true);
      setError(null);

      // For now, we'll show a placeholder since the database might not have analyses yet
      // TODO: Replace with actual API call when backend is ready
      
      // Simulated data for demonstration
      const sampleAnalyses: AnalysisItem[] = [
        {
          id: '1',
          file_name: 'Q3_Financial_Report.pdf',
          summary: 'Strong quarterly performance with 15% revenue growth...',
          created_at: new Date().toISOString(),
          status: 'completed',
          kpis: {
            revenue: '$2.5M',
            expenses: '$1.8M',
            netProfit: '$700K',
            growthRate: '15%'
          }
        }
      ];

      // Uncomment when API is ready:
      /*
      const { data: { session } } = await import('@/lib/supabase').then(m => m.supabase.auth.getSession());
      const token = session?.access_token;

      if (!token) return;

      const response = await fetch('/api/analysis', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const result = await response.json();
        setAnalyses(result.data || []);
      } else {
        setError('Failed to fetch analyses');
      }
      */

      setAnalyses(sampleAnalyses);
    } catch (error) {
      console.error('Failed to fetch analyses:', error);
      setError('Failed to load analyses');
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
      case 'pending':
        return <ClockIcon className="h-5 w-5 text-yellow-500" />;
      case 'failed':
        return <ExclamationTriangleIcon className="h-5 w-5 text-red-500" />;
      default:
        return <ClockIcon className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Complete';
      case 'pending':
        return 'Processing';
      case 'failed':
        return 'Failed';
      default:
        return 'Unknown';
    }
  };

  const handleViewAnalysis = (analysisId: string) => {
    window.location.href = `/dashboard/analysis/${analysisId}`;
  };

  return (
    <ProtectedRoute>
      <DashboardLayout currentPage="analysis">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Analysis Reports</h1>
              <p className="text-gray-600 mt-1">
                View and manage your AI-powered financial analysis reports
              </p>
            </div>
            
            <Button
              variant="primary"
              onClick={() => window.location.href = '/dashboard/upload'}
            >
              <DocumentIcon className="h-5 w-5 mr-2" />
              New Analysis
            </Button>
          </div>

          {/* Content */}
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading analyses...</p>
              </div>
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
              <ExclamationTriangleIcon className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-red-900 mb-2">Error Loading Analyses</h3>
              <p className="text-red-700 mb-4">{error}</p>
              <Button onClick={fetchAnalyses} variant="secondary">
                Try Again
              </Button>
            </div>
          ) : analyses.length === 0 ? (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-12 text-center">
              <ChartBarIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Analyses Yet</h3>
              <p className="text-gray-600 mb-6">
                Upload your first financial report to get started with AI-powered analysis
              </p>
              <Button
                variant="primary"
                onClick={() => window.location.href = '/dashboard/upload'}
              >
                <DocumentIcon className="h-5 w-5 mr-2" />
                Upload Report
              </Button>
            </div>
          ) : (
            <div className="grid gap-6">
              {analyses.map((analysis) => (
                <div key={analysis.id} className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4 flex-1">
                      <div className="p-3 bg-blue-100 rounded-lg">
                        <DocumentIcon className="h-6 w-6 text-blue-600" />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">
                          {analysis.file_name}
                        </h3>
                        
                        <p className="text-gray-600 mb-3 line-clamp-2">
                          {analysis.summary}
                        </p>
                        
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <div className="flex items-center space-x-1">
                            <CalendarIcon className="h-4 w-4" />
                            <span>{new Date(analysis.created_at).toLocaleDateString()}</span>
                          </div>
                          
                          <div className="flex items-center space-x-1">
                            {getStatusIcon(analysis.status)}
                            <span>{getStatusText(analysis.status)}</span>
                          </div>
                        </div>
                        
                        {analysis.kpis && (
                          <div className="mt-4 grid grid-cols-2 lg:grid-cols-4 gap-4">
                            {analysis.kpis.revenue && (
                              <div className="text-sm">
                                <span className="text-gray-500">Revenue:</span>
                                <span className="font-medium text-gray-900 ml-1">{analysis.kpis.revenue}</span>
                              </div>
                            )}
                            {analysis.kpis.netProfit && (
                              <div className="text-sm">
                                <span className="text-gray-500">Net Profit:</span>
                                <span className="font-medium text-gray-900 ml-1">{analysis.kpis.netProfit}</span>
                              </div>
                            )}
                            {analysis.kpis.growthRate && (
                              <div className="text-sm">
                                <span className="text-gray-500">Growth:</span>
                                <span className="font-medium text-green-600 ml-1">{analysis.kpis.growthRate}</span>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex space-x-2 ml-4">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => handleViewAnalysis(analysis.id)}
                        disabled={analysis.status !== 'completed'}
                      >
                        <EyeIcon className="h-4 w-4 mr-1" />
                        View
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}