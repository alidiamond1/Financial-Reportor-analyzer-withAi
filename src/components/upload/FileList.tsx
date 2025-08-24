'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/Button';
import { 
  DocumentIcon, 
  EyeIcon, 
  TrashIcon, 
  ChartBarIcon,
  ClockIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

interface FileItem {
  id: string;
  file_name: string;
  file_type: 'pdf' | 'excel' | 'csv';
  file_size: number;
  upload_date: string;
  analysis_status: 'pending' | 'completed' | 'failed';
}

interface FileListProps {
  onViewAnalysis?: (fileId: string) => void;
  onGenerateAnalysis?: (fileId: string) => void;
  refreshTrigger?: number;
}

export function FileList({ onViewAnalysis, onGenerateAnalysis, refreshTrigger }: FileListProps) {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchFiles();
    }
  }, [user, refreshTrigger]);

  const fetchFiles = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data: { session } } = await import('@/lib/supabase').then(m => m.supabase.auth.getSession());
      const token = session?.access_token;

      if (!token) {
        throw new Error('Authentication required');
      }

      const response = await fetch('/api/files', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch files');
      }

      const result = await response.json();
      setFiles(result.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load files');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (fileId: string) => {
    if (!confirm('Are you sure you want to delete this file? This action cannot be undone.')) {
      return;
    }

    try {
      setDeletingId(fileId);

      const { data: { session } } = await import('@/lib/supabase').then(m => m.supabase.auth.getSession());
      const token = session?.access_token;

      if (!token) {
        throw new Error('Authentication required');
      }

      const response = await fetch(`/api/files/${fileId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to delete file');
      }

      // Remove file from list
      setFiles(prev => prev.filter(file => file.id !== fileId));
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete file');
    } finally {
      setDeletingId(null);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getFileTypeIcon = (type: string) => {
    const iconClass = "h-5 w-5";
    switch (type) {
      case 'pdf':
        return <DocumentIcon className={`${iconClass} text-red-500`} />;
      case 'excel':
        return <DocumentIcon className={`${iconClass} text-green-500`} />;
      case 'csv':
        return <DocumentIcon className={`${iconClass} text-blue-500`} />;
      default:
        return <DocumentIcon className={`${iconClass} text-gray-500`} />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <ChartBarIcon className="h-3 w-3 mr-1" />
            Analyzed
          </span>
        );
      case 'pending':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            <ClockIcon className="h-3 w-3 mr-1" />
            Processing
          </span>
        );
      case 'failed':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
            <ExclamationTriangleIcon className="h-3 w-3 mr-1" />
            Failed
          </span>
        );
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-2 text-sm text-gray-500">Loading files...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <ExclamationTriangleIcon className="h-8 w-8 text-red-500 mx-auto mb-2" />
        <p className="text-sm text-red-600">{error}</p>
        <Button
          variant="ghost"
          size="sm"
          onClick={fetchFiles}
          className="mt-2"
        >
          Try Again
        </Button>
      </div>
    );
  }

  if (files.length === 0) {
    return (
      <div className="text-center py-12">
        <DocumentIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No files uploaded yet</h3>
        <p className="text-sm text-gray-500 mb-4">
          Upload your first financial report to get started with AI analysis
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-900">
          Your Files ({files.length})
        </h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={fetchFiles}
        >
          Refresh
        </Button>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg divide-y divide-gray-200">
        {files.map((file) => (
          <div key={file.id} className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3 flex-1 min-w-0">
                {getFileTypeIcon(file.file_type)}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {file.file_name}
                  </p>
                  <div className="flex items-center space-x-4 mt-1">
                    <span className="text-xs text-gray-500">
                      {formatFileSize(file.file_size)}
                    </span>
                    <span className="text-xs text-gray-500">
                      {formatDate(file.upload_date)}
                    </span>
                    {getStatusBadge(file.analysis_status)}
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                {file.analysis_status === 'completed' && onViewAnalysis && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onViewAnalysis(file.id)}
                  >
                    <EyeIcon className="h-4 w-4 mr-1" />
                    View Analysis
                  </Button>
                )}

                {file.analysis_status === 'failed' && onGenerateAnalysis && (
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => onGenerateAnalysis(file.id)}
                  >
                    <ChartBarIcon className="h-4 w-4 mr-1" />
                    Retry Analysis
                  </Button>
                )}

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDelete(file.id)}
                  disabled={deletingId === file.id}
                  className="text-red-600 hover:text-red-700"
                >
                  {deletingId === file.id ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
                  ) : (
                    <TrashIcon className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}