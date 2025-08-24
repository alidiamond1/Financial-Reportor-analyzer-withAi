import { NextRequest, NextResponse } from 'next/server';
import { supabase, STORAGE_BUCKETS, TABLES } from '@/lib/supabase';
import { authenticateRequest, checkSubscriptionTier } from '@/lib/auth';
import DashboardService from '@/lib/dashboard';
import { ApiResponse, ExportRequest, ExportResponse } from '@/types';
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
    const body: ExportRequest = await request.json();
    const { analysisId, format, sections = [] } = body;

    if (!analysisId || !format) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Analysis ID and format are required'
      }, { status: 400 });
    }

    if (!['pdf', 'word', 'notion'].includes(format)) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Invalid format. Supported formats: pdf, word, notion'
      }, { status: 400 });
    }

    // Check subscription tier for advanced export formats
    if ((format === 'word' || format === 'notion') && !(await checkSubscriptionTier(user.id, 'pro'))) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: `${format.toUpperCase()} export requires Pro or Enterprise subscription`
      }, { status: 403 });
    }

    // Get analysis with dashboard data
    const { data: analysis, error: analysisError } = await supabase
      .from(TABLES.ANALYSES)
      .select(`
        *,
        files!inner(
          id,
          file_name,
          user_id
        ),
        dashboards(*)
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

    // Get or generate dashboard if it doesn't exist
    let dashboard = analysis.dashboards?.[0];
    if (!dashboard) {
      const dashboardData = DashboardService.generateDashboard(analysis);
      
      const { data: newDashboard, error: dashboardError } = await supabase
        .from(TABLES.DASHBOARDS)
        .insert({
          id: uuidv4(),
          analysis_id: analysisId,
          chart_data: dashboardData.chartData,
          insights: dashboardData.insights
        })
        .select()
        .single();

      if (dashboardError) {
        console.error('Dashboard creation error:', dashboardError);
        return NextResponse.json<ApiResponse>({
          success: false,
          error: 'Failed to generate dashboard for export'
        }, { status: 500 });
      }

      dashboard = newDashboard;
    }

    // Generate export data
    const exportData = DashboardService.generateExportData(analysis, dashboard);

    // Filter sections if specified
    if (sections.length > 0) {
      const filteredData = { ...exportData };
      const allowedSections = ['summary', 'kpis', 'charts', 'insights', 'risks', 'opportunities', 'recommendations'];
      
      Object.keys(filteredData).forEach(key => {
        if (!sections.includes(key) && allowedSections.includes(key)) {
          delete (filteredData as any)[key];
        }
      });
      
      Object.assign(exportData, filteredData);
    }

    // Generate export file based on format
    const exportResult = await this.generateExportFile(exportData, format, analysis.files.file_name);
    
    if (!exportResult.success) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: exportResult.error
      }, { status: 500 });
    }

    // Store export file in Supabase Storage
    const exportFileName = `${user.id}/${uuidv4()}-export.${format === 'word' ? 'docx' : format}`;
    
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(STORAGE_BUCKETS.EXPORTS)
      .upload(exportFileName, exportResult.fileBuffer!, {
        cacheControl: '3600',
        upsert: false
      });

    if (uploadError) {
      console.error('Export upload error:', uploadError);
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Failed to store export file'
      }, { status: 500 });
    }

    // Generate signed URL for download
    const { data: urlData, error: urlError } = await supabase.storage
      .from(STORAGE_BUCKETS.EXPORTS)
      .createSignedUrl(exportFileName, 3600); // 1 hour expiry

    if (urlError || !urlData) {
      console.error('Export URL generation error:', urlError);
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Failed to generate download URL'
      }, { status: 500 });
    }

    const response: ExportResponse = {
      downloadUrl: urlData.signedUrl,
      expiresAt: new Date(Date.now() + 3600 * 1000), // 1 hour from now
      format: format,
      message: `${format.toUpperCase()} export generated successfully`
    };

    return NextResponse.json<ApiResponse<ExportResponse>>({
      success: true,
      data: response,
      message: 'Export generated successfully'
    }, { status: 200 });

  } catch (error) {
    console.error('Export generation error:', error);
    return NextResponse.json<ApiResponse>({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }

  /**
   * Generate export file in the specified format
   */
  async function generateExportFile(
    data: any,
    format: string,
    originalFileName: string
  ): Promise<{ success: boolean; fileBuffer?: Buffer; error?: string }> {
    try {
      switch (format) {
        case 'pdf':
          return await generatePDFExport(data, originalFileName);
        case 'word':
          return await generateWordExport(data, originalFileName);
        case 'notion':
          return await generateNotionExport(data, originalFileName);
        default:
          return { success: false, error: 'Unsupported export format' };
      }
    } catch (error) {
      console.error(`${format} export generation error:`, error);
      return { 
        success: false, 
        error: `Failed to generate ${format} export: ${error instanceof Error ? error.message : 'Unknown error'}` 
      };
    }
  }

  /**
   * Generate PDF export (simplified implementation)
   */
  async function generatePDFExport(data: any, fileName: string): Promise<{ success: boolean; fileBuffer?: Buffer; error?: string }> {
    // This is a simplified implementation
    // In production, you would use a library like puppeteer, jsPDF, or PDFKit
    
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>${data.title}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          .header { border-bottom: 2px solid #333; padding-bottom: 10px; margin-bottom: 20px; }
          .section { margin-bottom: 30px; }
          .kpi-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; }
          .kpi-item { padding: 10px; border: 1px solid #ddd; border-radius: 5px; }
          .list-item { margin: 5px 0; padding: 5px; background: #f5f5f5; border-radius: 3px; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>${data.title}</h1>
          <p>Original File: ${fileName}</p>
          <p>Generated: ${new Date().toLocaleString()}</p>
        </div>
        
        <div class="section">
          <h2>Executive Summary</h2>
          <p>${data.summary}</p>
        </div>
        
        <div class="section">
          <h2>Key Performance Indicators</h2>
          <div class="kpi-grid">
            ${Object.entries(data.kpis).map(([key, value]) => 
              `<div class="kpi-item"><strong>${key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}:</strong> ${value}</div>`
            ).join('')}
          </div>
        </div>
        
        <div class="section">
          <h2>Key Insights</h2>
          ${data.insights.map((insight: any) => 
            `<div class="list-item"><strong>${insight.title}:</strong> ${insight.description}</div>`
          ).join('')}
        </div>
        
        <div class="section">
          <h2>Identified Risks</h2>
          ${data.risks.map((risk: string) => `<div class="list-item">• ${risk}</div>`).join('')}
        </div>
        
        <div class="section">
          <h2>Growth Opportunities</h2>
          ${data.opportunities.map((opp: string) => `<div class="list-item">• ${opp}</div>`).join('')}
        </div>
        
        <div class="section">
          <h2>Recommendations</h2>
          ${data.recommendations.map((rec: string) => `<div class="list-item">• ${rec}</div>`).join('')}
        </div>
      </body>
      </html>
    `;

    // For now, return HTML content as buffer
    // In production, convert HTML to PDF using puppeteer or similar
    const fileBuffer = Buffer.from(htmlContent, 'utf-8');
    
    return { success: true, fileBuffer };
  }

  /**
   * Generate Word export (simplified implementation)
   */
  async function generateWordExport(data: any, fileName: string): Promise<{ success: boolean; fileBuffer?: Buffer; error?: string }> {
    // This is a simplified implementation
    // In production, you would use a library like docx or officegen
    
    const docContent = `
FINANCIAL ANALYSIS REPORT
========================

Original File: ${fileName}
Generated: ${new Date().toLocaleString()}

EXECUTIVE SUMMARY
================
${data.summary}

KEY PERFORMANCE INDICATORS
==========================
${Object.entries(data.kpis).map(([key, value]) => 
  `${key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}: ${value}`
).join('\n')}

KEY INSIGHTS
============
${data.insights.map((insight: any) => 
  `${insight.title}: ${insight.description}`
).join('\n\n')}

IDENTIFIED RISKS
===============
${data.risks.map((risk: string) => `• ${risk}`).join('\n')}

GROWTH OPPORTUNITIES
===================
${data.opportunities.map((opp: string) => `• ${opp}`).join('\n')}

RECOMMENDATIONS
===============
${data.recommendations.map((rec: string) => `• ${rec}`).join('\n')}
    `;

    // For now, return text content as buffer
    // In production, generate actual Word document
    const fileBuffer = Buffer.from(docContent, 'utf-8');
    
    return { success: true, fileBuffer };
  }

  /**
   * Generate Notion export (simplified implementation)
   */
  async function generateNotionExport(data: any, fileName: string): Promise<{ success: boolean; fileBuffer?: Buffer; error?: string }> {
    // This is a simplified implementation
    // In production, you would integrate with Notion API
    
    const notionContent = {
      title: data.title,
      originalFile: fileName,
      generatedAt: new Date().toISOString(),
      summary: data.summary,
      kpis: data.kpis,
      insights: data.insights,
      risks: data.risks,
      opportunities: data.opportunities,
      recommendations: data.recommendations,
      instructions: "Import this JSON into Notion using the Notion API or a Notion integration tool."
    };

    const fileBuffer = Buffer.from(JSON.stringify(notionContent, null, 2), 'utf-8');
    
    return { success: true, fileBuffer };
  }
}