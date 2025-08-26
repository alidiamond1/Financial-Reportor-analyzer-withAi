import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { STORAGE_BUCKETS, TABLES } from '@/lib/supabase';
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

    // Create authenticated Supabase client with user's session
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    
    const supabaseAuth = createClient(supabaseUrl, supabaseAnonKey);
    
    // Get the auth token from request headers
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Invalid authorization header'
      }, { status: 401 });
    }
    
    const token = authHeader.substring(7);
    
    // Set the auth session for Supabase client
    await supabaseAuth.auth.setSession({ access_token: token, refresh_token: '' });

    // Upload file to Supabase Storage using the authenticated client
    const { data: uploadData, error: uploadError } = await supabaseAuth.storage
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

    // Save file metadata to database using authenticated client
    const { data: fileRecord, error: dbError } = await supabaseAuth
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
      await supabaseAuth.storage
        .from(STORAGE_BUCKETS.FILES)
        .remove([storagePath]);

      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Failed to save file metadata'
      }, { status: 500 });
    }

    // Increment user upload count
    await supabaseAuth.rpc('increment_upload_count', { user_uuid: user.id });

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
    
    // Create authenticated Supabase client
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    const supabaseAuth = createClient(supabaseUrl, supabaseAnonKey);
    
    // Get the auth token from request headers
    const authHeader = request.headers.get('authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      await supabaseAuth.auth.setSession({ access_token: token, refresh_token: '' });
    }
    
    // Parse query parameters
    const page = parseInt(searchParams.get('page') || '1');
    const limit = Math.min(parseInt(searchParams.get('limit') || '10'), 50);
    const fileType = searchParams.get('fileType');
    const status = searchParams.get('status');
    
    const offset = (page - 1) * limit;

    // Build query
    let query = supabaseAuth
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