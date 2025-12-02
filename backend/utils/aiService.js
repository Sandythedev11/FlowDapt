const { GoogleGenAI } = require("@google/genai");

// Initialize Gemini AI
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// User-isolated data stores
const userDataStore = new Map();
const sessionMemory = new Map();

// ============================================
// COMPREHENSIVE DATA CHUNKING - ALL COLUMNS
// ============================================

const createDataChunks = (analysisData, analyticsResults) => {
  const chunks = [];
  const { fileName, fileType, data, fields, rowCount } = analysisData;
  const totalRows = rowCount || data?.length || 0;

  // Detect column types
  const numericCols = [];
  const categoricalCols = [];
  const dateCols = [];
  
  if (data && data.length > 0 && fields) {
    fields.forEach(field => {
      const values = data.map(r => r[field]).filter(v => v != null && v !== "");
      const numericCount = values.filter(v => typeof v === "number" || (!isNaN(Number(v)) && v !== "")).length;
      const uniqueCount = new Set(values.map(String)).size;
      
      // Check for date patterns
      const datePatterns = [/^\d{4}-\d{2}-\d{2}/, /^\d{2}\/\d{2}\/\d{4}/, /^\d{2}-\d{2}-\d{4}/];
      const isDate = values.slice(0, 10).some(v => typeof v === "string" && datePatterns.some(p => p.test(v)));
      
      if (isDate) {
        dateCols.push(field);
      } else if (numericCount > values.length * 0.5) {
        numericCols.push(field);
      } else if (uniqueCount < values.length * 0.5 && uniqueCount > 1 && uniqueCount < 100) {
        categoricalCols.push(field);
      }
    });
  }

  // 1. DATASET OVERVIEW - Complete schema
  chunks.push({
    id: "overview",
    type: "overview",
    content: `DATASET: "${fileName}" (${fileType?.toUpperCase()})
Total Rows: ${totalRows.toLocaleString()}
Total Columns: ${fields?.length || 0}

ALL AVAILABLE COLUMNS:
${fields?.map((f, i) => `  ${i + 1}. ${f}`).join("\n")}

COLUMN TYPES:
- Numeric Columns (${numericCols.length}): ${numericCols.join(", ") || "None"}
- Categorical Columns (${categoricalCols.length}): ${categoricalCols.join(", ") || "None"}
- Date Columns (${dateCols.length}): ${dateCols.join(", ") || "None"}

IMPORTANT: You can answer questions about ANY combination of these columns.
Examples: Date+Price, Region+Revenue, Product+Profit, Category+Sales, etc.`
  });

  // 2. COMPREHENSIVE STATISTICS FOR EVERY COLUMN
  if (data && data.length > 0 && fields) {
    let allStatsText = "COMPLETE STATISTICS FOR ALL COLUMNS:\n\n";
    
    fields.forEach((field) => {
      const values = data.map((row) => row[field]).filter((v) => v !== null && v !== undefined && v !== "");
      const numericValues = values.filter((v) => typeof v === "number" || (!isNaN(Number(v)) && v !== "")).map(Number);

      if (numericValues.length > values.length * 0.5) {
        // Numeric column - comprehensive stats
        const sum = numericValues.reduce((a, b) => a + b, 0);
        const avg = sum / numericValues.length;
        const min = Math.min(...numericValues);
        const max = Math.max(...numericValues);
        const sorted = [...numericValues].sort((a, b) => a - b);
        const median = sorted[Math.floor(sorted.length / 2)];
        const q1 = sorted[Math.floor(sorted.length * 0.25)];
        const q3 = sorted[Math.floor(sorted.length * 0.75)];
        const variance = numericValues.reduce((acc, v) => acc + Math.pow(v - avg, 2), 0) / numericValues.length;
        const stdDev = Math.sqrt(variance);

        allStatsText += `📊 ${field} (NUMERIC):
  - Count: ${numericValues.length} values | Missing: ${data.length - numericValues.length}
  - Total Sum: ${sum.toLocaleString(undefined, { maximumFractionDigits: 2 })}
  - Average (Mean): ${avg.toLocaleString(undefined, { maximumFractionDigits: 2 })}
  - Minimum: ${min.toLocaleString(undefined, { maximumFractionDigits: 2 })}
  - Maximum: ${max.toLocaleString(undefined, { maximumFractionDigits: 2 })}
  - Median: ${median.toLocaleString(undefined, { maximumFractionDigits: 2 })}
  - Q1 (25th percentile): ${q1.toLocaleString(undefined, { maximumFractionDigits: 2 })}
  - Q3 (75th percentile): ${q3.toLocaleString(undefined, { maximumFractionDigits: 2 })}
  - Range: ${(max - min).toLocaleString(undefined, { maximumFractionDigits: 2 })}
  - Std Deviation: ${stdDev.toLocaleString(undefined, { maximumFractionDigits: 2 })}\n\n`;
      } else {
        // Categorical/Text column - full distribution
        const valueCounts = {};
        values.forEach((v) => { valueCounts[String(v)] = (valueCounts[String(v)] || 0) + 1; });
        const sortedValues = Object.entries(valueCounts).sort((a, b) => b[1] - a[1]);
        const topValues = sortedValues.slice(0, 10);
        const bottomValues = sortedValues.slice(-3);

        allStatsText += `📋 ${field} (CATEGORICAL):
  - Total Values: ${values.length} | Missing: ${data.length - values.length}
  - Unique Values: ${sortedValues.length}
  - Top 10 Values:\n${topValues.map(([v, c], i) => `    ${i + 1}. "${v}": ${c} occurrences (${((c / values.length) * 100).toFixed(1)}%)`).join("\n")}
  ${sortedValues.length > 10 ? `- Least Common: ${bottomValues.map(([v, c]) => `"${v}" (${c})`).join(", ")}` : ""}\n\n`;
      }
    });

    chunks.push({ id: "all_stats", type: "statistics", content: allStatsText });
  }

  // 3. CROSS-COLUMN AGGREGATIONS - ALL combinations
  if (data && fields) {
    const usedNumericCols = analyticsResults?.numericColumns || numericCols;
    const usedCategoricalCols = analyticsResults?.categoricalColumns || categoricalCols;

    if (usedCategoricalCols.length > 0 && usedNumericCols.length > 0) {
      let aggText = "CROSS-COLUMN AGGREGATIONS (All Numeric by All Categorical):\n\n";
      
      // Process ALL categorical columns (up to 5)
      usedCategoricalCols.slice(0, 5).forEach(catCol => {
        // Process ALL numeric columns (up to 5)
        usedNumericCols.slice(0, 5).forEach(numCol => {
          const aggregations = {};
          data.forEach(row => {
            const cat = String(row[catCol] || "Unknown");
            const val = Number(row[numCol]);
            if (!isNaN(val)) {
              if (!aggregations[cat]) aggregations[cat] = { sum: 0, count: 0, min: Infinity, max: -Infinity };
              aggregations[cat].sum += val;
              aggregations[cat].count++;
              aggregations[cat].min = Math.min(aggregations[cat].min, val);
              aggregations[cat].max = Math.max(aggregations[cat].max, val);
            }
          });

          const sorted = Object.entries(aggregations)
            .map(([cat, s]) => ({ 
              cat, 
              total: s.sum, 
              count: s.count, 
              avg: s.sum / s.count,
              min: s.min,
              max: s.max
            }))
            .sort((a, b) => b.total - a.total);

          if (sorted.length > 0) {
            aggText += `\n${numCol} BY ${catCol}:\n`;
            aggText += `${"─".repeat(40)}\n`;
            sorted.slice(0, 8).forEach((a, i) => {
              aggText += `  ${i + 1}. ${a.cat}:\n`;
              aggText += `     Total: ${a.total.toLocaleString(undefined, {maximumFractionDigits: 2})}\n`;
              aggText += `     Count: ${a.count} | Avg: ${a.avg.toFixed(2)} | Min: ${a.min.toFixed(2)} | Max: ${a.max.toFixed(2)}\n`;
            });
            aggText += `  🏆 Best: ${sorted[0].cat} (${sorted[0].total.toLocaleString()})\n`;
            aggText += `  📉 Worst: ${sorted[sorted.length - 1].cat} (${sorted[sorted.length - 1].total.toLocaleString()})\n`;
          }
        });
      });

      chunks.push({ id: "aggregations", type: "aggregations", content: aggText });
    }
  }

  // 4. DATE-BASED ANALYSIS (if date columns exist)
  if (dateCols.length > 0 && numericCols.length > 0 && data) {
    let dateAnalysis = "TIME-BASED ANALYSIS:\n\n";
    
    dateCols.slice(0, 2).forEach(dateCol => {
      numericCols.slice(0, 3).forEach(numCol => {
        const timeData = {};
        data.forEach(row => {
          const dateVal = row[dateCol];
          const numVal = Number(row[numCol]);
          if (dateVal && !isNaN(numVal)) {
            const dateStr = String(dateVal).substring(0, 10); // YYYY-MM-DD or similar
            if (!timeData[dateStr]) timeData[dateStr] = { sum: 0, count: 0 };
            timeData[dateStr].sum += numVal;
            timeData[dateStr].count++;
          }
        });
        
        const sortedDates = Object.entries(timeData).sort((a, b) => a[0].localeCompare(b[0]));
        if (sortedDates.length > 0) {
          dateAnalysis += `${numCol} over ${dateCol}:\n`;
          dateAnalysis += `  - Date Range: ${sortedDates[0][0]} to ${sortedDates[sortedDates.length - 1][0]}\n`;
          dateAnalysis += `  - Total Periods: ${sortedDates.length}\n`;
          
          // First and last period comparison
          const firstPeriod = sortedDates[0];
          const lastPeriod = sortedDates[sortedDates.length - 1];
          const change = ((lastPeriod[1].sum - firstPeriod[1].sum) / (firstPeriod[1].sum || 1)) * 100;
          dateAnalysis += `  - First Period (${firstPeriod[0]}): ${firstPeriod[1].sum.toFixed(2)}\n`;
          dateAnalysis += `  - Last Period (${lastPeriod[0]}): ${lastPeriod[1].sum.toFixed(2)}\n`;
          dateAnalysis += `  - Overall Change: ${change > 0 ? "+" : ""}${change.toFixed(1)}%\n\n`;
        }
      });
    });
    
    chunks.push({ id: "time_analysis", type: "time_analysis", content: dateAnalysis });
  }

  // 5. SAMPLE DATA (first 30 rows with ALL columns)
  if (data && data.length > 0) {
    const sampleSize = Math.min(30, data.length);
    let sampleText = `SAMPLE DATA (${sampleSize} of ${totalRows} rows):\n\n`;
    sampleText += `Columns: ${fields.join(" | ")}\n`;
    sampleText += "─".repeat(80) + "\n";
    
    data.slice(0, sampleSize).forEach((row, i) => {
      const rowData = fields.map(f => {
        const val = row[f];
        if (val === null || val === undefined) return "NULL";
        if (typeof val === "number") return val.toLocaleString(undefined, { maximumFractionDigits: 2 });
        return String(val).substring(0, 30);
      }).join(" | ");
      sampleText += `${String(i + 1).padStart(3)}. ${rowData}\n`;
    });

    chunks.push({ id: "sample", type: "sample", content: sampleText });
  }

  // 6. AI INSIGHTS (from analytics engine)
  if (analyticsResults?.insights?.length > 0) {
    const insightsText = "AI-GENERATED INSIGHTS:\n\n" + analyticsResults.insights
      .map((ins, i) => `${i + 1}. [${ins.type?.toUpperCase()}] ${ins.title}\n   ${ins.description}\n   Confidence: ${ins.confidence}`)
      .join("\n\n");
    chunks.push({ id: "insights", type: "insights", content: insightsText });
  }

  // 7. CORRELATIONS (full matrix)
  if (analyticsResults?.correlations?.length > 0) {
    let corrText = "CORRELATION ANALYSIS:\n\n";
    const strongCorr = analyticsResults.correlations.filter(c => c.strength === "Strong");
    const moderateCorr = analyticsResults.correlations.filter(c => c.strength === "Moderate");
    
    if (strongCorr.length > 0) {
      corrText += "Strong Correlations:\n";
      strongCorr.forEach(c => {
        corrText += `  • ${c.field1} ↔ ${c.field2}: ${(c.correlation * 100).toFixed(1)}% (${c.correlation > 0 ? "positive" : "negative"})\n`;
      });
    }
    if (moderateCorr.length > 0) {
      corrText += "\nModerate Correlations:\n";
      moderateCorr.forEach(c => {
        corrText += `  • ${c.field1} ↔ ${c.field2}: ${(c.correlation * 100).toFixed(1)}%\n`;
      });
    }
    
    chunks.push({ id: "correlations", type: "correlations", content: corrText });
  }

  // 8. OUTLIERS
  if (analyticsResults?.outliers?.length > 0) {
    let outlierText = "OUTLIERS DETECTED:\n\n";
    analyticsResults.outliers.forEach(o => {
      outlierText += `${o.field}:\n`;
      outlierText += `  - ${o.outliers.length} outlier values detected (${o.method} method)\n`;
      outlierText += `  - Sample outliers: ${o.outliers.slice(0, 5).map(x => x.value.toFixed(2)).join(", ")}\n\n`;
    });
    chunks.push({ id: "outliers", type: "outliers", content: outlierText });
  }

  // 9. KPI SUMMARY
  if (numericCols.length > 0 && data) {
    let kpiText = "KEY PERFORMANCE INDICATORS (KPIs):\n\n";
    numericCols.slice(0, 5).forEach(col => {
      const values = data.map(r => Number(r[col])).filter(v => !isNaN(v));
      if (values.length > 0) {
        const total = values.reduce((a, b) => a + b, 0);
        const avg = total / values.length;
        const max = Math.max(...values);
        const min = Math.min(...values);
        const percentage = max > 0 ? Math.round((avg / max) * 100) : 0;
        
        kpiText += `${col}:\n`;
        kpiText += `  Total: ${total.toLocaleString(undefined, { maximumFractionDigits: 2 })}\n`;
        kpiText += `  Average: ${avg.toLocaleString(undefined, { maximumFractionDigits: 2 })}\n`;
        kpiText += `  Peak Value: ${max.toLocaleString(undefined, { maximumFractionDigits: 2 })}\n`;
        kpiText += `  Minimum Value: ${min.toLocaleString(undefined, { maximumFractionDigits: 2 })}\n`;
        kpiText += `  Performance: ${percentage}% (avg/max ratio)\n`;
        kpiText += `  Interpretation: ${percentage >= 70 ? "Excellent" : percentage >= 50 ? "Good" : percentage >= 30 ? "Fair" : "Needs Improvement"}\n\n`;
      }
    });
    chunks.push({ id: "kpis", type: "kpis", content: kpiText });
  }

  // 10. COMPLETE CORRELATION MATRIX (HEATMAP DATA)
  if (numericCols.length >= 2 && data) {
    let heatmapText = "CORRELATION HEATMAP MATRIX (Complete Cell-by-Cell Analysis):\n\n";
    heatmapText += "This matrix shows how strongly each numeric column correlates with every other column.\n";
    heatmapText += "Values range from -100% (perfect negative) to +100% (perfect positive).\n\n";
    
    // Calculate full correlation matrix
    const correlationMatrix = {};
    numericCols.slice(0, 8).forEach(col1 => {
      correlationMatrix[col1] = {};
      const values1 = data.map(r => Number(r[col1])).filter(v => !isNaN(v));
      
      numericCols.slice(0, 8).forEach(col2 => {
        if (col1 === col2) {
          correlationMatrix[col1][col2] = 1.0;
        } else {
          const values2 = data.map(r => Number(r[col2])).filter(v => !isNaN(v));
          const n = Math.min(values1.length, values2.length);
          if (n < 3) {
            correlationMatrix[col1][col2] = 0;
          } else {
            const meanX = values1.reduce((a, b) => a + b, 0) / n;
            const meanY = values2.reduce((a, b) => a + b, 0) / n;
            let numerator = 0, denomX = 0, denomY = 0;
            for (let i = 0; i < n; i++) {
              const dx = values1[i] - meanX;
              const dy = values2[i] - meanY;
              numerator += dx * dy;
              denomX += dx * dx;
              denomY += dy * dy;
            }
            const denom = Math.sqrt(denomX * denomY);
            correlationMatrix[col1][col2] = denom === 0 ? 0 : numerator / denom;
          }
        }
      });
    });
    
    // Format matrix as text
    heatmapText += "CORRELATION MATRIX:\n";
    heatmapText += "─".repeat(80) + "\n";
    const cols = Object.keys(correlationMatrix);
    cols.forEach(row => {
      heatmapText += `\n${row}:\n`;
      cols.forEach(col => {
        const corr = correlationMatrix[row][col];
        const percentage = (corr * 100).toFixed(0);
        const strength = Math.abs(corr) >= 0.7 ? "STRONG" : Math.abs(corr) >= 0.4 ? "MODERATE" : "WEAK";
        const direction = corr > 0 ? "positive" : corr < 0 ? "negative" : "none";
        heatmapText += `  → ${col}: ${percentage}% (${strength} ${direction})\n`;
      });
    });
    
    // Find strongest correlations
    const allCorrelations = [];
    cols.forEach(row => {
      cols.forEach(col => {
        if (row !== col) {
          allCorrelations.push({
            pair: `${row} ↔ ${col}`,
            value: correlationMatrix[row][col],
            percentage: (correlationMatrix[row][col] * 100).toFixed(1)
          });
        }
      });
    });
    allCorrelations.sort((a, b) => Math.abs(b.value) - Math.abs(a.value));
    
    heatmapText += "\n" + "─".repeat(80) + "\n";
    heatmapText += "TOP 10 STRONGEST CORRELATIONS:\n";
    allCorrelations.slice(0, 10).forEach((c, i) => {
      const strength = Math.abs(c.value) >= 0.7 ? "🔴 STRONG" : Math.abs(c.value) >= 0.4 ? "🟡 MODERATE" : "🟢 WEAK";
      heatmapText += `  ${i + 1}. ${c.pair}: ${c.percentage}% ${strength}\n`;
    });
    
    heatmapText += "\nHEATMAP INTERPRETATION:\n";
    heatmapText += "- Red cells (70-100%): Variables move together very strongly\n";
    heatmapText += "- Orange cells (40-70%): Moderate relationship exists\n";
    heatmapText += "- Gray cells (-20% to 20%): Little to no relationship\n";
    heatmapText += "- Negative values: Inverse relationship (one up, other down)\n";
    
    chunks.push({ id: "heatmap", type: "heatmap", content: heatmapText });
  }

  // 11. FUNNEL ANALYSIS (Conversion & Drop-off) - ENHANCED FOR ALL FIELD TYPES
  if (data && fields && fields.length > 0) {
    let funnelText = "FUNNEL CHART ANALYSIS (Conversion Stages):\n\n";
    
    // Try multiple field combinations for funnel analysis
    const funnelCandidates = [];
    
    // 1. Date fields + numeric fields (most common for time-based funnels)
    if (dateCols.length > 0 && numericCols.length > 0) {
      funnelCandidates.push({ catField: dateCols[0], numField: numericCols[0], type: "date" });
    }
    
    // 2. Categorical fields + numeric fields
    if (categoricalCols.length > 0 && numericCols.length > 0) {
      funnelCandidates.push({ catField: categoricalCols[0], numField: numericCols[0], type: "category" });
    }
    
    // 3. Any field with reasonable unique values + numeric field
    if (funnelCandidates.length === 0 && numericCols.length > 0) {
      const anyField = fields.find(f => {
        const uniqueVals = new Set(data.map(r => r[f]));
        return uniqueVals.size >= 3 && uniqueVals.size <= 50;
      });
      if (anyField) {
        funnelCandidates.push({ catField: anyField, numField: numericCols[0], type: "general" });
      }
    }
    
    // Generate funnel analysis for all candidates
    funnelCandidates.forEach((candidate, idx) => {
      const { catField, numField, type } = candidate;
      
      const aggregated = {};
      data.forEach(row => {
        const key = String(row[catField] || "Other");
        const val = Number(row[numField]) || 0;
        aggregated[key] = (aggregated[key] || 0) + val;
      });
      
      // Sort by date if it's a date field, otherwise by value
      let sorted;
      if (type === "date") {
        sorted = Object.entries(aggregated).sort((a, b) => a[0].localeCompare(b[0]));
      } else {
        sorted = Object.entries(aggregated).sort((a, b) => b[1] - a[1]);
      }
      
      // Limit to reasonable number of stages
      sorted = sorted.slice(0, 10);
      
      if (sorted.length > 0) {
        if (idx > 0) funnelText += "\n" + "=".repeat(80) + "\n\n";
        
        const total = sorted.reduce((sum, [, val]) => sum + val, 0);
        funnelText += `FUNNEL ${idx + 1}: ${catField} by ${numField} (${type} funnel)\n`;
        funnelText += "─".repeat(60) + "\n";
        
        sorted.forEach(([stage, value], i) => {
          const percentage = ((value / total) * 100).toFixed(1);
          const dropoff = i > 0 ? ((sorted[i-1][1] - value) / sorted[i-1][1] * 100).toFixed(1) : 0;
          const growth = i > 0 ? ((value - sorted[i-1][1]) / sorted[i-1][1] * 100).toFixed(1) : 0;
          
          funnelText += `\nStage ${i + 1}: ${stage}\n`;
          funnelText += `  Value: ${value.toLocaleString(undefined, { maximumFractionDigits: 2 })}\n`;
          funnelText += `  Share of Total: ${percentage}%\n`;
          
          if (i > 0) {
            if (type === "date") {
              // For date funnels, show growth/decline
              funnelText += `  Change from previous: ${growth > 0 ? "+" : ""}${growth}%\n`;
            } else {
              // For category funnels, show drop-off
              funnelText += `  Drop-off from previous: ${dropoff}%\n`;
            }
          }
        });
        
        funnelText += "\n" + "─".repeat(60) + "\n";
        funnelText += "FUNNEL INSIGHTS:\n";
        funnelText += `- First Stage: ${sorted[0][0]} (${((sorted[0][1] / total) * 100).toFixed(1)}% of total, ${sorted[0][1].toLocaleString()})\n`;
        funnelText += `- Last Stage: ${sorted[sorted.length - 1][0]} (${((sorted[sorted.length - 1][1] / total) * 100).toFixed(1)}% of total, ${sorted[sorted.length - 1][1].toLocaleString()})\n`;
        
        if (type === "date") {
          // For date funnels, show overall trend
          const overallChange = ((sorted[sorted.length - 1][1] - sorted[0][1]) / sorted[0][1] * 100).toFixed(1);
          funnelText += `- Overall Trend: ${overallChange > 0 ? "+" : ""}${overallChange}% from first to last period\n`;
        } else {
          // For category funnels, show conversion rate
          funnelText += `- Conversion Rate: ${((sorted[sorted.length - 1][1] / sorted[0][1]) * 100).toFixed(1)}% (top to bottom)\n`;
        }
        
        // Calculate average change between stages
        if (sorted.length > 1) {
          const avgChange = sorted.slice(1).reduce((sum, [, val], i) => {
            return sum + Math.abs((val - sorted[i][1]) / sorted[i][1]);
          }, 0) / (sorted.length - 1);
          funnelText += `- Average Stage Change: ${(avgChange * 100).toFixed(1)}%\n`;
        }
        
        // Identify biggest drop or gain
        let biggestChange = { stage: "", value: 0, percentage: 0 };
        sorted.forEach(([stage, value], i) => {
          if (i > 0) {
            const change = Math.abs(value - sorted[i-1][1]);
            const changePercent = Math.abs((value - sorted[i-1][1]) / sorted[i-1][1] * 100);
            if (changePercent > Math.abs(biggestChange.percentage)) {
              biggestChange = { 
                stage, 
                value: value - sorted[i-1][1], 
                percentage: (value - sorted[i-1][1]) / sorted[i-1][1] * 100 
              };
            }
          }
        });
        
        if (biggestChange.stage) {
          funnelText += `- Biggest Change: ${biggestChange.stage} (${biggestChange.percentage > 0 ? "+" : ""}${biggestChange.percentage.toFixed(1)}%)\n`;
        }
      }
    });
    
    if (funnelCandidates.length > 0) {
      chunks.push({ id: "funnel", type: "funnel", content: funnelText });
    }
  }

  // 12. GAUGE/KPI PERFORMANCE METRICS
  if (numericCols.length > 0 && data) {
    let gaugeText = "GAUGE CHART METRICS (Performance Indicators):\n\n";
    
    numericCols.slice(0, 5).forEach(col => {
      const values = data.map(r => Number(r[col])).filter(v => !isNaN(v));
      if (values.length > 0) {
        const avg = values.reduce((a, b) => a + b, 0) / values.length;
        const max = Math.max(...values);
        const min = Math.min(...values);
        const percentage = max > 0 ? Math.round((avg / max) * 100) : 0;
        
        let status = "🔴 Critical";
        let recommendation = "Immediate action required";
        if (percentage >= 70) {
          status = "🟢 Excellent";
          recommendation = "Maintain current performance";
        } else if (percentage >= 50) {
          status = "🟡 Good";
          recommendation = "Minor improvements possible";
        } else if (percentage >= 30) {
          status = "🟠 Fair";
          recommendation = "Focus on optimization";
        }
        
        gaugeText += `${col} GAUGE:\n`;
        gaugeText += `  Current Average: ${avg.toLocaleString(undefined, { maximumFractionDigits: 2 })}\n`;
        gaugeText += `  Maximum Possible: ${max.toLocaleString(undefined, { maximumFractionDigits: 2 })}\n`;
        gaugeText += `  Performance Score: ${percentage}%\n`;
        gaugeText += `  Status: ${status}\n`;
        gaugeText += `  Recommendation: ${recommendation}\n`;
        gaugeText += `  Range: ${min.toFixed(2)} to ${max.toFixed(2)}\n\n`;
      }
    });
    
    chunks.push({ id: "gauge", type: "gauge", content: gaugeText });
  }

  // 13. STACKED AREA / TREND ANALYSIS
  if (numericCols.length >= 2 && data) {
    let trendText = "STACKED AREA CHART ANALYSIS (Multi-Metric Trends):\n\n";
    
    const metrics = numericCols.slice(0, 4);
    trendText += `Analyzing ${metrics.length} metrics: ${metrics.join(", ")}\n\n`;
    
    metrics.forEach(metric => {
      const values = data.map(r => Number(r[metric])).filter(v => !isNaN(v));
      if (values.length > 0) {
        const total = values.reduce((a, b) => a + b, 0);
        const avg = total / values.length;
        
        // Calculate trend (simple linear regression slope)
        const n = values.length;
        const xMean = (n - 1) / 2;
        const yMean = avg;
        let numerator = 0, denominator = 0;
        values.forEach((y, x) => {
          numerator += (x - xMean) * (y - yMean);
          denominator += Math.pow(x - xMean, 2);
        });
        const slope = denominator !== 0 ? numerator / denominator : 0;
        const trendDirection = slope > 0 ? "📈 INCREASING" : slope < 0 ? "📉 DECREASING" : "➡️ STABLE";
        
        trendText += `${metric}:\n`;
        trendText += `  Total Contribution: ${total.toLocaleString(undefined, { maximumFractionDigits: 2 })}\n`;
        trendText += `  Average Value: ${avg.toLocaleString(undefined, { maximumFractionDigits: 2 })}\n`;
        trendText += `  Trend: ${trendDirection}\n`;
        trendText += `  Slope: ${slope.toFixed(4)} (rate of change)\n\n`;
      }
    });
    
    // Calculate total across all metrics
    const grandTotal = metrics.reduce((sum, metric) => {
      const values = data.map(r => Number(r[metric])).filter(v => !isNaN(v));
      return sum + values.reduce((a, b) => a + b, 0);
    }, 0);
    
    trendText += "COMBINED ANALYSIS:\n";
    trendText += `  Grand Total (all metrics): ${grandTotal.toLocaleString(undefined, { maximumFractionDigits: 2 })}\n`;
    
    metrics.forEach(metric => {
      const values = data.map(r => Number(r[metric])).filter(v => !isNaN(v));
      const total = values.reduce((a, b) => a + b, 0);
      const contribution = ((total / grandTotal) * 100).toFixed(1);
      trendText += `  ${metric} contribution: ${contribution}%\n`;
    });
    
    chunks.push({ id: "stacked_area", type: "stacked_area", content: trendText });
  }

  // 14. CHART INTERPRETATION GUIDE
  const chartGuide = `CHART INTERPRETATION GUIDE:

AVAILABLE VISUALIZATIONS:
1. Bar Chart: Compare values across categories
2. Line Chart: Show trends over time or sequence
3. Pie Chart: Display proportions and percentages
4. Scatter Plot: Reveal relationships between two variables
5. Heatmap: Show correlation strength between all numeric columns
6. Funnel Chart: Analyze conversion rates and drop-offs
7. Gauge Chart: Display KPI performance against targets
8. Stacked Area: Compare multiple metrics over time

HOW TO ANSWER CHART QUESTIONS:
- "Summarize the heatmap" → Use correlation matrix data above
- "Explain the funnel" → Use funnel analysis with conversion rates
- "What does the gauge show?" → Use gauge metrics with performance scores
- "Describe trends" → Use stacked area analysis with slopes
- "Compare regions/categories" → Use aggregation data
- "Find patterns" → Use correlations, outliers, and insights
- "Highest/lowest values" → Use statistics and KPI data

IMPORTANT: Always cite specific numbers, percentages, and values from the data above.`;

  chunks.push({ id: "chart_guide", type: "guide", content: chartGuide });

  // 15. CHART-READY DATA STRUCTURES
  if (data && data.length > 0) {
    let chartDataText = "CHART-READY DATA STRUCTURES (For All Visualizations):\n\n";
    
    // Bar Chart Data
    if (categoricalCols.length > 0 && numericCols.length > 0) {
      const catField = categoricalCols[0];
      const numField = numericCols[0];
      const barData = {};
      data.forEach(row => {
        const key = String(row[catField] || "Other");
        barData[key] = (barData[key] || 0) + (Number(row[numField]) || 0);
      });
      const sortedBar = Object.entries(barData).sort((a, b) => b[1] - a[1]).slice(0, 10);
      chartDataText += `BAR CHART DATA (${catField} vs ${numField}):\n`;
      sortedBar.forEach(([cat, val]) => {
        chartDataText += `  ${cat}: ${val.toLocaleString(undefined, { maximumFractionDigits: 2 })}\n`;
      });
      chartDataText += "\n";
    }
    
    // Pie Chart Data (Proportions)
    if (categoricalCols.length > 0) {
      const catField = categoricalCols[0];
      const pieData = {};
      data.forEach(row => {
        const key = String(row[catField] || "Other");
        pieData[key] = (pieData[key] || 0) + 1;
      });
      const total = Object.values(pieData).reduce((a, b) => a + b, 0);
      const sortedPie = Object.entries(pieData).sort((a, b) => b[1] - a[1]).slice(0, 8);
      chartDataText += `PIE CHART DATA (${catField} distribution):\n`;
      sortedPie.forEach(([cat, count]) => {
        const percentage = ((count / total) * 100).toFixed(1);
        chartDataText += `  ${cat}: ${count} records (${percentage}%)\n`;
      });
      chartDataText += "\n";
    }
    
    // Scatter Plot Data
    if (numericCols.length >= 2) {
      const xField = numericCols[0];
      const yField = numericCols[1];
      const scatterSample = data.slice(0, 20).map(row => ({
        x: Number(row[xField]) || 0,
        y: Number(row[yField]) || 0
      }));
      chartDataText += `SCATTER PLOT DATA (${xField} vs ${yField}) - Sample of 20 points:\n`;
      scatterSample.forEach((point, i) => {
        chartDataText += `  Point ${i + 1}: (${point.x.toFixed(2)}, ${point.y.toFixed(2)})\n`;
      });
      chartDataText += "\n";
    }
    
    // Line Chart Data (if there's a date/time field)
    const dateFields = fields.filter(f => {
      const sample = data[0]?.[f];
      return sample && (typeof sample === 'string' && /\d{4}|\d{2}\/\d{2}|\d{2}-\d{2}/.test(sample));
    });
    
    if (dateFields.length > 0 && numericCols.length > 0) {
      const dateField = dateFields[0];
      const numField = numericCols[0];
      const lineData = data.slice(0, 20).map(row => ({
        date: String(row[dateField]),
        value: Number(row[numField]) || 0
      }));
      chartDataText += `LINE CHART DATA (${dateField} vs ${numField}) - Sample of 20 points:\n`;
      lineData.forEach((point, i) => {
        chartDataText += `  ${point.date}: ${point.value.toFixed(2)}\n`;
      });
      chartDataText += "\n";
    }
    
    // Summary Statistics for Quick Reference
    chartDataText += "QUICK STATISTICS REFERENCE:\n";
    numericCols.slice(0, 5).forEach(col => {
      const values = data.map(r => Number(r[col])).filter(v => !isNaN(v));
      if (values.length > 0) {
        const sum = values.reduce((a, b) => a + b, 0);
        const avg = sum / values.length;
        const min = Math.min(...values);
        const max = Math.max(...values);
        chartDataText += `  ${col}: Sum=${sum.toFixed(2)}, Avg=${avg.toFixed(2)}, Min=${min.toFixed(2)}, Max=${max.toFixed(2)}\n`;
      }
    });
    
    chunks.push({ id: "chart_data", type: "chart_data", content: chartDataText });
  }

  // Log chunk types for debugging
  console.log(`📦 [CHUNKS CREATED] Total: ${chunks.length}, Types: ${chunks.map(c => c.id).join(", ")}`);
  
  return chunks;
};

