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
  const currentYear = new Date().getFullYear();
  const { includeInsights = false, includeAIChat = false, aiChatMessages = [], allInsights = [], quickStats = null } = options || {};
  
  // FlowDapt logo SVG (base64 encoded for embedding)
  const flowdaptLogo = `data:image/svg+xml;base64,${btoa(`<svg width="120" height="120" viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg"><rect width="120" height="120" rx="24" fill="url(#grad)"/><defs><linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:#3b82f6;stop-opacity:1"/><stop offset="100%" style="stop-color:#8b5cf6;stop-opacity:1"/></linearGradient></defs><path d="M30 45 L50 45 L50 75 L30 75 Z M55 30 L75 30 L75 75 L55 75 Z M80 50 L90 50 L90 75 L80 75 Z" fill="white"/></svg>`)}`;
  
  let html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>FlowDapt Data Analysis Report - ${report.fileName}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { 
      font-family: 'Segoe UI', 'Helvetica Neue', Arial, sans-serif; 
      color: #1e293b; 
      line-height: 1.7; 
      background: #ffffff;
      position: relative;
    }
    
    /* Watermark */
    .watermark {
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%) rotate(-45deg);
      opacity: 0.03;
      z-index: -1;
      pointer-events: none;
      font-size: 120px;
      font-weight: 900;
      color: #3b82f6;
      white-space: nowrap;
    }
    
    /* Page structure */
    .page { 
      padding: 60px 50px 80px 50px; 
      max-width: 1000px; 
      margin: 0 auto; 
      position: relative;
      min-height: 100vh;
    }
    
    /* Cover Page */
    .cover-page {
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      text-align: center;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 80px 50px;
      page-break-after: always;
    }
    .cover-logo {
      width: 180px;
      height: 180px;
      margin-bottom: 50px;
      filter: drop-shadow(0 10px 30px rgba(0,0,0,0.3));
    }
    .cover-title {
      font-size: 48px;
      font-weight: 700;
      margin-bottom: 20px;
      letter-spacing: -1px;
    }
    .cover-subtitle {
      font-size: 24px;
      font-weight: 300;
      margin-bottom: 60px;
      opacity: 0.95;
    }
    .cover-meta {
      background: rgba(255,255,255,0.15);
      backdrop-filter: blur(10px);
      padding: 30px 50px;
      border-radius: 16px;
      margin-top: 40px;
    }
    .cover-meta-item {
      font-size: 18px;
      margin: 12px 0;
      opacity: 0.95;
    }
    .cover-meta-label {
      font-weight: 600;
      margin-right: 10px;
    }
    
    /* Page footer with page numbers */
    .page-footer {
      position: fixed;
      bottom: 0;
      left: 0;
      right: 0;
      height: 60px;
      background: linear-gradient(to top, rgba(248,250,252,0.95), transparent);
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0 50px;
      font-size: 11px;
      color: #64748b;
      z-index: 10;
    }
    .page-footer-left {
      font-weight: 500;
    }
    .page-footer-right {
      font-weight: 600;
    }
    
    /* Content sections */
    .header { 
      text-align: center; 
      margin-bottom: 50px; 
      padding-bottom: 30px; 
      border-bottom: 4px solid #3b82f6; 
    }
    .header h1 { 
      color: #3b82f6; 
      font-size: 36px; 
      margin-bottom: 12px; 
      font-weight: 700;
    }
    .header .subtitle { 
      color: #64748b; 
      font-size: 16px; 
      font-weight: 400;
    }
    
    .meta-box { 
      background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%); 
      border: 2px solid #e2e8f0; 
      border-radius: 12px; 
      padding: 35px; 
      margin-bottom: 50px;
      box-shadow: 0 4px 6px rgba(0,0,0,0.05);
    }
    .meta-grid { 
      display: grid; 
      grid-template-columns: repeat(3, 1fr); 
      gap: 25px; 
    }
    .meta-item { 
      text-align: center; 
      padding: 20px;
      background: white;
      border-radius: 8px;
    }
    .meta-label { 
      font-size: 13px; 
      color: #64748b; 
      text-transform: uppercase; 
      letter-spacing: 0.5px;
      font-weight: 600;
    }
    .meta-value { 
      font-size: 24px; 
      font-weight: 700; 
      color: #1e293b; 
      margin-top: 8px;
    }
    
    /* Chart sections with increased spacing */
    .chart-section { 
      margin-bottom: 70px; 
      padding: 35px;
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.04);
      page-break-inside: avoid; 
    }
    .chart-header { 
      display: flex; 
      align-items: center; 
      gap: 15px; 
      margin-bottom: 25px; 
      padding-bottom: 20px; 
      border-bottom: 3px solid #e2e8f0; 
    }
    .chart-number { 
      background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%); 
      color: white; 
      width: 42px; 
      height: 42px; 
      border-radius: 50%; 
      display: flex; 
      align-items: center; 
      justify-content: center; 
      font-weight: 700; 
      font-size: 18px;
      box-shadow: 0 4px 6px rgba(59,130,246,0.3);
    }
    .chart-title { 
      font-size: 24px; 
      font-weight: 700; 
      color: #1e293b; 
    }
    .chart-subtitle { 
      font-size: 14px; 
      color: #64748b; 
      margin-top: 4px;
    }
    
    /* Charts increased by 15% */
    .chart-image { 
      text-align: center; 
      background: #f8fafc; 
      border-radius: 12px; 
      padding: 35px; 
      margin: 30px 0; 
      border: 1px solid #e2e8f0;
    }
    .chart-image img { 
      max-width: 100%; 
      height: auto; 
      border-radius: 8px;
      transform: scale(1.15);
      transform-origin: center;
    }
    
    /* Stats with better spacing */
    .stats-grid { 
      display: grid; 
      grid-template-columns: repeat(4, 1fr); 
      gap: 18px; 
      margin: 30px 0; 
    }
    .stat-box { 
      background: linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%); 
      padding: 22px; 
      border-radius: 10px; 
      text-align: center;
      border: 1px solid #cbd5e1;
    }
    .stat-label { 
      font-size: 12px; 
      color: #64748b; 
      text-transform: uppercase; 
      letter-spacing: 0.5px;
      font-weight: 600;
    }
    .stat-value { 
      font-size: 22px; 
      font-weight: 800; 
      color: #1e293b; 
      margin-top: 8px;
    }
    
    /* Insights with spacing */
    .insights-section { 
      margin: 30px 0; 
      padding: 25px;
      background: #f0fdf4;
      border-radius: 10px;
    }
    .insights-title { 
      font-size: 18px; 
      font-weight: 700; 
      color: #1e293b; 
      margin-bottom: 18px; 
      display: flex; 
      align-items: center; 
      gap: 10px; 
    }
    .insight-card { 
      background: white; 
      border-left: 5px solid #22c55e; 
      padding: 18px 20px; 
      margin-bottom: 15px; 
      border-radius: 0 10px 10px 0;
      box-shadow: 0 2px 4px rgba(0,0,0,0.05);
    }
    .insight-card-title { 
      font-weight: 700; 
      color: #166534; 
      font-size: 15px; 
    }
    .insight-card-desc { 
      color: #15803d; 
      font-size: 14px; 
      margin-top: 6px; 
      line-height: 1.6;
    }
    
    /* Correlations */
    .correlations-section { 
      margin: 30px 0; 
      padding: 25px;
      background: #eff6ff;
      border-radius: 10px;
    }
    .correlation-item { 
      display: inline-block; 
      background: white; 
      padding: 12px 18px; 
      border-radius: 8px; 
      margin: 6px; 
      font-size: 14px;
      font-weight: 600;
      box-shadow: 0 2px 4px rgba(0,0,0,0.05);
    }
    .correlation-strong { 
      background: #dcfce7; 
      color: #166534; 
      border: 2px solid #22c55e;
    }
    .correlation-moderate { 
      background: #fef3c7; 
      color: #92400e; 
      border: 2px solid #fbbf24;
    }
    
    /* KPI section */
    .kpi-section { 
      background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%); 
      color: white; 
      padding: 40px; 
      border-radius: 16px; 
      margin: 50px 0;
      box-shadow: 0 10px 30px rgba(59,130,246,0.3);
    }
    .kpi-title { 
      font-size: 24px; 
      font-weight: 700; 
      margin-bottom: 25px; 
    }
    .kpi-grid { 
      display: grid; 
      grid-template-columns: repeat(3, 1fr); 
      gap: 30px; 
    }
    .kpi-item { 
      text-align: center; 
      padding: 20px;
      background: rgba(255,255,255,0.15);
      border-radius: 12px;
      backdrop-filter: blur(10px);
    }
    .kpi-value { 
      font-size: 36px; 
      font-weight: 800; 
    }
    .kpi-label { 
      font-size: 14px; 
      opacity: 0.95; 
      margin-top: 8px;
    }
    
    /* Section dividers */
    .section-divider { 
      margin: 60px 0; 
      border-top: 3px solid #e2e8f0; 
    }
    
    /* All insights section */
    .all-insights-section { 
      margin: 50px 0; 
      padding: 35px;
      background: #f0fdf4;
      border-radius: 12px;
      page-break-inside: avoid; 
    }
    .all-insights-header { 
      font-size: 28px; 
      font-weight: 700; 
      color: #1e293b; 
      margin-bottom: 30px; 
      display: flex; 
      align-items: center; 
      gap: 12px; 
    }
    
    /* AI Chat section */
    .ai-chat-section { 
      margin: 50px 0; 
      padding: 35px;
      background: #eff6ff;
      border-radius: 12px;
      page-break-inside: avoid; 
    }
    .ai-chat-header { 
      font-size: 28px; 
      font-weight: 700; 
      color: #1e293b; 
      margin-bottom: 30px; 
      display: flex; 
      align-items: center; 
      gap: 12px; 
    }
    .chat-message { 
      margin-bottom: 20px; 
    }
    .chat-user { 
      background: #3b82f6; 
      color: white; 
      padding: 16px 20px; 
      border-radius: 16px 16px 4px 16px; 
      margin-left: 50px;
      box-shadow: 0 4px 6px rgba(59,130,246,0.2);
    }
    .chat-assistant { 
      background: white; 
      color: #1e293b; 
      padding: 16px 20px; 
      border-radius: 16px 16px 16px 4px; 
      margin-right: 50px;
      border: 1px solid #e2e8f0;
      box-shadow: 0 2px 4px rgba(0,0,0,0.05);
    }
    .chat-label { 
      font-size: 12px; 
      color: #64748b; 
      margin-bottom: 6px; 
      text-transform: uppercase; 
      font-weight: 600;
      letter-spacing: 0.5px;
    }
    
    /* Quick stats */
    .quick-stats-section { 
      margin: 50px 0; 
      padding: 35px;
      background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
      border-radius: 12px;
      border: 2px solid #e2e8f0;
      page-break-inside: avoid; 
    }
    .quick-stats-header { 
      font-size: 28px; 
      font-weight: 700; 
      color: #1e293b; 
      margin-bottom: 30px; 
      display: flex; 
      align-items: center; 
      gap: 12px; 
    }
    .quick-stats-grid { 
      display: grid; 
      grid-template-columns: repeat(7, 1fr); 
      gap: 15px; 
    }
    .quick-stat-box { 
      background: white; 
      padding: 20px 12px; 
      border-radius: 10px; 
      text-align: center; 
      border: 2px solid #e2e8f0;
      box-shadow: 0 2px 4px rgba(0,0,0,0.04);
    }
    .quick-stat-value { 
      font-size: 24px; 
      font-weight: 800; 
      color: #3b82f6; 
    }
    .quick-stat-label { 
      font-size: 11px; 
      color: #64748b; 
      text-transform: uppercase; 
      margin-top: 6px;
      font-weight: 600;
      letter-spacing: 0.5px;
    }
    
    @media print { 
      .page { padding: 40px 30px 70px 30px; } 
      .chart-section { page-break-inside: avoid; }
      .page-footer { position: fixed; }
    }
  </style>
