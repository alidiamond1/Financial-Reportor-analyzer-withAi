'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';

interface UploadProgress {
  fileId: string;
  progress: number;
  status: 'uploading' | 'analyzing' | 'completed' | 'error';
  fileName: string;
  error?: string;
}

interface UseFileUploadReturn {
  uploads: UploadProgress[];
  uploadFile: (file: File) => Promise<void>;
  removeUpload: (fileId: string) => void;
  clearCompleted: () => void;
}

export function useFileUpload(): UseFileUploadReturn {
  const [uploads, setUploads] = useState<UploadProgress[]>([]);
  const { user } = useAuth();

  const uploadFile = async (file: File): Promise<void> => {
    if (!user) {
      throw new Error('User must be authenticated to upload files');
    }

    // Generate temporary ID for tracking
    const tempId = `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Add upload to tracking
    const newUpload: UploadProgress = {
      fileId: tempId,
      progress: 0,
      status: 'uploading',
      fileName: file.name
    };

    setUploads(prev => [...prev, newUpload]);

    try {
      // Create FormData for file upload
      const formData = new FormData();
      formData.append('file', file);

      // Get auth token for API call
      const { data: { session } } = await import('@/lib/supabase').then(m => m.supabase.auth.getSession());
      const token = session?.access_token;

      if (!token) {
        throw new Error('Authentication token not found');
      }

      // Upload file
      const uploadResponse = await fetch('/api/files', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (!uploadResponse.ok) {
        const errorData = await uploadResponse.json();
        throw new Error(errorData.error || 'Upload failed');
      }

      const uploadResult = await uploadResponse.json();
      const actualFileId = uploadResult.data.fileId;

      // Update upload with actual file ID
      setUploads(prev => prev.map(upload => 
        upload.fileId === tempId 
          ? { ...upload, fileId: actualFileId, progress: 100, status: 'completed' }
          : upload
      ));

      // TODO: Start analysis when API is ready
      // For now, we'll skip the analysis step to avoid errors
      /*
      // Start analysis
      const analysisResponse = await fetch('/api/analysis/generate', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ fileId: actualFileId })
      });

      if (!analysisResponse.ok) {
        const errorData = await analysisResponse.json();
        throw new Error(errorData.error || 'Analysis failed');
      }

      // Mark as completed
      setUploads(prev => prev.map(upload => 
        upload.fileId === actualFileId 
          ? { ...upload, status: 'completed' }
          : upload
      ));
      */

    } catch (error) {
      console.error('Upload error:', error);
      
      // Update upload with error
      setUploads(prev => prev.map(upload => 
        upload.fileId === tempId 
          ? { 
              ...upload, 
              status: 'error',
              error: error instanceof Error ? error.message : 'Upload failed'
            }
          : upload
      ));
    }
  };

  const removeUpload = (fileId: string) => {
    setUploads(prev => prev.filter(upload => upload.fileId !== fileId));
  };

  const clearCompleted = () => {
    setUploads(prev => prev.filter(upload => upload.status !== 'completed'));
  };

  return {
    uploads,
    uploadFile,
    removeUpload,
    clearCompleted
  };
}