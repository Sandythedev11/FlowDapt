import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Sparkles, 
  TrendingUp, 
  TrendingDown,
  AlertTriangle, 
  Lightbulb,
  RefreshCw,
  ThumbsUp,
  ThumbsDown,
  Loader2,
  FileSpreadsheet,
  Upload,
  BarChart3,
  Target,
  Zap,
  Link2,
  Gauge
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { toast as sonnerToast } from "sonner";
import { 
  loadAnalysisResults,
  loadAnalysisData,
  runFullAnalysis, 
  storeAnalysisResults,
  type Insight,
  type AnalysisData,
  type AnalyticsResult
} from "@/lib/analyticsEngine";
import { GaugeChart } from "@/components/charts/GaugeChart";
import { AIChatBox } from "@/components/dashboard/AIChatBox";
import { SHORTCUTS } from "@/hooks/useKeyboardShortcuts";



const getInsightIcon = (type: string, category?: string) => {
  if (category === 'Seasonality') return BarChart3;
  if (category === 'Performance') return Target;
  switch (type) {
    case "trend": return TrendingUp;
    case "anomaly": return AlertTriangle;
    case "recommendation": return Lightbulb;
    case "summary": return BarChart3;
    case "pattern": return Target;
    case "correlation": return Link2;
    case "outlier": return AlertTriangle;
    default: return Sparkles;
  }
};

const getInsightColor = (type: string, category?: string) => {
  if (category === 'Seasonality') return "text-teal-500 bg-teal-500/10";
  if (category === 'Performance') return "text-emerald-500 bg-emerald-500/10";
  if (category === 'Statistics') return "text-slate-500 bg-slate-500/10";
  switch (type) {
    case "trend": return "text-green-500 bg-green-500/10";
    case "anomaly": return "text-amber-500 bg-amber-500/10";
    case "recommendation": return "text-blue-500 bg-blue-500/10";
    case "summary": return "text-purple-500 bg-purple-500/10";
    case "pattern": return "text-cyan-500 bg-cyan-500/10";
    case "correlation": return "text-indigo-500 bg-indigo-500/10";
    case "outlier": return "text-orange-500 bg-orange-500/10";
    default: return "text-primary bg-primary/10";
  }
};

