import { NextRequest, NextResponse } from 'next/server';
import { supabase, TABLES } from '@/lib/supabase';
import { authenticateRequest } from '@/lib/auth';
import DashboardService from '@/lib/dashboard';
import { ApiResponse } from '@/types';
import { v4 as uuidv4 } from 'uuid';

export async function GET(
  request: NextRequest,
  { params }: { params: { analysisId: string } }
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
    const analysisId = params.analysisId;

    // Get analysis and verify user ownership
    const { data: analysis, error: analysisError } = await supabase
      .from(TABLES.ANALYSES)
      .select(`
        *,
        files!inner(
          id,
          file_name,
          user_id
        )
      `)
      .eq('id', analysisId)
      .eq('files.user_id', user.id)
      .single();

    if (analysisError || !analysis) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Analysis not found'
      }, { status: 404 });
    }

    // Check if dashboard already exists
    const { data: existingDashboard, error: dashboardError } = await supabase
      .from(TABLES.DASHBOARDS)
      .select('*')
      .eq('analysis_id', analysisId)
      .single();

    let dashboard;

    if (existingDashboard && !dashboardError) {
      // Return existing dashboard
      dashboard = existingDashboard;
    } else {
      // Generate new dashboard
      const dashboardData = DashboardService.generateDashboard(analysis);
      
      // Save dashboard to database
      const { data: newDashboard, error: saveError } = await supabase
        .from(TABLES.DASHBOARDS)
        .insert({
          id: uuidv4(),
          analysis_id: analysisId,
          chart_data: dashboardData.chartData,
          insights: dashboardData.insights
        })
        .select()
        .single();

      if (saveError) {
        console.error('Dashboard save error:', saveError);
        return NextResponse.json<ApiResponse>({
          success: false,
          error: 'Failed to generate dashboard'
        }, { status: 500 });
      }

      dashboard = newDashboard;
    }

    // Return dashboard with analysis data
    const responseData = {
      ...dashboard,
      analysis: {
        id: analysis.id,
        summary: analysis.summary,
        kpis: analysis.kpis,
        risks: analysis.risks,
        opportunities: analysis.opportunities,
        recommendations: analysis.recommendations,
        file: analysis.files
      }
    };

    return NextResponse.json<ApiResponse>({
      success: true,
      data: responseData,
      message: 'Dashboard retrieved successfully'
    }, { status: 200 });

  } catch (error) {
    console.error('Get dashboard error:', error);
    return NextResponse.json<ApiResponse>({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { analysisId: string } }
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
    const analysisId = params.analysisId;

    // Get analysis and verify user ownership
    const { data: analysis, error: analysisError } = await supabase
      .from(TABLES.ANALYSES)
      .select(`
        *,
        files!inner(user_id)
      `)
      .eq('id', analysisId)
      .eq('files.user_id', user.id)
      .single();

    if (analysisError || !analysis) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Analysis not found'
      }, { status: 404 });
    }

    // Delete existing dashboard if it exists
    await supabase
      .from(TABLES.DASHBOARDS)
      .delete()
      .eq('analysis_id', analysisId);

    // Generate new dashboard
    const dashboardData = DashboardService.generateDashboard(analysis);
    
    // Save new dashboard to database
    const { data: newDashboard, error: saveError } = await supabase
      .from(TABLES.DASHBOARDS)
      .insert({
        id: uuidv4(),
        analysis_id: analysisId,
        chart_data: dashboardData.chartData,
        insights: dashboardData.insights
      })
      .select()
      .single();

    if (saveError) {
      console.error('Dashboard regeneration error:', saveError);
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Failed to regenerate dashboard'
      }, { status: 500 });
    }

    return NextResponse.json<ApiResponse>({
      success: true,
      data: newDashboard,
      message: 'Dashboard regenerated successfully'
    }, { status: 201 });

  } catch (error) {
    console.error('Regenerate dashboard error:', error);
    return NextResponse.json<ApiResponse>({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
}