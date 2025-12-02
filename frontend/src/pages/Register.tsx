import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, Loader2, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Register = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ name?: string; email?: string; password?: string }>({});
  const navigate = useNavigate();
  const { toast } = useToast();

  const passwordRequirements = [
    { label: "At least 8 characters", met: password.length >= 8 },
    { label: "Contains a number", met: /\d/.test(password) },
    { label: "Contains uppercase", met: /[A-Z]/.test(password) },
  ];

  // Validate name - only letters, spaces, hyphens, and apostrophes
  const isValidName = (name: string) => {
    // Allow only letters (including accented), spaces, hyphens, and apostrophes
    const nameRegex = /^[a-zA-ZÀ-ÿ\s'-]+$/;
    return nameRegex.test(name);
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Only update if valid or empty (to allow deletion)
    if (value === '' || isValidName(value)) {
      setName(value);
      // Clear name error when user types valid input
      if (errors.name && value.trim()) {
        setErrors(prev => ({ ...prev, name: undefined }));
      }
    }
  };

  const validateForm = () => {
    const newErrors: { name?: string; email?: string; password?: string } = {};
    
    if (!name.trim()) {
      newErrors.name = "Name is required";
    } else if (name.trim().length < 2) {
      newErrors.name = "Name must be at least 2 characters";
    } else if (!isValidName(name)) {
      newErrors.name = "Name can only contain letters, spaces, hyphens, and apostrophes";
    }
    
    if (!email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Please enter a valid email";
    }
    
    if (!password) {
      newErrors.password = "Password is required";
    } else if (!passwordRequirements.every(req => req.met)) {
      newErrors.password = "Password doesn't meet all requirements";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsLoading(true);
    
    try {
      const response = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim().toLowerCase(),
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Registration failed');
      }

      // Success - show message about email verification
      toast({
        title: "Account created!",
        description: data.message || "Please check your email for verification OTP.",
      });

      // Store email and name for verification page
      localStorage.setItem('pendingVerificationEmail', email);
      localStorage.setItem('pendingVerificationName', name);
      
      // If dev OTP is returned (email failed in dev mode), store it for display
      if (data.devOTP) {
        localStorage.setItem('devOTP', data.devOTP);
      }
      
      // Navigate to verification page
      navigate("/verify-email", { 
        state: { 
          email: email,
          name: name,
          devOTP: data.devOTP // Pass dev OTP if available
        } 
      });
      
    } catch (error: any) {
      toast({
        title: "Registration failed",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout title="Create an account" subtitle="Start your free trial today">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Full Name</Label>
          <Input
            id="name"
            type="text"
            placeholder="John Doe"
            value={name}
            onChange={handleNameChange}
            className={errors.name ? "border-destructive" : ""}
            maxLength={50}
          />
          {errors.name && (
            <p className="text-sm text-destructive">{errors.name}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={errors.email ? "border-destructive" : ""}
          />
          {errors.email && (
            <p className="text-sm text-destructive">{errors.email}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="Create a password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={errors.password ? "border-destructive pr-10" : "pr-10"}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {errors.password && (
            <p className="text-sm text-destructive">{errors.password}</p>
          )}
          <div className="space-y-1 pt-2">
            {passwordRequirements.map((req) => (
              <div key={req.label} className="flex items-center gap-2 text-sm">
                <div className={`w-4 h-4 rounded-full flex items-center justify-center ${
                  req.met ? "bg-accent text-accent-foreground" : "bg-muted"
                }`}>
                  {req.met && <Check className="h-3 w-3" />}
                </div>
                <span className={req.met ? "text-foreground" : "text-muted-foreground"}>
                  {req.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        <Button type="submit" variant="gradient" className="w-full" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Creating account...
            </>
          ) : (
            "Create Account"
          )}
        </Button>
      </form>

      <p className="mt-4 text-xs text-center text-muted-foreground">
        By signing up, you agree to our{" "}
        <Link to="/terms" className="text-primary hover:underline">Terms of Service</Link>
        {" "}and{" "}
        <Link to="/privacy" className="text-primary hover:underline">Privacy Policy</Link>
      </p>

      <div className="mt-6 text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link to="/login" className="text-primary font-medium hover:underline">
          Sign in
        </Link>
      </div>
    </AuthLayout>
  );
};

export default Register;
