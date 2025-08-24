import { Analysis, ChartData, Insight, Dashboard } from '@/types';

export interface DashboardGenerationResult {
  chartData: ChartData[];
  insights: Insight[];
}

export class DashboardService {
  /**
   * Generate dashboard data from analysis results
   */
  static generateDashboard(analysis: Analysis): DashboardGenerationResult {
    const chartData = this.generateChartData(analysis);
    const insights = this.generateInsights(analysis);

    return {
      chartData,
      insights
    };
  }

  /**
   * Generate chart data from KPIs and analysis
   */
  private static generateChartData(analysis: Analysis): ChartData[] {
    const charts: ChartData[] = [];
    const kpis = analysis.kpis;

    // Financial Overview Bar Chart
    const financialOverview: ChartData = {
      type: 'bar',
      title: 'Financial Overview',
      data: [
        {
          category: 'Revenue',
          value: this.extractNumericValue(kpis.revenue),
          formatted: kpis.revenue
        },
        {
          category: 'Expenses', 
          value: this.extractNumericValue(kpis.expenses),
          formatted: kpis.expenses
        },
        {
          category: 'Net Profit',
          value: this.extractNumericValue(kpis.netProfit),
          formatted: kpis.netProfit
        }
      ],
      xAxisKey: 'category',
      yAxisKey: 'value'
    };
    charts.push(financialOverview);

    // Asset vs Liability Pie Chart (if available)
    if (kpis.totalAssets !== 'N/A' && kpis.totalLiabilities !== 'N/A') {
      const assetValue = this.extractNumericValue(kpis.totalAssets);
      const liabilityValue = this.extractNumericValue(kpis.totalLiabilities);
      const equity = assetValue - liabilityValue;

      if (assetValue > 0) {
        const balanceSheet: ChartData = {
          type: 'pie',
          title: 'Balance Sheet Composition',
          data: [
            {
              name: 'Assets',
              value: assetValue,
              formatted: kpis.totalAssets
            },
            {
              name: 'Liabilities',
              value: liabilityValue,
              formatted: kpis.totalLiabilities
            },
            {
              name: 'Equity',
              value: Math.max(0, equity),
              formatted: this.formatCurrency(equity)
            }
          ],
          dataKey: 'value'
        };
        charts.push(balanceSheet);
      }
    }

    // Performance Metrics Area Chart
    const performanceMetrics: ChartData = {
      type: 'area',
      title: 'Performance Metrics',
      data: [
        {
          metric: 'Growth Rate',
          value: this.extractPercentageValue(kpis.growthRate),
          formatted: kpis.growthRate
        },
        {
          metric: 'Profit Margin',
          value: this.extractPercentageValue(kpis.profitMargin),
          formatted: kpis.profitMargin
        },
        {
          metric: 'ROI',
          value: this.extractPercentageValue(kpis.returnOnInvestment),
          formatted: kpis.returnOnInvestment
        }
      ].filter(item => item.value !== null),
      xAxisKey: 'metric',
      yAxisKey: 'value'
    };

    if (performanceMetrics.data.length > 0) {
      charts.push(performanceMetrics);
    }

    // Risk vs Opportunity Analysis
    const riskOpportunityData: ChartData = {
      type: 'bar',
      title: 'Risk vs Opportunity Analysis',
      data: [
        {
          category: 'Risks Identified',
          value: analysis.risks.length,
          items: analysis.risks
        },
        {
          category: 'Opportunities Found',
          value: analysis.opportunities.length,
          items: analysis.opportunities
        },
        {
          category: 'Recommendations',
          value: analysis.recommendations.length,
          items: analysis.recommendations
        }
      ],
      xAxisKey: 'category',
      yAxisKey: 'value'
    };
    charts.push(riskOpportunityData);

    return charts;
  }

