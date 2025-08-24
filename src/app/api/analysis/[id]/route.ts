import { NextRequest, NextResponse } from 'next/server';
import { supabase, TABLES } from '@/lib/supabase';
import { authenticateRequest } from '@/lib/auth';
import { ApiResponse } from '@/types';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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
    const analysisId = params.id;

    // Get analysis with file details, ensuring user ownership
    const { data: analysis, error } = await supabase
      .from(TABLES.ANALYSES)
      .select(`
        *,
        files!inner(
          id,
          file_name,
          file_type,
          upload_date,
          file_size,
          user_id
        )
      `)
      .eq('id', analysisId)
      .eq('files.user_id', user.id)
      .single();

    if (error || !analysis) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Analysis not found'
      }, { status: 404 });
    }

    return NextResponse.json<ApiResponse>({
      success: true,
      data: analysis,
      message: 'Analysis retrieved successfully'
    }, { status: 200 });

  } catch (error) {
    console.error('Get analysis error:', error);
    return NextResponse.json<ApiResponse>({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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
    const analysisId = params.id;

    // Verify user owns the analysis through file ownership
    const { data: analysis, error: fetchError } = await supabase
      .from(TABLES.ANALYSES)
      .select(`
        id,
        file_id,
        files!inner(user_id)
      `)
      .eq('id', analysisId)
      .eq('files.user_id', user.id)
      .single();

    if (fetchError || !analysis) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Analysis not found'
      }, { status: 404 });
    }

    // Delete associated dashboard data first
    await supabase
      .from(TABLES.DASHBOARDS)
      .delete()
      .eq('analysis_id', analysisId);

    // Delete the analysis
    const { error: deleteError } = await supabase
      .from(TABLES.ANALYSES)
      .delete()
      .eq('id', analysisId);

    if (deleteError) {
      console.error('Analysis deletion error:', deleteError);
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Failed to delete analysis'
      }, { status: 500 });
    }

    return NextResponse.json<ApiResponse>({
      success: true,
      message: 'Analysis deleted successfully'
    }, { status: 200 });

  } catch (error) {
    console.error('Delete analysis error:', error);
    return NextResponse.json<ApiResponse>({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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
    const analysisId = params.id;
    const body = await request.json();

    // Verify user owns the analysis
    const { data: existingAnalysis, error: fetchError } = await supabase
      .from(TABLES.ANALYSES)
      .select(`
        id,
        files!inner(user_id)
      `)
      .eq('id', analysisId)
      .eq('files.user_id', user.id)
      .single();

    if (fetchError || !existingAnalysis) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Analysis not found'
      }, { status: 404 });
    }

    // Only allow updating certain fields
    const allowedUpdates: { [key: string]: any } = {};
    
    if (body.summary && typeof body.summary === 'string') {
      allowedUpdates.summary = body.summary;
    }

    if (body.kpis && typeof body.kpis === 'object') {
      allowedUpdates.kpis = body.kpis;
    }

    if (body.risks && Array.isArray(body.risks)) {
      allowedUpdates.risks = body.risks;
    }

    if (body.opportunities && Array.isArray(body.opportunities)) {
      allowedUpdates.opportunities = body.opportunities;
    }

    if (body.recommendations && Array.isArray(body.recommendations)) {
      allowedUpdates.recommendations = body.recommendations;
    }

    if (Object.keys(allowedUpdates).length === 0) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'No valid fields to update'
      }, { status: 400 });
    }

    // Update analysis
    const { data: updatedAnalysis, error: updateError } = await supabase
      .from(TABLES.ANALYSES)
      .update(allowedUpdates)
      .eq('id', analysisId)
      .select()
      .single();

    if (updateError) {
      console.error('Analysis update error:', updateError);
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Failed to update analysis'
      }, { status: 500 });
    }

    return NextResponse.json<ApiResponse>({
      success: true,
      data: updatedAnalysis,
      message: 'Analysis updated successfully'
    }, { status: 200 });

  } catch (error) {
    console.error('Update analysis error:', error);
    return NextResponse.json<ApiResponse>({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
}