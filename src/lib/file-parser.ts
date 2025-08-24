import * as XLSX from 'xlsx';

export interface ParsedFileContent {
  text: string;
  metadata: {
    fileName: string;
    fileType: string;
    pageCount?: number;
    sheetCount?: number;
    extractedAt: Date;
  };
}

export class FileParsingService {
  /**
   * Parse different file types and extract text content
   */
  static async parseFile(
    file: File | Buffer,
    fileName: string,
    fileType: 'pdf' | 'excel' | 'csv'
  ): Promise<ParsedFileContent> {
    try {
      switch (fileType) {
        case 'pdf':
          return await this.parsePDF(file, fileName);
        case 'excel':
          return await this.parseExcel(file, fileName);
        case 'csv':
          return await this.parseCSV(file, fileName);
        default:
          throw new Error(`Unsupported file type: ${fileType}`);
      }
    } catch (error) {
      console.error(`Error parsing ${fileType} file:`, error);
      throw new Error(`Failed to parse ${fileType} file: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Parse PDF file and extract text content
   * Note: This is a simplified implementation
   * In production, you might want to use a more robust PDF parser
   */
  private static async parsePDF(
    file: File | Buffer,
    fileName: string
  ): Promise<ParsedFileContent> {
    try {
      // For now, we'll provide a placeholder implementation
      // In a real app, you'd use a library like pdf-parse
      // const pdfParse = require('pdf-parse');
      
      // Convert File to Buffer if needed
      let buffer: Buffer;
      if (file instanceof File) {
        const arrayBuffer = await file.arrayBuffer();
        buffer = Buffer.from(arrayBuffer);
      } else {
        buffer = file;
      }

      // Placeholder text extraction
      // In reality, you would use: const data = await pdfParse(buffer);
      const extractedText = `PDF content extraction is not fully implemented yet. 
      This is a placeholder for PDF file: ${fileName}
      
      Sample financial data for demonstration:
      Revenue: $1,200,000
      Expenses: $800,000
      Net Income: $400,000
      Total Assets: $2,500,000
      Total Liabilities: $1,000,000
      Cash Flow from Operations: $350,000
      
      Note: Implement proper PDF parsing using libraries like pdf-parse or PDF.js for production use.`;

      return {
        text: extractedText,
        metadata: {
          fileName,
          fileType: 'pdf',
          pageCount: 1, // Would be extracted from actual PDF
          extractedAt: new Date()
        }
      };

    } catch (error) {
      throw new Error(`PDF parsing failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Parse Excel file and extract text content
   */
  private static async parseExcel(
    file: File | Buffer,
    fileName: string
  ): Promise<ParsedFileContent> {
    try {
      let buffer: Buffer;
      if (file instanceof File) {
        const arrayBuffer = await file.arrayBuffer();
        buffer = Buffer.from(arrayBuffer);
      } else {
        buffer = file;
      }

      const workbook = XLSX.read(buffer, { type: 'buffer' });
      const sheetNames = workbook.SheetNames;
      
      let extractedText = `Excel Workbook: ${fileName}\n`;
      extractedText += `Sheets: ${sheetNames.join(', ')}\n\n`;

      // Process each sheet
      sheetNames.forEach((sheetName, index) => {
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        
        extractedText += `Sheet ${index + 1}: ${sheetName}\n`;
        extractedText += `Rows: ${jsonData.length}\n`;
        
        // Convert data to text format
        jsonData.forEach((row: any, rowIndex) => {
          if (rowIndex < 50) { // Limit to first 50 rows to prevent overwhelming the AI
            const rowText = Array.isArray(row) 
              ? row.join(' | ') 
              : Object.values(row || {}).join(' | ');
            if (rowText.trim()) {
              extractedText += `Row ${rowIndex + 1}: ${rowText}\n`;
            }
          }
        });
        
        extractedText += '\n';
      });

      return {
        text: extractedText,
        metadata: {
          fileName,
          fileType: 'excel',
          sheetCount: sheetNames.length,
          extractedAt: new Date()
        }
      };

    } catch (error) {
      throw new Error(`Excel parsing failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Parse CSV file and extract text content
   */
  private static async parseCSV(
    file: File | Buffer,
    fileName: string
  ): Promise<ParsedFileContent> {
    try {
      let text: string;
      
      if (file instanceof File) {
        text = await file.text();
      } else {
        text = file.toString('utf-8');
      }

      // Parse CSV content
      const lines = text.split('\n').filter(line => line.trim());
      const headers = lines[0]?.split(',').map(h => h.trim()) || [];
      
      let extractedText = `CSV File: ${fileName}\n`;
      extractedText += `Headers: ${headers.join(' | ')}\n`;
      extractedText += `Total Rows: ${lines.length - 1}\n\n`;

      // Process data rows (limit to first 100 rows)
      const maxRows = Math.min(100, lines.length);
      for (let i = 0; i < maxRows; i++) {
        const line = lines[i];
        if (line && line.trim()) {
          extractedText += `Row ${i + 1}: ${line.trim()}\n`;
        }
      }

      if (lines.length > 100) {
        extractedText += `\n... and ${lines.length - 100} more rows\n`;
      }

      return {
        text: extractedText,
        metadata: {
          fileName,
          fileType: 'csv',
          extractedAt: new Date()
        }
      };

    } catch (error) {
      throw new Error(`CSV parsing failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Validate file size and type before parsing
   */
  static validateFile(file: File): { isValid: boolean; error?: string } {
    const maxSize = 10 * 1024 * 1024; // 10MB
    const allowedTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel',
      'text/csv'
    ];

    if (file.size > maxSize) {
      return {
        isValid: false,
        error: `File too large. Maximum size is ${maxSize / 1024 / 1024}MB`
      };
    }

    if (!allowedTypes.includes(file.type)) {
      return {
        isValid: false,
        error: 'Invalid file type. Only PDF, Excel, and CSV files are supported'
      };
    }

    return { isValid: true };
  }

  /**
   * Get file type from MIME type
   */
  static getFileType(mimeType: string): 'pdf' | 'excel' | 'csv' | null {
    switch (mimeType) {
      case 'application/pdf':
        return 'pdf';
      case 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet':
      case 'application/vnd.ms-excel':
        return 'excel';
      case 'text/csv':
        return 'csv';
      default:
        return null;
    }
  }
}

export default FileParsingService;