  /**
   * Generate insights from analysis data
   */
  private static generateInsights(analysis: Analysis): Insight[] {
    const insights: Insight[] = [];
    const kpis = analysis.kpis;

    // Profitability Insight
    const netProfitValue = this.extractNumericValue(kpis.netProfit);
    if (netProfitValue !== null) {
      insights.push({
        id: 'profitability',
        title: 'Profitability Analysis',
        description: netProfitValue > 0 
          ? `Company shows positive profitability with net profit of ${kpis.netProfit}`
          : `Company has negative profitability with net loss of ${kpis.netProfit}`,
        type: netProfitValue > 0 ? 'positive' : 'negative',
        importance: 'high'
      });
    }

    // Growth Rate Insight
    const growthRate = this.extractPercentageValue(kpis.growthRate);
    if (growthRate !== null) {
      insights.push({
        id: 'growth',
        title: 'Growth Performance',
        description: growthRate > 0
          ? `Strong growth trajectory with ${kpis.growthRate} growth rate`
          : `Declining performance with ${kpis.growthRate} growth rate`,
        type: growthRate > 5 ? 'positive' : growthRate < 0 ? 'negative' : 'neutral',
        importance: 'high'
      });
    }

    // Cash Flow Insight
    if (kpis.cashFlow !== 'N/A') {
      const cashFlowValue = this.extractNumericValue(kpis.cashFlow);
      if (cashFlowValue !== null) {
        insights.push({
          id: 'cashflow',
          title: 'Cash Flow Status',
          description: cashFlowValue > 0
            ? `Healthy cash flow from operations: ${kpis.cashFlow}`
            : `Negative cash flow requiring attention: ${kpis.cashFlow}`,
          type: cashFlowValue > 0 ? 'positive' : 'negative',
          importance: 'high'
        });
      }
    }

    // Risk Assessment
    if (analysis.risks.length > 0) {
      insights.push({
        id: 'risks',
        title: 'Risk Assessment',
        description: `${analysis.risks.length} potential risks identified that require management attention`,
        type: analysis.risks.length > 3 ? 'negative' : 'neutral',
        importance: analysis.risks.length > 3 ? 'high' : 'medium'
      });
    }

    // Opportunity Assessment
    if (analysis.opportunities.length > 0) {
      insights.push({
        id: 'opportunities',
        title: 'Growth Opportunities',
        description: `${analysis.opportunities.length} growth opportunities identified for business expansion`,
        type: 'positive',
        importance: 'medium'
      });
    }

    // Debt to Equity Ratio Insight
    if (kpis.debtToEquityRatio !== 'N/A') {
      const debtRatio = this.extractNumericValue(kpis.debtToEquityRatio);
      if (debtRatio !== null) {
        insights.push({
          id: 'leverage',
          title: 'Financial Leverage',
          description: debtRatio > 1
            ? `High leverage with debt-to-equity ratio of ${kpis.debtToEquityRatio}`
            : `Conservative leverage with debt-to-equity ratio of ${kpis.debtToEquityRatio}`,
          type: debtRatio > 1.5 ? 'negative' : debtRatio > 1 ? 'neutral' : 'positive',
          importance: debtRatio > 1.5 ? 'high' : 'medium'
        });
      }
    }

    return insights;
  }

  /**
   * Extract numeric value from formatted string
   */
  private static extractNumericValue(value: string): number | null {
    if (!value || value === 'N/A') return null;
    
    // Remove currency symbols, commas, and spaces
    const cleaned = value.replace(/[$,\s%]/g, '');
    
    // Handle negative values in parentheses
    const isNegative = cleaned.includes('(') && cleaned.includes(')');
    const numericString = cleaned.replace(/[()]/g, '');
    
    const number = parseFloat(numericString);
    return isNaN(number) ? null : (isNegative ? -number : number);
  }

  /**
   * Extract percentage value from formatted string
   */
  private static extractPercentageValue(value: string): number | null {
    if (!value || value === 'N/A') return null;
    
    const cleaned = value.replace(/[%\s]/g, '');
    const number = parseFloat(cleaned);
    return isNaN(number) ? null : number;
  }

  /**
   * Format number as currency
   */
  private static formatCurrency(value: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      notation: 'compact'
    }).format(value);
  }

  /**
   * Generate export-ready dashboard data
   */
  static generateExportData(
    analysis: Analysis,
    dashboard: Dashboard
  ): {
    title: string;
    summary: string;
    kpis: any;
    charts: ChartData[];
    insights: Insight[];
    risks: string[];
    opportunities: string[];
    recommendations: string[];
    metadata: any;
  } {
    return {
      title: `Financial Analysis Report`,
      summary: analysis.summary,
      kpis: analysis.kpis,
      charts: dashboard.chartData,
      insights: dashboard.insights,
      risks: analysis.risks,
      opportunities: analysis.opportunities,
      recommendations: analysis.recommendations,
      metadata: {
        generatedAt: new Date().toISOString(),
        analysisId: analysis.id,
        dashboardId: dashboard.id
      }
    };
  }
}

export default DashboardService;