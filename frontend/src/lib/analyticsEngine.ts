// Advanced Analytics Engine - Auto-generates insights, detects columns, correlations & outliers

export interface AnalysisData {
  fileName: string;
  fileType: string;
  data: any[];
  fields: string[];
  rowCount?: number;
  timestamp: string;
}

export interface ColumnInfo {
  name: string;
  type: 'numeric' | 'date' | 'categorical' | 'text';
  isDate: boolean;
  isNumeric: boolean;
  uniqueValues: number;
  nullCount: number;
  sample: any[];
}

export interface Insight {
  id: string;
  type: 'trend' | 'anomaly' | 'recommendation' | 'summary' | 'pattern' | 'correlation' | 'outlier';
  title: string;
  description: string;
  confidence: 'High' | 'Medium' | 'Low';
  category: string;
  value?: string | number;
  change?: number;
  severity?: 'info' | 'warning' | 'critical';
}

export interface CorrelationResult {
  field1: string;
  field2: string;
  correlation: number;
  strength: 'Strong' | 'Moderate' | 'Weak' | 'None';
}

export interface OutlierResult {
  field: string;
  outliers: { index: number; value: number }[];
  method: 'IQR' | 'StdDev';
  threshold: number;
}

export interface AnalyticsResult {
  columns: ColumnInfo[];
  insights: Insight[];
  correlations: CorrelationResult[];
  outliers: OutlierResult[];
  recommendedXAxis: string;
  recommendedYAxis: string;
  dateColumn: string | null;
  numericColumns: string[];
  categoricalColumns: string[];
}

// Date format patterns
const DATE_PATTERNS = [
  /^\d{4}-\d{2}-\d{2}$/,                    // YYYY-MM-DD
  /^\d{2}\/\d{2}\/\d{4}$/,                  // MM/DD/YYYY or DD/MM/YYYY
  /^\d{2}-\d{2}-\d{4}$/,                    // MM-DD-YYYY or DD-MM-YYYY
  /^\d{4}\/\d{2}\/\d{2}$/,                  // YYYY/MM/DD
  /^\d{1,2}\s+\w+\s+\d{4}$/,                // D Month YYYY
  /^\w+\s+\d{1,2},?\s+\d{4}$/,              // Month D, YYYY
  /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/,   // ISO format
];

// Check if value is Excel serial date (number between 1 and 2958465)
const isExcelSerialDate = (value: any): boolean => {
  if (typeof value !== 'number') return false;
  return value > 1 && value < 2958465 && Number.isInteger(value) || (value > 1 && value < 2958465);
};

// Convert Excel serial date to JS Date
const excelSerialToDate = (serial: number): Date => {
  const utcDays = Math.floor(serial - 25569);
  return new Date(utcDays * 86400 * 1000);
};

// Check if string looks like a date
const isDateString = (value: any): boolean => {
  if (typeof value !== 'string') return false;
  const trimmed = value.trim();
  if (DATE_PATTERNS.some(p => p.test(trimmed))) return true;
  const parsed = Date.parse(trimmed);
  return !isNaN(parsed) && parsed > 0;
};

// Detect column type
const detectColumnType = (values: any[]): ColumnInfo['type'] => {
  const nonNull = values.filter(v => v !== null && v !== undefined && v !== '');
  if (nonNull.length === 0) return 'text';
  
  const sample = nonNull.slice(0, 100);
  
  // Check for dates first
  const dateCount = sample.filter(v => isExcelSerialDate(v) || isDateString(v)).length;
  if (dateCount > sample.length * 0.7) return 'date';
  
  // Check for numeric
  const numericCount = sample.filter(v => typeof v === 'number' || (!isNaN(Number(v)) && v !== '')).length;
  if (numericCount > sample.length * 0.7) return 'numeric';
  
  // Check for categorical (low cardinality)
  const uniqueValues = new Set(sample.map(String)).size;
  if (uniqueValues < sample.length * 0.3 && uniqueValues < 50) return 'categorical';
  
  return 'text';
};

