import { GoogleGenerativeAI } from '@google/generative-ai';
import { KPIs } from '@/types';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export interface AnalysisResult {
  summary: string;
  kpis: KPIs;
  risks: string[];
  opportunities: string[];
  recommendations: string[];
}

export class GeminiAnalysisService {
  private model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

  /**
   * Analyze financial report content and extract insights
   */
  async analyzeFinancialReport(
    content: string,
    fileName: string,
    customPrompt?: string
  ): Promise<AnalysisResult> {
    const prompt = customPrompt || this.getDefaultPrompt();
    
    const fullPrompt = `
${prompt}

File Name: ${fileName}

Financial Report Content:
${content}

Please provide your analysis in the following JSON format:
{
  "summary": "A comprehensive summary of the financial report (3-4 sentences)",
  "kpis": {
    "revenue": "Revenue value with currency and period",
    "expenses": "Total expenses value with currency and period", 
    "netProfit": "Net profit/loss value with currency and period",
    "growthRate": "Revenue/profit growth rate as percentage",
    "totalAssets": "Total assets value (if available)",
    "totalLiabilities": "Total liabilities value (if available)",
    "cashFlow": "Operating cash flow (if available)",
    "debtToEquityRatio": "Debt to equity ratio (if available)",
    "returnOnInvestment": "ROI percentage (if available)",
    "profitMargin": "Profit margin percentage (if available)"
  },
  "risks": [
    "List of identified financial risks",
    "Each risk as a separate string"
  ],
  "opportunities": [
    "List of identified opportunities", 
    "Each opportunity as a separate string"
  ],
  "recommendations": [
    "List of actionable recommendations",
    "Each recommendation as a separate string"
  ]
}

Important: Respond only with valid JSON. If a KPI value is not available in the report, use "N/A" as the value.
`;

    try {
      const result = await this.model.generateContent(fullPrompt);
      const response = await result.response;
      const text = response.text();

      // Parse JSON response
      const analysisResult = this.parseAnalysisResponse(text);
      return analysisResult;

    } catch (error) {
      console.error('Gemini API error:', error);
      throw new Error('Failed to analyze financial report with AI');
    }
  }

  /**
   * Generate custom query response for chat functionality
   */
  async generateCustomResponse(
    query: string,
    analysisContext?: AnalysisResult,
    reportContent?: string
  ): Promise<string> {
    let prompt = `
You are a financial analysis expert. Answer the following query about financial data.

User Query: ${query}
`;

    if (analysisContext) {
      prompt += `
Previous Analysis Summary: ${analysisContext.summary}

Key Financial Metrics:
- Revenue: ${analysisContext.kpis.revenue}
- Expenses: ${analysisContext.kpis.expenses}
- Net Profit: ${analysisContext.kpis.netProfit}
- Growth Rate: ${analysisContext.kpis.growthRate}

Known Risks: ${analysisContext.risks.join(', ')}
Known Opportunities: ${analysisContext.opportunities.join(', ')}
`;
    }

    if (reportContent) {
      prompt += `
Original Report Content (first 2000 characters):
${reportContent.substring(0, 2000)}...
`;
    }

    prompt += `
Please provide a helpful, accurate, and professional response to the user's query. 
If you cannot answer based on the available data, clearly state that limitation.
`;

    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      return response.text();

    } catch (error) {
      console.error('Gemini chat error:', error);
      throw new Error('Failed to generate response');
    }
  }

  /**
   * Parse the AI response and extract structured data
   */
  private parseAnalysisResponse(text: string): AnalysisResult {
    try {
      // Clean the response to extract JSON
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in response');
      }

      const jsonStr = jsonMatch[0];
      const parsed = JSON.parse(jsonStr);

      // Validate and structure the response
      return {
        summary: parsed.summary || 'Analysis summary not available',
        kpis: {
          revenue: parsed.kpis?.revenue || 'N/A',
          expenses: parsed.kpis?.expenses || 'N/A',
          netProfit: parsed.kpis?.netProfit || 'N/A',
          growthRate: parsed.kpis?.growthRate || 'N/A',
          totalAssets: parsed.kpis?.totalAssets || 'N/A',
          totalLiabilities: parsed.kpis?.totalLiabilities || 'N/A',
          cashFlow: parsed.kpis?.cashFlow || 'N/A',
          debtToEquityRatio: parsed.kpis?.debtToEquityRatio || 'N/A',
          returnOnInvestment: parsed.kpis?.returnOnInvestment || 'N/A',
          profitMargin: parsed.kpis?.profitMargin || 'N/A'
        },
        risks: Array.isArray(parsed.risks) ? parsed.risks : [],
        opportunities: Array.isArray(parsed.opportunities) ? parsed.opportunities : [],
        recommendations: Array.isArray(parsed.recommendations) ? parsed.recommendations : []
      };

    } catch (error) {
      console.error('Failed to parse analysis response:', error);
      
      // Return fallback response
      return {
        summary: 'Unable to generate detailed analysis. Please try again or contact support.',
        kpis: {
          revenue: 'N/A',
          expenses: 'N/A', 
          netProfit: 'N/A',
          growthRate: 'N/A',
          totalAssets: 'N/A',
          totalLiabilities: 'N/A',
          cashFlow: 'N/A',
          debtToEquityRatio: 'N/A',
          returnOnInvestment: 'N/A',
          profitMargin: 'N/A'
        },
        risks: ['Analysis unavailable - please review the report manually'],
        opportunities: ['Analysis unavailable - please review the report manually'],
        recommendations: ['Analysis unavailable - please review the report manually']
      };
    }
  }

  /**
   * Get default analysis prompt
   */
  private getDefaultPrompt(): string {
    return `
You are an expert financial analyst with extensive experience in analyzing financial reports, statements, and business documents. 

Your task is to analyze the provided financial report and extract key insights including:

1. A comprehensive summary highlighting the main financial performance indicators
2. Key Performance Indicators (KPIs) with specific numerical values where available
3. Financial risks that could impact the business
4. Growth opportunities and positive trends
5. Actionable recommendations for improvement

Please be thorough but concise in your analysis. Focus on:
- Revenue trends and patterns
- Expense management and cost structure
- Profitability and margins
- Cash flow situation
- Asset utilization
- Debt levels and financial stability
- Market position and competitive advantages
- Seasonal variations or cyclical patterns

If specific numerical data is not clearly stated in the report, indicate "N/A" rather than making assumptions.
`;
  }

  /**
   * Validate file content before analysis
   */
  static validateContent(content: string): { isValid: boolean; error?: string } {
    if (!content || content.trim().length === 0) {
      return { isValid: false, error: 'Content is empty' };
    }

    if (content.length < 100) {
      return { isValid: false, error: 'Content too short for meaningful analysis' };
    }

    if (content.length > 100000) {
      return { isValid: false, error: 'Content too long - please upload a smaller file' };
    }

    return { isValid: true };
  }
}

export const geminiService = new GeminiAnalysisService();