</head>
<body>
  <!-- Watermark -->
  <div class="watermark">FLOWDAPT</div>
  
  <!-- Page Footer (appears on all pages) -->
  <div class="page-footer">
    <div class="page-footer-left">Generated by FlowDapt Analytics Engine — ${currentYear}</div>
    <div class="page-footer-right">Page <span class="page-number"></span></div>
  </div>
  
  <!-- Cover Page -->
  <div class="cover-page">
    <img src="${flowdaptLogo}" alt="FlowDapt Logo" class="cover-logo" />
    <h1 class="cover-title">FlowDapt Data Analysis Report</h1>
    <p class="cover-subtitle">Comprehensive Analytics & Insights</p>
    <div class="cover-meta">
      <div class="cover-meta-item">
        <span class="cover-meta-label">Report Generated:</span>
        <span>${now}</span>
      </div>
      <div class="cover-meta-item">
        <span class="cover-meta-label">Data Source:</span>
        <span>${report.fileName}</span>
      </div>
      <div class="cover-meta-item">
        <span class="cover-meta-label">Total Records:</span>
        <span>${report.totalRows.toLocaleString()}</span>
      </div>
      <div class="cover-meta-item">
        <span class="cover-meta-label">Charts Included:</span>
        <span>${report.charts.length}</span>
      </div>
    </div>
  </div>
  
  <!-- Main Content -->
  <div class="page">
    <div class="header">
      <h1>📊 Analytics Report</h1>
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
  </div>
  
  <script>
    // Add page numbers dynamically
    window.onload = function() {
      const pageNumbers = document.querySelectorAll('.page-number');
      pageNumbers.forEach((el, index) => {
        el.textContent = index + 1;
      });
    };
  </script>
</body>
</html>`;

  return html;
};
