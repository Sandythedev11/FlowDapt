import { useState } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { MessageSquare, Send, Loader2, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

const Feedback = () => {
  const [feedback, setFeedback] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!feedback.trim()) {
      toast.error("Please enter your feedback");
      return;
    }

    if (feedback.trim().length < 10) {
      toast.error("Feedback must be at least 10 characters long");
      return;
    }

    setIsSubmitting(true);

    try {
      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:5000/api/feedback/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ feedback: feedback.trim() }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to submit feedback");
      }

      toast.success("Feedback submitted successfully!", {
        description: "Thank you for helping us improve FlowDapt.",
      });

      setFeedback("");
      setSubmitted(true);

      // Reset submitted state after 3 seconds
      setTimeout(() => setSubmitted(false), 3000);
    } catch (error: any) {
      console.error("Feedback submission error:", error);
      toast.error("Failed to submit feedback", {
        description: error.message || "Please try again later.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-3xl">
        {/* Page Header */}
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <MessageSquare className="h-6 w-6 text-primary" />
            Feedback
          </h1>
          <p className="text-muted-foreground mt-1">
            Share your thoughts, suggestions, or report issues to help us improve FlowDapt
          </p>
        </div>

        {/* Feedback Form */}
        <Card className="card-shadow">
          <CardHeader>
            <CardTitle>Send Us Your Feedback</CardTitle>
            <CardDescription>
              Your feedback is valuable to us. Let us know what you think about FlowDapt, 
              suggest new features, or report any issues you've encountered.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="feedback">Your Feedback</Label>
                <Textarea
                  id="feedback"
                  placeholder="Tell us what's on your mind... (minimum 10 characters)"
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  rows={8}
                  className="resize-none"
                  disabled={isSubmitting}
                />
                <p className="text-xs text-muted-foreground">
                  {feedback.length} characters
                </p>
              </div>

              <div className="flex items-center gap-3">
                <Button
                  type="submit"
                  disabled={isSubmitting || !feedback.trim() || feedback.trim().length < 10}
                  className="min-w-[140px]"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Sending...
                    </>
                  ) : submitted ? (
                    <>
                      <CheckCircle2 className="mr-2 h-4 w-4" />
                      Sent!
                    </>
                  ) : (
                    <>
                      <Send className="mr-2 h-4 w-4" />
                      Submit Feedback
                    </>
                  )}
                </Button>

                {feedback.trim() && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setFeedback("")}
                    disabled={isSubmitting}
                  >
                    Clear
                  </Button>
                )}
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">What to Include</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground space-y-2">
              <p>• Feature requests or suggestions</p>
              <p>• Bug reports or technical issues</p>
              <p>• User experience improvements</p>
              <p>• General comments or questions</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Response Time</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              <p>
                We review all feedback carefully. While we may not respond to every submission, 
                your input helps shape the future of FlowDapt.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Feedback;
