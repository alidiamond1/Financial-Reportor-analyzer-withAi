'use client';

import React, { useState } from 'react';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { FileUpload } from '@/components/upload/FileUpload';
import { FileList } from '@/components/upload/FileList';

export default function UploadPage() {
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleUploadComplete = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  const handleViewAnalysis = (fileId: string) => {
    // Navigate to analysis page
    window.location.href = `/dashboard/analysis/${fileId}`;
  };

  const handleGenerateAnalysis = async (fileId: string) => {
    try {
      const { data: { session } } = await import('@/lib/supabase').then(m => m.supabase.auth.getSession());
      const token = session?.access_token;

      if (!token) {
        alert('Authentication required');
        return;
      }

      const response = await fetch('/api/analysis/generate', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ fileId })
      });

      if (response.ok) {
        alert('Analysis started! Check back in a few minutes.');
        setRefreshTrigger(prev => prev + 1);
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to start analysis');
      }
    } catch (error) {
      alert('Failed to start analysis');
    }
  };

  return (
    <ProtectedRoute>
      <DashboardLayout currentPage="upload">
        <div className="space-y-8">
          {/* Header */}
          <div>
            <h1 className="text-2xl font-bold text-gray-900">File Upload & Management</h1>
            <p className="text-gray-600 mt-1">
              Upload financial reports and manage your files
            </p>
          </div>

          {/* Upload Section */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Upload New Report</h2>
            <FileUpload onUploadComplete={handleUploadComplete} />
          </div>

          {/* File List Section */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <FileList 
              refreshTrigger={refreshTrigger}
              onViewAnalysis={handleViewAnalysis}
              onGenerateAnalysis={handleGenerateAnalysis}
            />
          </div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}