// ============================================
// INDEX USER DATA
// ============================================

const indexUserData = (userId, analysisData, analyticsResults = null) => {
  if (!userId || !analysisData?.data?.length) {
    console.error("❌ [AI INDEX] Invalid data");
    return 0;
  }

  console.log(`\n📊 [AI INDEX] Indexing for user: ${userId}`);
  console.log(`   File: ${analysisData.fileName}, Rows: ${analysisData.data.length}, Fields: ${analysisData.fields?.length}`);

  const chunks = createDataChunks(analysisData, analyticsResults);

  userDataStore.set(userId, {
    chunks,
    rawData: analysisData.data,
    fields: analysisData.fields || [],
    fileName: analysisData.fileName,
    rowCount: analysisData.rowCount || analysisData.data.length,
    analyticsResults,
    indexedAt: new Date().toISOString(),
  });

  console.log(`✅ [AI INDEX] Created ${chunks.length} chunks. Users indexed: ${userDataStore.size}`);
  return chunks.length;
};

const indexInsights = (userId, insights) => {
  const userData = userDataStore.get(userId);
  if (!userData || !insights?.length) return;
  
  userData.chunks = userData.chunks.filter(c => c.type !== "insights");
  userData.chunks.push({
    id: "insights",
    type: "insights",
    content: "AI INSIGHTS:\n" + insights.map((ins, i) => `${i + 1}. ${ins.title}: ${ins.description}`).join("\n")
  });
  userDataStore.set(userId, userData);
};

