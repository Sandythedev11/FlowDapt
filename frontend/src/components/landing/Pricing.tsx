import { Sparkles } from "lucide-react";

export function Pricing() {
  return (
    <section id="pricing" className="py-24">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Simple <span className="gradient-text">Pricing</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            Start using FlowDapt today
          </p>
        </div>

        <div className="max-w-2xl mx-auto">
          <div className="relative p-12 rounded-3xl glass border-2 border-primary/30 card-shadow text-center">
            <div className="absolute -top-4 left-1/2 -translate-x-1/2">
              <div className="px-6 py-2 rounded-full gradient-primary flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary-foreground" />
                <span className="text-sm font-semibold text-primary-foreground">Limited Time</span>
              </div>
            </div>
            
            <div className="mb-6">
              <h3 className="text-3xl font-bold mb-2">Plans are incoming</h3>
              <p className="text-xl text-muted-foreground">Currently free for all users</p>
            </div>

            <div className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-accent/20 border border-accent/30">
              <span className="text-2xl font-bold text-accent">₹0</span>
              <span className="text-muted-foreground">/month</span>
            </div>

            <p className="mt-6 text-sm text-muted-foreground">
              Enjoy full access to all features while we're in beta. Pricing plans will be announced soon.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
