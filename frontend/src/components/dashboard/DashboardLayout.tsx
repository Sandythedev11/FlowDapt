import { ReactNode, useState, useEffect } from "react";
import { DashboardSidebar } from "./DashboardSidebar";
import { DashboardHeader } from "./DashboardHeader";
import { cn } from "@/lib/utils";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import { clearAnalyticsData } from "@/lib/userStorage";

interface DashboardLayoutProps {
  children: ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  // Enable global keyboard shortcuts
  useKeyboardShortcuts();

  // Clear analytics data when user leaves the page/closes browser
  // Note: This uses sessionStorage flag to detect new sessions
  useEffect(() => {
    const sessionKey = "flowdapt_session_active";
    const isNewSession = !sessionStorage.getItem(sessionKey);
    
    if (isNewSession) {
      // New session - clear any stale analytics data from previous session
      clearAnalyticsData();
      sessionStorage.setItem(sessionKey, "true");
    }

    // Handle page visibility change (tab switch, minimize)
    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        // User switched away - mark session as potentially ending
        sessionStorage.setItem("flowdapt_last_active", Date.now().toString());
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      
      {/* Sidebar */}
      <div className={cn(
        "fixed inset-y-0 left-0 z-50 md:translate-x-0 transition-transform duration-300",
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <DashboardSidebar />
      </div>

      {/* Main content */}
      <div className="md:pl-64 transition-all duration-300">
        <DashboardHeader onMenuClick={() => setSidebarOpen(true)} />
        <main className="p-4 md:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
