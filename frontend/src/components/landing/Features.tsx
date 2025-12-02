import { 
  Upload, 
  BarChart3, 
  Sparkles, 
  FileText, 
  FileSpreadsheet,
  Zap
} from "lucide-react";

const features = [
  {
    icon: Upload,
    title: "Easy File Upload",
    description: "Drag and drop CSV, Excel, JSON, or PDF files. Our system handles the rest automatically.",
  },
  {
    icon: Zap,
    title: "Automated Analytics",
    description: "AI processes your data instantly, identifying patterns and anomalies without manual configuration.",
  },
  {
    icon: BarChart3,
    title: "Interactive Charts",
    description: "Beautiful, interactive visualizations that help you understand your data at a glance.",
  },
  {
    icon: Sparkles,
    title: "AI-Generated Insights",
    description: "Get intelligent recommendations and insights powered by advanced machine learning algorithms.",
  },
  {
    icon: FileText,
    title: "Report Builder",
    description: "Build comprehensive PDF reports with charts, insights, and AI chat conversations included.",
  },
  {
    icon: FileSpreadsheet,
    title: "Multiple Formats",
    description: "Support for various data formats including CSV, Excel, JSON, and even PDF documents.",
  },
];

export function Features() {
  return (
    <section id="features" className="py-24">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Everything You Need for{" "}
            <span className="gradient-text">Data Analytics</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            Powerful features designed to help you extract maximum value from your data
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <div
              key={feature.title}
              className="group p-6 rounded-2xl bg-card border border-border card-shadow hover:card-shadow-hover transition-all duration-300 hover:-translate-y-1"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                <feature.icon className="h-6 w-6 text-primary-foreground" />
              </div>
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
