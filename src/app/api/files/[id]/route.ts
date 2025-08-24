import { NextRequest, NextResponse } from 'next/server';
import { supabase, STORAGE_BUCKETS, TABLES } from '@/lib/supabase';
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
    const fileId = params.id;

    // Get file details
    const { data: file, error } = await supabase
      .from(TABLES.FILES)
      .select('*')
      .eq('id', fileId)
      .eq('user_id', user.id)
      .single();

    if (error || !file) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'File not found'
      }, { status: 404 });
    }

    return NextResponse.json<ApiResponse>({
      success: true,
      data: file,
      message: 'File retrieved successfully'
    }, { status: 200 });

  } catch (error) {
    console.error('Get file error:', error);
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
    const fileId = params.id;

    // Get file details to verify ownership and get storage path
    const { data: file, error: fetchError } = await supabase
      .from(TABLES.FILES)
      .select('*')
      .eq('id', fileId)
      .eq('user_id', user.id)
      .single();

    if (fetchError || !file) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'File not found'
      }, { status: 404 });
    }

    // Delete associated analyses first (cascade should handle this, but being explicit)
    const { error: analysisDeleteError } = await supabase
      .from(TABLES.ANALYSES)
      .delete()
      .eq('file_id', fileId);

    if (analysisDeleteError) {
      console.error('Analysis deletion error:', analysisDeleteError);
    }

    // Delete file from storage
    if (file.supabase_storage_path) {
      const { error: storageError } = await supabase.storage
        .from(STORAGE_BUCKETS.FILES)
        .remove([file.supabase_storage_path]);

      if (storageError) {
        console.error('Storage deletion error:', storageError);
        // Continue with database deletion even if storage deletion fails
      }
    }

    // Delete file record from database
    const { error: deleteError } = await supabase
      .from(TABLES.FILES)
      .delete()
      .eq('id', fileId)
      .eq('user_id', user.id);

    if (deleteError) {
      console.error('File deletion error:', deleteError);
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Failed to delete file'
      }, { status: 500 });
    }

    return NextResponse.json<ApiResponse>({
      success: true,
      message: 'File deleted successfully'
    }, { status: 200 });

  } catch (error) {
    console.error('Delete file error:', error);
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
    const fileId = params.id;
    const body = await request.json();

    // Validate that user owns the file
    const { data: existingFile, error: fetchError } = await supabase
      .from(TABLES.FILES)
      .select('id')
      .eq('id', fileId)
      .eq('user_id', user.id)
      .single();

    if (fetchError || !existingFile) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'File not found'
      }, { status: 404 });
    }

    // Only allow updating certain fields
    const allowedUpdates: { [key: string]: any } = {};
    
    if (body.file_name && typeof body.file_name === 'string') {
      allowedUpdates.file_name = body.file_name;
    }

    if (body.analysis_status && ['pending', 'completed', 'failed'].includes(body.analysis_status)) {
      allowedUpdates.analysis_status = body.analysis_status;
    }

    if (Object.keys(allowedUpdates).length === 0) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'No valid fields to update'
      }, { status: 400 });
    }

    // Update file
    const { data: updatedFile, error: updateError } = await supabase
      .from(TABLES.FILES)
      .update(allowedUpdates)
      .eq('id', fileId)
      .eq('user_id', user.id)
      .select()
      .single();

    if (updateError) {
      console.error('File update error:', updateError);
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Failed to update file'
      }, { status: 500 });
    }

    return NextResponse.json<ApiResponse>({
      success: true,
      data: updatedFile,
      message: 'File updated successfully'
    }, { status: 200 });

  } catch (error) {
    console.error('Update file error:', error);
    return NextResponse.json<ApiResponse>({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
}