// Analyze columns
export const analyzeColumns = (data: any[], fields: string[]): ColumnInfo[] => {
  return fields.map(field => {
    const values = data.map(row => row[field]);
    const nonNull = values.filter(v => v !== null && v !== undefined && v !== '');
    const type = detectColumnType(values);
    
    return {
      name: field,
      type,
      isDate: type === 'date',
      isNumeric: type === 'numeric',
      uniqueValues: new Set(nonNull.map(String)).size,
      nullCount: values.length - nonNull.length,
      sample: nonNull.slice(0, 5),
    };
  });
};

// Calculate correlation between two numeric arrays
const calculateCorrelation = (x: number[], y: number[]): number => {
  const n = Math.min(x.length, y.length);
  if (n < 3) return 0;
  
  const meanX = x.reduce((a, b) => a + b, 0) / n;
  const meanY = y.reduce((a, b) => a + b, 0) / n;
  
  let numerator = 0;
  let denomX = 0;
  let denomY = 0;
  
  for (let i = 0; i < n; i++) {
    const dx = x[i] - meanX;
    const dy = y[i] - meanY;
    numerator += dx * dy;
    denomX += dx * dx;
    denomY += dy * dy;
  }
  
  const denom = Math.sqrt(denomX * denomY);
  return denom === 0 ? 0 : numerator / denom;
};

// Get correlation strength
const getCorrelationStrength = (r: number): CorrelationResult['strength'] => {
  const abs = Math.abs(r);
  if (abs >= 0.7) return 'Strong';
  if (abs >= 0.4) return 'Moderate';
  if (abs >= 0.2) return 'Weak';
  return 'None';
};

// Detect outliers using IQR method
const detectOutliersIQR = (values: number[]): { index: number; value: number }[] => {
  if (values.length < 4) return [];
  
  const sorted = [...values].sort((a, b) => a - b);
  const q1 = sorted[Math.floor(sorted.length * 0.25)];
  const q3 = sorted[Math.floor(sorted.length * 0.75)];
  const iqr = q3 - q1;
  const lowerBound = q1 - 1.5 * iqr;
  const upperBound = q3 + 1.5 * iqr;
  
  return values
    .map((v, i) => ({ index: i, value: v }))
    .filter(({ value }) => value < lowerBound || value > upperBound);
};


