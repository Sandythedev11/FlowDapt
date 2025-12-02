// Report Builder - User-scoped report queue management
import { getUserItem, setUserItem, STORAGE_KEYS } from "./userStorage";
import type { Insight } from "./analyticsEngine";

// AI Chat message interface
export interface AIChatMessage {
  role: "user" | "assistant";
  content: string;
  timestamp?: string;
}

// Report generation options
export interface ReportOptions {
  includeInsights: boolean;
  includeAIChat: boolean;
  aiChatMessages?: AIChatMessage[];
  allInsights?: Insight[];
  quickStats?: {
    mean: string;
    median: string;
    stdDev: string;
    min: string;
    max: string;
    sum: string;
    count: number;
  } | null;
}

export interface ReportChart {
  id: string;
  chartType: string;
  chartLabel: string;
  xAxis: string;
  yAxis: string;
  title: string;
  chartImageBase64: string | null;
  dataSlice: any[];
  stats: {
    mean: string;
    median: string;
    stdDev: string;
    min: string;
    max: string;
    sum: string;
    count: number;
  } | null;
  insights: Array<{
    type: string;
    title: string;
    description: string;
    confidence: string;
  }>;
  correlations: Array<{
    field1: string;
    field2: string;
    correlation: number;
    strength: string;
  }>;
  addedAt: string;
}

export interface ReportData {
  fileName: string;
  fileType: string;
  totalRows: number;
  charts: ReportChart[];
  createdAt: string;
  updatedAt: string;
}

const REPORT_QUEUE_KEY = "reportBuilderQueue";

// Get current report queue
export const getReportQueue = (): ReportData | null => {
  return getUserItem<ReportData | null>(REPORT_QUEUE_KEY, null);
};

