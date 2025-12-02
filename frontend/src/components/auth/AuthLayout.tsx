import { Link } from "react-router-dom";
import { BarChart3 } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { ReactNode } from "react";

interface AuthLayoutProps {
  children: ReactNode;
  title: string;
  subtitle: string;
}

export function AuthLayout({ children, title, subtitle }: AuthLayoutProps) {
  return (
    <div className="min-h-screen bg-background flex">
      {/* Left side - Decorative */}
      <div className="hidden lg:flex lg:w-1/2 gradient-primary relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary-foreground rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-primary-foreground rounded-full blur-3xl" />
        </div>
        <div className="relative z-10 flex flex-col justify-center p-12">
          <Link to="/" className="flex items-center gap-3 mb-12">
            <div className="w-12 h-12 rounded-xl bg-primary-foreground/20 flex items-center justify-center">
              <BarChart3 className="h-7 w-7 text-primary-foreground" />
            </div>
            <span className="font-bold text-2xl text-primary-foreground">FlowDapt</span>
          </Link>
          <h2 className="text-4xl font-bold text-primary-foreground mb-6">
            Turn your data into powerful insights
          </h2>
          <p className="text-lg text-primary-foreground/80">
            Join thousands of analysts using AI to unlock the potential of their data.
          </p>
        </div>
      </div>

      {/* Right side - Form */}
      <div className="w-full lg:w-1/2 flex flex-col">
        <div className="flex items-center justify-between p-4">
          <Link to="/" className="flex items-center gap-2 lg:hidden">
            <div className="w-9 h-9 rounded-lg gradient-primary flex items-center justify-center">
              <BarChart3 className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="font-bold text-xl">FlowDapt</span>
          </Link>
          <div className="ml-auto">
            <ThemeToggle />
          </div>
        </div>

        <div className="flex-1 flex items-center justify-center p-8">
          <div className="w-full max-w-md">
            <div className="text-center mb-8">
              <h1 className="text-2xl font-bold mb-2">{title}</h1>
              <p className="text-muted-foreground">{subtitle}</p>
            </div>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
