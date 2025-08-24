import { NextRequest, NextResponse } from 'next/server';
import { supabase, TABLES } from '@/lib/supabase';
import { authenticateRequest, checkSubscriptionTier, checkRateLimit } from '@/lib/auth';
import { geminiService } from '@/lib/gemini';
import { ApiResponse } from '@/types';
import { v4 as uuidv4 } from 'uuid';

interface ChatQueryRequest {
  message: string;
  analysisId?: string;
  conversationId?: string;
}

interface ChatQueryResponse {
  response: string;
  conversationId: string;
  timestamp: Date;
  analysisContext?: boolean;
}

export async function POST(request: NextRequest) {
  try {
    // Authenticate user
    const authResult = await authenticateRequest(request);
    if (!authResult.success || !authResult.user) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: authResult.error || 'Authentication required'
      }, { status: 401 });
    }

    const user = authResult.user;

    // Check subscription tier for chat functionality
    if (!(await checkSubscriptionTier(user.id, 'pro'))) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'AI Chat requires Pro or Enterprise subscription'
      }, { status: 403 });
    }

    // Rate limiting for chat queries
    const rateLimit = checkRateLimit(`chat_${user.id}`, 20, 60 * 1000); // 20 queries per minute
    if (!rateLimit.allowed) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Too many chat queries. Please wait before sending another message.'
      }, { status: 429 });
    }

    const body: ChatQueryRequest = await request.json();
    const { message, analysisId, conversationId } = body;

    if (!message || message.trim().length === 0) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Message is required'
      }, { status: 400 });
    }

    if (message.length > 1000) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Message too long. Maximum 1000 characters allowed.'
      }, { status: 400 });
    }

    let analysisContext = null;
    let reportContent = null;

    // Get analysis context if analysisId is provided
    if (analysisId) {
      const { data: analysis, error: analysisError } = await supabase
        .from(TABLES.ANALYSES)
        .select(`
          *,
          files!inner(
            id,
            file_name,
            user_id,
            supabase_storage_path
          )
        `)
        .eq('id', analysisId)
        .eq('files.user_id', user.id)
        .single();

      if (analysis && !analysisError) {
        analysisContext = {
          id: analysis.id,
          summary: analysis.summary,
          kpis: analysis.kpis,
          risks: analysis.risks,
          opportunities: analysis.opportunities,
          recommendations: analysis.recommendations
        };

        // Optionally get report content for more context
        // This is a simplified approach - in production you might cache this
        try {
          if (analysis.files.supabase_storage_path) {
            const { data: fileData } = await supabase.storage
              .from('uploaded-files')
              .download(analysis.files.supabase_storage_path);

            if (fileData) {
              // For simplicity, we'll just use the summary
              // In production, you might want to include relevant excerpts
              reportContent = analysis.summary;
            }
          }
        } catch (error) {
          console.log('Could not fetch report content for context:', error);
        }
      }
    }

    try {
      // Generate AI response using Gemini
      const aiResponse = await geminiService.generateCustomResponse(
        message,
        analysisContext,
        reportContent
      );

      // Generate or use existing conversation ID
      const chatConversationId = conversationId || uuidv4();

      // Save chat message to database
      const { data: chatRecord, error: chatError } = await supabase
        .from(TABLES.CHAT_MESSAGES)
        .insert({
          id: uuidv4(),
          user_id: user.id,
          analysis_id: analysisId || null,
          message: message.trim(),
          response: aiResponse,
          timestamp: new Date().toISOString()
        })
        .select()
        .single();

      if (chatError) {
        console.error('Chat save error:', chatError);
        // Continue with response even if saving fails
      }

      const response: ChatQueryResponse = {
        response: aiResponse,
        conversationId: chatConversationId,
        timestamp: new Date(),
        analysisContext: !!analysisContext
      };

      return NextResponse.json<ApiResponse<ChatQueryResponse>>({
        success: true,
        data: response,
        message: 'Chat response generated successfully'
      }, { status: 200 });

    } catch (error) {
      console.error('Chat AI error:', error);
      
      // Return a helpful error response
      const fallbackResponse: ChatQueryResponse = {
        response: "I'm sorry, I'm having trouble processing your question right now. Please try again in a moment, or contact support if the issue persists.",
        conversationId: conversationId || uuidv4(),
        timestamp: new Date(),
        analysisContext: !!analysisContext
      };

      return NextResponse.json<ApiResponse<ChatQueryResponse>>({
        success: true,
        data: fallbackResponse,
        message: 'Fallback response provided due to AI service issue'
      }, { status: 200 });
    }

  } catch (error) {
    console.error('Chat query error:', error);
    return NextResponse.json<ApiResponse>({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    // Authenticate user
    const authResult = await authenticateRequest(request);
    if (!authResult.success || !authResult.user) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: authResult.error || 'Authentication required'
      }, { status: 401 });
    }

    const user = authResult.user;
    const { searchParams } = new URL(request.url);
    
    // Parse query parameters
    const page = parseInt(searchParams.get('page') || '1');
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100);
    const analysisId = searchParams.get('analysisId');
    
    const offset = (page - 1) * limit;

    // Build query
    let query = supabase
      .from(TABLES.CHAT_MESSAGES)
      .select('*', { count: 'exact' })
      .eq('user_id', user.id)
      .order('timestamp', { ascending: false });

    // Filter by analysis if specified
    if (analysisId) {
      query = query.eq('analysis_id', analysisId);
    }

    // Apply pagination
    query = query.range(offset, offset + limit - 1);

    const { data: chatMessages, error, count } = await query;

    if (error) {
      console.error('Chat history query error:', error);
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Failed to fetch chat history'
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      data: chatMessages || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      }
    }, { status: 200 });

  } catch (error) {
    console.error('Get chat history error:', error);
    return NextResponse.json<ApiResponse>({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
}