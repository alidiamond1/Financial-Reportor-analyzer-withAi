'use client';

import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { useFileUpload } from '@/hooks/useFileUpload';
import { Button } from '@/components/ui/Button';
import { CloudArrowUpIcon, DocumentIcon, XMarkIcon } from '@heroicons/react/24/outline';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ACCEPTED_TYPES = {
  'application/pdf': ['.pdf'],
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
  'application/vnd.ms-excel': ['.xls'],
  'text/csv': ['.csv']
};

interface FileUploadProps {
  onUploadComplete?: (fileId: string) => void;
  className?: string;
}

export function FileUpload({ onUploadComplete, className = '' }: FileUploadProps) {
  const { uploads, uploadFile, removeUpload, clearCompleted } = useFileUpload();
  const [dragActive, setDragActive] = useState(false);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    for (const file of acceptedFiles) {
      try {
        await uploadFile(file);
        if (onUploadComplete) {
          // Note: In a real implementation, you'd wait for the upload to complete
          // and get the actual file ID from the upload hook
          onUploadComplete('temp-id');
        }
      } catch (error) {
        console.error('Upload failed:', error);
      }
    }
  }, [uploadFile, onUploadComplete]);

  const { getRootProps, getInputProps, isDragActive, fileRejections } = useDropzone({
    onDrop,
    accept: ACCEPTED_TYPES,
    maxSize: MAX_FILE_SIZE,
    multiple: true,
    onDragEnter: () => setDragActive(true),
    onDragLeave: () => setDragActive(false)
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'uploading':
      case 'analyzing':
        return (
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
        );
      case 'completed':
        return (
          <div className="h-4 w-4 bg-green-500 rounded-full flex items-center justify-center">
            <svg className="h-2 w-2 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </div>
        );
      case 'error':
        return (
          <div className="h-4 w-4 bg-red-500 rounded-full flex items-center justify-center">
            <XMarkIcon className="h-2 w-2 text-white" />
          </div>
        );
      default:
        return null;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'uploading':
        return 'Uploading...';
      case 'analyzing':
        return 'Analyzing...';
      case 'completed':
        return 'Completed';
      case 'error':
        return 'Failed';
      default:
        return '';
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Upload Area */}
      <div
        {...getRootProps()}
        className={`
          relative border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
          ${isDragActive || dragActive 
            ? 'border-blue-400 bg-blue-50' 
            : 'border-gray-300 hover:border-gray-400'
          }
        `}
      >
        <input {...getInputProps()} />
        
        <CloudArrowUpIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        
        <div className="space-y-2">
          <p className="text-lg font-medium text-gray-900">
            {isDragActive ? 'Drop files here' : 'Upload your financial reports'}
          </p>
          <p className="text-sm text-gray-500">
            Drag & drop files here, or{' '}
            <span className="text-blue-600 font-medium">browse</span>
          </p>
          <p className="text-xs text-gray-400">
            Supports PDF, Excel (.xlsx, .xls), and CSV files up to 10MB
          </p>
        </div>
      </div>

      {/* File Rejections */}
      {fileRejections.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
          <h4 className="text-sm font-medium text-red-800 mb-2">
            Some files were rejected:
          </h4>
          <ul className="text-sm text-red-700 space-y-1">
            {fileRejections.map(({ file, errors }) => (
              <li key={file.name}>
                <strong>{file.name}</strong>:
                <ul className="ml-4 list-disc">
                  {errors.map(error => (
                    <li key={error.code}>{error.message}</li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Upload Progress */}
      {uploads.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-lg">
          <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
            <h3 className="text-sm font-medium text-gray-900">
              Upload Progress ({uploads.length})
            </h3>
            {uploads.some(u => u.status === 'completed') && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearCompleted}
              >
                Clear Completed
              </Button>
            )}
          </div>
          
          <div className="divide-y divide-gray-200">
            {uploads.map((upload) => (
              <div key={upload.fileId} className="px-4 py-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3 flex-1 min-w-0">
                    <DocumentIcon className="h-5 w-5 text-gray-400 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {upload.fileName}
                      </p>
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(upload.status)}
                        <span className="text-xs text-gray-500">
                          {getStatusText(upload.status)}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeUpload(upload.fileId)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <XMarkIcon className="h-4 w-4" />
                  </Button>
                </div>
                
                {/* Progress Bar */}
                {(upload.status === 'uploading' || upload.status === 'analyzing') && (
                  <div className="mt-2">
                    <div className="bg-gray-200 rounded-full h-1">
                      <div 
                        className="bg-blue-600 h-1 rounded-full transition-all duration-300"
                        style={{ 
                          width: upload.status === 'uploading' 
                            ? `${upload.progress}%` 
                            : '100%'
                        }}
                      />
                    </div>
                  </div>
                )}
                
                {/* Error Message */}
                {upload.status === 'error' && upload.error && (
                  <p className="mt-1 text-xs text-red-600">
                    {upload.error}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick Start Tips */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="text-sm font-medium text-blue-900 mb-2">
          💡 Quick Tips for Better Analysis
        </h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Upload recent financial statements for the most relevant insights</li>
          <li>• Ensure your files contain clear financial data and numbers</li>
          <li>• PDF files work best when they contain selectable text (not scanned images)</li>
          <li>• Excel files should have data in structured tables or rows</li>
        </ul>
      </div>
    </div>
  );
}