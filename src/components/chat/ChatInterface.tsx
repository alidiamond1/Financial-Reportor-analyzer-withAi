'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { 
  PaperAirplaneIcon,
  ChatBubbleLeftRightIcon,
  ExclamationTriangleIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';

interface ChatMessage {
  id: string;
  message: string;
  response: string;
  timestamp: Date;
  isUser: boolean;
  analysisContext?: boolean;
}

interface ChatInterfaceProps {
  analysisId?: string;
  analysisContext?: {
    fileName: string;
    summary: string;
  };
  className?: string;
}

export function ChatInterface({ analysisId, analysisContext, className = '' }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Add welcome message
    if (messages.length === 0) {
      const welcomeMessage: ChatMessage = {
        id: 'welcome',
        message: '',
        response: analysisContext 
          ? `Hello! I'm your AI financial assistant. I can help you understand the analysis of "${analysisContext.fileName}" or answer any financial questions you have. What would you like to know?`
          : 'Hello! I\'m your AI financial assistant. I can help you analyze financial data and answer questions about financial reports. How can I assist you today?',
        timestamp: new Date(),
        isUser: false,
        analysisContext: !!analysisContext
      };
      setMessages([welcomeMessage]);
    }
  }, [analysisContext]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!inputValue.trim() || isLoading) return;

    if (!user) {
      setError('Please log in to use the chat feature.');
      return;
    }

    const userMessage = inputValue.trim();
    setInputValue('');
    setError(null);

    // Add user message to chat
    const userChatMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      message: userMessage,
      response: '',
      timestamp: new Date(),
      isUser: true
    };

    setMessages(prev => [...prev, userChatMessage]);
    setIsLoading(true);

    try {
      const { data: { session } } = await import('@/lib/supabase').then(m => m.supabase.auth.getSession());
      const token = session?.access_token;

      if (!token) {
        throw new Error('Authentication required');
      }

      // For now, simulate AI response since API might not be ready
      // TODO: Replace with actual API call when backend is implemented
      
      const simulatedResponse = `Thank you for your question: "${userMessage}". 

I'm your AI financial assistant and I'd be happy to help you with financial analysis and insights. However, the chat API is still being set up. 

In the meantime, here are some things I can help you with once fully operational:
• Financial report analysis
• KPI explanations
• Risk assessment
• Growth opportunities
• Performance benchmarking

Please check back soon for full AI functionality!`;

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Add AI response to chat
      const aiChatMessage: ChatMessage = {
        id: `ai-${Date.now()}`,
        message: userMessage,
        response: simulatedResponse,
        timestamp: new Date(),
        isUser: false,
        analysisContext: !!analysisContext
      };

      setMessages(prev => [...prev, aiChatMessage]);

      /* TODO: Uncomment when API is ready
      const response = await fetch('/api/chat/query', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: userMessage,
          analysisId: analysisId,
          conversationId: `chat-${Date.now()}`
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to get response');
      }

      const result = await response.json();
      
      // Add AI response to chat
      const aiChatMessage: ChatMessage = {
        id: `ai-${Date.now()}`,
        message: userMessage,
        response: result.data.response,
        timestamp: new Date(),
        isUser: false,
        analysisContext: result.data.analysisContext
      };

      setMessages(prev => [...prev, aiChatMessage]);
      */

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send message');
      
      // Add error message to chat
      const errorMessage: ChatMessage = {
        id: `error-${Date.now()}`,
        message: userMessage,
        response: 'I apologize, but I encountered an error processing your request. The chat API is currently being set up. Please try again later or contact support if the issue persists.',
        timestamp: new Date(),
        isUser: false
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const formatTimestamp = (timestamp: Date) => {
    return timestamp.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const suggestedQuestions = [
    'What are the key financial highlights?',
    'What risks should I be aware of?',
    'How is the company performing compared to industry standards?',
    'What opportunities for growth do you see?'
  ];

  const handleSuggestedQuestion = (question: string) => {
    setInputValue(question);
  };

  return (
    <div className={`flex flex-col h-full bg-white rounded-lg border border-gray-200 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <ChatBubbleLeftRightIcon className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <h3 className="font-medium text-gray-900">AI Financial Assistant</h3>
            {analysisContext && (
              <p className="text-sm text-gray-500">
                Analyzing: {analysisContext.fileName}
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center space-x-1">
          <SparklesIcon className="h-4 w-4 text-blue-500" />
          <span className="text-xs text-blue-600 font-medium">AI Powered</span>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div key={message.id} className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-xs lg:max-w-md xl:max-w-lg ${
              message.isUser 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-100 text-gray-900'
            } rounded-lg px-4 py-2`}>
              {message.isUser ? (
                <p className="text-sm">{message.message}</p>
              ) : (
                <div className="space-y-2">
                  <p className="text-sm whitespace-pre-wrap">{message.response}</p>
                  {message.analysisContext && (
                    <div className="flex items-center space-x-1 text-xs text-gray-500">
                      <SparklesIcon className="h-3 w-3" />
                      <span>Context-aware response</span>
                    </div>
                  )}
                </div>
              )}
              <p className={`text-xs mt-1 ${
                message.isUser ? 'text-blue-100' : 'text-gray-500'
              }`}>
                {formatTimestamp(message.timestamp)}
              </p>
            </div>
          </div>
        ))}

        {/* Loading indicator */}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 rounded-lg px-4 py-2">
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                <span className="text-sm text-gray-600">AI is thinking...</span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Questions */}
      {messages.length <= 1 && !isLoading && (
        <div className="px-4 py-2 border-t border-gray-100">
          <p className="text-xs text-gray-500 mb-2">Suggested questions:</p>
          <div className="flex flex-wrap gap-2">
            {suggestedQuestions.map((question, index) => (
              <button
                key={index}
                onClick={() => handleSuggestedQuestion(question)}
                className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded-full hover:bg-blue-100 transition-colors"
              >
                {question}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Error display */}
      {error && (
        <div className="px-4 py-2 bg-red-50 border-t border-red-200">
          <div className="flex items-center space-x-2">
            <ExclamationTriangleIcon className="h-4 w-4 text-red-500" />
            <span className="text-sm text-red-700">{error}</span>
          </div>
        </div>
      )}

      {/* Input */}
      <div className="p-4 border-t border-gray-200">
        <form onSubmit={handleSubmit} className="flex space-x-2">
          <div className="flex-1">
            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Ask me anything about your financial data..."
              disabled={isLoading}
              className="border-gray-300"
            />
          </div>
          <Button
            type="submit"
            variant="primary"
            size="md"
            disabled={!inputValue.trim() || isLoading}
            className="px-3"
          >
            <PaperAirplaneIcon className="h-4 w-4" />
          </Button>
        </form>
        
        <p className="text-xs text-gray-500 mt-2">
          💡 Tip: Be specific with your questions for more detailed insights
        </p>
      </div>
    </div>
  );
}