import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Play, Sparkles, BarChart3 } from "lucide-react";
import { DemoModal } from "./DemoModal";

export function Hero() {
  const [isDemoOpen, setIsDemoOpen] = useState(false);

  const handleWatchDemo = () => {
    setIsDemoOpen(true);
  };
  return (
    <section className="relative min-h-screen flex items-center justify-center pt-24 md:pt-32 overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/20 rounded-full blur-3xl animate-float" style={{ animationDelay: "3s" }} />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-transparent via-background to-background" />
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-sm font-medium text-primary mb-8 animate-fade-up">
            <Sparkles className="h-4 w-4" />
            AI-Powered Analytics Platform
          </div>

          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6 animate-fade-up" style={{ animationDelay: "0.1s" }}>
            Transform Your Data Into{" "}
            <span className="gradient-text">Actionable Insights</span>
          </h1>

          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 animate-fade-up" style={{ animationDelay: "0.2s" }}>
            Upload your data, let AI analyze it, and get powerful visualizations and insights in seconds. No coding required.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-up" style={{ animationDelay: "0.3s" }}>
            <Button variant="gradient" size="xl" asChild>
              <Link to="/register">
                Start Free Trial
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button variant="hero" size="xl" onClick={handleWatchDemo}>
              <Play className="mr-2 h-5 w-5" />
              Watch Demo
            </Button>
          </div>

          <div className="mt-16 animate-fade-up" style={{ animationDelay: "0.4s" }}>
            <p className="text-2xl font-bold text-primary">24k+ users</p>
          </div>
        </div>

        {/* FlowDapt Logo Display */}
        <div className="mt-20 relative animate-fade-up flex items-center justify-center" style={{ animationDelay: "0.5s" }}>
          <div className="relative glass rounded-2xl p-16 card-shadow">
            <div className="flex items-center gap-4">
              <div className="w-24 h-24 rounded-2xl gradient-primary flex items-center justify-center">
                <BarChart3 className="h-14 w-14 text-primary-foreground" />
              </div>
              <div>
                <h2 className="text-5xl font-bold gradient-text">FlowDapt</h2>
                <p className="text-xl text-muted-foreground mt-2">Data. Adapt. Flow.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Demo Modal */}
      <DemoModal isOpen={isDemoOpen} onClose={() => setIsDemoOpen(false)} />
    </section>
  );
}