// Initialize or get report queue
export const initReportQueue = (fileName: string, fileType: string, totalRows: number): ReportData => {
  const existing = getReportQueue();
  if (existing && existing.fileName === fileName) {
    return existing;
  }
  
  const newReport: ReportData = {
    fileName,
    fileType,
    totalRows,
    charts: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  setUserItem(REPORT_QUEUE_KEY, newReport);
  return newReport;
};

// Add chart to report queue
export const addChartToReport = (chart: Omit<ReportChart, "id" | "addedAt">): boolean => {
  const report = getReportQueue();
  if (!report) return false;

  const newChart: ReportChart = {
    ...chart,
    id: `chart_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    addedAt: new Date().toISOString(),
  };

  report.charts.push(newChart);
  report.updatedAt = new Date().toISOString();
  setUserItem(REPORT_QUEUE_KEY, report);
  return true;
};

// Remove chart from report queue
export const removeChartFromReport = (chartId: string): boolean => {
  const report = getReportQueue();
  if (!report) return false;

  report.charts = report.charts.filter(c => c.id !== chartId);
  report.updatedAt = new Date().toISOString();
  setUserItem(REPORT_QUEUE_KEY, report);
  return true;
};

// Reorder charts in report
export const reorderCharts = (fromIndex: number, toIndex: number): boolean => {
  const report = getReportQueue();
  if (!report || fromIndex < 0 || toIndex < 0) return false;

  const [removed] = report.charts.splice(fromIndex, 1);
  report.charts.splice(toIndex, 0, removed);
  report.updatedAt = new Date().toISOString();
  setUserItem(REPORT_QUEUE_KEY, report);
  return true;
};

// Clear report queue
export const clearReportQueue = (): void => {
  const report = getReportQueue();
  if (report) {
    report.charts = [];
    report.updatedAt = new Date().toISOString();
    setUserItem(REPORT_QUEUE_KEY, report);
  }
};

// Get chart count
export const getReportChartCount = (): number => {
  const report = getReportQueue();
  return report?.charts?.length || 0;
};

// Generate PDF HTML content with options
export const generateReportHTML = (report: ReportData, options?: ReportOptions): string => {
  const now = new Date().toLocaleString();
  const { includeInsights = false, includeAIChat = false, aiChatMessages = [], allInsights = [], quickStats = null } = options || {};
  
  let html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>FlowDapt Analytics Report - ${report.fileName}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Segoe UI', Arial, sans-serif; color: #1e293b; line-height: 1.6; }
    .page { padding: 40px; max-width: 900px; margin: 0 auto; }
    .header { text-align: center; margin-bottom: 40px; padding-bottom: 20px; border-bottom: 3px solid #3b82f6; }
    .header h1 { color: #3b82f6; font-size: 28px; margin-bottom: 8px; }
    .header .subtitle { color: #64748b; font-size: 14px; }
    .meta-box { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; margin-bottom: 30px; }
    .meta-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px; }
    .meta-item { text-align: center; }
    .meta-label { font-size: 12px; color: #64748b; text-transform: uppercase; }
    .meta-value { font-size: 18px; font-weight: 600; color: #1e293b; }
    .chart-section { margin-bottom: 50px; page-break-inside: avoid; }
    .chart-header { display: flex; align-items: center; gap: 10px; margin-bottom: 15px; padding-bottom: 10px; border-bottom: 2px solid #e2e8f0; }
    .chart-number { background: #3b82f6; color: white; width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 600; }
    .chart-title { font-size: 20px; font-weight: 600; color: #1e293b; }
    .chart-subtitle { font-size: 13px; color: #64748b; }
    .chart-image { text-align: center; background: #f8fafc; border-radius: 8px; padding: 20px; margin: 20px 0; }
    .chart-image img { max-width: 100%; height: auto; border-radius: 4px; }
    .stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin: 20px 0; }
    .stat-box { background: #f1f5f9; padding: 15px; border-radius: 8px; text-align: center; }
    .stat-label { font-size: 11px; color: #64748b; text-transform: uppercase; }
    .stat-value { font-size: 18px; font-weight: 700; color: #1e293b; }
    .insights-section { margin: 20px 0; }
    .insights-title { font-size: 16px; font-weight: 600; color: #1e293b; margin-bottom: 12px; display: flex; align-items: center; gap: 8px; }
    .insight-card { background: #f0fdf4; border-left: 4px solid #22c55e; padding: 12px 15px; margin-bottom: 10px; border-radius: 0 8px 8px 0; }
    .insight-card-title { font-weight: 600; color: #166534; font-size: 14px; }
    .insight-card-desc { color: #15803d; font-size: 13px; margin-top: 4px; }
    .correlations-section { margin: 20px 0; }
    .correlation-item { display: inline-block; background: #eff6ff; padding: 8px 12px; border-radius: 6px; margin: 4px; font-size: 13px; }
    .correlation-strong { background: #dcfce7; color: #166534; }
    .correlation-moderate { background: #fef3c7; color: #92400e; }
    .kpi-section { background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%); color: white; padding: 25px; border-radius: 12px; margin: 30px 0; }
    .kpi-title { font-size: 18px; font-weight: 600; margin-bottom: 15px; }
    .kpi-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; }
    .kpi-item { text-align: center; }
    .kpi-value { font-size: 28px; font-weight: 700; }
    .kpi-label { font-size: 12px; opacity: 0.9; }
    .footer { text-align: center; padding: 30px 0; border-top: 1px solid #e2e8f0; margin-top: 40px; color: #64748b; font-size: 12px; }
    .section-divider { margin: 40px 0; border-top: 2px solid #e2e8f0; }
    .all-insights-section { margin: 30px 0; page-break-inside: avoid; }
    .all-insights-header { font-size: 22px; font-weight: 600; color: #1e293b; margin-bottom: 20px; display: flex; align-items: center; gap: 10px; }
    .ai-chat-section { margin: 30px 0; page-break-inside: avoid; }
    .ai-chat-header { font-size: 22px; font-weight: 600; color: #1e293b; margin-bottom: 20px; display: flex; align-items: center; gap: 10px; }
    .chat-message { margin-bottom: 15px; }
    .chat-user { background: #3b82f6; color: white; padding: 12px 16px; border-radius: 12px 12px 4px 12px; margin-left: 40px; }
    .chat-assistant { background: #f1f5f9; color: #1e293b; padding: 12px 16px; border-radius: 12px 12px 12px 4px; margin-right: 40px; }
    .chat-label { font-size: 11px; color: #64748b; margin-bottom: 4px; text-transform: uppercase; }
    .quick-stats-section { margin: 30px 0; page-break-inside: avoid; }
    .quick-stats-header { font-size: 22px; font-weight: 600; color: #1e293b; margin-bottom: 20px; display: flex; align-items: center; gap: 10px; }
    .quick-stats-grid { display: grid; grid-template-columns: repeat(7, 1fr); gap: 10px; }
    .quick-stat-box { background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%); padding: 15px 10px; border-radius: 8px; text-align: center; border: 1px solid #e2e8f0; }
    .quick-stat-value { font-size: 20px; font-weight: 700; color: #3b82f6; }
    .quick-stat-label { font-size: 11px; color: #64748b; text-transform: uppercase; margin-top: 4px; }
    @media print { .page { padding: 20px; } .chart-section { page-break-inside: avoid; } }
  </style>
</head>
<body>
  <div class="page">
    <div class="header">
      <h1>📊 FlowDapt Analytics Report</h1>
      <p class="subtitle">Comprehensive Data Analysis & Visualization Report</p>
    </div>

    <div class="meta-box">
      <div class="meta-grid">
        <div class="meta-item">
          <div class="meta-label">Source File</div>
          <div class="meta-value">${report.fileName}</div>
        </div>
        <div class="meta-item">
          <div class="meta-label">Total Records</div>
          <div class="meta-value">${report.totalRows.toLocaleString()}</div>
        </div>
        <div class="meta-item">
          <div class="meta-label">Charts Included</div>
          <div class="meta-value">${report.charts.length}</div>
        </div>
      </div>
    </div>`;

  // Add All Insights section (if enabled)
  if (includeInsights && allInsights && allInsights.length > 0) {
    html += `
    <div class="all-insights-section">
      <div class="all-insights-header">💡 AI-Generated Insights</div>`;
    allInsights.slice(0, 10).forEach(insight => {
      html += `
      <div class="insight-card">
        <div class="insight-card-title">${insight.title}</div>
        <div class="insight-card-desc">${insight.description}</div>
      </div>`;
    });
    html += `
    </div>
    <div class="section-divider"></div>`;
  }

  // Add AI Chat section (if enabled)
  if (includeAIChat && aiChatMessages && aiChatMessages.length > 0) {
    html += `
    <div class="ai-chat-section">
      <div class="ai-chat-header">🤖 AI Chat Conversation</div>`;
    aiChatMessages.forEach(msg => {
      if (msg.role === "user") {
        html += `
      <div class="chat-message">
        <div class="chat-label">You</div>
        <div class="chat-user">${msg.content}</div>
      </div>`;
      } else {
        html += `
      <div class="chat-message">
        <div class="chat-label">FlowDapt AI</div>
        <div class="chat-assistant">${msg.content}</div>
      </div>`;
      }
    });
    html += `
    </div>
    <div class="section-divider"></div>`;
  }

  // Add each chart section
  report.charts.forEach((chart, index) => {
    html += `
    <div class="chart-section">
      <div class="chart-header">
        <div class="chart-number">${index + 1}</div>
        <div>
          <div class="chart-title">${chart.title || chart.chartLabel}</div>
          <div class="chart-subtitle">X-Axis: ${chart.xAxis} | Y-Axis: ${chart.yAxis}</div>
        </div>
      </div>`;

    // Chart image
    if (chart.chartImageBase64) {
      html += `
      <div class="chart-image">
        <img src="${chart.chartImageBase64}" alt="${chart.chartLabel}" />
      </div>`;
    }

    // Statistics
    if (chart.stats) {
      html += `
      <div class="stats-grid">
        <div class="stat-box"><div class="stat-label">Mean</div><div class="stat-value">${chart.stats.mean}</div></div>
        <div class="stat-box"><div class="stat-label">Median</div><div class="stat-value">${chart.stats.median}</div></div>
        <div class="stat-box"><div class="stat-label">Sum</div><div class="stat-value">${chart.stats.sum}</div></div>
        <div class="stat-box"><div class="stat-label">Count</div><div class="stat-value">${chart.stats.count}</div></div>
      </div>`;
    }

    // Insights for this chart
    if (chart.insights && chart.insights.length > 0) {
      html += `
      <div class="insights-section">
        <div class="insights-title">💡 Key Insights</div>`;
      chart.insights.slice(0, 3).forEach(insight => {
        html += `
        <div class="insight-card">
          <div class="insight-card-title">${insight.title}</div>
          <div class="insight-card-desc">${insight.description}</div>
        </div>`;
      });
      html += `</div>`;
    }

    // Correlations
    if (chart.correlations && chart.correlations.length > 0) {
      html += `
      <div class="correlations-section">
        <div class="insights-title">🔗 Correlations</div>`;
      chart.correlations.slice(0, 4).forEach(corr => {
        const cls = corr.strength === 'Strong' ? 'correlation-strong' : corr.strength === 'Moderate' ? 'correlation-moderate' : '';
        html += `<span class="correlation-item ${cls}">${corr.field1} ↔ ${corr.field2}: ${(corr.correlation * 100).toFixed(0)}%</span>`;
      });
      html += `</div>`;
    }

    html += `</div>`;
  });

  // KPI Summary section
  if (report.charts.length > 0) {
    const allStats = report.charts.filter(c => c.stats).map(c => c.stats!);
    if (allStats.length > 0) {
      const totalSum = allStats.reduce((acc, s) => acc + parseFloat(s.sum || '0'), 0);
      const avgMean = allStats.reduce((acc, s) => acc + parseFloat(s.mean || '0'), 0) / allStats.length;
      const totalCount = allStats.reduce((acc, s) => acc + (s.count || 0), 0);

      html += `
    <div class="kpi-section">
      <div class="kpi-title">📈 Overall KPIs</div>
      <div class="kpi-grid">
        <div class="kpi-item">
          <div class="kpi-value">${totalSum.toLocaleString(undefined, { maximumFractionDigits: 0 })}</div>
          <div class="kpi-label">Combined Total</div>
        </div>
        <div class="kpi-item">
          <div class="kpi-value">${avgMean.toLocaleString(undefined, { maximumFractionDigits: 2 })}</div>
          <div class="kpi-label">Average Mean</div>
        </div>
        <div class="kpi-item">
          <div class="kpi-value">${totalCount.toLocaleString()}</div>
          <div class="kpi-label">Data Points</div>
        </div>
      </div>
    </div>`;
    }
  }

  // Add Quick Statistics section (always included if available)
  if (quickStats) {
    html += `
    <div class="quick-stats-section">
      <div class="quick-stats-header">📊 Quick Statistics Summary</div>
      <div class="quick-stats-grid">
        <div class="quick-stat-box">
          <div class="quick-stat-value">${quickStats.mean}</div>
          <div class="quick-stat-label">Mean</div>
        </div>
        <div class="quick-stat-box">
          <div class="quick-stat-value">${quickStats.median}</div>
          <div class="quick-stat-label">Median</div>
        </div>
        <div class="quick-stat-box">
          <div class="quick-stat-value">${quickStats.stdDev}</div>
          <div class="quick-stat-label">Std Dev</div>
        </div>
        <div class="quick-stat-box">
          <div class="quick-stat-value">${quickStats.min}</div>
          <div class="quick-stat-label">Min</div>
        </div>
        <div class="quick-stat-box">
          <div class="quick-stat-value">${quickStats.max}</div>
          <div class="quick-stat-label">Max</div>
        </div>
        <div class="quick-stat-box">
          <div class="quick-stat-value">${quickStats.sum}</div>
          <div class="quick-stat-label">Sum</div>
        </div>
        <div class="quick-stat-box">
          <div class="quick-stat-value">${quickStats.count}</div>
          <div class="quick-stat-label">Count</div>
        </div>
      </div>
    </div>`;
  }

  html += `
    <div class="footer">
      <p>Report generated by FlowDapt Analytics Platform</p>
      <p>Generated on: ${now}</p>
    </div>
  </div>
</body>
</html>`;

  return html;
};
