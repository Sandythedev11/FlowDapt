import { Link, useLocation } from "react-router-dom";
import { BarChart3, Linkedin, Github } from "lucide-react";
import { smoothScrollToSection } from "@/lib/smoothScroll";

export function Footer() {
  const location = useLocation();

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, sectionId: string) => {
    e.preventDefault();
    
    // If we're on the home page, just scroll
    if (location.pathname === '/') {
      smoothScrollToSection(sectionId);
    } else {
      // If we're on another page, navigate to home with hash
      window.location.href = `/#${sectionId}`;
    }
  };
  return (
    <footer className="py-12 border-t border-border">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 rounded-lg gradient-primary flex items-center justify-center">
                <BarChart3 className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="font-bold text-xl">FlowDapt</span>
            </Link>
            <p className="text-muted-foreground text-sm">
              Modern workflow-driven, adaptive solutions for data teams.
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Product</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <a 
                  href="#features" 
                  onClick={(e) => handleNavClick(e, 'features')}
                  className="hover:text-foreground transition-colors cursor-pointer"
                >
                  Features
                </a>
              </li>
              <li>
                <a 
                  href="#pricing" 
                  onClick={(e) => handleNavClick(e, 'pricing')}
                  className="hover:text-foreground transition-colors cursor-pointer"
                >
                  Pricing
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Company</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="/about" className="hover:text-foreground transition-colors">About</Link></li>
              <li><Link to="/contact" className="hover:text-foreground transition-colors">Contact</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Legal</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="/privacy" className="hover:text-foreground transition-colors">Privacy</Link></li>
              <li><Link to="/terms" className="hover:text-foreground transition-colors">Terms</Link></li>
              <li><Link to="/security" className="hover:text-foreground transition-colors">Security</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-border flex flex-col items-center gap-4">
          {/* Developer Contact */}
          <div className="flex items-center gap-4">
            <span className="text-xs text-muted-foreground/70">Built by Sandeep Gouda</span>
            <div className="flex items-center gap-3">
              <a
                href="https://www.linkedin.com/in/sandeep-gouda-42b5ba299"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-primary transition-colors"
                aria-label="LinkedIn"
              >
                <Linkedin className="h-4 w-4" />
              </a>
              <a
                href="https://github.com/Sandythedev11"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-primary transition-colors"
                aria-label="GitHub"
              >
                <Github className="h-4 w-4" />
              </a>
            </div>
          </div>
          
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} FlowDapt. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
