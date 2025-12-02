import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  FileSpreadsheet, 
  Zap, 
  Upload, 
  ArrowRight,
  BarChart3,
  PieChart,
  Clock,
  LineChart
} from "lucide-react";
import { Link } from "react-router-dom";
import { loadAnalysisData, loadAnalysisResults } from "@/lib/analyticsEngine";
import { AIChatBox } from "@/components/dashboard/AIChatBox";
import { getReportChartCount } from "@/lib/reportBuilder";

const DashboardHome = () => {
  const [hasData, setHasData] = useState(false);
  const [stats, setStats] = useState({
    dataRows: 0,
    insightsGenerated: 0,
    chartsInReport: 0,
    dataFields: 0
  });

  useEffect(() => {
    // Check if user has data
    const data = loadAnalysisData();
    const results = loadAnalysisResults();
    setHasData(!!data);

    // Calculate stats from actual data
    const dataRows = data?.data?.length || 0;
    const dataFields = data?.fields?.length || 0;
    const insightsCount = results?.insights?.length || 0;
    const chartsInReport = getReportChartCount();

    setStats({
      dataRows,
      insightsGenerated: insightsCount,
      chartsInReport,
      dataFields
    });
  }, []);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Dashboard</h1>
            <p className="text-muted-foreground">Welcome back! Here's your analytics overview.</p>
          </div>
          <Button variant="gradient" asChild>
            <Link to="/dashboard/upload">
              <Upload className="mr-2 h-4 w-4" />
              Upload Data
            </Link>
          </Button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="card-shadow hover:card-shadow-hover transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <FileSpreadsheet className="h-5 w-5 text-primary" />
                </div>
              </div>
              <div className="mt-4">
                <p className="text-2xl font-bold">{stats.dataRows.toLocaleString()}</p>
                <p className="text-sm text-muted-foreground">Data Rows</p>
              </div>
            </CardContent>
          </Card>

          <Card className="card-shadow hover:card-shadow-hover transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
                  <Zap className="h-5 w-5 text-amber-500" />
                </div>
              </div>
              <div className="mt-4">
                <p className="text-2xl font-bold">{stats.insightsGenerated}</p>
                <p className="text-sm text-muted-foreground">Insights Generated</p>
              </div>
            </CardContent>
          </Card>

          <Card className="card-shadow hover:card-shadow-hover transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                  <BarChart3 className="h-5 w-5 text-green-500" />
                </div>
              </div>
              <div className="mt-4">
                <p className="text-2xl font-bold">{stats.chartsInReport}</p>
                <p className="text-sm text-muted-foreground">Charts in Report</p>
              </div>
            </CardContent>
          </Card>

          <Card className="card-shadow hover:card-shadow-hover transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                  <LineChart className="h-5 w-5 text-blue-500" />
                </div>
              </div>
              <div className="mt-4">
                <p className="text-2xl font-bold">{stats.dataFields}</p>
                <p className="text-sm text-muted-foreground">Data Fields</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Quick Upload Widget */}
          <Card className="lg:col-span-1 card-shadow">
            <CardHeader>
              <CardTitle className="text-lg">Quick Upload</CardTitle>
              <CardDescription>Drag files here or click to upload</CardDescription>
            </CardHeader>
            <CardContent>
              <Link to="/dashboard/upload">
                <div className="border-2 border-dashed border-border rounded-xl p-8 text-center hover:border-primary/50 hover:bg-primary/5 transition-all duration-300 cursor-pointer">
                  <div className="w-12 h-12 mx-auto rounded-full bg-primary/10 flex items-center justify-center mb-4">
                    <Upload className="h-6 w-6 text-primary" />
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">
                    CSV, Excel, JSON, PDF
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Max 5MB per file
                  </p>
                </div>
              </Link>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="lg:col-span-2 card-shadow">
            <CardHeader>
              <CardTitle className="text-lg">Quick Actions</CardTitle>
              <CardDescription>Jump to key features</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Link to="/dashboard/analytics">
                  <div className="p-4 rounded-lg border border-border hover:border-primary/50 hover:bg-primary/5 transition-all cursor-pointer">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <BarChart3 className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">Visual Analytics</p>
                        <p className="text-xs text-muted-foreground">Create charts & visualizations</p>
                      </div>
                    </div>
                  </div>
                </Link>
                <Link to="/dashboard/insights">
                  <div className="p-4 rounded-lg border border-border hover:border-amber-500/50 hover:bg-amber-500/5 transition-all cursor-pointer">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
                        <Zap className="h-5 w-5 text-amber-500" />
                      </div>
                      <div>
                        <p className="font-medium">AI Insights</p>
                        <p className="text-xs text-muted-foreground">Get AI-powered analysis</p>
                      </div>
                    </div>
                  </div>
                </Link>
                <Link to="/dashboard/report">
                  <div className="p-4 rounded-lg border border-border hover:border-green-500/50 hover:bg-green-500/5 transition-all cursor-pointer">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                        <FileSpreadsheet className="h-5 w-5 text-green-500" />
                      </div>
                      <div>
                        <p className="font-medium">Report Builder</p>
                        <p className="text-xs text-muted-foreground">Generate PDF reports</p>
                      </div>
                    </div>
                  </div>
                </Link>
                <Link to="/dashboard/settings">
                  <div className="p-4 rounded-lg border border-border hover:border-blue-500/50 hover:bg-blue-500/5 transition-all cursor-pointer">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                        <Clock className="h-5 w-5 text-blue-500" />
                      </div>
                      <div>
                        <p className="font-medium">Settings</p>
                        <p className="text-xs text-muted-foreground">Manage your account</p>
                      </div>
                    </div>
                  </div>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Preview */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="card-shadow">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-primary" />
                Data Overview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-center justify-center border border-dashed border-border rounded-lg bg-secondary/30">
                <div className="text-center">
                  <BarChart3 className="h-12 w-12 mx-auto text-muted-foreground/50 mb-2" />
                  <p className="text-muted-foreground">
                    {hasData ? "View analytics for your data" : "Upload data to see analytics"}
                  </p>
                  {hasData && (
                    <Button variant="link" asChild className="mt-2">
                      <Link to="/dashboard/analytics">
                        Go to Analytics
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="card-shadow">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <PieChart className="h-5 w-5 text-accent" />
                Distribution
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-center justify-center border border-dashed border-border rounded-lg bg-secondary/30">
                <div className="text-center">
                  <PieChart className="h-12 w-12 mx-auto text-muted-foreground/50 mb-2" />
                  <p className="text-muted-foreground">
                    {hasData ? "View insights for your data" : "Charts will appear here"}
                  </p>
                  {hasData && (
                    <Button variant="link" asChild className="mt-2">
                      <Link to="/dashboard/insights">
                        Go to Insights
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* AI Chat Box */}
      <AIChatBox hasData={hasData} />
    </DashboardLayout>
  );
};

export default DashboardHome;
