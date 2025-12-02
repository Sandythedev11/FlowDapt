import { Upload, Cpu, BarChart3, Lightbulb } from "lucide-react";

const steps = [
  {
    icon: Upload,
    step: "01",
    title: "Upload Your Data",
    description: "Simply drag and drop your files or click to upload. We support CSV, Excel, JSON, and PDF formats.",
  },
  {
    icon: Cpu,
    step: "02",
    title: "AI Processing",
    description: "Our AI engine automatically processes and analyzes your data, identifying key patterns and trends.",
  },
  {
    icon: BarChart3,
    step: "03",
    title: "Visualize Results",
    description: "Explore interactive charts and dashboards that bring your data to life with beautiful visualizations.",
  },
  {
    icon: Lightbulb,
    step: "04",
    title: "Get Insights",
    description: "Receive AI-generated insights and recommendations to make data-driven decisions confidently.",
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="py-24 bg-secondary/30">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            How It <span className="gradient-text">Works</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            Get started in minutes with our simple four-step process
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((item, index) => (
            <div key={item.step} className="relative">
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-12 left-1/2 w-full h-0.5 bg-gradient-to-r from-primary/50 to-accent/50" />
              )}
              <div className="relative text-center">
                <div className="w-24 h-24 mx-auto rounded-2xl gradient-primary flex items-center justify-center mb-6 shadow-lg">
                  <item.icon className="h-10 w-10 text-primary-foreground" />
                </div>
                <span className="text-sm font-bold text-primary mb-2 block">Step {item.step}</span>
                <h3 className="text-xl font-semibold mb-3">{item.title}</h3>
                <p className="text-muted-foreground">{item.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
