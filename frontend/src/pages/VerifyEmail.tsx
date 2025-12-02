import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Mail, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const VerifyEmail = () => {
  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes in seconds
  const [canResend, setCanResend] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  // Get email from location state or localStorage
  const email = location.state?.email || localStorage.getItem('pendingVerificationEmail');
  const userName = location.state?.name || localStorage.getItem('pendingVerificationName');
  const [devOTP, setDevOTP] = useState<string | null>(location.state?.devOTP || localStorage.getItem('devOTP'));

  useEffect(() => {
    // Redirect to register if no email found
    if (!email) {
      navigate('/register');
      return;
    }

    // Countdown timer
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setCanResend(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [email, navigate]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleOtpChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, ''); // Only allow digits
    if (value.length <= 6) {
      setOtp(value);
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();

    if (otp.length !== 6) {
      toast({
        title: "Invalid OTP",
        description: "Please enter a 6-digit OTP code.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('http://localhost:5000/api/auth/verify-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          otp,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Verification failed');
      }

      // Success - store token and user data, clear pending data
      if (data.token) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify({
          _id: data._id,
          name: data.name,
          email: data.email,
          role: data.role,
        }));
      }
      localStorage.removeItem('pendingVerificationEmail');
      localStorage.removeItem('pendingVerificationName');
      localStorage.removeItem('devOTP');

      toast({
        title: "Email verified!",
        description: "Your account has been verified successfully.",
      });

      // Navigate to dashboard
      navigate("/dashboard");

    } catch (error: any) {
      toast({
        title: "Verification failed",
        description: error.message || "Invalid or expired OTP. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setIsResending(true);

    try {
      const response = await fetch('http://localhost:5000/api/auth/resend-verification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to resend OTP');
      }

      toast({
        title: "OTP sent!",
        description: data.devOTP 
          ? "Email failed - OTP shown below (dev mode)." 
          : "A new verification code has been sent to your email.",
      });

      // If dev OTP is returned, update it
      if (data.devOTP) {
        setDevOTP(data.devOTP);
        localStorage.setItem('devOTP', data.devOTP);
      }

      // Reset timer
      setTimeLeft(600);
      setCanResend(false);
      setOtp('');

    } catch (error: any) {
      toast({
        title: "Failed to resend",
        description: error.message || "Could not resend OTP. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsResending(false);
    }
  };

  return (
    <AuthLayout 
      title="Verify your email" 
      subtitle={`We've sent a verification code to ${email}`}
    >
      <div className="space-y-6">
        {/* Email Icon */}
        <div className="flex justify-center">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
            <Mail className="h-8 w-8 text-primary" />
          </div>
        </div>

        {/* Timer */}
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span>
              {timeLeft > 0 ? (
                <>Code expires in <span className="font-semibold text-foreground">{formatTime(timeLeft)}</span></>
              ) : (
                <span className="text-destructive font-semibold">Code expired</span>
              )}
            </span>
          </div>
        </div>

        {/* OTP Form */}
        <form onSubmit={handleVerify} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="otp">Verification Code</Label>
            <Input
              id="otp"
              type="text"
              inputMode="numeric"
              placeholder="Enter 6-digit code"
              value={otp}
              onChange={handleOtpChange}
              className="text-center text-2xl tracking-widest font-semibold"
              maxLength={6}
              autoComplete="off"
              autoFocus
            />
            <p className="text-xs text-muted-foreground text-center">
              Enter the 6-digit code sent to your email
            </p>
          </div>

          <Button 
            type="submit" 
            variant="gradient" 
            className="w-full" 
            disabled={isLoading || otp.length !== 6}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Verifying...
              </>
            ) : (
              "Verify Email"
            )}
          </Button>
        </form>

        {/* Resend OTP */}
        <div className="text-center space-y-2">
          <p className="text-sm text-muted-foreground">
            Didn't receive the code?
          </p>
          <Button
            variant="ghost"
            onClick={handleResendOtp}
            disabled={!canResend || isResending}
            className="text-primary"
          >
            {isResending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sending...
              </>
            ) : canResend ? (
              "Resend Code"
            ) : (
              `Resend in ${formatTime(timeLeft)}`
            )}
          </Button>
        </div>

        {/* Dev Mode OTP Display */}
        {devOTP && (
          <div className="mt-4 p-4 rounded-lg bg-amber-500/10 border border-amber-500/30">
            <p className="text-xs text-amber-600 dark:text-amber-400 text-center font-medium mb-2">
              ⚠️ Development Mode - Email delivery failed
            </p>
            <div className="text-center">
              <p className="text-xs text-muted-foreground mb-1">Your OTP code:</p>
              <p className="text-2xl font-bold tracking-widest text-amber-600 dark:text-amber-400">
                {devOTP}
              </p>
            </div>
            <p className="text-xs text-muted-foreground text-center mt-2">
              This is only shown in development mode when email fails.
            </p>
          </div>
        )}

        {/* Help Text */}
        <div className="mt-6 p-4 rounded-lg bg-secondary/50 border border-border">
          <p className="text-xs text-muted-foreground text-center">
            <strong>Note:</strong> Check your spam folder if you don't see the email. 
            The verification code is valid for 10 minutes.
          </p>
        </div>
      </div>
    </AuthLayout>
  );
};

export default VerifyEmail;
