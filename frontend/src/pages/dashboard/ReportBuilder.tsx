import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  FileText,
  Download,
  Trash2,
  ChevronUp,
  ChevronDown,
  BarChart3,
  LineChart,
  PieChart,
  ScatterChart,
  Layers,
  Grid3X3,
  GitBranch,
  Gauge,
  FileWarning,
  Sparkles,
  ArrowRight,
  MessageCircle,
  Lightbulb,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";
import {
  getReportQueue,
  removeChartFromReport,
  reorderCharts,
  generateReportHTML,
  type ReportData,
  type ReportChart,
  type AIChatMessage,
} from "@/lib/reportBuilder";
import { loadGeneratedInsights, loadAnalysisData } from "@/lib/analyticsEngine";
import { getUserItem, STORAGE_KEYS } from "@/lib/userStorage";

const chartIcons: Record<string, any> = {
  bar: BarChart3,
  line: LineChart,
  pie: PieChart,
  scatter: ScatterChart,
  area: Layers,
  heatmap: Grid3X3,
  funnel: GitBranch,
  gauge: Gauge,
};

const ReportBuilder = () => {
  const [report, setReport] = useState<ReportData | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [includeInsights, setIncludeInsights] = useState(true);
  const [includeAIChat, setIncludeAIChat] = useState(false);
  const [aiChatMessages, setAiChatMessages] = useState<AIChatMessage[]>([]);
  const [hasAIChat, setHasAIChat] = useState(false);
  const { toast } = useToast();

  // Load report queue and AI chat on mount
  useEffect(() => {
    const loadReport = () => {
      const data = getReportQueue();
      setReport(data);
      
      // Load AI chat history
      const chatHistory = getUserItem<AIChatMessage[]>(STORAGE_KEYS.AI_CHAT_HISTORY, []);
      setAiChatMessages(chatHistory);
      setHasAIChat(chatHistory.length > 0);
    };
    loadReport();
    
    // Listen for storage changes
    const handleStorage = () => loadReport();
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  const handleRemoveChart = (chartId: string) => {
    removeChartFromReport(chartId);
    setReport(getReportQueue());
    toast({ title: "Chart removed", description: "Chart has been removed from the report." });
  };

  const handleMoveUp = (index: number) => {
    if (index > 0) {
      reorderCharts(index, index - 1);
      setReport(getReportQueue());
    }
  };

  const handleMoveDown = (index: number) => {
    if (report && index < report.charts.length - 1) {
      reorderCharts(index, index + 1);
      setReport(getReportQueue());
    }
  };

  const handleGeneratePDF = async () => {
    if (!report || report.charts.length === 0) {
      toast({ title: "No charts", description: "Add charts to generate a report.", variant: "destructive" });
      return;
    }

    setIsGenerating(true);
    try {
      // Load insights and analysis data for quick stats
      const allInsights = loadGeneratedInsights();
      const analysisData = loadAnalysisData();
      
      // Calculate quick stats from analysis data
      let quickStats = null;
      if (analysisData?.data && report.charts.length > 0) {
        const firstChart = report.charts[0];
        if (firstChart.stats) {
          quickStats = firstChart.stats;
        }
      }

      const htmlContent = generateReportHTML(report, {
        includeInsights,
        includeAIChat,
        aiChatMessages: includeAIChat ? aiChatMessages : [],
        allInsights: includeInsights ? allInsights : [],
        quickStats,
      });
      
      const blob = new Blob([htmlContent], { type: "text/html;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${report.fileName.replace(/\.[^/.]+$/, "")}_report.html`;
      link.click();
      URL.revokeObjectURL(url);

      toast({
        title: "Report generated!",
        description: "Your comprehensive report has been downloaded.",
      });
    } catch (error) {
      toast({ title: "Generation failed", description: "Could not generate report.", variant: "destructive" });
    }
    setIsGenerating(false);
  };

  const getChartIcon = (chartType: string) => {
    const Icon = chartIcons[chartType] || BarChart3;
    return <Icon className="h-5 w-5" />;
  };

  // Empty state
  if (!report || report.charts.length === 0) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-bold">Report Builder</h1>
            <p className="text-muted-foreground">
              Build custom reports by adding charts from Visual Analytics
            </p>
          </div>

          <Card className="card-shadow">
            <CardContent className="py-16">
              <div className="text-center">
                <FileWarning className="h-16 w-16 mx-auto text-muted-foreground/30 mb-4" />
                <h3 className="text-lg font-medium mb-2">No Charts Added Yet</h3>
                <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                  Go to Visual Analytics and click "Include in Report" on any chart to add it to your report.
                </p>
                <Link to="/dashboard/analytics">
                  <Button variant="gradient">
                    <BarChart3 className="mr-2 h-4 w-4" />
                    Go to Visual Analytics
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Report Builder</h1>
            <p className="text-muted-foreground">
              {report.charts.length} chart{report.charts.length !== 1 ? "s" : ""} from {report.fileName}
            </p>
          </div>
          <Button variant="gradient" onClick={handleGeneratePDF} disabled={isGenerating}>
            <Download className="mr-2 h-4 w-4" />
            {isGenerating ? "Generating..." : "Download Report"}
          </Button>
        </div>

        {/* Report Options */}
        <Card className="card-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              Report Options
            </CardTitle>
            <CardDescription>Customize what to include in your report</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-6">
              <div className="flex items-center space-x-3">
                <Checkbox 
                  id="include-insights" 
                  checked={includeInsights}
                  onCheckedChange={(checked) => setIncludeInsights(checked === true)}
                />
                <Label htmlFor="include-insights" className="flex items-center gap-2 cursor-pointer">
                  <Lightbulb className="h-4 w-4 text-amber-500" />
                  Include Insights
                  <span className="text-xs text-muted-foreground">(AI-generated analysis)</span>
                </Label>
              </div>
              <div className="flex items-center space-x-3">
                <Checkbox 
                  id="include-ai-chat" 
                  checked={includeAIChat}
                  onCheckedChange={(checked) => setIncludeAIChat(checked === true)}
                  disabled={!hasAIChat}
                />
                <Label 
                  htmlFor="include-ai-chat" 
                  className={`flex items-center gap-2 cursor-pointer ${!hasAIChat ? 'opacity-50' : ''}`}
                >
                  <MessageCircle className="h-4 w-4 text-blue-500" />
                  Include AI Chat
                  <span className="text-xs text-muted-foreground">
                    {hasAIChat ? `(${aiChatMessages.length} messages)` : "(no chat history)"}
                  </span>
                </Label>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Report Summary */}
        <Card className="card-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              Report Summary
            </CardTitle>
            <CardDescription>Overview of your custom report</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 rounded-lg bg-primary/10 text-center">
                <p className="text-2xl font-bold text-primary">{report.charts.length}</p>
                <p className="text-sm text-muted-foreground">Charts</p>
              </div>
              <div className="p-4 rounded-lg bg-green-500/10 text-center">
                <p className="text-2xl font-bold text-green-500">{report.totalRows.toLocaleString()}</p>
                <p className="text-sm text-muted-foreground">Data Rows</p>
              </div>
              <div className="p-4 rounded-lg bg-purple-500/10 text-center">
                <p className="text-2xl font-bold text-purple-500">
                  {report.charts.reduce((acc, c) => acc + (c.insights?.length || 0), 0)}
                </p>
                <p className="text-sm text-muted-foreground">Insights</p>
              </div>
              <div className="p-4 rounded-lg bg-amber-500/10 text-center">
                <p className="text-2xl font-bold text-amber-500">
                  {report.charts.reduce((acc, c) => acc + (c.correlations?.length || 0), 0)}
                </p>
                <p className="text-sm text-muted-foreground">Correlations</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Charts List */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Charts in Report (drag to reorder)
          </h2>
          
          {report.charts.map((chart, index) => (
            <ChartCard
              key={chart.id}
              chart={chart}
              index={index}
              total={report.charts.length}
              onRemove={() => handleRemoveChart(chart.id)}
              onMoveUp={() => handleMoveUp(index)}
              onMoveDown={() => handleMoveDown(index)}
              getChartIcon={getChartIcon}
            />
          ))}
        </div>

        {/* Add More Charts CTA */}
        <Card className="card-shadow border-dashed">
          <CardContent className="py-8">
            <div className="text-center">
              <p className="text-muted-foreground mb-4">Want to add more charts to your report?</p>
              <Link to="/dashboard/analytics">
                <Button variant="outline">
                  <BarChart3 className="mr-2 h-4 w-4" />
                  Go to Visual Analytics
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};


// Chart Card Component
interface ChartCardProps {
  chart: ReportChart;
  index: number;
  total: number;
  onRemove: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  getChartIcon: (type: string) => JSX.Element;
}

const ChartCard = ({ chart, index, total, onRemove, onMoveUp, onMoveDown, getChartIcon }: ChartCardProps) => {
  return (
    <Card className="card-shadow">
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          {/* Order Controls */}
          <div className="flex flex-col items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={onMoveUp}
              disabled={index === 0}
            >
              <ChevronUp className="h-4 w-4" />
            </Button>
            <span className="text-sm font-bold text-primary">{index + 1}</span>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={onMoveDown}
              disabled={index === total - 1}
            >
              <ChevronDown className="h-4 w-4" />
            </Button>
          </div>

          {/* Chart Preview */}
          {chart.chartImageBase64 && (
            <div className="w-32 h-24 rounded-lg overflow-hidden bg-secondary/30 shrink-0">
              <img
                src={chart.chartImageBase64}
                alt={chart.chartLabel}
                className="w-full h-full object-contain"
              />
            </div>
          )}

          {/* Chart Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              {getChartIcon(chart.chartType)}
              <h3 className="font-semibold truncate">{chart.title || chart.chartLabel}</h3>
              <Badge variant="secondary" className="shrink-0">{chart.chartLabel}</Badge>
            </div>
            <p className="text-sm text-muted-foreground mb-2">
              X: {chart.xAxis} | Y: {chart.yAxis}
            </p>
            <div className="flex flex-wrap gap-2">
              {chart.stats && (
                <Badge variant="outline" className="text-xs">
                  Mean: {chart.stats.mean}
                </Badge>
              )}
              {chart.insights && chart.insights.length > 0 && (
                <Badge variant="outline" className="text-xs bg-green-500/10 border-green-500/30">
                  {chart.insights.length} insight{chart.insights.length !== 1 ? "s" : ""}
                </Badge>
              )}
              {chart.correlations && chart.correlations.length > 0 && (
                <Badge variant="outline" className="text-xs bg-blue-500/10 border-blue-500/30">
                  {chart.correlations.length} correlation{chart.correlations.length !== 1 ? "s" : ""}
                </Badge>
              )}
            </div>
          </div>

          {/* Remove Button */}
          <Button
            variant="ghost"
            size="icon"
            className="text-destructive hover:text-destructive hover:bg-destructive/10"
            onClick={onRemove}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ReportBuilder;
