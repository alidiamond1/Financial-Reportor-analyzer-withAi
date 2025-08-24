import { NextRequest, NextResponse } from 'next/server';
import { supabase, STORAGE_BUCKETS, TABLES } from '@/lib/supabase';
import { authenticateRequest, checkUploadLimit, checkRateLimit } from '@/lib/auth';
import { ApiResponse, FileUploadResponse } from '@/types';
import { v4 as uuidv4 } from 'uuid';

const MAX_FILE_SIZE = parseInt(process.env.MAX_FILE_SIZE || '10485760'); // 10MB
const ALLOWED_TYPES = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-excel',
  'text/csv'
];

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const clientIp = request.ip || request.headers.get('x-forwarded-for') || 'unknown';
    const rateLimit = checkRateLimit(clientIp, 10, 60 * 1000); // 10 uploads per minute
    
    if (!rateLimit.allowed) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Too many upload attempts. Please try again later.'
      }, { status: 429 });
    }

    // Authenticate user
    const authResult = await authenticateRequest(request);
    if (!authResult.success || !authResult.user) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: authResult.error || 'Authentication required'
      }, { status: 401 });
    }

    const user = authResult.user;

    // Check upload limits
    const uploadCheck = await checkUploadLimit(user.id);
    if (!uploadCheck.canUpload) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: `Upload limit exceeded. You have used ${uploadCheck.currentCount}/${uploadCheck.limit} uploads this month.`
      }, { status: 403 });
    }

    // Parse form data
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'No file provided'
      }, { status: 400 });
    }

    // Validate file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Invalid file type. Only PDF, Excel, and CSV files are allowed.'
      }, { status: 400 });
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: `File too large. Maximum size is ${MAX_FILE_SIZE / 1024 / 1024}MB.`
      }, { status: 400 });
    }

    // Generate unique file path
    const fileId = uuidv4();
    const fileExtension = file.name.split('.').pop();
    const storagePath = `${user.id}/${fileId}.${fileExtension}`;

    // Upload file to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(STORAGE_BUCKETS.FILES)
      .upload(storagePath, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (uploadError) {
      console.error('File upload error:', uploadError);
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Failed to upload file to storage'
      }, { status: 500 });
    }

    // Determine file type
    let fileType: 'pdf' | 'excel' | 'csv';
    if (file.type === 'application/pdf') {
      fileType = 'pdf';
    } else if (file.type.includes('excel') || file.type.includes('spreadsheet')) {
      fileType = 'excel';
    } else {
      fileType = 'csv';
    }

    // Save file metadata to database
    const { data: fileRecord, error: dbError } = await supabase
      .from(TABLES.FILES)
      .insert({
        id: fileId,
        user_id: user.id,
        file_name: file.name,
        file_type: fileType,
        file_size: file.size,
        analysis_status: 'pending',
        supabase_storage_path: storagePath
      })
      .select()
      .single();

    if (dbError) {
      console.error('Database insert error:', dbError);
      
      // Clean up uploaded file if database insert fails
      await supabase.storage
        .from(STORAGE_BUCKETS.FILES)
        .remove([storagePath]);

      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Failed to save file metadata'
      }, { status: 500 });
    }

    // Increment user upload count
    await supabase.rpc('increment_upload_count', { user_uuid: user.id });

    // Return success response
    const response: FileUploadResponse = {
      fileId: fileRecord.id,
      fileName: fileRecord.file_name,
      message: 'File uploaded successfully. Analysis will begin shortly.'
    };

    return NextResponse.json<ApiResponse<FileUploadResponse>>({
      success: true,
      data: response,
      message: 'File uploaded successfully'
    }, { status: 201 });

  } catch (error) {
    console.error('File upload error:', error);
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
    const limit = Math.min(parseInt(searchParams.get('limit') || '10'), 50);
    const fileType = searchParams.get('fileType');
    const status = searchParams.get('status');
    
    const offset = (page - 1) * limit;

    // Build query
    let query = supabase
      .from(TABLES.FILES)
      .select('*', { count: 'exact' })
      .eq('user_id', user.id)
      .order('upload_date', { ascending: false });

    // Apply filters
    if (fileType && ['pdf', 'excel', 'csv'].includes(fileType)) {
      query = query.eq('file_type', fileType);
    }

    if (status && ['pending', 'completed', 'failed'].includes(status)) {
      query = query.eq('analysis_status', status);
    }

    // Apply pagination
    query = query.range(offset, offset + limit - 1);

    const { data: files, error, count } = await query;

    if (error) {
      console.error('Files query error:', error);
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Failed to fetch files'
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      data: files || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      }
    }, { status: 200 });

  } catch (error) {
    console.error('Get files error:', error);
    return NextResponse.json<ApiResponse>({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
}