// ============================================
// RETRIEVAL - ALWAYS INCLUDE ALL CONTEXT
// ============================================

const retrieveContext = (userId) => {
  const userData = userDataStore.get(userId);
  if (!userData?.chunks?.length) return null;

  // ALWAYS include ALL chunks for comprehensive context
  // The AI needs full dataset context regardless of query or chart selection
  // This ensures questions about ANY field combination work correctly
  return {
    chunks: userData.chunks, // Return ALL chunks - never filter by query
    rawData: userData.rawData,
    fields: userData.fields,
    fileName: userData.fileName,
    rowCount: userData.rowCount,
    analyticsResults: userData.analyticsResults,
  };
};

// ============================================
// DYNAMIC CALCULATIONS - Enhanced for any field
// ============================================

const performCalculations = (userData, query) => {
  if (!userData?.rawData?.length) return null;

  const { rawData, fields } = userData;
  const queryLower = query.toLowerCase();
  const results = [];

  // Find all numeric fields
  const numericFields = fields.filter(f => {
    const values = rawData.map(r => r[f]).filter(v => v != null);
    const numericCount = values.filter(v => typeof v === "number" || !isNaN(Number(v))).length;
    return numericCount > values.length * 0.5;
  });

  // Find mentioned fields in query
  const mentionedFields = fields.filter(f => queryLower.includes(f.toLowerCase()));
  const mentionedNumeric = mentionedFields.filter(f => numericFields.includes(f));

  // Sum/Total calculations
  if (queryLower.match(/total|sum|overall|combined|aggregate/)) {
    const targetFields = mentionedNumeric.length ? mentionedNumeric : numericFields.slice(0, 5);
    targetFields.forEach(field => {
      const sum = rawData.reduce((acc, row) => acc + (Number(row[field]) || 0), 0);
      results.push(`Total ${field}: ${sum.toLocaleString(undefined, { maximumFractionDigits: 2 })}`);
    });
  }

  // Average calculations
  if (queryLower.match(/average|avg|mean/)) {
    const targetFields = mentionedNumeric.length ? mentionedNumeric : numericFields.slice(0, 5);
    targetFields.forEach(field => {
      const values = rawData.map(r => Number(r[field])).filter(v => !isNaN(v));
      if (values.length) {
        const avg = values.reduce((a, b) => a + b, 0) / values.length;
        results.push(`Average ${field}: ${avg.toLocaleString(undefined, { maximumFractionDigits: 2 })}`);
      }
    });
  }

  // Min/Max calculations
  if (queryLower.match(/minimum|min|lowest|smallest/)) {
    const targetFields = mentionedNumeric.length ? mentionedNumeric : numericFields.slice(0, 3);
    targetFields.forEach(field => {
      const values = rawData.map(r => Number(r[field])).filter(v => !isNaN(v));
      if (values.length) {
        results.push(`Minimum ${field}: ${Math.min(...values).toLocaleString(undefined, { maximumFractionDigits: 2 })}`);
      }
    });
  }

  if (queryLower.match(/maximum|max|highest|largest|peak/)) {
    const targetFields = mentionedNumeric.length ? mentionedNumeric : numericFields.slice(0, 3);
    targetFields.forEach(field => {
      const values = rawData.map(r => Number(r[field])).filter(v => !isNaN(v));
      if (values.length) {
        results.push(`Maximum ${field}: ${Math.max(...values).toLocaleString(undefined, { maximumFractionDigits: 2 })}`);
      }
    });
  }

  // Count calculations
  if (queryLower.match(/how many|count|number of|rows|records/)) {
    results.push(`Total records: ${rawData.length.toLocaleString()}`);
    results.push(`Total columns: ${fields.length}`);
  }

  // Group by calculations (e.g., "sales by region", "revenue by product")
  const byMatch = queryLower.match(/(\w+)\s+by\s+(\w+)/);
  if (byMatch) {
    const numericField = fields.find(f => f.toLowerCase().includes(byMatch[1]));
    const categoryField = fields.find(f => f.toLowerCase().includes(byMatch[2]));
    
    if (numericField && categoryField && numericFields.includes(numericField)) {
      const grouped = {};
      rawData.forEach(row => {
        const cat = String(row[categoryField] || "Unknown");
        const val = Number(row[numericField]) || 0;
        if (!grouped[cat]) grouped[cat] = { sum: 0, count: 0 };
        grouped[cat].sum += val;
        grouped[cat].count++;
      });
      
      const sorted = Object.entries(grouped)
        .map(([cat, data]) => ({ cat, ...data, avg: data.sum / data.count }))
        .sort((a, b) => b.sum - a.sum);
      
      results.push(`\n${numericField} by ${categoryField}:`);
      sorted.slice(0, 10).forEach((item, i) => {
        results.push(`  ${i + 1}. ${item.cat}: Total=${item.sum.toLocaleString(undefined, {maximumFractionDigits: 2})}, Count=${item.count}, Avg=${item.avg.toFixed(2)}`);
      });
    }
  }

  // Comparison queries
  if (queryLower.match(/compare|versus|vs|difference between/)) {
    const mentionedCats = [];
    fields.forEach(f => {
      const uniqueVals = [...new Set(rawData.map(r => String(r[f])))];
      uniqueVals.forEach(v => {
        if (queryLower.includes(v.toLowerCase())) {
          mentionedCats.push({ field: f, value: v });
        }
      });
    });
    
    if (mentionedCats.length >= 2 && numericFields.length > 0) {
      const numField = numericFields[0];
      mentionedCats.forEach(({ field, value }) => {
        const filtered = rawData.filter(r => String(r[field]) === value);
        const sum = filtered.reduce((acc, r) => acc + (Number(r[numField]) || 0), 0);
        const avg = sum / (filtered.length || 1);
        results.push(`${value}: Total ${numField}=${sum.toLocaleString()}, Count=${filtered.length}, Avg=${avg.toFixed(2)}`);
      });
    }
  }

  // Top/Bottom queries
  if (queryLower.match(/top|best|highest|leading|first/)) {
    const n = queryLower.match(/top\s+(\d+)/)?.[1] || 5;
    numericFields.slice(0, 2).forEach(field => {
      const sorted = [...rawData]
        .map(r => ({ value: Number(r[field]) || 0, row: r }))
        .sort((a, b) => b.value - a.value)
        .slice(0, parseInt(n));
      
      results.push(`\nTop ${n} ${field}:`);
      sorted.forEach((item, i) => {
        const label = Object.values(item.row).find(v => typeof v === 'string') || `Row ${i + 1}`;
        results.push(`  ${i + 1}. ${label}: ${item.value.toLocaleString(undefined, { maximumFractionDigits: 2 })}`);
      });
    });
  }

  if (queryLower.match(/bottom|worst|lowest|last/)) {
    const n = queryLower.match(/bottom\s+(\d+)/)?.[1] || 5;
    numericFields.slice(0, 2).forEach(field => {
      const sorted = [...rawData]
        .map(r => ({ value: Number(r[field]) || 0, row: r }))
        .sort((a, b) => a.value - b.value)
        .slice(0, parseInt(n));
      
      results.push(`\nBottom ${n} ${field}:`);
      sorted.forEach((item, i) => {
        const label = Object.values(item.row).find(v => typeof v === 'string') || `Row ${i + 1}`;
        results.push(`  ${i + 1}. ${label}: ${item.value.toLocaleString(undefined, { maximumFractionDigits: 2 })}`);
      });
    });
  }

  // Percentage/Ratio queries
  if (queryLower.match(/percentage|percent|ratio|proportion/)) {
    numericFields.slice(0, 3).forEach(field => {
      const values = rawData.map(r => Number(r[field])).filter(v => !isNaN(v));
      if (values.length > 0) {
        const total = values.reduce((a, b) => a + b, 0);
        const avg = total / values.length;
        const percentage = total > 0 ? (avg / total * 100).toFixed(2) : 0;
        results.push(`${field}: Average is ${percentage}% of total`);
      }
    });
  }

  // Growth/Change queries
  if (queryLower.match(/growth|change|increase|decrease|trend/)) {
    numericFields.slice(0, 3).forEach(field => {
      const values = rawData.map(r => Number(r[field])).filter(v => !isNaN(v));
      if (values.length >= 2) {
        const first = values[0];
        const last = values[values.length - 1];
        const change = last - first;
        const percentChange = first !== 0 ? ((change / first) * 100).toFixed(2) : 0;
        const direction = change > 0 ? "increased" : change < 0 ? "decreased" : "remained stable";
        results.push(`${field}: ${direction} by ${Math.abs(percentChange)}% (from ${first.toFixed(2)} to ${last.toFixed(2)})`);
      }
    });
  }

  // Distribution queries
  if (queryLower.match(/distribution|spread|range|variance/)) {
    numericFields.slice(0, 3).forEach(field => {
      const values = rawData.map(r => Number(r[field])).filter(v => !isNaN(v));
      if (values.length > 0) {
        const min = Math.min(...values);
        const max = Math.max(...values);
        const range = max - min;
        const avg = values.reduce((a, b) => a + b, 0) / values.length;
        const variance = values.reduce((acc, v) => acc + Math.pow(v - avg, 2), 0) / values.length;
        const stdDev = Math.sqrt(variance);
        results.push(`${field} distribution: Range=${range.toFixed(2)}, StdDev=${stdDev.toFixed(2)}, CV=${((stdDev/avg)*100).toFixed(2)}%`);
      }
    });
  }

  return results.length ? results.join("\n") : null;
};

