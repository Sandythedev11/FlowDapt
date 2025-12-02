import { useEffect, useRef, useState } from "react";
import {
  X,
  Play,
  Upload,
  BarChart3,
  Sparkles,
  FileText,
  ChevronRight,
  FileSpreadsheet,
  TrendingUp,
  Download,
  CheckCircle2,
  ArrowRight,
  PieChart,
  LineChart,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface DemoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// Demo steps for the animated walkthrough
const demoSteps = [
  {
    id: 1,
    title: "Upload Your Data",
    description:
      "Drag and drop CSV, Excel, JSON, or PDF files up to 5MB. Our system automatically detects file formats.",
    icon: Upload,
    color: "text-blue-500",
    bgColor: "bg-blue-500/10",
  },
  {
    id: 2,
    title: "Auto-Analysis",
    description:
      "AI automatically detects column types, identifies date and numeric fields, and sets optimal chart configurations.",
    icon: Sparkles,
    color: "text-purple-500",
    bgColor: "bg-purple-500/10",
  },
  {
    id: 3,
    title: "Visual Charts",
    description:
      "Generate Bar, Line, Pie, and Scatter charts instantly. Export to CSV, Excel, PDF, or download chart images.",
    icon: BarChart3,
    color: "text-green-500",
    bgColor: "bg-green-500/10",
  },
  {
    id: 4,
    title: "AI Insights",
    description:
      "Get trends, anomalies, correlations, outliers, and actionable recommendations automatically generated.",
    icon: Sparkles,
    color: "text-amber-500",
    bgColor: "bg-amber-500/10",
  },
  {
    id: 5,
    title: "Report Builder",
    description:
      "Build comprehensive PDF reports with charts, AI insights, and chat conversations included.",
    icon: FileText,
    color: "text-cyan-500",
    bgColor: "bg-cyan-500/10",
  },
];

// Animated Demo Component - Shows FlowDapt workflow visually
function AnimatedDemo({ activeStep }: { activeStep: number }) {
  const [animationPhase, setAnimationPhase] = useState(0);

  useEffect(() => {
    const phases = [0, 1, 2, 3];
    let currentPhase = 0;
    const interval = setInterval(() => {
      currentPhase = (currentPhase + 1) % phases.length;
      setAnimationPhase(currentPhase);
    }, 1000);
    return () => clearInterval(interval);
  }, [activeStep]);

  // Step 1: Upload Animation
  if (activeStep === 0) {
    return (
      <div className="relative w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-500/5 to-blue-600/10">
        <div className="text-center">
          {/* Upload Zone */}
          <div
            className={`w-64 h-40 mx-auto border-2 border-dashed rounded-2xl flex flex-col items-center justify-center transition-all duration-500 ${
              animationPhase >= 1
                ? "border-blue-500 bg-blue-500/10"
                : "border-gray-300"
            }`}
          >
            <Upload
              className={`h-12 w-12 mb-3 transition-all duration-500 ${
                animationPhase >= 1
                  ? "text-blue-500 scale-110"
                  : "text-gray-400"
              }`}
            />
            <p className="text-sm font-medium">Drop your file here</p>
            <p className="text-xs text-muted-foreground">CSV, Excel, JSON, PDF</p>
          </div>

          {/* File being uploaded */}
          {animationPhase >= 2 && (
            <div className="mt-4 flex items-center justify-center gap-3 animate-fade-up">
              <FileSpreadsheet className="h-8 w-8 text-green-500" />
              <div className="text-left">
                <p className="text-sm font-medium">sales_data.xlsx</p>
                <div className="w-32 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-green-500 rounded-full transition-all duration-1000"
                    style={{ width: animationPhase >= 3 ? "100%" : "60%" }}
                  />
                </div>
              </div>
              {animationPhase >= 3 && (
                <CheckCircle2 className="h-6 w-6 text-green-500 animate-scale-in" />
              )}
            </div>
          )}
        </div>
      </div>
    );
  }

  // Step 2: Auto-Analysis Animation
  if (activeStep === 1) {
    return (
      <div className="relative w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-500/5 to-purple-600/10">
        <div className="grid grid-cols-3 gap-4 p-6">
          {/* Column Detection */}
          <div
            className={`p-4 rounded-xl bg-white/50 dark:bg-gray-800/50 border transition-all duration-500 ${
              animationPhase >= 0 ? "border-purple-500 shadow-lg" : "border-gray-200"
            }`}
          >
            <div className="text-xs text-muted-foreground mb-2">Detecting Columns</div>
            <div className="space-y-2">
              {["Date", "Sales", "Region", "Product"].map((col, i) => (
                <div
                  key={col}
                  className={`flex items-center gap-2 text-sm transition-all duration-300 ${
                    animationPhase > i ? "opacity-100" : "opacity-30"
                  }`}
                  style={{ transitionDelay: `${i * 200}ms` }}
                >
                  <div
                    className={`w-2 h-2 rounded-full ${
                      i === 0
                        ? "bg-blue-500"
                        : i === 1
                        ? "bg-green-500"
                        : "bg-purple-500"
                    }`}
                  />
                  <span>{col}</span>
                  {animationPhase > i && (
                    <CheckCircle2 className="h-3 w-3 text-green-500 ml-auto" />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* AI Processing */}
          <div className="flex flex-col items-center justify-center">
            <div
              className={`w-16 h-16 rounded-full bg-purple-500/20 flex items-center justify-center ${
                animationPhase >= 1 ? "animate-pulse" : ""
              }`}
            >
              <Sparkles className="h-8 w-8 text-purple-500" />
            </div>
            <p className="text-xs mt-2 text-muted-foreground">AI Processing</p>
            <ArrowRight
              className={`h-6 w-6 text-purple-500 mt-2 transition-all duration-500 ${
                animationPhase >= 2 ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-2"
              }`}
            />
          </div>

          {/* Results */}
          <div
            className={`p-4 rounded-xl bg-white/50 dark:bg-gray-800/50 border transition-all duration-500 ${
              animationPhase >= 2 ? "border-green-500 shadow-lg" : "border-gray-200"
            }`}
          >
            <div className="text-xs text-muted-foreground mb-2">Auto-Configured</div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>X-Axis:</span>
                <span className="font-medium text-blue-500">Date</span>
              </div>
              <div className="flex justify-between">
                <span>Y-Axis:</span>
                <span className="font-medium text-green-500">Sales</span>
              </div>
              <div className="flex justify-between">
                <span>Chart:</span>
                <span className="font-medium text-purple-500">Line</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Step 3: Charts Animation
  if (activeStep === 2) {
    return (
      <div className="relative w-full h-full flex items-center justify-center bg-gradient-to-br from-green-500/5 to-green-600/10 p-6">
        <div className="grid grid-cols-2 gap-4 w-full max-w-lg">
          {/* Bar Chart */}
          <div
            className={`p-4 rounded-xl bg-white/50 dark:bg-gray-800/50 border transition-all duration-500 ${
              animationPhase === 0 ? "border-primary shadow-lg scale-105" : "border-gray-200"
            }`}
          >
            <div className="flex items-center gap-2 mb-3">
              <BarChart3 className="h-4 w-4 text-primary" />
              <span className="text-xs font-medium">Bar Chart</span>
            </div>
            <div className="flex items-end gap-1 h-16">
              {[40, 65, 45, 80, 55, 70].map((h, i) => (
                <div
                  key={i}
                  className="flex-1 bg-primary/60 rounded-t transition-all duration-500"
                  style={{
                    height: animationPhase >= 0 ? `${h}%` : "10%",
                    transitionDelay: `${i * 100}ms`,
                  }}
                />
              ))}
            </div>
          </div>

          {/* Line Chart */}
          <div
            className={`p-4 rounded-xl bg-white/50 dark:bg-gray-800/50 border transition-all duration-500 ${
              animationPhase === 1 ? "border-primary shadow-lg scale-105" : "border-gray-200"
            }`}
          >
            <div className="flex items-center gap-2 mb-3">
              <LineChart className="h-4 w-4 text-green-500" />
              <span className="text-xs font-medium">Line Chart</span>
            </div>
            <svg viewBox="0 0 100 40" className="w-full h-16">
              <path
                d="M0,30 L20,25 L40,15 L60,20 L80,10 L100,5"
                fill="none"
                stroke="rgb(34, 197, 94)"
                strokeWidth="2"
                className={`transition-all duration-1000 ${
                  animationPhase >= 1 ? "opacity-100" : "opacity-0"
                }`}
                style={{
                  strokeDasharray: 200,
                  strokeDashoffset: animationPhase >= 1 ? 0 : 200,
                }}
              />
            </svg>
          </div>

          {/* Pie Chart */}
          <div
            className={`p-4 rounded-xl bg-white/50 dark:bg-gray-800/50 border transition-all duration-500 ${
              animationPhase === 2 ? "border-primary shadow-lg scale-105" : "border-gray-200"
            }`}
          >
            <div className="flex items-center gap-2 mb-3">
              <PieChart className="h-4 w-4 text-purple-500" />
              <span className="text-xs font-medium">Pie Chart</span>
            </div>
            <div className="flex justify-center">
              <svg viewBox="0 0 40 40" className="w-16 h-16">
                <circle
                  cx="20"
                  cy="20"
                  r="15"
                  fill="none"
                  stroke="rgb(59, 130, 246)"
                  strokeWidth="8"
                  strokeDasharray="30 70"
                  className={`transition-all duration-500 ${
                    animationPhase >= 2 ? "opacity-100" : "opacity-30"
                  }`}
                />
                <circle
                  cx="20"
                  cy="20"
                  r="15"
                  fill="none"
                  stroke="rgb(34, 197, 94)"
                  strokeWidth="8"
                  strokeDasharray="25 75"
                  strokeDashoffset="-30"
                  className={`transition-all duration-500 ${
                    animationPhase >= 2 ? "opacity-100" : "opacity-30"
                  }`}
                />
                <circle
                  cx="20"
                  cy="20"
                  r="15"
                  fill="none"
                  stroke="rgb(168, 85, 247)"
                  strokeWidth="8"
                  strokeDasharray="45 55"
                  strokeDashoffset="-55"
                  className={`transition-all duration-500 ${
                    animationPhase >= 2 ? "opacity-100" : "opacity-30"
                  }`}
                />
              </svg>
            </div>
          </div>

          {/* Export Options */}
          <div
            className={`p-4 rounded-xl bg-white/50 dark:bg-gray-800/50 border transition-all duration-500 ${
              animationPhase === 3 ? "border-primary shadow-lg scale-105" : "border-gray-200"
            }`}
          >
            <div className="flex items-center gap-2 mb-3">
              <Download className="h-4 w-4 text-amber-500" />
              <span className="text-xs font-medium">Export Options</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {["CSV", "Excel", "PDF", "PNG"].map((format, i) => (
                <div
                  key={format}
                  className={`text-xs py-1 px-2 rounded bg-secondary text-center transition-all duration-300 ${
                    animationPhase >= 3 ? "opacity-100" : "opacity-30"
                  }`}
                  style={{ transitionDelay: `${i * 100}ms` }}
                >
                  {format}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Step 4: AI Insights Animation
  if (activeStep === 3) {
    const insights = [
      { icon: TrendingUp, text: "Sales up 23% vs last month", color: "text-green-500", bg: "bg-green-500/10" },
      { icon: Sparkles, text: "Peak performance on Fridays", color: "text-purple-500", bg: "bg-purple-500/10" },
      { icon: BarChart3, text: "Product A leads with 45% share", color: "text-blue-500", bg: "bg-blue-500/10" },
    ];

    return (
      <div className="relative w-full h-full flex items-center justify-center bg-gradient-to-br from-amber-500/5 to-amber-600/10 p-6">
        <div className="w-full max-w-md space-y-3">
          <div className="text-center mb-4">
            <Sparkles className="h-10 w-10 text-amber-500 mx-auto mb-2 animate-pulse" />
            <p className="text-sm font-medium">AI-Generated Insights</p>
          </div>
          {insights.map((insight, i) => {
            const Icon = insight.icon;
            return (
              <div
                key={i}
                className={`flex items-center gap-3 p-4 rounded-xl bg-white/50 dark:bg-gray-800/50 border border-gray-200 transition-all duration-500 ${
                  animationPhase > i ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-4"
                }`}
                style={{ transitionDelay: `${i * 300}ms` }}
              >
                <div className={`w-10 h-10 rounded-lg ${insight.bg} flex items-center justify-center`}>
                  <Icon className={`h-5 w-5 ${insight.color}`} />
                </div>
                <p className="text-sm font-medium">{insight.text}</p>
                <CheckCircle2 className="h-5 w-5 text-green-500 ml-auto" />
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // Step 5: Report Builder Animation
  if (activeStep === 4) {
    const reportItems = [
      { type: "Chart", name: "Sales Bar Chart", icon: BarChart3, color: "text-blue-500" },
      { type: "Chart", name: "Revenue Line Chart", icon: LineChart, color: "text-green-500" },
      { type: "Insights", name: "AI-Generated Analysis", icon: Sparkles, color: "text-purple-500" },
    ];

    return (
      <div className="relative w-full h-full flex items-center justify-center bg-gradient-to-br from-cyan-500/5 to-cyan-600/10 p-6">
        <div className="w-full max-w-md">
          <div className="flex items-center gap-2 mb-4">
            <FileText className="h-5 w-5 text-cyan-500" />
            <span className="font-medium">Report Builder</span>
          </div>
          <div className="space-y-2">
            {reportItems.map((item, i) => {
              const Icon = item.icon;
              return (
                <div
                  key={i}
                  className={`flex items-center gap-3 p-3 rounded-lg bg-white/50 dark:bg-gray-800/50 border border-gray-200 transition-all duration-500 ${
                    animationPhase > i ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
                  }`}
                  style={{ transitionDelay: `${i * 300}ms` }}
                >
                  <div className="w-8 h-8 rounded-full bg-cyan-500/10 flex items-center justify-center">
                    <Icon className={`h-4 w-4 ${item.color}`} />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{item.name}</p>
                    <p className="text-xs text-muted-foreground">{item.type}</p>
                  </div>
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                </div>
              );
            })}
          </div>
          {animationPhase >= 3 && (
            <div className="mt-4 flex justify-center animate-fade-up">
              <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-cyan-500 text-white text-sm font-medium">
                <Download className="h-4 w-4" />
                Download Report
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return null;
}

export function DemoModal({ isOpen, onClose }: DemoModalProps) {
  const [activeStep, setActiveStep] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);

  // Auto-advance steps
  useEffect(() => {
    if (!isOpen) return;

    const interval = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % demoSteps.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  // Handle outside click
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
      onClose();
    }
  };

  // Animation on open
  useEffect(() => {
    if (isOpen) {
      setIsAnimating(true);
      setActiveStep(0);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-all duration-300 ${
        isAnimating ? "opacity-100" : "opacity-0"
      }`}
      onClick={handleBackdropClick}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

      {/* Modal */}
      <div
        ref={modalRef}
        className={`relative w-full max-w-5xl max-h-[90vh] overflow-hidden rounded-2xl bg-background border border-border shadow-2xl transform transition-all duration-500 ${
          isAnimating ? "scale-100 opacity-100" : "scale-95 opacity-0"
        }`}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 rounded-full bg-background/80 hover:bg-secondary transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Header */}
        <div className="p-6 border-b border-border bg-gradient-to-r from-primary/5 to-accent/5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center">
              <Play className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">FlowDapt Platform Demo</h2>
              <p className="text-muted-foreground">
                See how easy it is to transform your data into insights
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {/* Animated Demo Section */}
          <div className="relative aspect-video rounded-xl overflow-hidden border border-border mb-8">
            <AnimatedDemo activeStep={activeStep} />
          </div>

          {/* Step-by-Step Walkthrough */}
          <div className="space-y-6">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              How FlowDapt Works
            </h3>

            {/* Progress Bar */}
            <div className="flex gap-2">
              {demoSteps.map((_, index) => (
                <div
                  key={index}
                  className={`h-1 flex-1 rounded-full transition-all duration-500 ${
                    index <= activeStep ? "bg-primary" : "bg-secondary"
                  }`}
                />
              ))}
            </div>

            {/* Steps Grid */}
            <div className="grid md:grid-cols-5 gap-4">
              {demoSteps.map((step, index) => {
                const Icon = step.icon;
                const isActive = index === activeStep;

                return (
                  <button
                    key={step.id}
                    onClick={() => setActiveStep(index)}
                    className={`p-4 rounded-xl text-left transition-all duration-300 ${
                      isActive
                        ? "bg-primary/10 border-2 border-primary scale-105 shadow-lg"
                        : "bg-secondary/30 border border-border hover:bg-secondary/50"
                    }`}
                  >
                    <div
                      className={`w-10 h-10 rounded-lg ${step.bgColor} flex items-center justify-center mb-3`}
                    >
                      <Icon className={`h-5 w-5 ${step.color}`} />
                    </div>
                    <h4 className={`font-semibold text-sm mb-1 ${isActive ? "text-primary" : ""}`}>
                      {step.title}
                    </h4>
                    <p
                      className={`text-xs text-muted-foreground line-clamp-2 ${
                        isActive ? "line-clamp-none" : ""
                      }`}
                    >
                      {step.description}
                    </p>
                  </button>
                );
              })}
            </div>

            {/* Active Step Detail */}
            <div className="p-6 rounded-xl bg-gradient-to-r from-primary/5 to-accent/5 border border-primary/20">
              <div className="flex items-start gap-4">
                <div
                  className={`w-14 h-14 rounded-xl ${demoSteps[activeStep].bgColor} flex items-center justify-center shrink-0`}
                >
                  {(() => {
                    const Icon = demoSteps[activeStep].icon;
                    return <Icon className={`h-7 w-7 ${demoSteps[activeStep].color}`} />;
                  })()}
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-medium px-2 py-1 rounded-full bg-primary/10 text-primary">
                      Step {activeStep + 1} of {demoSteps.length}
                    </span>
                  </div>
                  <h4 className="text-xl font-semibold mb-2">{demoSteps[activeStep].title}</h4>
                  <p className="text-muted-foreground">{demoSteps[activeStep].description}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-border bg-secondary/20 flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Experience the power of AI-driven analytics — no credit card required.
          </p>
          <div className="flex gap-3">
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
            <Button variant="gradient" asChild>
              <a href="/register">
                Start Free Trial
                <ChevronRight className="ml-2 h-4 w-4" />
              </a>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
