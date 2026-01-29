import { useState, useEffect, useRef, useCallback } from "react";
import { Link } from "react-router-dom";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { 
  BarChart3, 
  LineChart as LineChartIcon, 
  PieChart as PieChartIcon, 
  ScatterChart as ScatterChartIcon,
  Upload,
  Loader2,
  FileSpreadsheet,
  RefreshCw,
  Sparkles,
  AlertTriangle,
  TrendingUp,
  FileText,
  Image as ImageIcon,
  Gauge,
  GitBranch,
  Grid3X3,
  Layers,
  Info,
  Plus,
  CheckCircle2
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  ScatterChart,
  Scatter,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
  FunnelChart,
  Funnel,
  LabelList,
} from "recharts";
import { GaugeChart } from "@/components/charts/GaugeChart";
import { AIChatBox } from "@/components/dashboard/AIChatBox";
import Papa from "papaparse";
import * as XLSX from "xlsx";
import { loadAnalysisResults, loadAnalysisData, storeAnalysisResults, runFullAnalysis, type AnalyticsResult, type AnalysisData as EngineAnalysisData } from "@/lib/analyticsEngine";
import { removeUserItem, STORAGE_KEYS } from "@/lib/userStorage";
import { initReportQueue, addChartToReport, getReportChartCount, clearReportQueue } from "@/lib/reportBuilder";
import { API_ENDPOINTS } from "@/config/api";

interface AnalysisData {
  fileName: string;
  fileType: string;
  data: any[];
  fields: string[];
  rowCount?: number;
  timestamp: string;
}

const COLORS = ['#3b82f6', '#10b981', '#8b5cf6', '#f59e0b', '#ef4444', '#06b6d4', '#ec4899', '#84cc16'];

