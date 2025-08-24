'use client';

import React, { useState, useEffect } from 'react';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { ChatInterface } from '@/components/chat/ChatInterface';
import { useAuth } from '@/contexts/AuthContext';
import { 
  ChatBubbleLeftRightIcon,
  SparklesIcon,
  LightBulbIcon,
  ChartBarIcon,
  DocumentTextIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

export default function ChatPage() {
  const { user } = useAuth();
  const [hasAccess, setHasAccess] = useState(false);

  useEffect(() => {
    // Check if user has access to AI Chat (Pro/Enterprise users)
    // For now, we'll allow all users for demonstration
    setHasAccess(true);
    
    // TODO: Implement subscription check
    // setHasAccess(user?.subscriptionTier === 'pro' || user?.subscriptionTier === 'enterprise');
  }, [user]);

  const suggestedQuestions = [
    {
      icon: <ChartBarIcon className="h-5 w-5" />,
      title: "Analyze Key Metrics",
      question: "What are the key financial metrics I should focus on for my business?"
    },
    {
      icon: <DocumentTextIcon className="h-5 w-5" />,
      title: "Report Insights",
      question: "Can you explain the trends in my latest financial report?"
    },
    {
      icon: <LightBulbIcon className="h-5 w-5" />,
      title: "Improvement Suggestions",
      question: "What recommendations do you have to improve my financial performance?"
    },
    {
      icon: <SparklesIcon className="h-5 w-5" />,
      title: "Future Projections",
      question: "Based on current trends, what can I expect for next quarter?"
    }
  ];

  if (!hasAccess) {
    return (
      <ProtectedRoute>
        <DashboardLayout currentPage="chat">
          <div className="flex items-center justify-center min-h-96">
            <div className="text-center max-w-md">
              <div className="p-4 bg-blue-100 rounded-full inline-block mb-4">
                <ChatBubbleLeftRightIcon className="h-8 w-8 text-blue-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">AI Chat - Pro Feature</h2>
              <p className="text-gray-600 mb-6">
                Unlock AI-powered conversations about your financial data with our Pro plan.
              </p>
              <div className="space-y-2">
                <button className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors">
                  Upgrade to Pro
                </button>
                <button className="w-full text-blue-600 px-6 py-3 rounded-lg font-medium hover:bg-blue-50 transition-colors">
                  Learn More
                </button>
              </div>
            </div>
          </div>
        </DashboardLayout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <DashboardLayout currentPage="chat">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Header */}
          <div className="text-center">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <div className="p-3 bg-blue-100 rounded-full">
                <ChatBubbleLeftRightIcon className="h-8 w-8 text-blue-600" />
              </div>
              <SparklesIcon className="h-6 w-6 text-yellow-500" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">AI Financial Assistant</h1>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Get instant insights about your financial data. Ask questions about your reports, 
              request analysis, or get recommendations for improving your business performance.
            </p>
          </div>

          {/* Suggested Questions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            {suggestedQuestions.map((item, index) => (
              <button
                key={index}
                className="text-left p-4 bg-white border border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-md transition-all group"
                onClick={() => {
                  // TODO: Auto-fill the chat input with this question
                  console.log('Suggested question:', item.question);
                }}
              >
                <div className="flex items-start space-x-3">
                  <div className="p-2 bg-gray-100 rounded-lg group-hover:bg-blue-100 transition-colors">
                    {item.icon}
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900 mb-1">{item.title}</h3>
                    <p className="text-sm text-gray-600">{item.question}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>

          {/* Chat Interface */}
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm h-96">
            <ChatInterface className="h-full" />
          </div>

          {/* Pro Features Notice */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <SparklesIcon className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-blue-900 mb-1">Pro AI Features Active</h4>
                <p className="text-sm text-blue-700">
                  You have access to unlimited AI conversations, advanced analysis capabilities, 
                  and context-aware responses based on your uploaded financial data.
                </p>
              </div>
            </div>
          </div>

          {/* Help Section */}
          <div className="bg-gray-50 rounded-lg p-6">
            <h3 className="font-semibold text-gray-900 mb-3">Tips for Better AI Conversations</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Be Specific</h4>
                <p>Ask about specific metrics, time periods, or aspects of your financial data for more accurate responses.</p>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Use Context</h4>
                <p>Reference your uploaded reports or previous analyses to get contextual insights.</p>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Ask Follow-ups</h4>
                <p>Don't hesitate to ask clarifying questions or request deeper analysis on interesting findings.</p>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Request Actions</h4>
                <p>Ask for recommendations, action plans, or next steps based on your financial data.</p>
              </div>
            </div>
          </div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}