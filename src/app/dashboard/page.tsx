'use client';

import React, { useState, useEffect } from 'react';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { FileUpload } from '@/components/upload/FileUpload';
import { FileList } from '@/components/upload/FileList';
import { DatabaseSetup } from '@/components/setup/DatabaseSetup';
import { Button } from '@/components/ui/Button';
import { 
  DocumentArrowUpIcon,
  ChartBarIcon,
  ChatBubbleLeftRightIcon,
  ArrowRightIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

interface DashboardStats {
  totalFiles: number;
  completedAnalyses: number;
  pendingAnalyses: number;
  failedAnalyses: number;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    totalFiles: 0,
    completedAnalyses: 0,
    pendingAnalyses: 0,
    failedAnalyses: 0
  });
  const [loading, setLoading] = useState(true);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    fetchDashboardStats();
  }, [refreshTrigger]);

  const fetchDashboardStats = async () => {
    try {
      const { data: { session } } = await import('@/lib/supabase').then(m => m.supabase.auth.getSession());
      const token = session?.access_token;

      if (!token) return;

      const response = await fetch('/api/files', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const result = await response.json();
        const files = result.data || [];
        
        setStats({
          totalFiles: files.length,
          completedAnalyses: files.filter((f: any) => f.analysis_status === 'completed').length,
          pendingAnalyses: files.filter((f: any) => f.analysis_status === 'pending').length,
          failedAnalyses: files.filter((f: any) => f.analysis_status === 'failed').length
        });
      }
    } catch (error) {
      console.error('Failed to fetch dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUploadComplete = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  const StatCard = ({ 
    title, 
    value, 
    icon, 
    color, 
    description 
  }: { 
    title: string; 
    value: number; 
    icon: React.ReactNode; 
    color: string; 
    description: string;
  }) => (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center">
        <div className={`p-3 rounded-lg ${color}`}>
          {icon}
        </div>
        <div className="ml-4">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{loading ? '-' : value}</p>
          <p className="text-xs text-gray-500">{description}</p>
        </div>
      </div>
    </div>
  );

  return (
    <ProtectedRoute>
      <DashboardLayout currentPage="dashboard">
        <DatabaseSetup />
        
        <div className="space-y-8">
          {/* Header */}
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Dashboard Overview</h1>
            <p className="text-gray-600 mt-1">
              Manage your financial reports and view AI-powered insights
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard
              title="Total Files"
              value={stats.totalFiles}
              icon={<DocumentArrowUpIcon className="h-6 w-6 text-blue-600" />}
              color="bg-blue-100"
              description="Uploaded reports"
            />
            <StatCard
              title="Completed Analysis"
              value={stats.completedAnalyses}
              icon={<CheckCircleIcon className="h-6 w-6 text-green-600" />}
              color="bg-green-100"
              description="Ready to view"
            />
            <StatCard
              title="Processing"
              value={stats.pendingAnalyses}
              icon={<ClockIcon className="h-6 w-6 text-yellow-600" />}
              color="bg-yellow-100"
              description="Analysis in progress"
            />
            <StatCard
              title="Failed"
              value={stats.failedAnalyses}
              icon={<ExclamationTriangleIcon className="h-6 w-6 text-red-600" />}
              color="bg-red-100"
              description="Need attention"
            />
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Upload Section */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-900">Quick Upload</h2>
                  <Button variant="ghost" size="sm">
                    <a href="/dashboard/upload" className="flex items-center">
                      View All <ArrowRightIcon className="h-4 w-4 ml-1" />
                    </a>
                  </Button>
                </div>
                <FileUpload onUploadComplete={handleUploadComplete} />
              </div>
            </div>

            {/* Quick Actions Panel */}
            <div className="space-y-4">
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
                <div className="space-y-3">
                  <Button 
                    variant="primary" 
                    size="lg" 
                    className="w-full justify-start"
                  >
                    <DocumentArrowUpIcon className="h-5 w-5 mr-3" />
                    <a href="/dashboard/upload">Upload New Report</a>
                  </Button>
                  
                  <Button 
                    variant="secondary" 
                    size="lg" 
                    className="w-full justify-start"
                  >
                    <ChartBarIcon className="h-5 w-5 mr-3" />
                    <a href="/dashboard/analysis">View Analysis</a>
                  </Button>
                  
                  <Button 
                    variant="ghost" 
                    size="lg" 
                    className="w-full justify-start"
                  >
                    <ChatBubbleLeftRightIcon className="h-5 w-5 mr-3" />
                    <a href="/dashboard/chat">Ask AI Assistant</a>
                  </Button>
                </div>
              </div>

              {/* Tips */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="text-sm font-medium text-blue-900 mb-2">💡 Pro Tips</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Upload recent financial statements for best results</li>
                  <li>• Use the AI chat for specific questions</li>
                  <li>• Export reports to PDF, Word, or Notion</li>
                  <li>• Upgrade to Pro for unlimited uploads</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Recent Files */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Recent Files</h2>
              <Button variant="ghost" size="sm">
                <a href="/dashboard/upload" className="flex items-center">
                  View All <ArrowRightIcon className="h-4 w-4 ml-1" />
                </a>
              </Button>
            </div>
            <FileList refreshTrigger={refreshTrigger} />
          </div>

          {/* Welcome Message for New Users */}
          {stats.totalFiles === 0 && !loading && (
            <div className="text-center py-12">
              <DocumentArrowUpIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-medium text-gray-900 mb-2">
                Welcome to Financial Report Analyzer!
              </h3>
              <p className="text-gray-600 mb-6 max-w-md mx-auto">
                Get started by uploading your first financial report. Our AI will analyze it and provide valuable insights in minutes.
              </p>
              <Button variant="primary" size="lg">
                <a href="/dashboard/upload" className="flex items-center">
                  <DocumentArrowUpIcon className="h-5 w-5 mr-2" />
                  Upload Your First Report
                </a>
              </Button>
            </div>
          )}
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}