// ============================================
// SESSION MEMORY
// ============================================

const getSessionMemory = (userId, sessionId) => {
  const key = `${userId}_${sessionId}`;
  if (!sessionMemory.has(key)) sessionMemory.set(key, []);
  return sessionMemory.get(key);
};

const addToSessionMemory = (userId, sessionId, role, content) => {
  const memory = getSessionMemory(userId, sessionId);
  memory.push({ role, content, timestamp: new Date().toISOString() });
  if (memory.length > 20) memory.splice(0, memory.length - 20);
};

const clearSessionMemory = (userId, sessionId) => {
  sessionMemory.delete(`${userId}_${sessionId}`);
};

// Clear all data for a user (called on logout/session end)
const clearUserData = (userId) => {
  if (!userId) return false;
  
  // Clear indexed data
  userDataStore.delete(userId);
  
  // Clear all session memories for this user
  const keysToDelete = [];
  sessionMemory.forEach((_, key) => {
    if (key.startsWith(`${userId}_`)) {
      keysToDelete.push(key);
    }
  });
  keysToDelete.forEach(key => sessionMemory.delete(key));
  
  console.log(`🧹 [AI CLEANUP] Cleared all data for user: ${userId}`);
  return true;
};

// ============================================
// MAIN CHAT FUNCTION
// ============================================

