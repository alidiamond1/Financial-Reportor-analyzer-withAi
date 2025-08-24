import { NextRequest, NextResponse } from 'next/server';
import { supabase, TABLES } from '@/lib/supabase';
import { authenticateRequest } from '@/lib/auth';
import { ApiResponse, PaginatedResponse } from '@/types';

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
    const limit = Math.min(parseInt(searchParams.get('limit') || '10'), 50);
    const fileId = searchParams.get('fileId');
    
    const offset = (page - 1) * limit;

    // Build query with file join to ensure user ownership
    let query = supabase
      .from(TABLES.ANALYSES)
      .select(`
        *,
        files!inner(
          id,
          file_name,
          file_type,
          upload_date,
          user_id
        )
      `, { count: 'exact' })
      .eq('files.user_id', user.id)
      .order('created_at', { ascending: false });

    // Apply file filter if specified
    if (fileId) {
      query = query.eq('file_id', fileId);
    }

    // Apply pagination
    query = query.range(offset, offset + limit - 1);

    const { data: analyses, error, count } = await query;

    if (error) {
      console.error('Analyses query error:', error);
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Failed to fetch analyses'
      }, { status: 500 });
    }

    const response: PaginatedResponse = {
      success: true,
      data: analyses || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      }
    };

    return NextResponse.json(response, { status: 200 });

  } catch (error) {
    console.error('Get analyses error:', error);
    return NextResponse.json<ApiResponse>({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
}