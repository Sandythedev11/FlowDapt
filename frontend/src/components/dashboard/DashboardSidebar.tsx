import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  BarChart3,
  Home,
  Upload,
  LineChart,
  Sparkles,
  Settings,
  ChevronLeft,
  ChevronRight,
  FileText,
  MessageSquare,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { SHORTCUTS } from "@/hooks/useKeyboardShortcuts";
import { getReportChartCount } from "@/lib/reportBuilder";

const menuItems = [
  { icon: Home, label: "Dashboard", path: "/dashboard" },
  { icon: Upload, label: "Upload Data", path: "/dashboard/upload", shortcut: SHORTCUTS.UPLOAD.label },
  { icon: LineChart, label: "Visual Analytics", path: "/dashboard/analytics" },
  { icon: Sparkles, label: "Insights", path: "/dashboard/insights", shortcut: SHORTCUTS.INSIGHTS.label },
  { icon: FileText, label: "Report Builder", path: "/dashboard/report", badge: true, shortcut: SHORTCUTS.REPORT.label },
];

const bottomItems = [
  { icon: MessageSquare, label: "Feedback", path: "/dashboard/feedback" },
  { icon: Settings, label: "Settings", path: "/dashboard/settings", shortcut: SHORTCUTS.SETTINGS.label },
];

export function DashboardSidebar() {
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [reportCount, setReportCount] = useState(0);

  // Update report count
  useEffect(() => {
    const updateCount = () => setReportCount(getReportChartCount());
    updateCount();
    
    // Listen for storage changes
    const handleStorage = () => updateCount();
    window.addEventListener("storage", handleStorage);
    
    // Poll for changes (since localStorage events don't fire in same tab)
    const interval = setInterval(updateCount, 2000);
    
    return () => {
      window.removeEventListener("storage", handleStorage);
      clearInterval(interval);
    };
  }, []);

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 h-screen bg-sidebar border-r border-sidebar-border flex flex-col transition-all duration-300 z-50",
        isCollapsed ? "w-16" : "w-64"
      )}
    >
      {/* Logo */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-sidebar-border">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-lg gradient-primary flex items-center justify-center shrink-0">
            <BarChart3 className="h-5 w-5 text-primary-foreground" />
          </div>
          {!isCollapsed && <span className="font-bold text-lg">FlowDapt</span>}
        </Link>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() => setIsCollapsed(!isCollapsed)}
        >
          {isCollapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 px-2 space-y-1 overflow-y-auto">
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          const showBadge = item.badge && reportCount > 0;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200",
                isActive
                  ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                  : "text-sidebar-foreground hover:bg-sidebar-accent/50"
              )}
            >
              <div className="relative">
                <item.icon className={cn("h-5 w-5 shrink-0", isActive && "text-primary")} />
                {showBadge && isCollapsed && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-primary text-[10px] text-primary-foreground rounded-full flex items-center justify-center font-bold">
                    {reportCount}
                  </span>
                )}
              </div>
              {!isCollapsed && (
                <>
                  <span className="flex-1">{item.label}</span>
                  {showBadge && (
                    <span className="bg-primary text-primary-foreground text-[10px] px-1.5 py-0.5 rounded-full font-bold">
                      {reportCount}
                    </span>
                  )}
                  {item.shortcut && (
                    <span className="text-[10px] text-muted-foreground/50 font-mono bg-secondary/40 px-1.5 py-0.5 rounded">
                      {item.shortcut}
                    </span>
                  )}
                </>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Bottom section */}
      <div className="py-4 px-2 border-t border-sidebar-border space-y-1">
        {bottomItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200",
                isActive
                  ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                  : "text-sidebar-foreground hover:bg-sidebar-accent/50"
              )}
            >
              <item.icon className={cn("h-5 w-5 shrink-0", isActive && "text-primary")} />
              {!isCollapsed && (
                <>
                  <span className="flex-1">{item.label}</span>
                  {item.shortcut && (
                    <span className="text-[10px] text-muted-foreground/50 font-mono bg-secondary/40 px-1.5 py-0.5 rounded">
                      {item.shortcut}
                    </span>
                  )}
                </>
              )}
            </Link>
          );
        })}
      </div>
    </aside>
  );
}
