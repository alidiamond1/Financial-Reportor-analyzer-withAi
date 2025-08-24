import { NextRequest, NextResponse } from 'next/server';
import { supabase, STORAGE_BUCKETS, TABLES } from '@/lib/supabase';
import { authenticateRequest, checkSubscriptionTier } from '@/lib/auth';
import { geminiService } from '@/lib/gemini';
import FileParsingService from '@/lib/file-parser';
import { ApiResponse, AnalysisRequest, AnalysisResponse } from '@/types';
import { v4 as uuidv4 } from 'uuid';

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
    const body: AnalysisRequest = await request.json();
    const { fileId, analysisType = 'full', customPrompt } = body;

    if (!fileId) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'File ID is required'
      }, { status: 400 });
    }

    // Check if user has access to advanced features
    if (customPrompt && !(await checkSubscriptionTier(user.id, 'pro'))) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Custom prompts require Pro or Enterprise subscription'
      }, { status: 403 });
    }

    // Get file details and verify ownership
    const { data: file, error: fileError } = await supabase
      .from(TABLES.FILES)
      .select('*')
      .eq('id', fileId)
      .eq('user_id', user.id)
      .single();

    if (fileError || !file) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'File not found'
      }, { status: 404 });
    }

    // Check if analysis already exists
    const { data: existingAnalysis } = await supabase
      .from(TABLES.ANALYSES)
      .select('id')
      .eq('file_id', fileId)
      .single();

    if (existingAnalysis && analysisType !== 'custom') {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Analysis already exists for this file'
      }, { status: 409 });
    }

    // Update file status to pending
    await supabase
      .from(TABLES.FILES)
      .update({ analysis_status: 'pending' })
      .eq('id', fileId);

    try {
      // Download file from storage
      if (!file.supabase_storage_path) {
        throw new Error('File storage path not found');
      }

      const { data: fileData, error: downloadError } = await supabase.storage
        .from(STORAGE_BUCKETS.FILES)
        .download(file.supabase_storage_path);

      if (downloadError || !fileData) {
        throw new Error('Failed to download file from storage');
      }

      // Parse file content
      const fileBuffer = Buffer.from(await fileData.arrayBuffer());
      const parsedContent = await FileParsingService.parseFile(
        fileBuffer,
        file.file_name,
        file.file_type as 'pdf' | 'excel' | 'csv'
      );

      // Validate content
      const contentValidation = geminiService.constructor.validateContent(parsedContent.text);
      if (!contentValidation.isValid) {
        throw new Error(contentValidation.error);
      }

      // Generate analysis using Gemini AI
      const analysisResult = await geminiService.analyzeFinancialReport(
        parsedContent.text,
        file.file_name,
        customPrompt
      );

      // Save analysis to database
      const analysisId = uuidv4();
      const { data: savedAnalysis, error: analysisError } = await supabase
        .from(TABLES.ANALYSES)
        .insert({
          id: analysisId,
          file_id: fileId,
          summary: analysisResult.summary,
          kpis: analysisResult.kpis,
          risks: analysisResult.risks,
          opportunities: analysisResult.opportunities,
          recommendations: analysisResult.recommendations
        })
        .select()
        .single();

      if (analysisError) {
        console.error('Analysis save error:', analysisError);
        throw new Error('Failed to save analysis');
      }

      // Update file status to completed
      await supabase
        .from(TABLES.FILES)
        .update({ analysis_status: 'completed' })
        .eq('id', fileId);

      // Create notification for user
      await supabase
        .from(TABLES.NOTIFICATIONS)
        .insert({
          user_id: user.id,
          type: 'success',
          title: 'Analysis Complete',
          message: `Financial analysis for "${file.file_name}" has been completed successfully.`
        });

      const response: AnalysisResponse = {
        analysisId: savedAnalysis.id,
        status: 'completed',
        message: 'Analysis completed successfully'
      };

      return NextResponse.json<ApiResponse<AnalysisResponse>>({
        success: true,
        data: response,
        message: 'Analysis generated successfully'
      }, { status: 201 });

    } catch (error) {
      console.error('Analysis generation error:', error);

      // Update file status to failed
      await supabase
        .from(TABLES.FILES)
        .update({ analysis_status: 'failed' })
        .eq('id', fileId);

      // Create error notification
      await supabase
        .from(TABLES.NOTIFICATIONS)
        .insert({
          user_id: user.id,
          type: 'error',
          title: 'Analysis Failed',
          message: `Failed to analyze "${file.file_name}". Please try again or contact support.`
        });

      const errorMessage = error instanceof Error ? error.message : 'Analysis generation failed';
      
      return NextResponse.json<ApiResponse>({
        success: false,
        error: errorMessage
      }, { status: 500 });
    }

  } catch (error) {
    console.error('Generate analysis error:', error);
    return NextResponse.json<ApiResponse>({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
}