const chat = async (userId, sessionId, query) => {
  console.log(`\n🤖 [AI CHAT] User: ${userId}, Query: "${query}"`);
  console.log(`   Indexed users: ${userDataStore.size}`);

  if (!userDataStore.has(userId)) {
    console.log(`⚠️ No data for user ${userId}`);
    return { success: true, response: "I don't have any data to analyze yet. Please upload a dataset first, then ask me questions!", source: "no_data" };
  }

  try {
    const context = retrieveContext(userId);
    if (!context?.chunks?.length) {
      return { success: true, response: "I couldn't find data to analyze. Please try uploading your dataset again.", source: "no_context" };
    }

    const calculations = performCalculations(context, query);
    const memory = getSessionMemory(userId, sessionId);
    const recentHistory = memory.slice(-4).map(m => `${m.role === "user" ? "User" : "AI"}: ${m.content}`).join("\n");

    // Detect query intent to help AI focus
    const queryLower = query.toLowerCase();
    let queryContext = "";
    
    if (queryLower.match(/heatmap|correlation matrix|correlate|relationship between/)) {
      queryContext = "🔍 QUERY TYPE: Correlation/Heatmap Analysis\n→ Focus on: Correlation matrix, heatmap data, relationship strengths\n";
    } else if (queryLower.match(/funnel|conversion|drop.?off|stage/)) {
      queryContext = "🔍 QUERY TYPE: Funnel/Conversion Analysis\n→ Focus on: Funnel stages, conversion rates, drop-off percentages\n";
    } else if (queryLower.match(/gauge|kpi|performance|score/)) {
      queryContext = "🔍 QUERY TYPE: KPI/Performance Analysis\n→ Focus on: Gauge metrics, performance scores, status indicators\n";
    } else if (queryLower.match(/trend|over time|temporal|growth|change/)) {
      queryContext = "🔍 QUERY TYPE: Trend/Temporal Analysis\n→ Focus on: Time-based analysis, slopes, growth rates, trends\n";
    } else if (queryLower.match(/compare|versus|vs|difference/)) {
      queryContext = "🔍 QUERY TYPE: Comparative Analysis\n→ Focus on: Cross-column aggregations, category comparisons\n";
    } else if (queryLower.match(/summarize|summary|overview|explain all/)) {
      queryContext = "🔍 QUERY TYPE: Comprehensive Summary\n→ Focus on: All insights, correlations, KPIs, trends, patterns\n";
    } else if (queryLower.match(/pattern|anomaly|outlier|unusual/)) {
      queryContext = "🔍 QUERY TYPE: Pattern Detection\n→ Focus on: Outliers, anomalies, correlations, insights\n";
    } else if (queryLower.match(/top|bottom|best|worst|highest|lowest/)) {
      queryContext = "🔍 QUERY TYPE: Ranking/Extremes Analysis\n→ Focus on: Top/bottom values, rankings, extremes\n";
    }

    // Build FULL context from ALL chunks
    const fullContext = context.chunks.map(c => c.content).join("\n\n" + "=".repeat(50) + "\n\n");

    const systemPrompt = `You are FlowDapt AI, a COMPLETE ANALYTICS INTERPRETER and expert data analyst. You have FULL access to the user's dataset AND all analytical visualizations.

YOUR ROLE:
You are NOT just a Q&A bot. You are a comprehensive analytics interpreter that can:
- Explain every chart, heatmap, KPI, gauge, funnel, and visualization
- Summarize correlation patterns and relationships
- Interpret trends, anomalies, clusters, and distributions
- Compare regions, categories, time periods, and metrics
- Provide actionable insights from any analytical output
- Answer ANY permutation of analytical queries

CRITICAL CAPABILITIES:
✅ Summarize heatmaps with specific correlation values
✅ Explain funnel conversion rates and drop-offs
✅ Interpret gauge KPIs with performance scores
✅ Describe trends in stacked area charts
✅ Compare highest/lowest values across categories
✅ Identify strongest/weakest correlations
✅ Explain regional or temporal patterns
✅ Detect anomalies and outliers
✅ Analyze cross-column relationships
✅ Provide chart-specific interpretations

CRITICAL RULES:
1. You have COMPLETE access: dataset, statistics, correlations, KPIs, trends, insights
2. ALWAYS cite specific numbers, percentages, and values from the context
3. When asked about charts (heatmap, funnel, gauge, etc.), use the specific analytical sections
4. For "summarize X chart" queries, provide comprehensive interpretation with key findings
5. For "explain correlation" queries, use the correlation matrix data
6. For "what does the funnel show" or "summarize the funnel" queries, SEARCH for "FUNNEL CHART ANALYSIS" in the context and use that data with conversion rates, stages, and drop-offs
7. For "gauge/KPI" queries, use gauge metrics with performance scores
8. NEVER say "I don't have that information" or "the context doesn't contain" - the data IS in the context below, search for it
9. Be specific: cite exact values, percentages, correlations, and comparisons
10. Provide actionable insights, not just data recitation
11. If asked about a funnel, look for sections labeled "FUNNEL CHART ANALYSIS", "FUNNEL 1", "FUNNEL 2", etc.

DATASET INFORMATION:
- File: "${context.fileName}"
- Total Records: ${context.rowCount?.toLocaleString()} rows
- All Available Columns: ${context.fields?.join(", ")}
- Analytical Context: Full statistics, correlations, KPIs, trends, insights included below

${queryContext ? `${"=".repeat(80)}\n${queryContext}${"=".repeat(80)}\n\n` : ""}

${"=".repeat(80)}
COMPLETE ANALYTICAL CONTEXT (Dataset + All Visualizations):
${"=".repeat(80)}

${fullContext}

${calculations ? `\n${"=".repeat(80)}\nON-DEMAND CALCULATIONS:\n${"=".repeat(80)}\n${calculations}` : ""}
${recentHistory ? `\n${"=".repeat(80)}\nCONVERSATION HISTORY:\n${"=".repeat(80)}\n${recentHistory}` : ""}

${"=".repeat(80)}
RESPONSE GUIDELINES:
${"=".repeat(80)}
- For heatmap questions: Use correlation matrix, cite specific percentages
- For funnel questions: Look for "FUNNEL CHART ANALYSIS" section, use conversion rates, drop-offs, stage analysis with specific values
- For gauge/KPI questions: Use performance scores, status, recommendations
- For trend questions: Use slope analysis, direction, rate of change
- For comparison questions: Use aggregations, cite specific values
- For pattern questions: Use correlations, outliers, insights
- For "summarize" questions: Provide comprehensive overview with key findings
- For "explain" questions: Interpret meaning and implications
- For "what does X show" questions: Describe patterns and significance

REMEMBER: You are a COMPLETE ANALYTICS INTERPRETER. Use ALL the analytical context above to provide comprehensive, specific, and actionable responses.`;

    // Enhanced model configuration for better analytical responses
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: [{ role: "user", parts: [{ text: systemPrompt + "\n\nQuestion: " + query }] }],
      generationConfig: {
        temperature: 0.3, // Lower temperature for more factual, precise responses
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 2048, // Allow longer, more detailed responses
        candidateCount: 1,
      },
      safetySettings: [
        { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_NONE" },
        { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_NONE" },
        { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_NONE" },
        { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_NONE" },
      ],
    });

    const aiResponse = response.text || "I couldn't generate a response. Please try again.";

    addToSessionMemory(userId, sessionId, "user", query);
    addToSessionMemory(userId, sessionId, "assistant", aiResponse);

    console.log(`✅ [AI CHAT] Response: ${aiResponse.length} chars, ${context.chunks.length} chunks used`);

    return { success: true, response: aiResponse, source: "rag", chunksUsed: context.chunks.length };
  } catch (error) {
    console.error(`❌ [AI CHAT] Error:`, error);
    return { success: false, response: `Error: ${error.message}`, error: error.message };
  }
};

// ============================================
// DEBUG
// ============================================

const debugUserData = (userId) => {
  const allUsers = Array.from(userDataStore.keys());
  const userData = userDataStore.get(userId);
  
  if (!userData) {
    return { indexed: false, userId, totalUsers: allUsers.length, allUserIds: allUsers };
  }
  return {
    indexed: true,
    userId,
    fileName: userData.fileName,
    rowCount: userData.rowCount,
    fields: userData.fields,
    chunksCount: userData.chunks?.length,
    chunkTypes: userData.chunks?.map(c => c.type),
    indexedAt: userData.indexedAt,
    totalUsers: allUsers.length
  };
};

module.exports = {
  indexUserData,
  indexInsights,
  chat,
  clearSessionMemory,
  clearUserData,
  debugUserData,
  getUserDataStore: () => userDataStore,
};