// Main analytics function - runs all analysis automatically
export const runFullAnalysis = (data: AnalysisData): AnalyticsResult => {
  const { data: rows, fields } = data;
  if (!rows || rows.length === 0 || !fields || fields.length === 0) {
    return {
      columns: [], insights: [], correlations: [], outliers: [],
      recommendedXAxis: '', recommendedYAxis: '', dateColumn: null,
      numericColumns: [], categoricalColumns: []
    };
  }

  // 1. Analyze columns
  const columns = analyzeColumns(rows, fields);
  const numericColumns = columns.filter(c => c.isNumeric).map(c => c.name);
  const dateColumns = columns.filter(c => c.isDate).map(c => c.name);
  const categoricalColumns = columns.filter(c => c.type === 'categorical').map(c => c.name);

  // 2. Auto-detect best X and Y axis
  let recommendedXAxis = dateColumns[0] || categoricalColumns[0] || fields[0];
  let recommendedYAxis = numericColumns[0] || fields[1] || fields[0];
  
  // Prefer date for X-axis if available
  if (dateColumns.length > 0) recommendedXAxis = dateColumns[0];
  // Look for common numeric column names for Y-axis
  const commonYNames = ['sales', 'revenue', 'amount', 'total', 'price', 'quantity', 'units', 'value', 'count'];
  const bestY = numericColumns.find(col => commonYNames.some(n => col.toLowerCase().includes(n)));
  if (bestY) recommendedYAxis = bestY;

  // 3. Generate insights
  const insights: Insight[] = [];
  
  // Dataset overview
  insights.push({
    id: 'overview',
    type: 'summary',
    title: 'Dataset Overview',
    description: `Dataset contains ${rows.length} records with ${fields.length} columns. Found ${numericColumns.length} numeric, ${dateColumns.length} date, and ${categoricalColumns.length} categorical columns.`,
    confidence: 'High',
    category: 'Summary',
    value: rows.length
  });

  // Analyze numeric columns for trends and patterns
  numericColumns.slice(0, 5).forEach(col => {
    const values = rows.map(r => Number(r[col])).filter(v => !isNaN(v));
    if (values.length < 2) return;

    const sum = values.reduce((a, b) => a + b, 0);
    const mean = sum / values.length;
    const min = Math.min(...values);
    const max = Math.max(...values);

    // Trend detection
    const mid = Math.floor(values.length / 2);
    const firstHalf = values.slice(0, mid);
    const secondHalf = values.slice(mid);
    const firstAvg = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;
    const changePercent = ((secondAvg - firstAvg) / Math.abs(firstAvg || 1)) * 100;

    if (Math.abs(changePercent) > 10) {
      insights.push({
        id: `trend-${col}`,
        type: 'trend',
        title: changePercent > 0 ? `📈 Upward Trend in ${col}` : `📉 Downward Trend in ${col}`,
        description: `${col} shows a ${Math.abs(changePercent).toFixed(1)}% ${changePercent > 0 ? 'increase' : 'decrease'} comparing first and second half of data.`,
        confidence: Math.abs(changePercent) > 25 ? 'High' : 'Medium',
        category: 'Trend',
        change: changePercent
      });
    }

    // Spike/Drop detection
    const stdDev = Math.sqrt(values.reduce((acc, v) => acc + Math.pow(v - mean, 2), 0) / values.length);
    const spikes = values.filter(v => v > mean + 2 * stdDev).length;
    const drops = values.filter(v => v < mean - 2 * stdDev).length;

    if (spikes > 0) {
      insights.push({
        id: `spike-${col}`,
        type: 'anomaly',
        title: `⚡ Spikes Detected in ${col}`,
        description: `Found ${spikes} unusually high values (>2σ above mean) in ${col}. These may indicate peak periods or anomalies.`,
        confidence: 'Medium',
        category: 'Anomaly',
        value: spikes,
        severity: 'warning'
      });
    }

    if (drops > 0) {
      insights.push({
        id: `drop-${col}`,
        type: 'anomaly',
        title: `📉 Drops Detected in ${col}`,
        description: `Found ${drops} unusually low values (>2σ below mean) in ${col}. These may indicate dips or data issues.`,
        confidence: 'Medium',
        category: 'Anomaly',
        value: drops,
        severity: 'warning'
      });
    }

    // Range insight
    insights.push({
      id: `range-${col}`,
      type: 'summary',
      title: `${col} Statistics`,
      description: `${col} ranges from ${min.toLocaleString()} to ${max.toLocaleString()} with average ${mean.toFixed(2)}. Total: ${sum.toLocaleString()}.`,
      confidence: 'High',
      category: 'Statistics',
      value: mean
    });
  });

  // Categorical analysis - find dominant values and best performers
  categoricalColumns.slice(0, 3).forEach(col => {
    const counts: Record<string, number> = {};
    rows.forEach(r => {
      const val = String(r[col] || 'Unknown');
      counts[val] = (counts[val] || 0) + 1;
    });
    const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
    if (sorted.length > 0) {
      const [topVal, topCount] = sorted[0];
      const pct = ((topCount / rows.length) * 100).toFixed(1);
      insights.push({
        id: `cat-${col}`,
        type: 'pattern',
        title: `🏆 Top ${col}: "${topVal}"`,
        description: `"${topVal}" is the most common value in ${col}, appearing ${topCount} times (${pct}%). There are ${sorted.length} unique values.`,
        confidence: Number(pct) > 50 ? 'High' : 'Medium',
        category: 'Pattern',
        value: topVal
      });
    }

    // Best performing category by numeric value
    if (numericColumns.length > 0) {
      const primaryNumeric = numericColumns[0];
      const categoryTotals: Record<string, { sum: number; count: number }> = {};
      rows.forEach(r => {
        const cat = String(r[col] || 'Unknown');
        const val = Number(r[primaryNumeric]);
        if (!isNaN(val)) {
          if (!categoryTotals[cat]) categoryTotals[cat] = { sum: 0, count: 0 };
          categoryTotals[cat].sum += val;
          categoryTotals[cat].count++;
        }
      });
      const sortedBySum = Object.entries(categoryTotals).sort((a, b) => b[1].sum - a[1].sum);
      if (sortedBySum.length > 1) {
        const [bestCat, bestData] = sortedBySum[0];
        const totalSum = sortedBySum.reduce((acc, [, d]) => acc + d.sum, 0);
        const bestPct = ((bestData.sum / totalSum) * 100).toFixed(1);
        insights.push({
          id: `best-${col}`,
          type: 'pattern',
          title: `⭐ Best Performing ${col}`,
          description: `"${bestCat}" leads in ${primaryNumeric} with ${bestData.sum.toLocaleString()} total (${bestPct}% of all). Average per record: ${(bestData.sum / bestData.count).toFixed(2)}.`,
          confidence: 'High',
          category: 'Performance',
          value: bestCat
        });
      }
    }
  });

  // Seasonality detection (if date column exists)
  if (dateColumns.length > 0 && numericColumns.length > 0) {
    const dateCol = dateColumns[0];
    const numCol = numericColumns[0];
    const monthlyData: Record<number, { sum: number; count: number }> = {};
    
    rows.forEach(r => {
      let dateVal = r[dateCol];
      let month: number | null = null;
      
      // Handle Excel serial dates
      if (typeof dateVal === 'number' && dateVal > 1 && dateVal < 2958465) {
        const date = excelSerialToDate(dateVal);
        month = date.getMonth();
      } else if (typeof dateVal === 'string') {
        const parsed = new Date(dateVal);
        if (!isNaN(parsed.getTime())) {
          month = parsed.getMonth();
        }
      }
      
      if (month !== null) {
        const val = Number(r[numCol]);
        if (!isNaN(val)) {
          if (!monthlyData[month]) monthlyData[month] = { sum: 0, count: 0 };
          monthlyData[month].sum += val;
          monthlyData[month].count++;
        }
      }
    });

    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthlyAvgs = Object.entries(monthlyData).map(([m, d]) => ({
      month: Number(m),
      avg: d.sum / d.count
    })).sort((a, b) => b.avg - a.avg);

    if (monthlyAvgs.length >= 3) {
      const bestMonth = monthlyAvgs[0];
      const worstMonth = monthlyAvgs[monthlyAvgs.length - 1];
      const variance = bestMonth.avg / (worstMonth.avg || 1);
      
      if (variance > 1.3) {
        insights.push({
          id: 'seasonality',
          type: 'pattern',
          title: '📊 Seasonality Pattern Detected',
          description: `${numCol} peaks in ${monthNames[bestMonth.month]} (avg: ${bestMonth.avg.toFixed(2)}) and dips in ${monthNames[worstMonth.month]} (avg: ${worstMonth.avg.toFixed(2)}). Seasonal variance: ${((variance - 1) * 100).toFixed(0)}%.`,
          confidence: variance > 1.5 ? 'High' : 'Medium',
          category: 'Seasonality',
          value: monthNames[bestMonth.month]
        });
      }
    }
  }

  // 4. Calculate correlations
  const correlations: CorrelationResult[] = [];
  for (let i = 0; i < numericColumns.length && i < 5; i++) {
    for (let j = i + 1; j < numericColumns.length && j < 5; j++) {
      const x = rows.map(r => Number(r[numericColumns[i]])).filter(v => !isNaN(v));
      const y = rows.map(r => Number(r[numericColumns[j]])).filter(v => !isNaN(v));
      const corr = calculateCorrelation(x, y);
      const strength = getCorrelationStrength(corr);
      
      correlations.push({
        field1: numericColumns[i],
        field2: numericColumns[j],
        correlation: corr,
        strength
      });

      if (strength === 'Strong') {
        insights.push({
          id: `corr-${i}-${j}`,
          type: 'correlation',
          title: `🔗 Strong Correlation Found`,
          description: `${numericColumns[i]} and ${numericColumns[j]} have a ${corr > 0 ? 'positive' : 'negative'} correlation of ${(corr * 100).toFixed(0)}%.`,
          confidence: 'High',
          category: 'Correlation',
          value: corr
        });
      }
    }
  }

  // 5. Detect outliers
  const outliers: OutlierResult[] = [];
  numericColumns.slice(0, 5).forEach(col => {
    const values = rows.map(r => Number(r[col])).filter(v => !isNaN(v));
    const detected = detectOutliersIQR(values);
    if (detected.length > 0 && detected.length < values.length * 0.1) {
      outliers.push({
        field: col,
        outliers: detected.slice(0, 10),
        method: 'IQR',
        threshold: 1.5
      });
      
      insights.push({
        id: `outlier-${col}`,
        type: 'outlier',
        title: `🎯 Outliers in ${col}`,
        description: `Found ${detected.length} outlier values in ${col} using IQR method. These values deviate significantly from the typical range.`,
        confidence: 'Medium',
        category: 'Outlier',
        value: detected.length,
        severity: detected.length > 5 ? 'warning' : 'info'
      });
    }
  });

  // Recommendations
  if (numericColumns.length >= 2) {
    insights.push({
      id: 'rec-scatter',
      type: 'recommendation',
      title: '💡 Try Scatter Plot',
      description: `With ${numericColumns.length} numeric columns, use Scatter Plot to explore relationships between variables like ${numericColumns.slice(0, 2).join(' and ')}.`,
      confidence: 'Medium',
      category: 'Recommendation'
    });
  }

  if (dateColumns.length > 0 && numericColumns.length > 0) {
    insights.push({
      id: 'rec-timeline',
      type: 'recommendation',
      title: '📅 Time Series Analysis',
      description: `Use Line Chart with ${dateColumns[0]} on X-axis to visualize trends over time for metrics like ${numericColumns[0]}.`,
      confidence: 'High',
      category: 'Recommendation'
    });
  }

  return {
    columns,
    insights,
    correlations: correlations.filter(c => c.strength !== 'None'),
    outliers,
    recommendedXAxis,
    recommendedYAxis,
    dateColumn: dateColumns[0] || null,
    numericColumns,
    categoricalColumns
  };
};

// Import user-scoped storage utilities
import { getUserItem, setUserItem, STORAGE_KEYS } from "./userStorage";

// Store analysis results (user-scoped)
export const storeAnalysisResults = (data: AnalysisData, results: AnalyticsResult) => {
  setUserItem(STORAGE_KEYS.ANALYSIS_DATA, data);
  setUserItem(STORAGE_KEYS.ANALYTICS_RESULTS, results);
  setUserItem(STORAGE_KEYS.GENERATED_INSIGHTS, results.insights);
};

// Load analysis results (user-scoped)
export const loadAnalysisResults = (): AnalyticsResult | null => {
  return getUserItem<AnalyticsResult | null>(STORAGE_KEYS.ANALYTICS_RESULTS, null);
};

// Load analysis data (user-scoped)
export const loadAnalysisData = (): AnalysisData | null => {
  return getUserItem<AnalysisData | null>(STORAGE_KEYS.ANALYSIS_DATA, null);
};

// Load generated insights (user-scoped)
export const loadGeneratedInsights = (): Insight[] => {
  return getUserItem<Insight[]>(STORAGE_KEYS.GENERATED_INSIGHTS, []);
};