const VisualAnalytics = () => {
  const [analysisData, setAnalysisData] = useState<AnalysisData | null>(null);
  const [analyticsResults, setAnalyticsResults] = useState<AnalyticsResult | null>(null);
  const [activeChart, setActiveChart] = useState("bar");
  const [isLoading, setIsLoading] = useState(true);
  const [isDownloadingChart, setIsDownloadingChart] = useState(false);
  const [selectedXField, setSelectedXField] = useState<string>("");
  const [selectedYField, setSelectedYField] = useState<string>("");
  const [reportChartCount, setReportChartCount] = useState(0);
  const [isAddingToReport, setIsAddingToReport] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Update report count
  useEffect(() => {
    setReportChartCount(getReportChartCount());
  }, []);

  // Index FULL data for AI analysis - ALL columns, not just chart selections
  // This ensures AI can answer questions about ANY field combination
  const indexDataForAI = async (data: AnalysisData, analyticsRes?: AnalyticsResult | null) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        console.log("⚠️ No token, skipping AI indexing");
        return;
      }

      const totalRows = data.data?.length || 0;
      const maxRows = 500; // Limit rows to prevent payload too large
      const dataToSend = data.data?.slice(0, maxRows) || [];

      console.log("📤 Indexing FULL dataset for AI (all columns)...", {
        fileName: data.fileName,
        rows: `${dataToSend.length}/${totalRows}`,
        allFields: data.fields?.length,
        hasAnalytics: !!analyticsRes,
        insightsCount: analyticsRes?.insights?.length || 0,
        correlationsCount: analyticsRes?.correlations?.length || 0
      });

      const response = await fetch(API_ENDPOINTS.AI.INDEX, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          // Send COMPLETE dataset with ALL fields - not filtered by chart selection
          analysisData: {
            fileName: data.fileName,
            fileType: data.fileType,
            data: dataToSend,
            fields: data.fields, // ALL columns
            rowCount: totalRows,
            timestamp: data.timestamp
          },
          // Include FULL analytics for comprehensive AI context
          analyticsResults: analyticsRes ? {
            insights: analyticsRes.insights || [],
            correlations: analyticsRes.correlations || [],
            outliers: analyticsRes.outliers || [],
            numericColumns: analyticsRes.numericColumns || [],
            categoricalColumns: analyticsRes.categoricalColumns || [],
            columns: analyticsRes.columns || [],
            dateColumn: analyticsRes.dateColumn,
            recommendedXAxis: analyticsRes.recommendedXAxis,
            recommendedYAxis: analyticsRes.recommendedYAxis
          } : null,
          insights: analyticsRes?.insights || []
        }),
      });

      const result = await response.json();
      if (result.success) {
        console.log("✅ Full dataset indexed for AI:", result);
      } else {
        console.error("❌ AI indexing failed:", result.message);
      }
    } catch (error) {
      console.error("❌ Failed to index data for AI:", error);
    }
  };

  // Load data from user-scoped localStorage on mount
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      const stored = loadAnalysisData();
      const results = loadAnalysisResults();
      
      if (stored) {
        try {
          setAnalysisData(stored);
          setAnalyticsResults(results);
          
          // Index data for AI when loaded
          indexDataForAI(stored, results);
          
          // Use auto-detected fields from analytics engine if available
          if (results) {
            setSelectedXField(results.recommendedXAxis || stored.fields[0]);
            setSelectedYField(results.recommendedYAxis || stored.fields[1] || stored.fields[0]);
          } else if (stored.fields && stored.fields.length > 0) {
            setSelectedXField(stored.fields[0]);
            const numericField = stored.fields.find((field: string) => {
              const firstValue = stored.data[0]?.[field];
              return typeof firstValue === "number";
            });
            setSelectedYField(numericField || stored.fields[1] || stored.fields[0]);
          }
        } catch (error) {
          console.error("Failed to parse analysis data:", error);
        }
      }
      setIsLoading(false);
    };
    loadData();
  }, []);

  // Calculate statistics
  const calculateStats = () => {
    if (!analysisData?.data || !selectedYField) return null;
    
    const values = analysisData.data
      .map(row => Number(row[selectedYField]))
      .filter(v => !isNaN(v));
    
    if (values.length === 0) return null;

    const sum = values.reduce((a, b) => a + b, 0);
    const mean = sum / values.length;
    const sorted = [...values].sort((a, b) => a - b);
    const median = sorted[Math.floor(sorted.length / 2)];
    const variance = values.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / values.length;
    const stdDev = Math.sqrt(variance);

    return {
      mean: mean.toFixed(2),
      median: median.toFixed(2),
      stdDev: stdDev.toFixed(2),
      min: Math.min(...values).toFixed(2),
      max: Math.max(...values).toFixed(2),
      sum: sum.toFixed(2),
      count: values.length,
    };
  };

  const stats = calculateStats();

  // Download chart as PNG image
  const handleDownloadChart = useCallback(async () => {
    if (!chartContainerRef.current || !analysisData) {
      toast({ title: "No chart to download", description: "Please load data first.", variant: "destructive" });
      return;
    }
    
    setIsDownloadingChart(true);
    try {
      // Check if it's an SVG-based chart or HTML-based chart (like heatmap)
      const svgElement = chartContainerRef.current.querySelector('svg');
      
      if (svgElement) {
        // SVG-based chart (Bar, Line, Pie, Scatter, etc.)
        const clonedSvg = svgElement.cloneNode(true) as SVGElement;
        const bbox = svgElement.getBoundingClientRect();
        clonedSvg.setAttribute('width', String(bbox.width));
        clonedSvg.setAttribute('height', String(bbox.height));
        
        // Add white background
        const bgRect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        bgRect.setAttribute('width', '100%');
        bgRect.setAttribute('height', '100%');
        bgRect.setAttribute('fill', 'white');
        clonedSvg.insertBefore(bgRect, clonedSvg.firstChild);

        // Convert SVG to data URL
        const svgData = new XMLSerializer().serializeToString(clonedSvg);
        const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
        const svgUrl = URL.createObjectURL(svgBlob);

        // Create canvas and draw SVG
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const img = new window.Image();
        
        img.onload = () => {
          canvas.width = bbox.width * 2; // 2x for better quality
          canvas.height = bbox.height * 2;
          ctx?.scale(2, 2);
          ctx?.drawImage(img, 0, 0);
          
          // Convert to PNG and download
          canvas.toBlob((blob) => {
            if (blob) {
              const url = URL.createObjectURL(blob);
              const link = document.createElement('a');
              const chartType = chartTypes.find(c => c.id === activeChart)?.label || 'Chart';
              link.href = url;
              link.download = `${analysisData.fileName.replace(/\.[^/.]+$/, "")}_${chartType.replace(' ', '_')}.png`;
              link.click();
              URL.revokeObjectURL(url);
              URL.revokeObjectURL(svgUrl);
              
              toast({ title: "Chart downloaded!", description: `${chartType} saved as PNG image.` });
            }
            setIsDownloadingChart(false);
          }, 'image/png');
        };
        
        img.onerror = () => {
          // Fallback: download as SVG
          const link = document.createElement('a');
          link.href = svgUrl;
          link.download = `${analysisData.fileName.replace(/\.[^/.]+$/, "")}_chart.svg`;
          link.click();
          URL.revokeObjectURL(svgUrl);
          
          toast({ title: "Chart downloaded!", description: "Chart saved as SVG image." });
          setIsDownloadingChart(false);
        };
        
        img.src = svgUrl;
      } else {
        // HTML-based chart (Heatmap, Gauge, etc.) - use html2canvas approach
        const { default: html2canvas } = await import('html2canvas');
        
        const canvas = await html2canvas(chartContainerRef.current, {
          backgroundColor: '#ffffff',
          scale: 2,
          logging: false,
        });
        
        canvas.toBlob((blob) => {
          if (blob) {
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            const chartType = chartTypes.find(c => c.id === activeChart)?.label || 'Chart';
            link.href = url;
            link.download = `${analysisData.fileName.replace(/\.[^/.]+$/, "")}_${chartType.replace(' ', '_')}.png`;
            link.click();
            URL.revokeObjectURL(url);
            
            toast({ title: "Chart downloaded!", description: `${chartType} saved as PNG image.` });
          }
          setIsDownloadingChart(false);
        }, 'image/png');
      }
    } catch (error) {
      console.error("Chart download error:", error);
      toast({ title: "Download failed", description: "Could not download chart image.", variant: "destructive" });
      setIsDownloadingChart(false);
    }
  }, [analysisData, activeChart, toast]);

  // Get chart image as base64 for exports
  const getChartImageBase64 = useCallback(async (): Promise<string | null> => {
    if (!chartContainerRef.current) return null;
    
    try {
      const svgElement = chartContainerRef.current.querySelector('svg');
      if (!svgElement) return null;

      const clonedSvg = svgElement.cloneNode(true) as SVGElement;
      const bbox = svgElement.getBoundingClientRect();
      clonedSvg.setAttribute('width', String(bbox.width));
      clonedSvg.setAttribute('height', String(bbox.height));
      
      const bgRect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      bgRect.setAttribute('width', '100%');
      bgRect.setAttribute('height', '100%');
      bgRect.setAttribute('fill', 'white');
      clonedSvg.insertBefore(bgRect, clonedSvg.firstChild);

      const svgData = new XMLSerializer().serializeToString(clonedSvg);
      return `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(svgData)))}`;
    } catch {
      return null;
    }
  }, []);

  // Add current chart to report
  const handleAddToReport = useCallback(async () => {
    if (!analysisData) {
      toast({ title: "No data", description: "Please upload data first.", variant: "destructive" });
      return;
    }

    setIsAddingToReport(true);
    try {
      // Initialize report queue if needed
      initReportQueue(analysisData.fileName, analysisData.fileType, analysisData.rowCount || analysisData.data.length);

      // Get chart image
      const chartImage = await getChartImageBase64();
      const chartType = chartTypes.find(c => c.id === activeChart);

      // Add chart to report
      const success = addChartToReport({
        chartType: activeChart,
        chartLabel: chartType?.label || "Chart",
        xAxis: selectedXField,
        yAxis: selectedYField,
        title: `${chartType?.label || "Chart"}: ${selectedYField} by ${selectedXField}`,
        chartImageBase64: chartImage,
        dataSlice: analysisData.data.slice(0, 50),
        stats: stats ? {
          mean: stats.mean,
          median: stats.median,
          stdDev: stats.stdDev,
          min: stats.min,
          max: stats.max,
          sum: stats.sum,
          count: stats.count,
        } : null,
        insights: analyticsResults?.insights?.slice(0, 5).map(i => ({
          type: i.type,
          title: i.title,
          description: i.description,
          confidence: i.confidence,
        })) || [],
        correlations: analyticsResults?.correlations?.slice(0, 4).map(c => ({
          field1: c.field1,
          field2: c.field2,
          correlation: c.correlation,
          strength: c.strength,
        })) || [],
      });

      if (success) {
        setReportChartCount(getReportChartCount());
        toast({
          title: "Chart added to report!",
          description: `${chartType?.label} has been added. View in Report Builder.`,
        });
      } else {
        toast({ title: "Failed to add", description: "Could not add chart to report.", variant: "destructive" });
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to add chart to report.", variant: "destructive" });
    }
    setIsAddingToReport(false);
  }, [analysisData, activeChart, selectedXField, selectedYField, stats, analyticsResults, getChartImageBase64, toast]);

  // Prepare chart data
  const getChartData = () => {
    if (!analysisData?.data) return [];
    return analysisData.data.slice(0, 50); // Limit to 50 rows for performance
  };

  // Prepare pie chart data
  const getPieData = () => {
    if (!analysisData?.data || !selectedXField) return [];
    
    const counts: { [key: string]: number } = {};
    analysisData.data.forEach(row => {
      const key = String(row[selectedXField] || "Unknown");
      counts[key] = (counts[key] || 0) + (Number(row[selectedYField]) || 1);
    });

    return Object.entries(counts)
      .slice(0, 8)
      .map(([name, value]) => ({ name, value }));
  };

  // Handle file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please upload a file smaller than 5 MB.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    const fileName = file.name.toLowerCase();

    // CSV Processing
    if (fileName.endsWith(".csv")) {
      Papa.parse(file, {
        header: true,
        dynamicTyping: true,
        skipEmptyLines: true,
        complete: (results) => {
          const newData: AnalysisData = {
            fileName: file.name,
            fileType: "csv",
            data: results.data as any[],
            fields: results.meta.fields || [],
            rowCount: results.data.length,
            timestamp: new Date().toISOString(),
          };
          const analyticsRes = runFullAnalysis(newData as EngineAnalysisData);
          storeAnalysisResults(newData as EngineAnalysisData, analyticsRes);
          setAnalysisData(newData);
          setAnalyticsResults(analyticsRes);
          // Index for AI with full analytics
          indexDataForAI(newData, analyticsRes);
          if (newData.fields.length > 0) {
            setSelectedXField(newData.fields[0]);
            const numericField = newData.fields.find((field) => {
              const firstValue = (results.data[0] as any)?.[field];
              return typeof firstValue === "number";
            });
            setSelectedYField(numericField || newData.fields[1] || newData.fields[0]);
          }
          setIsLoading(false);
          toast({
            title: "Data loaded!",
            description: `Loaded ${results.data.length} rows from ${file.name}`,
          });
        },
        error: () => {
          setIsLoading(false);
          toast({
            title: "Parse error",
            description: "Failed to parse CSV file.",
            variant: "destructive",
          });
        },
      });
    }
    // Excel Processing
    else if (fileName.endsWith(".xlsx") || fileName.endsWith(".xls")) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: "array" });
          const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
          const jsonData = XLSX.utils.sheet_to_json(firstSheet);
          const fields = Object.keys((jsonData[0] as object) || {});

          const newData: AnalysisData = {
            fileName: file.name,
            fileType: "excel",
            data: jsonData as any[],
            fields: fields,
            rowCount: jsonData.length,
            timestamp: new Date().toISOString(),
          };
          const analyticsRes = runFullAnalysis(newData as EngineAnalysisData);
          storeAnalysisResults(newData as EngineAnalysisData, analyticsRes);
          setAnalysisData(newData);
          setAnalyticsResults(analyticsRes);
          // Index for AI with full analytics
          indexDataForAI(newData, analyticsRes);
          if (fields.length > 0) {
            setSelectedXField(fields[0]);
            const numericField = fields.find((field) => {
              const firstValue = (jsonData[0] as any)?.[field];
              return typeof firstValue === "number";
            });
            setSelectedYField(numericField || fields[1] || fields[0]);
          }
          setIsLoading(false);
          toast({
            title: "Data loaded!",
            description: `Loaded ${jsonData.length} rows from ${file.name}`,
          });
        } catch {
          setIsLoading(false);
          toast({
            title: "Parse error",
            description: "Failed to parse Excel file.",
            variant: "destructive",
          });
        }
      };
      reader.readAsArrayBuffer(file);
    }
    // JSON Processing
    else if (fileName.endsWith(".json")) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const jsonData = JSON.parse(e.target?.result as string);
          const dataArray = Array.isArray(jsonData) ? jsonData : [jsonData];
          const fields = Object.keys((dataArray[0] as object) || {});

          const newData: AnalysisData = {
            fileName: file.name,
            fileType: "json",
            data: dataArray,
            fields: fields,
            rowCount: dataArray.length,
            timestamp: new Date().toISOString(),
          };
          const analyticsRes = runFullAnalysis(newData as EngineAnalysisData);
          storeAnalysisResults(newData as EngineAnalysisData, analyticsRes);
          setAnalysisData(newData);
          setAnalyticsResults(analyticsRes);
          // Index for AI with full analytics
          indexDataForAI(newData, analyticsRes);
          if (fields.length > 0) {
            setSelectedXField(fields[0]);
            const numericField = fields.find((field) => {
              const firstValue = (dataArray[0] as any)?.[field];
              return typeof firstValue === "number";
            });
            setSelectedYField(numericField || fields[1] || fields[0]);
          }
          setIsLoading(false);
          toast({
            title: "Data loaded!",
            description: `Loaded ${dataArray.length} records from ${file.name}`,
          });
        } catch {
          setIsLoading(false);
          toast({
            title: "Parse error",
            description: "Failed to parse JSON file.",
            variant: "destructive",
          });
        }
      };
      reader.readAsText(file);
    } else {
      setIsLoading(false);
      toast({
        title: "Unsupported format",
        description: "Please upload CSV, Excel, or JSON files.",
        variant: "destructive",
      });
    }

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Clear data (user-scoped) - also clears Report Builder queue
  const handleClearData = () => {
    removeUserItem(STORAGE_KEYS.ANALYSIS_DATA);
    removeUserItem(STORAGE_KEYS.ANALYTICS_RESULTS);
    removeUserItem(STORAGE_KEYS.GENERATED_INSIGHTS);
    // Clear Report Builder queue as well
    clearReportQueue();
    setReportChartCount(0);
    setAnalysisData(null);
    setAnalyticsResults(null);
    setSelectedXField("");
    setSelectedYField("");
    toast({
      title: "Data cleared",
      description: "All analysis data and report queue have been cleared.",
    });
  };

  // Render empty state
  const renderEmptyState = () => (
    <div className="h-80 flex items-center justify-center border border-dashed border-border rounded-xl bg-secondary/20">
      <div className="text-center">
        <FileSpreadsheet className="h-16 w-16 mx-auto text-muted-foreground/30 mb-4" />
        <p className="text-muted-foreground mb-4">No data available for visualization</p>
        <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
          <Upload className="mr-2 h-4 w-4" />
          Upload Data
        </Button>
      </div>
    </div>
  );

  // Render loading state
  const renderLoadingState = () => (
    <div className="h-80 flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="h-12 w-12 mx-auto text-primary animate-spin mb-4" />
        <p className="text-muted-foreground">Loading visualization...</p>
      </div>
    </div>
  );

  // Render Bar Chart
  const renderBarChart = () => {
    if (!analysisData?.data?.length) return renderEmptyState();
    const chartData = getChartData();
    const dataCount = chartData.length;
    
    // Smart tick interval based on data count
    const interval = dataCount > 20 ? Math.floor(dataCount / 10) : dataCount > 10 ? 1 : 0;
    
    return (
      <ResponsiveContainer width="100%" height={450}>
        <BarChart data={chartData} margin={{ top: 20, right: 40, left: 60, bottom: 100 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis 
            dataKey={selectedXField} 
            tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
            angle={-45}
            textAnchor="end"
            height={90}
            interval={interval}
            tickFormatter={(value) => {
              const str = String(value);
              return str.length > 15 ? str.substring(0, 12) + '...' : str;
            }}
          />
          <YAxis 
            tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
            width={50}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: "hsl(var(--card))", 
              border: "1px solid hsl(var(--border))",
              borderRadius: "8px"
            }}
            formatter={(value: any) => [Number(value).toLocaleString(), selectedYField]}
          />
          <Legend 
            wrapperStyle={{ paddingTop: "20px" }}
            iconType="rect"
          />
          <Bar dataKey={selectedYField} fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    );
  };

  // Render Line Chart
  const renderLineChart = () => {
    if (!analysisData?.data?.length) return renderEmptyState();
    const chartData = getChartData();
    const dataCount = chartData.length;
    
    // Smart tick interval based on data count
    const interval = dataCount > 20 ? Math.floor(dataCount / 10) : dataCount > 10 ? 1 : 0;
    
    return (
      <ResponsiveContainer width="100%" height={450}>
        <LineChart data={chartData} margin={{ top: 20, right: 40, left: 60, bottom: 100 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis 
            dataKey={selectedXField} 
            tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
            angle={-45}
            textAnchor="end"
            height={90}
            interval={interval}
            tickFormatter={(value) => {
              const str = String(value);
              return str.length > 15 ? str.substring(0, 12) + '...' : str;
            }}
          />
          <YAxis 
            tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
            width={50}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: "hsl(var(--card))", 
              border: "1px solid hsl(var(--border))",
              borderRadius: "8px"
            }}
            formatter={(value: any) => [Number(value).toLocaleString(), selectedYField]}
          />
          <Legend 
            wrapperStyle={{ paddingTop: "20px" }}
            iconType="line"
          />
          <Line 
            type="monotone" 
            dataKey={selectedYField} 
            stroke="hsl(var(--primary))" 
            strokeWidth={2}
            dot={{ fill: "hsl(var(--primary))", strokeWidth: 2 }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    );
  };

  // Render Pie Chart
  const renderPieChart = () => {
    const pieData = getPieData();
    if (!pieData.length) return renderEmptyState();
    
    // Custom label with truncation
    const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
      const RADIAN = Math.PI / 180;
      const radius = outerRadius + 25;
      const x = cx + radius * Math.cos(-midAngle * RADIAN);
      const y = cy + radius * Math.sin(-midAngle * RADIAN);
      
      if (percent < 0.05) return null; // Hide labels for slices < 5%
      
      return (
        <text 
          x={x} 
          y={y} 
          fill="hsl(var(--foreground))" 
          textAnchor={x > cx ? 'start' : 'end'} 
          dominantBaseline="central"
          fontSize={11}
        >
          {`${(percent * 100).toFixed(0)}%`}
        </text>
      );
    };
    
    return (
      <ResponsiveContainer width="100%" height={450}>
        <PieChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
          <Pie
            data={pieData}
            cx="50%"
            cy="45%"
            labelLine={{ stroke: "hsl(var(--border))", strokeWidth: 1 }}
            label={renderCustomLabel}
            outerRadius={110}
            fill="#8884d8"
            dataKey="value"
          >
            {pieData.map((_, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip 
            contentStyle={{ 
              backgroundColor: "hsl(var(--card))", 
              border: "1px solid hsl(var(--border))",
              borderRadius: "8px"
            }}
            formatter={(value: any) => [Number(value).toLocaleString(), selectedYField]}
          />
          <Legend 
            verticalAlign="bottom" 
            height={60}
            wrapperStyle={{ paddingTop: "20px" }}
            formatter={(value) => {
              const str = String(value);
              return str.length > 20 ? str.substring(0, 17) + '...' : str;
            }}
          />
        </PieChart>
      </ResponsiveContainer>
    );
  };

  // Render Scatter Chart
  const renderScatterChart = () => {
    if (!analysisData?.data?.length) return renderEmptyState();
    const scatterData = getChartData().map(row => ({
      x: Number(row[selectedXField]) || 0,
      y: Number(row[selectedYField]) || 0,
    }));
    return (
      <ResponsiveContainer width="100%" height={450}>
        <ScatterChart margin={{ top: 20, right: 40, left: 60, bottom: 60 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis 
            type="number" 
            dataKey="x" 
            name={selectedXField}
            tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
            label={{ 
              value: selectedXField, 
              position: 'insideBottom', 
              offset: -10,
              style: { fill: "hsl(var(--muted-foreground))", fontSize: 12 }
            }}
            tickFormatter={(value) => Number(value).toLocaleString()}
          />
          <YAxis 
            type="number" 
            dataKey="y" 
            name={selectedYField}
            tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
            width={50}
            label={{ 
              value: selectedYField, 
              angle: -90, 
              position: 'insideLeft',
              style: { fill: "hsl(var(--muted-foreground))", fontSize: 12 }
            }}
            tickFormatter={(value) => Number(value).toLocaleString()}
          />
          <Tooltip 
            cursor={{ strokeDasharray: "3 3" }}
            contentStyle={{ 
              backgroundColor: "hsl(var(--card))", 
              border: "1px solid hsl(var(--border))",
              borderRadius: "8px"
            }}
            formatter={(value: any, name: string) => [Number(value).toLocaleString(), name]}
          />
          <Legend 
            wrapperStyle={{ paddingTop: "10px" }}
          />
          <Scatter name="Data Points" data={scatterData} fill="hsl(var(--primary))" />
        </ScatterChart>
      </ResponsiveContainer>
    );
  };

  // Calculate correlation between two arrays
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

  // Render Heatmap (Correlation Matrix)
  const renderHeatmap = () => {
    if (!analysisData?.data?.length) return renderEmptyState();
    
    // Find numeric columns directly from data
    const numericCols = analysisData.fields.filter(field => {
      const values = analysisData.data.map(row => row[field]);
      const numericCount = values.filter(v => typeof v === 'number' || (!isNaN(Number(v)) && v !== '' && v !== null)).length;
      return numericCount > values.length * 0.5;
    }).slice(0, 6);

    if (numericCols.length < 2) {
      return (
        <div className="h-80 flex items-center justify-center border border-dashed border-border rounded-xl bg-secondary/20">
          <div className="text-center">
            <Grid3X3 className="h-16 w-16 mx-auto text-muted-foreground/30 mb-4" />
            <p className="text-muted-foreground mb-2">Not enough numeric columns for correlation</p>
            <p className="text-sm text-muted-foreground">Upload data with 2+ numeric columns</p>
          </div>
        </div>
      );
    }

    // Calculate correlation matrix directly
    const correlationMatrix: { [key: string]: { [key: string]: number } } = {};
    
    numericCols.forEach(col1 => {
      correlationMatrix[col1] = {};
      const values1 = analysisData.data.map(row => Number(row[col1])).filter(v => !isNaN(v));
      
      numericCols.forEach(col2 => {
        if (col1 === col2) {
          correlationMatrix[col1][col2] = 1;
        } else {
          const values2 = analysisData.data.map(row => Number(row[col2])).filter(v => !isNaN(v));
          correlationMatrix[col1][col2] = calculateCorrelation(values1, values2);
        }
      });
    });

    const getColor = (value: number) => {
      if (value >= 0.7) return "bg-green-500";
      if (value >= 0.4) return "bg-green-400";
      if (value >= 0.2) return "bg-green-300";
      if (value >= -0.2) return "bg-gray-300 dark:bg-gray-600";
      if (value >= -0.4) return "bg-red-300";
      if (value >= -0.7) return "bg-red-400";
      return "bg-red-500";
    };

    return (
      <div className="overflow-x-auto py-4">
        <div className="min-w-fit px-4">
          {/* Column Headers */}
          <div className="flex mb-2">
            <div className="w-32 flex-shrink-0" />
            {numericCols.map(col => (
              <div 
                key={col} 
                className="w-24 text-xs font-medium text-center px-2"
                title={col}
              >
                <div className="truncate">
                  {col.length > 12 ? col.substring(0, 10) + '..' : col}
                </div>
              </div>
            ))}
          </div>
          
          {/* Correlation Matrix */}
          {numericCols.map(row => (
            <div key={row} className="flex items-center mb-1">
              <div 
                className="w-32 text-xs font-medium pr-3 flex-shrink-0 text-right"
                title={row}
              >
                <div className="truncate">
                  {row.length > 14 ? row.substring(0, 12) + '..' : row}
                </div>
              </div>
              {numericCols.map(col => {
                const value = correlationMatrix[row]?.[col] ?? 0;
                return (
                  <div
                    key={`${row}-${col}`}
                    className={`w-24 h-14 flex items-center justify-center text-xs font-semibold rounded mx-0.5 transition-all hover:scale-105 cursor-pointer ${getColor(value)} ${Math.abs(value) > 0.5 ? "text-white" : "text-gray-800 dark:text-gray-200"}`}
                    title={`${row} ↔ ${col}: ${(value * 100).toFixed(1)}%`}
                  >
                    {(value * 100).toFixed(0)}%
                  </div>
                );
              })}
            </div>
          ))}
          
          {/* Legend */}
          <div className="flex items-center justify-center gap-6 mt-6 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 bg-red-500 rounded shadow-sm" />
              <span className="font-medium">Strong Negative</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 bg-gray-400 rounded shadow-sm" />
              <span className="font-medium">Neutral</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 bg-green-500 rounded shadow-sm" />
              <span className="font-medium">Strong Positive</span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Render Funnel Chart
  const renderFunnelChart = () => {
    if (!analysisData?.data?.length) return renderEmptyState();
    
    // Get top categories by value for funnel
    const categoryField = analyticsResults?.categoricalColumns[0] || selectedXField;
    const valueField = analyticsResults?.numericColumns[0] || selectedYField;
    
    const aggregated: { [key: string]: number } = {};
    analysisData.data.forEach(row => {
      const key = String(row[categoryField] || "Other");
      const val = Number(row[valueField]) || 0;
      aggregated[key] = (aggregated[key] || 0) + val;
    });

    const funnelData = Object.entries(aggregated)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([name, value], index) => ({
        name: name.length > 20 ? name.substring(0, 17) + '...' : name,
        value,
        fill: COLORS[index % COLORS.length],
      }));

    if (funnelData.length === 0) {
      return (
        <div className="h-80 flex items-center justify-center border border-dashed border-border rounded-xl bg-secondary/20">
          <div className="text-center">
            <GitBranch className="h-16 w-16 mx-auto text-muted-foreground/30 mb-4" />
            <p className="text-muted-foreground">No categorical data for funnel chart</p>
          </div>
        </div>
      );
    }

    return (
      <ResponsiveContainer width="100%" height={450}>
        <FunnelChart margin={{ top: 20, right: 40, left: 40, bottom: 20 }}>
          <Tooltip
            contentStyle={{
              backgroundColor: "hsl(var(--card))",
              border: "1px solid hsl(var(--border))",
              borderRadius: "8px",
            }}
            formatter={(value: any) => [Number(value).toLocaleString(), valueField]}
          />
          <Funnel dataKey="value" data={funnelData} isAnimationActive>
            <LabelList 
              position="center" 
              fill="#fff" 
              stroke="none" 
              dataKey="name"
              style={{ fontSize: 12, fontWeight: 600 }}
            />
          </Funnel>
        </FunnelChart>
      </ResponsiveContainer>
    );
  };

  // Render Gauge Chart (KPI)
  const renderGaugeChart = () => {
    if (!analysisData?.data?.length || !stats) {
      return (
        <div className="h-80 flex items-center justify-center border border-dashed border-border rounded-xl bg-secondary/20">
          <div className="text-center">
            <Gauge className="h-16 w-16 mx-auto text-muted-foreground/30 mb-4" />
            <p className="text-muted-foreground">No numeric data for gauge chart</p>
          </div>
        </div>
      );
    }

    const mean = parseFloat(stats.mean);
    const max = parseFloat(stats.max);
    const percentage = Math.min(100, Math.round((mean / max) * 100));

    return (
      <div className="min-h-[450px] flex flex-col items-center justify-center gap-8 py-6">
        <GaugeChart
          value={percentage}
          maxValue={100}
          label={selectedYField.length > 25 ? selectedYField.substring(0, 22) + '...' : selectedYField}
          unit="%"
          size="lg"
          thresholds={{ low: 33, mid: 66 }}
        />
        <div className="grid grid-cols-3 gap-8 text-center w-full max-w-md px-4">
          <div className="p-3 rounded-lg bg-primary/10">
            <p className="text-2xl font-bold text-primary">{Number(stats.mean).toLocaleString()}</p>
            <p className="text-xs text-muted-foreground mt-1">Average</p>
          </div>
          <div className="p-3 rounded-lg bg-green-500/10">
            <p className="text-2xl font-bold text-green-500">{Number(stats.max).toLocaleString()}</p>
            <p className="text-xs text-muted-foreground mt-1">Maximum</p>
          </div>
          <div className="p-3 rounded-lg bg-amber-500/10">
            <p className="text-2xl font-bold text-amber-500">{Number(stats.min).toLocaleString()}</p>
            <p className="text-xs text-muted-foreground mt-1">Minimum</p>
          </div>
        </div>
      </div>
    );
  };

  // Render Stacked Area Chart
  const renderStackedAreaChart = () => {
    if (!analysisData?.data?.length) return renderEmptyState();
    
    const numericCols = analyticsResults?.numericColumns.slice(0, 4) || [selectedYField];
    if (numericCols.length < 2) {
      return (
        <div className="h-80 flex items-center justify-center border border-dashed border-border rounded-xl bg-secondary/20">
          <div className="text-center">
            <Layers className="h-16 w-16 mx-auto text-muted-foreground/30 mb-4" />
            <p className="text-muted-foreground mb-2">Need 2+ numeric columns for stacked area</p>
            <p className="text-sm text-muted-foreground">Upload data with multiple metrics</p>
          </div>
        </div>
      );
    }

    const chartData = getChartData();
    const dataCount = chartData.length;
    const interval = dataCount > 20 ? Math.floor(dataCount / 10) : dataCount > 10 ? 1 : 0;

    return (
      <ResponsiveContainer width="100%" height={450}>
        <AreaChart data={chartData} margin={{ top: 20, right: 40, left: 60, bottom: 100 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis
            dataKey={selectedXField}
            tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
            angle={-45}
            textAnchor="end"
            height={90}
            interval={interval}
            tickFormatter={(value) => {
              const str = String(value);
              return str.length > 15 ? str.substring(0, 12) + '...' : str;
            }}
          />
          <YAxis 
            tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
            width={50}
            tickFormatter={(value) => Number(value).toLocaleString()}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "hsl(var(--card))",
              border: "1px solid hsl(var(--border))",
              borderRadius: "8px",
            }}
            formatter={(value: any, name: string) => [Number(value).toLocaleString(), name]}
          />
          <Legend 
            wrapperStyle={{ paddingTop: "20px" }}
            formatter={(value) => {
              const str = String(value);
              return str.length > 20 ? str.substring(0, 17) + '...' : str;
            }}
          />
          {numericCols.map((col, index) => (
            <Area
              key={col}
              type="monotone"
              dataKey={col}
              stackId="1"
              stroke={COLORS[index % COLORS.length]}
              fill={COLORS[index % COLORS.length]}
              fillOpacity={0.6}
            />
          ))}
        </AreaChart>
      </ResponsiveContainer>
    );
  };

  // Render active chart
  const renderChart = () => {
    if (isLoading) return renderLoadingState();
    switch (activeChart) {
      case "bar": return renderBarChart();
      case "line": return renderLineChart();
      case "pie": return renderPieChart();
      case "scatter": return renderScatterChart();
      case "heatmap": return renderHeatmap();
      case "funnel": return renderFunnelChart();
      case "gauge": return renderGaugeChart();
      case "area": return renderStackedAreaChart();
      default: return renderBarChart();
    }
  };

  const chartTypes = [
    { id: "bar", label: "Bar Chart", icon: BarChart3 },
    { id: "line", label: "Line Chart", icon: LineChartIcon },
    { id: "pie", label: "Pie Chart", icon: PieChartIcon },
    { id: "scatter", label: "Scatter Plot", icon: ScatterChartIcon },
    { id: "area", label: "Stacked Area", icon: Layers },
    { id: "heatmap", label: "Heatmap", icon: Grid3X3 },
    { id: "funnel", label: "Funnel", icon: GitBranch },
    { id: "gauge", label: "Gauge", icon: Gauge },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Hidden file input */}
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          accept=".csv,.xlsx,.xls,.json"
          onChange={handleFileUpload}
        />

        {/* Report Builder Tip */}
        {reportChartCount > 0 && (
          <Alert className="border-primary/50 bg-primary/10">
            <CheckCircle2 className="h-4 w-4 text-primary" />
            <AlertDescription className="flex items-center justify-between">
              <span className="text-primary">
                <strong>{reportChartCount} chart{reportChartCount !== 1 ? "s" : ""}</strong> added to your report. 
                For best results, download as PDF from the Report Builder.
              </span>
              <Link to="/dashboard/report">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="ml-4 border-primary/50 text-primary hover:bg-primary/20"
                >
                  <FileText className="mr-2 h-3 w-3" />
                  View Report
                </Button>
              </Link>
            </AlertDescription>
          </Alert>
        )}

        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Visual Analytics</h1>
            <p className="text-muted-foreground">
              {analysisData 
                ? `Analyzing: ${analysisData.fileName} (${analysisData.rowCount} rows)`
                : "Upload data to explore interactive visualizations"
              }
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => fileInputRef.current?.click()}>
              <Upload className="mr-2 h-4 w-4" />
              Upload Data
            </Button>
            {analysisData && (
              <Button variant="outline" onClick={handleClearData}>
                <RefreshCw className="mr-2 h-4 w-4" />
                Clear
              </Button>
            )}
          </div>
        </div>

        {/* Field Selectors */}
        {analysisData && analysisData.fields.length > 0 && (
          <Card className="card-shadow">
            <CardContent className="p-4">
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-2">
                  <label className="text-sm font-medium">X-Axis:</label>
                  <select
                    value={selectedXField}
                    onChange={(e) => setSelectedXField(e.target.value)}
                    className="px-3 py-1.5 rounded-md border border-border bg-background text-sm"
                  >
                    {analysisData.fields.map((field) => (
                      <option key={field} value={field}>{field}</option>
                    ))}
                  </select>
                </div>
                <div className="flex items-center gap-2">
                  <label className="text-sm font-medium">Y-Axis:</label>
                  <select
                    value={selectedYField}
                    onChange={(e) => setSelectedYField(e.target.value)}
                    className="px-3 py-1.5 rounded-md border border-border bg-background text-sm"
                  >
                    {analysisData.fields.map((field) => (
                      <option key={field} value={field}>{field}</option>
                    ))}
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Chart Type Tabs */}
        <Tabs value={activeChart} onValueChange={setActiveChart} className="space-y-6">
          <TabsList className="grid grid-cols-4 md:grid-cols-8 w-full max-w-4xl">
            {chartTypes.map((chart) => (
              <TabsTrigger key={chart.id} value={chart.id} className="flex items-center gap-1 text-xs md:text-sm">
                <chart.icon className="h-4 w-4" />
                <span className="hidden sm:inline">{chart.label.split(" ")[0]}</span>
              </TabsTrigger>
            ))}
          </TabsList>

          {chartTypes.map((chart) => (
            <TabsContent key={chart.id} value={chart.id} className="transition-all duration-300">
              <Card className="card-shadow">
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <chart.icon className="h-5 w-5 text-primary" />
                      {chart.label}
                    </CardTitle>
                    <CardDescription>
                      {analysisData 
                        ? `Showing ${selectedYField} by ${selectedXField}`
                        : "Upload data to generate this visualization"
                      }
                    </CardDescription>
                  </div>
                  {analysisData && (
                    <div className="flex items-center gap-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={handleAddToReport}
                        disabled={isAddingToReport}
                        className="border-primary/50 hover:bg-primary/10"
                      >
                        {isAddingToReport ? (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                          <Plus className="mr-2 h-4 w-4" />
                        )}
                        Include in Report
                        {reportChartCount > 0 && (
                          <Badge variant="secondary" className="ml-2 h-5 px-1.5">
                            {reportChartCount}
                          </Badge>
                        )}
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={handleDownloadChart}
                        disabled={isDownloadingChart}
                      >
                        {isDownloadingChart ? (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                          <ImageIcon className="mr-2 h-4 w-4" />
                        )}
                        Download Chart
                      </Button>
                    </div>
                  )}
                </CardHeader>
                <CardContent>
                  <div ref={chartContainerRef}>
                    {renderChart()}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          ))}
        </Tabs>

        {/* Quick Stats */}
        <Card className="card-shadow">
          <CardHeader>
            <CardTitle>Quick Statistics</CardTitle>
            <CardDescription>
              {stats 
                ? `Statistics for ${selectedYField} (${stats.count} values)`
                : "Upload data to see summary statistics"
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
              {[
                { label: "Mean", value: stats?.mean },
                { label: "Median", value: stats?.median },
                { label: "Std Dev", value: stats?.stdDev },
                { label: "Min", value: stats?.min },
                { label: "Max", value: stats?.max },
                { label: "Sum", value: stats?.sum },
                { label: "Count", value: stats?.count },
              ].map((stat) => (
                <div key={stat.label} className="p-4 rounded-lg bg-secondary/30 text-center">
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  <p className={`text-xl font-bold ${stat.value ? "" : "text-muted-foreground/50"}`}>
                    {stat.value ?? "--"}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Correlation Matrix */}
        {analyticsResults && analyticsResults.correlations.length > 0 && (
          <Card className="card-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                Correlation Analysis
              </CardTitle>
              <CardDescription>
                Automatically detected correlations between numeric columns
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {analyticsResults.correlations.map((corr, i) => (
                  <div 
                    key={i} 
                    className={`p-4 rounded-lg border ${
                      corr.strength === 'Strong' 
                        ? 'border-green-500/50 bg-green-500/5' 
                        : corr.strength === 'Moderate'
                        ? 'border-amber-500/50 bg-amber-500/5'
                        : 'border-border bg-secondary/20'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <Badge variant={corr.strength === 'Strong' ? 'default' : 'secondary'}>
                        {corr.strength}
                      </Badge>
                      <span className={`text-lg font-bold ${
                        corr.correlation > 0 ? 'text-green-500' : 'text-red-500'
                      }`}>
                        {(corr.correlation * 100).toFixed(0)}%
                      </span>
                    </div>
                    <p className="text-sm font-medium">{corr.field1}</p>
                    <p className="text-xs text-muted-foreground">↔</p>
                    <p className="text-sm font-medium">{corr.field2}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Outlier Detection */}
        {analyticsResults && analyticsResults.outliers.length > 0 && (
          <Card className="card-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-amber-500" />
                Outlier Detection
              </CardTitle>
              <CardDescription>
                Unusual values detected using IQR (Interquartile Range) method
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analyticsResults.outliers.map((outlier, i) => (
                  <div key={i} className="p-4 rounded-lg border border-amber-500/30 bg-amber-500/5">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">{outlier.field}</span>
                      <Badge variant="outline" className="border-amber-500 text-amber-500">
                        {outlier.outliers.length} outlier{outlier.outliers.length > 1 ? 's' : ''}
                      </Badge>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {outlier.outliers.slice(0, 8).map((o, j) => (
                        <span 
                          key={j} 
                          className="px-2 py-1 text-xs rounded bg-amber-500/20 text-amber-700 dark:text-amber-300"
                        >
                          Row {o.index + 1}: {o.value.toLocaleString()}
                        </span>
                      ))}
                      {outlier.outliers.length > 8 && (
                        <span className="px-2 py-1 text-xs rounded bg-secondary text-muted-foreground">
                          +{outlier.outliers.length - 8} more
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Auto-Detected Columns Info */}
        {analyticsResults && (
          <Card className="card-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                Auto-Detected Column Types
              </CardTitle>
              <CardDescription>
                Intelligent column detection for optimal visualization
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {analyticsResults.dateColumn && (
                  <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/30">
                    <p className="text-sm text-muted-foreground mb-1">Date Column</p>
                    <p className="font-medium text-blue-500">{analyticsResults.dateColumn}</p>
                  </div>
                )}
                <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/30">
                  <p className="text-sm text-muted-foreground mb-1">Numeric Columns ({analyticsResults.numericColumns.length})</p>
                  <p className="font-medium text-green-500 text-sm">
                    {analyticsResults.numericColumns.slice(0, 4).join(', ')}
                    {analyticsResults.numericColumns.length > 4 && ` +${analyticsResults.numericColumns.length - 4} more`}
                  </p>
                </div>
                <div className="p-4 rounded-lg bg-purple-500/10 border border-purple-500/30">
                  <p className="text-sm text-muted-foreground mb-1">Categorical Columns ({analyticsResults.categoricalColumns.length})</p>
                  <p className="font-medium text-purple-500 text-sm">
                    {analyticsResults.categoricalColumns.slice(0, 4).join(', ') || 'None detected'}
                    {analyticsResults.categoricalColumns.length > 4 && ` +${analyticsResults.categoricalColumns.length - 4} more`}
                  </p>
                </div>
              </div>
              <div className="mt-4 p-3 rounded-lg bg-primary/5 border border-primary/20">
                <p className="text-sm">
                  <span className="font-medium">Recommended:</span> Use <span className="text-primary font-medium">{analyticsResults.recommendedXAxis}</span> for X-axis and <span className="text-primary font-medium">{analyticsResults.recommendedYAxis}</span> for Y-axis
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Data Preview */}
        {analysisData && analysisData.data.length > 0 && (
          <Card className="card-shadow">
            <CardHeader>
              <CardTitle>Data Preview</CardTitle>
              <CardDescription>
                Showing first 10 rows of {analysisData.rowCount} total rows
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      {analysisData.fields.slice(0, 6).map((field) => (
                        <th key={field} className="px-4 py-2 text-left font-medium text-muted-foreground">
                          {field}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {analysisData.data.slice(0, 10).map((row, i) => (
                      <tr key={i} className="border-b border-border/50 hover:bg-secondary/30">
                        {analysisData.fields.slice(0, 6).map((field) => (
                          <td key={field} className="px-4 py-2">
                            {String(row[field] ?? "-")}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* AI Chat Box */}
      <AIChatBox hasData={!!analysisData} />
    </DashboardLayout>
  );
};

export default VisualAnalytics;
