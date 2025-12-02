import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import { BarChart3, Menu, X } from "lucide-react";
import { useState } from "react";
import { smoothScrollToSection } from "@/lib/smoothScroll";

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, sectionId: string) => {
    e.preventDefault();
    setIsOpen(false);
    
    // If we're on the home page, just scroll
    if (location.pathname === '/') {
      smoothScrollToSection(sectionId);
    } else {
      // If we're on another page, navigate to home with hash
      window.location.href = `/#${sectionId}`;
    }
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-lg gradient-primary flex items-center justify-center">
              <BarChart3 className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="font-bold text-xl">FlowDapt</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            <a 
              href="#features" 
              onClick={(e) => handleNavClick(e, 'features')}
              className="text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
            >
              Features
            </a>
            <a 
              href="#how-it-works" 
              onClick={(e) => handleNavClick(e, 'how-it-works')}
              className="text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
            >
              How It Works
            </a>
            <a 
              href="#pricing" 
              onClick={(e) => handleNavClick(e, 'pricing')}
              className="text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
            >
              Pricing
            </a>
          </div>

          <div className="hidden md:flex items-center gap-3">
            <ThemeToggle />
            <Button variant="ghost" asChild>
              <Link to="/login">Login</Link>
            </Button>
            <Button variant="gradient" asChild>
              <Link to="/register">Get Started</Link>
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center gap-2">
            <ThemeToggle />
            <Button variant="ghost" size="icon" onClick={() => setIsOpen(!isOpen)}>
              {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden py-4 border-t border-border animate-fade-up">
            <div className="flex flex-col gap-4">
              <a 
                href="#features" 
                onClick={(e) => handleNavClick(e, 'features')}
                className="text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
              >
                Features
              </a>
              <a 
                href="#how-it-works" 
                onClick={(e) => handleNavClick(e, 'how-it-works')}
                className="text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
              >
                How It Works
              </a>
              <a 
                href="#pricing" 
                onClick={(e) => handleNavClick(e, 'pricing')}
                className="text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
              >
                Pricing
              </a>
              <div className="flex gap-3 pt-4 border-t border-border">
                <Button variant="outline" className="flex-1" asChild>
                  <Link to="/login">Login</Link>
                </Button>
                <Button variant="gradient" className="flex-1" asChild>
                  <Link to="/register">Get Started</Link>
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
