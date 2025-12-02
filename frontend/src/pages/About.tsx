import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Sparkles, Target, Users, Zap } from "lucide-react";

const About = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <Button variant="ghost" asChild className="mb-6">
          <Link to="/">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Link>
        </Button>

        <h1 className="text-4xl font-bold mb-4">About FlowDapt</h1>
        <p className="text-xl text-muted-foreground mb-12">Data. Adapt. Flow.</p>

        <div className="space-y-12 text-foreground">
          <section>
            <h2 className="text-2xl font-semibold mb-4">Who We Are</h2>
            <p className="mb-4">
              FlowDapt is a modern startup revolutionizing how teams interact with their data. We're building the next generation of workflow-driven, adaptive analytics solutions that empower organizations to make data-driven decisions with confidence and speed.
            </p>
            <p>
              Founded on the principle that data analytics should be accessible, intuitive, and powerful, FlowDapt combines cutting-edge AI technology with elegant user experience design to create a platform that adapts to your workflow—not the other way around.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-6">Our Mission</h2>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="p-6 rounded-lg bg-primary/5 border border-primary/20">
                <div className="w-12 h-12 rounded-lg gradient-primary flex items-center justify-center mb-4">
                  <Sparkles className="h-6 w-6 text-primary-foreground" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Simplify Complexity</h3>
                <p className="text-sm text-muted-foreground">
                  Transform complex data analysis into simple, actionable insights that anyone can understand and use.
                </p>
              </div>

              <div className="p-6 rounded-lg bg-primary/5 border border-primary/20">
                <div className="w-12 h-12 rounded-lg gradient-primary flex items-center justify-center mb-4">
                  <Zap className="h-6 w-6 text-primary-foreground" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Accelerate Decisions</h3>
                <p className="text-sm text-muted-foreground">
                  Reduce the time from data upload to actionable insights from hours to seconds with AI-powered automation.
                </p>
              </div>

              <div className="p-6 rounded-lg bg-primary/5 border border-primary/20">
                <div className="w-12 h-12 rounded-lg gradient-primary flex items-center justify-center mb-4">
                  <Target className="h-6 w-6 text-primary-foreground" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Adapt to You</h3>
                <p className="text-sm text-muted-foreground">
                  Create a platform that learns and adapts to your unique workflow, industry, and analytical needs.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">What We Do</h2>
            <p className="mb-4">
              FlowDapt provides a comprehensive, AI-powered data analytics platform that enables teams to:
            </p>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center shrink-0 mt-0.5">
                  <span className="text-primary text-sm font-bold">✓</span>
                </div>
                <div>
                  <strong>Upload and Process Data Effortlessly:</strong> Support for multiple file formats including CSV, Excel, and PDF with automatic parsing and validation.
                </div>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center shrink-0 mt-0.5">
                  <span className="text-primary text-sm font-bold">✓</span>
                </div>
                <div>
                  <strong>Generate Instant Insights:</strong> AI-powered analysis that automatically identifies patterns, trends, anomalies, and correlations in your data.
                </div>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center shrink-0 mt-0.5">
                  <span className="text-primary text-sm font-bold">✓</span>
                </div>
                <div>
                  <strong>Visualize with Impact:</strong> Interactive dashboards and charts that make complex data easy to understand and share.
                </div>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center shrink-0 mt-0.5">
                  <span className="text-primary text-sm font-bold">✓</span>
                </div>
                <div>
                  <strong>Collaborate Seamlessly:</strong> Share insights, create reports, and work together with your team in real-time.
                </div>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center shrink-0 mt-0.5">
                  <span className="text-primary text-sm font-bold">✓</span>
                </div>
                <div>
                  <strong>Secure Your Data:</strong> Enterprise-grade security with encryption, authentication, and compliance standards.
                </div>
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Our Technology</h2>
            <p className="mb-4">
              FlowDapt is built on a modern, scalable technology stack designed for performance, security, and reliability:
            </p>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold mb-3">Frontend</h3>
                <ul className="space-y-2 text-muted-foreground">
                  <li>• React with TypeScript for type-safe development</li>
                  <li>• Vite for lightning-fast build times</li>
                  <li>• Tailwind CSS for modern, responsive design</li>
                  <li>• shadcn/ui for accessible component library</li>
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-3">Backend</h3>
                <ul className="space-y-2 text-muted-foreground">
                  <li>• Node.js with Express for robust API</li>
                  <li>• MongoDB for flexible data storage</li>
                  <li>• JWT authentication for secure access</li>
                  <li>• Gmail SMTP for reliable email delivery</li>
                </ul>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Our Values</h2>
            <div className="space-y-4">
              <div className="p-4 rounded-lg border border-border">
                <h3 className="text-lg font-semibold mb-2">🔒 Security First</h3>
                <p className="text-muted-foreground">
                  Your data security is our top priority. We implement industry-leading security practices including password hashing, email verification, and encrypted data transmission.
                </p>
              </div>
              <div className="p-4 rounded-lg border border-border">
                <h3 className="text-lg font-semibold mb-2">🚀 Innovation Driven</h3>
                <p className="text-muted-foreground">
                  We continuously push the boundaries of what's possible with data analytics, leveraging the latest AI and machine learning technologies.
                </p>
              </div>
              <div className="p-4 rounded-lg border border-border">
                <h3 className="text-lg font-semibold mb-2">👥 User Centric</h3>
                <p className="text-muted-foreground">
                  Every feature we build starts with understanding our users' needs. We design for real workflows and real people.
                </p>
              </div>
              <div className="p-4 rounded-lg border border-border">
                <h3 className="text-lg font-semibold mb-2">🌱 Continuous Growth</h3>
                <p className="text-muted-foreground">
                  As a startup, we're agile and adaptive. We listen to feedback, iterate quickly, and constantly improve our platform.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Why Choose FlowDapt?</h2>
            <p className="mb-4">
              In a crowded market of analytics tools, FlowDapt stands out by focusing on what matters most:
            </p>
            <ul className="space-y-2 text-muted-foreground">
              <li>✨ <strong>No Coding Required:</strong> Powerful analytics without the complexity</li>
              <li>⚡ <strong>Lightning Fast:</strong> From upload to insights in seconds</li>
              <li>🎯 <strong>Adaptive Intelligence:</strong> AI that learns your patterns and preferences</li>
              <li>🔐 <strong>Enterprise Security:</strong> Bank-level encryption and compliance</li>
              <li>💰 <strong>Transparent Pricing:</strong> No hidden fees or surprise charges</li>
              <li>🤝 <strong>Dedicated Support:</strong> Real humans ready to help</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Join Our Journey</h2>
            <p className="mb-6">
              We're just getting started, and we'd love for you to be part of our story. Whether you're a data analyst, business leader, or curious explorer, FlowDapt is here to help you unlock the power of your data.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button variant="gradient" size="lg" asChild>
                <Link to="/register">Start Free Trial</Link>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <Link to="/#">Contact Us</Link>
              </Button>
            </div>
          </section>

          <section className="bg-primary/5 p-8 rounded-lg border border-primary/20">
            <div className="flex items-center gap-3 mb-4">
              <Users className="h-8 w-8 text-primary" />
              <h2 className="text-2xl font-semibold">Get in Touch</h2>
            </div>
            <p className="mb-4">
              Have questions? Want to learn more? We'd love to hear from you.
            </p>
            <ul className="space-y-2">
              <li><strong>Email:</strong> hello@flowdapt.com</li>
              <li><strong>Support:</strong> support@flowdapt.com</li>
              <li><strong>Careers:</strong> careers@flowdapt.com</li>
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
};

export default About;
