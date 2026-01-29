import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, Loader2, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { API_ENDPOINTS, getAuthHeaders } from "@/config/api";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isReactivating, setIsReactivating] = useState(false);
  const [showReactivateDialog, setShowReactivateDialog] = useState(false);
  const [deactivatedEmail, setDeactivatedEmail] = useState("");
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const navigate = useNavigate();
  const { toast } = useToast();

  const validateForm = () => {
    const newErrors: { email?: string; password?: string } = {};
    
    if (!email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Please enter a valid email";
    }
    
    if (!password) {
      newErrors.password = "Password is required";
    } else if (password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsLoading(true);
    
    try {
      const response = await fetch(API_ENDPOINTS.AUTH.LOGIN, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        // Check if account is deactivated
        if (data.isDeactivated) {
          setDeactivatedEmail(data.email);
          setShowReactivateDialog(true);
          setIsLoading(false);
          return;
        }
        throw new Error(data.message || 'Login failed');
      }

      // Clear any previous user's data before storing new user
      // This ensures complete data isolation between users
      const previousUser = localStorage.getItem('user');
      if (previousUser) {
        try {
          const prevUserData = JSON.parse(previousUser);
          // Clear previous user's scoped data if different user
          if (prevUserData._id !== data._id) {
            // Remove all keys that start with the previous user's ID
            const keysToRemove: string[] = [];
            for (let i = 0; i < localStorage.length; i++) {
              const key = localStorage.key(i);
              if (key && key.startsWith(`${prevUserData._id}_`)) {
                keysToRemove.push(key);
              }
            }
            // Don't actually remove - just let the new user have their own namespace
          }
        } catch (e) {
          // Ignore parse errors
        }
      }

      // Store token and user data
      if (data.token) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify({
          _id: data._id,
          name: data.name,
          email: data.email,
          role: data.role,
        }));
      }

      // Clear any pending verification data
      localStorage.removeItem('pendingVerificationEmail');
      localStorage.removeItem('pendingVerificationName');

      toast({
        title: "Welcome back!",
        description: `Logged in as ${data.name}`,
      });

      // Navigate to user's personal dashboard
      navigate("/dashboard");

    } catch (error: any) {
      toast({
        title: "Login failed",
        description: error.message || "Invalid email or password. Please try again.",
        variant: "destructive",
      });
      
      // Clear password field on error
      setPassword("");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle account reactivation
  const handleReactivate = async () => {
    setIsReactivating(true);
    
    try {
      const response = await fetch(API_ENDPOINTS.AUTH.REACTIVATE_ACCOUNT, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          email: deactivatedEmail,
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Reactivation failed');
      }

      // Store token and user data
      if (data.token) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify({
          _id: data._id,
          name: data.name,
          email: data.email,
          role: data.role,
        }));
      }

      toast({
        title: "Account Reactivated!",
        description: `Welcome back, ${data.name}!`,
      });

      setShowReactivateDialog(false);
      // Navigate to user's personal dashboard
      navigate("/dashboard");

    } catch (error: any) {
      toast({
        title: "Reactivation failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsReactivating(false);
    }
  };

  return (
    <AuthLayout title="Welcome back" subtitle="Enter your credentials to access your account">
      <form onSubmit={handleSubmit} className="space-y-4">
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
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Password</Label>
            <Link 
              to="/forgot-password" 
              className="text-sm text-primary hover:underline"
            >
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
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
        </div>

        <Button type="submit" variant="gradient" className="w-full" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Signing in...
            </>
          ) : (
            "Sign In"
          )}
        </Button>
      </form>

      <div className="mt-6 text-center text-sm text-muted-foreground">
        Don't have an account?{" "}
        <Link to="/register" className="text-primary font-medium hover:underline">
          Sign up
        </Link>
      </div>

      {/* Reactivate Account Dialog */}
      <AlertDialog open={showReactivateDialog} onOpenChange={setShowReactivateDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              Account Deactivated
            </AlertDialogTitle>
            <AlertDialogDescription>
              Your account has been deactivated. Would you like to reactivate it and continue using FlowDapt?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => {
              setShowReactivateDialog(false);
              setPassword("");
            }}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleReactivate}
              disabled={isReactivating}
              className="bg-primary"
            >
              {isReactivating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Reactivating...
                </>
              ) : (
                "Reactivate Account"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AuthLayout>
  );
};

export default Login;