const Insights = () => {
  const [analysisData, setAnalysisData] = useState<AnalysisData | null>(null);
  const [analyticsResults, setAnalyticsResults] = useState<AnalyticsResult | null>(null);
  const [insights, setInsights] = useState<Insight[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [feedback, setFeedback] = useState<{ [key: string]: "helpful" | "not-helpful" | null }>({});
  const navigate = useNavigate();
  const { toast } = useToast();

  // Handle feedback click
  const handleFeedback = (insightId: string, type: "helpful" | "not-helpful") => {
    setFeedback(prev => {
      const currentFeedback = prev[insightId];
      // If clicking the same button, toggle it off
      if (currentFeedback === type) {
        sonnerToast.success("Feedback removed");
        return { ...prev, [insightId]: null };
      }
      // Otherwise set the new feedback
      sonnerToast.success("Thanks for your feedback!");
      return { ...prev, [insightId]: type };
    });
  };

  // Load data and insights from analytics engine on mount
  useEffect(() => {
    loadDataAndInsights();
  }, []);

  const loadDataAndInsights = () => {
    setIsLoading(true);
    const stored = loadAnalysisData();
    const results = loadAnalysisResults();
    
    if (stored) {
      try {
        setAnalysisData(stored);
        setAnalyticsResults(results);
        
        // Load pre-generated insights from analytics engine
        if (results && results.insights.length > 0) {
          setInsights(results.insights);
        } else {
          // Fallback: run analysis if no results stored
          const newResults = runFullAnalysis(stored);
          storeAnalysisResults(stored, newResults);
          setInsights(newResults.insights);
          setAnalyticsResults(newResults);
        }
      } catch (error) {
        console.error("Failed to parse analysis data:", error);
      }
    }
    setIsLoading(false);
  };

  const handleGenerateNewInsights = () => {
    if (!analysisData) {
      toast({
        title: "No data available",
        description: "Please upload a dataset first to generate insights.",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    
    // Re-run full analysis
    setTimeout(() => {
      const newResults = runFullAnalysis(analysisData);
      storeAnalysisResults(analysisData, newResults);
      setInsights(newResults.insights);
      setAnalyticsResults(newResults);
      setIsGenerating(false);
      toast({
        title: "Insights regenerated!",
        description: `Generated ${newResults.insights.length} insights with ${newResults.correlations.length} correlations and ${newResults.outliers.length} outlier detections.`,
      });
    }, 1500);
  };

  const handleUploadData = () => {
    navigate("/dashboard/upload");
  };

  // Calculate summary stats
  const trendCount = insights.filter(i => i.type === "trend").length;
  const anomalyCount = insights.filter(i => i.type === "anomaly" || i.type === "outlier").length;
  const recommendationCount = insights.filter(i => i.type === "recommendation").length;
  const correlationCount = insights.filter(i => i.type === "correlation").length;

  // Calculate KPIs from data
  const calculateKPIs = () => {
    if (!analysisData?.data || !analyticsResults) return null;

    const numericCols = analyticsResults.numericColumns;
    if (numericCols.length === 0) return null;

    const data = analysisData.data;
    const primaryCol = numericCols[0];
    const values = data.map(r => Number(r[primaryCol])).filter(v => !isNaN(v));
    
    if (values.length === 0) return null;

    const sum = values.reduce((a, b) => a + b, 0);
    const mean = sum / values.length;
    const max = Math.max(...values);
    const min = Math.min(...values);

    // Calculate data quality score (based on completeness)
    const totalCells = data.length * analysisData.fields.length;
    const nullCells = data.reduce((count, row) => {
      return count + analysisData.fields.filter(f => row[f] === null || row[f] === undefined || row[f] === "").length;
    }, 0);
    const dataQuality = Math.round(((totalCells - nullCells) / totalCells) * 100);

    // Calculate trend score (positive trend = higher score)
    const mid = Math.floor(values.length / 2);
    const firstHalf = values.slice(0, mid);
    const secondHalf = values.slice(mid);
    const firstAvg = firstHalf.reduce((a, b) => a + b, 0) / (firstHalf.length || 1);
    const secondAvg = secondHalf.reduce((a, b) => a + b, 0) / (secondHalf.length || 1);
    const trendScore = Math.min(100, Math.max(0, 50 + ((secondAvg - firstAvg) / (firstAvg || 1)) * 100));

    // Calculate performance score (how close to max)
    const performanceScore = Math.round((mean / max) * 100);

    // Calculate insight coverage
    const insightCoverage = Math.min(100, Math.round((insights.length / 10) * 100));

    return {
      dataQuality,
      trendScore: Math.round(trendScore),
      performanceScore,
      insightCoverage,
      primaryColumn: primaryCol,
      mean,
      max,
    };
  };

  const kpis = calculateKPIs();

  // Loading state
  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <Loader2 className="h-12 w-12 mx-auto text-primary animate-spin mb-4" />
            <p className="text-muted-foreground">Loading insights...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // Empty state - no data
  if (!analysisData) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold flex items-center gap-2">
                <Sparkles className="h-6 w-6 text-primary" />
                AI Insights
              </h1>
              <span className="text-[10px] text-muted-foreground/50 font-mono bg-secondary/40 px-1.5 py-0.5 rounded">
                {SHORTCUTS.INSIGHTS.label}
              </span>
            </div>
            <p className="text-muted-foreground">
              AI-generated insights and recommendations from your data
            </p>
          </div>

          <Card className="card-shadow">
            <CardContent className="p-12 text-center">
              <div className="w-20 h-20 mx-auto rounded-full bg-primary/10 flex items-center justify-center mb-6">
                <FileSpreadsheet className="h-10 w-10 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">No Data Available</h3>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                Upload a dataset to generate AI-powered insights. We support CSV, Excel, and JSON files up to 5 MB.
              </p>
              <Button variant="gradient" onClick={handleUploadData}>
                <Upload className="mr-2 h-4 w-4" />
                Upload Data
              </Button>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold flex items-center gap-2">
                <Sparkles className="h-6 w-6 text-primary" />
                AI Insights
              </h1>
              <span className="text-[10px] text-muted-foreground/50 font-mono bg-secondary/40 px-1.5 py-0.5 rounded">
                {SHORTCUTS.INSIGHTS.label}
              </span>
            </div>
            <p className="text-muted-foreground">
              Analyzing: {analysisData.fileName} ({analysisData.rowCount || analysisData.data.length} records)
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleUploadData}>
              <Upload className="mr-2 h-4 w-4" />
              New Data
            </Button>
            <Button 
              variant="gradient" 
              onClick={handleGenerateNewInsights}
              disabled={isGenerating}
            >
              {isGenerating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Regenerate Insights
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Insights Summary */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
          <Card className="card-shadow">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <Sparkles className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{insights.length}</p>
                <p className="text-sm text-muted-foreground">Total Insights</p>
              </div>
            </CardContent>
          </Card>
          <Card className="card-shadow">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-green-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{trendCount}</p>
                <p className="text-sm text-muted-foreground">Trends</p>
              </div>
            </CardContent>
          </Card>
          <Card className="card-shadow">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center">
                <AlertTriangle className="h-6 w-6 text-amber-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{anomalyCount}</p>
                <p className="text-sm text-muted-foreground">Anomalies</p>
              </div>
            </CardContent>
          </Card>
          <Card className="card-shadow">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-indigo-500/10 flex items-center justify-center">
                <Link2 className="h-6 w-6 text-indigo-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{correlationCount}</p>
                <p className="text-sm text-muted-foreground">Correlations</p>
              </div>
            </CardContent>
          </Card>
          <Card className="card-shadow">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center">
                <Lightbulb className="h-6 w-6 text-blue-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{recommendationCount}</p>
                <p className="text-sm text-muted-foreground">Tips</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* KPI Gauge Charts */}
        {kpis && (
          <Card className="card-shadow">
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-6">
                <Gauge className="h-5 w-5 text-primary" />
                <h2 className="text-lg font-semibold">Key Performance Indicators</h2>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="flex flex-col items-center p-4 rounded-xl bg-secondary/30 hover:bg-secondary/50 transition-colors">
                  <GaugeChart
                    value={kpis.dataQuality}
                    maxValue={100}
                    label="Data Quality"
                    unit="%"
                    size="sm"
                    thresholds={{ low: 50, mid: 80 }}
                  />
                  <p className="text-xs text-muted-foreground mt-2 text-center">
                    Completeness of your dataset
                  </p>
                </div>
                
                <div className="flex flex-col items-center p-4 rounded-xl bg-secondary/30 hover:bg-secondary/50 transition-colors">
                  <GaugeChart
                    value={kpis.trendScore}
                    maxValue={100}
                    label="Trend Score"
                    unit="%"
                    size="sm"
                    thresholds={{ low: 40, mid: 60 }}
                  />
                  <p className="text-xs text-muted-foreground mt-2 text-center">
                    Overall data trend direction
                  </p>
                </div>
                
                <div className="flex flex-col items-center p-4 rounded-xl bg-secondary/30 hover:bg-secondary/50 transition-colors">
                  <GaugeChart
                    value={kpis.performanceScore}
                    maxValue={100}
                    label="Performance"
                    unit="%"
                    size="sm"
                    thresholds={{ low: 33, mid: 66 }}
                  />
                  <p className="text-xs text-muted-foreground mt-2 text-center">
                    Avg vs max for {kpis.primaryColumn}
                  </p>
                </div>
                
                <div className="flex flex-col items-center p-4 rounded-xl bg-secondary/30 hover:bg-secondary/50 transition-colors">
                  <GaugeChart
                    value={kpis.insightCoverage}
                    maxValue={100}
                    label="Insight Coverage"
                    unit="%"
                    size="sm"
                    thresholds={{ low: 30, mid: 60 }}
                  />
                  <p className="text-xs text-muted-foreground mt-2 text-center">
                    Analysis depth achieved
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Insights Cards */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Generated Insights</h2>
          
          {insights.length === 0 ? (
            <Card className="card-shadow">
              <CardContent className="p-8 text-center">
                <Zap className="h-12 w-12 mx-auto text-muted-foreground/30 mb-4" />
                <p className="text-muted-foreground">No insights could be generated from this dataset.</p>
                <p className="text-sm text-muted-foreground mt-2">Try uploading a dataset with more numeric data.</p>
              </CardContent>
            </Card>
          ) : (
            insights.map((insight) => {
              const IconComponent = getInsightIcon(insight.type, insight.category);
              const colorClasses = getInsightColor(insight.type, insight.category);
              
              return (
                <Card key={insight.id} className="card-shadow hover:card-shadow-hover transition-all duration-300">
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row md:items-start gap-4">
                      <div className={`w-12 h-12 rounded-xl ${colorClasses.split(" ")[1]} flex items-center justify-center shrink-0`}>
                        <IconComponent className={`h-6 w-6 ${colorClasses.split(" ")[0]}`} />
                      </div>
                      <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                          <h3 className="font-semibold">{insight.title}</h3>
                          <Badge variant="secondary">{insight.category}</Badge>
                          <Badge 
                            variant="outline" 
                            className={
                              insight.confidence === "High" 
                                ? "border-green-500 text-green-500" 
                                : insight.confidence === "Medium"
                                ? "border-amber-500 text-amber-500"
                                : "border-gray-500 text-gray-500"
                            }
                          >
                            {insight.confidence} Confidence
                          </Badge>
                          {insight.change !== undefined && (
                            <Badge 
                              variant="outline"
                              className={insight.change > 0 ? "border-green-500 text-green-500" : "border-red-500 text-red-500"}
                            >
                              {insight.change > 0 ? (
                                <TrendingUp className="h-3 w-3 mr-1" />
                              ) : (
                                <TrendingDown className="h-3 w-3 mr-1" />
                              )}
                              {Math.abs(insight.change).toFixed(1)}%
                            </Badge>
                          )}
                        </div>
                        <p className="text-muted-foreground">{insight.description}</p>
                        <div className="flex items-center gap-2 mt-4">
                          <Button 
                            variant={feedback[insight.id] === "helpful" ? "default" : "ghost"}
                            size="sm"
                            className={feedback[insight.id] === "helpful" ? "bg-green-500 hover:bg-green-600 text-white" : ""}
                            onClick={() => handleFeedback(insight.id, "helpful")}
                          >
                            <ThumbsUp className={`mr-1 h-4 w-4 ${feedback[insight.id] === "helpful" ? "fill-current" : ""}`} />
                            Helpful
                          </Button>
                          <Button 
                            variant={feedback[insight.id] === "not-helpful" ? "default" : "ghost"}
                            size="sm"
                            className={feedback[insight.id] === "not-helpful" ? "bg-red-500 hover:bg-red-600 text-white" : ""}
                            onClick={() => handleFeedback(insight.id, "not-helpful")}
                          >
                            <ThumbsDown className={`mr-1 h-4 w-4 ${feedback[insight.id] === "not-helpful" ? "fill-current" : ""}`} />
                            Not Helpful
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>

        {/* More Data CTA */}
        <Card className="card-shadow">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 mx-auto rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <Sparkles className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Want different insights?</h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Upload a different dataset or visit Visual Analytics to explore your data with interactive charts.
            </p>
            <div className="flex justify-center gap-3">
              <Button variant="outline" onClick={handleUploadData}>
                <Upload className="mr-2 h-4 w-4" />
                Upload New Data
              </Button>
              <Button variant="gradient" onClick={() => navigate("/dashboard/analytics")}>
                <BarChart3 className="mr-2 h-4 w-4" />
                View Charts
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* AI Chat Box */}
      <AIChatBox hasData={!!analysisData} />
    </DashboardLayout>
  );
};

export default Insights;
