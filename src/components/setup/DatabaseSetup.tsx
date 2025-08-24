'use client';

import React, { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/Button';
import { 
  CheckCircleIcon, 
  ExclamationTriangleIcon,
  InformationCircleIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';

interface DatabaseSetupProps {
  onSetupComplete?: () => void;
}

export function DatabaseSetup({ onSetupComplete }: DatabaseSetupProps) {
  const [isChecking, setIsChecking] = useState(false);
  const [setupStatus, setSetupStatus] = useState<'checking' | 'needed' | 'complete' | 'error'>('checking');
  const [message, setMessage] = useState<string>('');

  const checkDatabaseSetup = async () => {
    setIsChecking(true);
    try {
      // Try to query the users table to check if database is set up
      const { data, error } = await supabase
        .from('users')
        .select('id')
        .limit(1);

      if (error) {
        if (error.code === 'PGRST116' || error.code === '42P01') {
          setSetupStatus('needed');
          setMessage('Database tables not found. Please set up your database first.');
        } else {
          setSetupStatus('error');
          setMessage(`Database error: ${error.message}`);
        }
      } else {
        setSetupStatus('complete');
        setMessage('Database is properly configured!');
        onSetupComplete?.();
      }
    } catch (error) {
      setSetupStatus('error');
      setMessage('Failed to check database setup.');
    } finally {
      setIsChecking(false);
    }
  };

  React.useEffect(() => {
    checkDatabaseSetup();
  }, []);

  if (setupStatus === 'complete') {
    return null; // Don't show if database is properly set up
  }

  return (
    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-6">
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0">
          {setupStatus === 'checking' && (
            <ArrowPathIcon className="h-6 w-6 text-yellow-600 animate-spin" />
          )}
          {setupStatus === 'needed' && (
            <ExclamationTriangleIcon className="h-6 w-6 text-yellow-600" />
          )}
          {setupStatus === 'error' && (
            <ExclamationTriangleIcon className="h-6 w-6 text-red-600" />
          )}
        </div>
        
        <div className="flex-1">
          <h3 className="text-lg font-medium text-yellow-800 mb-2">
            Database Setup Required
          </h3>
          
          <p className="text-yellow-700 mb-4">
            {message}
          </p>

          {setupStatus === 'needed' && (
            <div className="space-y-4">
              <div className="bg-white rounded-lg p-4 border border-yellow-200">
                <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                  <InformationCircleIcon className="h-5 w-5 text-blue-500 mr-2" />
                  Setup Instructions
                </h4>
                <ol className="list-decimal list-inside space-y-2 text-sm text-gray-700">
                  <li>Open your Supabase dashboard</li>
                  <li>Go to the SQL Editor</li>
                  <li>Copy and paste the database schema from <code className="bg-gray-100 px-1 rounded">src/lib/database-schema.sql</code></li>
                  <li>Run the SQL script to create all required tables and policies</li>
                  <li>Click "Recheck Database" below after running the script</li>
                </ol>
              </div>

              <div className="flex space-x-3">
                <Button
                  onClick={checkDatabaseSetup}
                  loading={isChecking}
                  variant="primary"
                  size="sm"
                >
                  {isChecking ? 'Checking...' : 'Recheck Database'}
                </Button>
                
                <Button
                  onClick={() => window.open('https://app.supabase.com', '_blank')}
                  variant="secondary"
                  size="sm"
                >
                  Open Supabase Dashboard
                </Button>
              </div>
            </div>
          )}

          {setupStatus === 'error' && (
            <Button
              onClick={checkDatabaseSetup}
              loading={isChecking}
              variant="primary"
              size="sm"
            >
              Retry Check
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}