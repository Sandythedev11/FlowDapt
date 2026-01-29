import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { 
  Settings as SettingsIcon, 
  Bell, 
  Moon, 
  Sun, 
  Monitor,
  UserX,
  Trash2,
  LogOut,
  Shield,
  Eye,
  EyeOff,
  Loader2,
  AlertTriangle,
  User,
  Mail,
  Check,
  X,
  Plus
} from "lucide-react";
import { useTheme } from "@/hooks/useTheme";
import { API_ENDPOINTS } from "@/config/api";
import { toast } from "sonner";

const Settings = () => {
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();
  
  // User profile state
  const [user, setUser] = useState({ name: "", email: "", recoveryEmail: "", recoveryEmailVerified: false });
  const [editName, setEditName] = useState("");
  const [isEditingName, setIsEditingName] = useState(false);
  const [isSavingName, setIsSavingName] = useState(false);
  
  // Recovery email state
  const [showRecoveryDialog, setShowRecoveryDialog] = useState(false);
  const [recoveryEmail, setRecoveryEmail] = useState("");
  const [recoveryOTP, setRecoveryOTP] = useState("");
  const [isAddingRecovery, setIsAddingRecovery] = useState(false);
  const [isVerifyingRecovery, setIsVerifyingRecovery] = useState(false);
  const [showRecoveryOTPInput, setShowRecoveryOTPInput] = useState(false);
  
  // General Settings State
  const [gmailNotifications, setGmailNotifications] = useState(true);

  // Account action states
  const [showDeactivateDialog, setShowDeactivateDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [showForgotPasswordLink, setShowForgotPasswordLink] = useState(false);

  // Load user data
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const parsed = JSON.parse(storedUser);
        setUser({
          name: parsed.name || "",
          email: parsed.email || "",
          recoveryEmail: parsed.recoveryEmail || "",
          recoveryEmailVerified: parsed.recoveryEmailVerified || false,
        });
        setEditName(parsed.name || "");
      } catch {
        // Use default
      }
    }
    // Fetch latest user data from server
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(API_ENDPOINTS.AUTH.ME, {
        headers: { "Authorization": `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setUser({
          name: data.name,
          email: data.email,
          recoveryEmail: data.recoveryEmail || "",
          recoveryEmailVerified: data.recoveryEmailVerified || false,
        });
        setEditName(data.name);
        // Update localStorage
        localStorage.setItem("user", JSON.stringify(data));
      }
    } catch (err) {
      console.error("Failed to fetch user data:", err);
    }
  };

  // Handle name update
  const handleSaveName = async () => {
    if (!editName.trim() || editName.trim() === user.name) {
      setIsEditingName(false);
      return;
    }

    setIsSavingName(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(API_ENDPOINTS.AUTH.UPDATE_PROFILE, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({ name: editName.trim() }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to update name");
      }

      setUser(prev => ({ ...prev, name: data.name }));
      localStorage.setItem("user", JSON.stringify({ ...user, name: data.name }));
      toast.success("Name updated successfully");
      setIsEditingName(false);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsSavingName(false);
    }
  };

  // Handle add recovery email
  const handleAddRecoveryEmail = async () => {
    if (!recoveryEmail.trim()) {
      toast.error("Please enter a recovery email");
      return;
    }

    setIsAddingRecovery(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(API_ENDPOINTS.AUTH.ADD_RECOVERY_EMAIL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({ recoveryEmail: recoveryEmail.trim() }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to add recovery email");
      }

      toast.success("Verification code sent to your recovery email");
      setShowRecoveryOTPInput(true);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsAddingRecovery(false);
    }
  };

  // Handle verify recovery email
  const handleVerifyRecoveryEmail = async () => {
    if (!recoveryOTP.trim() || recoveryOTP.length !== 6) {
      toast.error("Please enter a valid 6-digit code");
      return;
    }

    setIsVerifyingRecovery(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(API_ENDPOINTS.AUTH.VERIFY_RECOVERY_EMAIL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({ otp: recoveryOTP }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to verify recovery email");
      }

      setUser(prev => ({ ...prev, recoveryEmail: data.recoveryEmail, recoveryEmailVerified: true }));
      toast.success("Recovery email verified successfully!");
      setShowRecoveryDialog(false);
      resetRecoveryState();
      fetchUserData();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsVerifyingRecovery(false);
    }
  };

  // Handle remove recovery email
  const handleRemoveRecoveryEmail = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(API_ENDPOINTS.AUTH.REMOVE_RECOVERY_EMAIL, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` },
      });

      if (!response.ok) {
        throw new Error("Failed to remove recovery email");
      }

      setUser(prev => ({ ...prev, recoveryEmail: "", recoveryEmailVerified: false }));
      toast.success("Recovery email removed");
      fetchUserData();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const resetRecoveryState = () => {
    setRecoveryEmail("");
    setRecoveryOTP("");
    setShowRecoveryOTPInput(false);
  };

  // Handle Gmail notification toggle
  const handleGmailNotificationToggle = () => {
    setGmailNotifications(prev => {
      const newState = !prev;
      toast.success(`Gmail notifications ${newState ? 'enabled' : 'disabled'}`);
      return newState;
    });
  };



  // Handle theme change
  const handleThemeChange = (value: "light" | "dark" | "system") => {
    setTheme(value);
    toast.success(`Theme changed to ${value} mode`);
  };

  // Reset dialog state
  const resetDialogState = () => {
    setPassword("");
    setShowPassword(false);
    setError("");
    setShowForgotPasswordLink(false);
    setIsLoading(false);
  };

  // Handle account deactivation
  const handleDeactivateAccount = async () => {
    if (!password) {
      setError("Please enter your password");
      return;
    }
    setIsLoading(true);
    setError("");
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(API_ENDPOINTS.AUTH.DEACTIVATE_ACCOUNT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({ password }),
      });
      const data = await response.json();
      if (!response.ok) {
        if (data.showForgotPassword) setShowForgotPasswordLink(true);
        throw new Error(data.message || "Failed to deactivate account");
      }
      localStorage.clear();
      toast.success("Account deactivated successfully");
      setShowDeactivateDialog(false);
      navigate("/");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle account deletion
  const handleDeleteAccount = async () => {
    if (!password) {
      setError("Please enter your password");
      return;
    }
    setIsLoading(true);
    setError("");
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(API_ENDPOINTS.AUTH.DELETE_ACCOUNT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({ password }),
      });
      const data = await response.json();
      if (!response.ok) {
        if (data.showForgotPassword) setShowForgotPasswordLink(true);
        throw new Error(data.message || "Failed to delete account");
      }
      localStorage.clear();
      toast.success("Account deleted permanently");
      setShowDeleteDialog(false);
      navigate("/");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    toast.success("Logged out successfully");
    navigate("/");
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-4xl">
        {/* Page Header */}
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <SettingsIcon className="h-6 w-6" />
            Settings
          </h1>
          <p className="text-muted-foreground">Manage your account settings and preferences</p>
        </div>

        {/* Edit Profile */}
        <Card className="card-shadow">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <User className="h-5 w-5 text-primary" />
              Edit Profile
            </CardTitle>
            <CardDescription>Update your personal information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Name */}
            <div className="space-y-2">
              <Label>Display Name</Label>
              <div className="flex items-center gap-2">
                {isEditingName ? (
                  <>
                    <Input
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="max-w-xs"
                      maxLength={50}
                    />
                    <Button size="sm" onClick={handleSaveName} disabled={isSavingName}>
                      {isSavingName ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => { setIsEditingName(false); setEditName(user.name); }}>
                      <X className="h-4 w-4" />
                    </Button>
                  </>
                ) : (
                  <>
                    <span className="text-lg font-medium">{user.name}</span>
                    <Button size="sm" variant="ghost" onClick={() => setIsEditingName(true)}>
                      Edit
                    </Button>
                  </>
                )}
              </div>
            </div>

            <Separator />

            {/* Email */}
            <div className="space-y-2">
              <Label>Primary Email</Label>
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span>{user.email}</span>
                <Badge variant="secondary" className="text-xs">Primary</Badge>
              </div>
            </div>

            <Separator />

            {/* Recovery Email */}
            <div className="space-y-2">
              <Label>Recovery Email</Label>
              <p className="text-sm text-muted-foreground">Add a backup email for account recovery</p>
              {user.recoveryEmail ? (
                <div className="flex items-center gap-2 mt-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span>{user.recoveryEmail}</span>
                  {user.recoveryEmailVerified ? (
                    <Badge className="bg-green-500 text-xs">Verified</Badge>
                  ) : (
                    <Badge variant="outline" className="text-amber-500 border-amber-500 text-xs">Pending</Badge>
                  )}
                  <Button size="sm" variant="ghost" className="text-destructive" onClick={handleRemoveRecoveryEmail}>
                    Remove
                  </Button>
                </div>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-2"
                  onClick={() => { resetRecoveryState(); setShowRecoveryDialog(true); }}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Recovery Email
                </Button>
              )}
            </div>
          </CardContent>
        </Card>


        {/* General Settings */}
        <Card className="card-shadow">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Bell className="h-5 w-5 text-primary" />
              General Settings
            </CardTitle>
            <CardDescription>Configure your global app preferences</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <h3 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">Notifications</h3>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="gmail-notifications">Gmail Notifications</Label>
                  <p className="text-sm text-muted-foreground">Receive email updates about your activity</p>
                </div>
                <Switch id="gmail-notifications" checked={gmailNotifications} onCheckedChange={handleGmailNotificationToggle} />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Theme Settings */}
        <Card className="card-shadow">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2"><Sun className="h-5 w-5 text-chart-4" />Theme</CardTitle>
            <CardDescription>Customize the appearance</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <button onClick={() => handleThemeChange("light")} className={`p-4 rounded-xl border-2 transition-all ${theme === "light" ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"}`}>
                <div className="flex flex-col items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center"><Sun className="h-6 w-6 text-amber-600" /></div>
                  <div className="text-center"><p className="font-medium">Light</p><p className="text-xs text-muted-foreground">Bright and clean</p></div>
                </div>
              </button>
              <button onClick={() => handleThemeChange("dark")} className={`p-4 rounded-xl border-2 transition-all ${theme === "dark" ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"}`}>
                <div className="flex flex-col items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center"><Moon className="h-6 w-6 text-slate-300" /></div>
                  <div className="text-center"><p className="font-medium">Dark</p><p className="text-xs text-muted-foreground">Easy on the eyes</p></div>
                </div>
              </button>
              <button onClick={() => handleThemeChange("system")} className={`p-4 rounded-xl border-2 transition-all ${theme === "system" ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"}`}>
                <div className="flex flex-col items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-100 to-slate-800 flex items-center justify-center"><Monitor className="h-6 w-6 text-white" /></div>
                  <div className="text-center"><p className="font-medium">System</p><p className="text-xs text-muted-foreground">Match device</p></div>
                </div>
              </button>
            </div>
          </CardContent>
        </Card>

        {/* Account Settings */}
        <Card className="card-shadow border-destructive/20">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2"><Shield className="h-5 w-5 text-destructive" />Account Settings</CardTitle>
            <CardDescription>Manage your account status</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="flex items-center gap-2"><UserX className="h-4 w-4" />Deactivate Account</Label>
                <p className="text-sm text-muted-foreground">Temporarily disable your account</p>
              </div>
              <Button variant="outline" className="border-amber-500 text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950" onClick={() => { resetDialogState(); setShowDeactivateDialog(true); }}>Deactivate</Button>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="flex items-center gap-2 text-destructive"><Trash2 className="h-4 w-4" />Delete Account</Label>
                <p className="text-sm text-muted-foreground">Permanently delete your account</p>
              </div>
              <Button variant="destructive" onClick={() => { resetDialogState(); setShowDeleteDialog(true); }}>Delete</Button>
            </div>
          </CardContent>
        </Card>

        {/* Logout */}
        <Card className="card-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="flex items-center gap-2 text-base font-medium"><LogOut className="h-4 w-4" />Sign Out</Label>
                <p className="text-sm text-muted-foreground">Sign out of your account</p>
              </div>
              <AlertDialog>
                <AlertDialogTrigger asChild><Button variant="outline"><LogOut className="mr-2 h-4 w-4" />Logout</Button></AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader><AlertDialogTitle>Sign out?</AlertDialogTitle><AlertDialogDescription>You will be signed out of your account.</AlertDialogDescription></AlertDialogHeader>
                  <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={handleLogout}>Sign Out</AlertDialogAction></AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </CardContent>
        </Card>
      </div>


      {/* Recovery Email Dialog */}
      <Dialog open={showRecoveryDialog} onOpenChange={(open) => { if (!open) resetRecoveryState(); setShowRecoveryDialog(open); }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><Mail className="h-5 w-5 text-primary" />Add Recovery Email</DialogTitle>
            <DialogDescription>Add a backup email for account recovery. We'll send a verification code.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {!showRecoveryOTPInput ? (
              <div className="space-y-2">
                <Label htmlFor="recovery-email">Recovery Email</Label>
                <Input id="recovery-email" type="email" placeholder="backup@example.com" value={recoveryEmail} onChange={(e) => setRecoveryEmail(e.target.value)} />
              </div>
            ) : (
              <div className="space-y-2">
                <Label htmlFor="recovery-otp">Verification Code</Label>
                <Input id="recovery-otp" type="text" inputMode="numeric" placeholder="Enter 6-digit code" value={recoveryOTP} onChange={(e) => setRecoveryOTP(e.target.value.replace(/\D/g, '').slice(0, 6))} className="text-center text-xl tracking-widest" maxLength={6} />
                <p className="text-xs text-muted-foreground text-center">Enter the code sent to {recoveryEmail}</p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRecoveryDialog(false)}>Cancel</Button>
            {!showRecoveryOTPInput ? (
              <Button onClick={handleAddRecoveryEmail} disabled={isAddingRecovery || !recoveryEmail}>
                {isAddingRecovery ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Sending...</> : "Send Code"}
              </Button>
            ) : (
              <Button onClick={handleVerifyRecoveryEmail} disabled={isVerifyingRecovery || recoveryOTP.length !== 6}>
                {isVerifyingRecovery ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Verifying...</> : "Verify"}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Deactivate Dialog */}
      <Dialog open={showDeactivateDialog} onOpenChange={(open) => { if (!open) resetDialogState(); setShowDeactivateDialog(open); }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><UserX className="h-5 w-5 text-amber-500" />Deactivate Account</DialogTitle>
            <DialogDescription>Enter your password to confirm. You can reactivate by logging in.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="deactivate-password">Password</Label>
              <div className="relative">
                <Input id="deactivate-password" type={showPassword ? "text" : "password"} placeholder="Enter your password" value={password} onChange={(e) => { setPassword(e.target.value); setError(""); setShowForgotPasswordLink(false); }} className={error ? "border-destructive pr-10" : "pr-10"} />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {error && <div className="flex items-center gap-2 text-sm text-destructive"><AlertTriangle className="h-4 w-4" />{error}</div>}
              {showForgotPasswordLink && <Link to="/forgot-password" className="text-sm text-primary hover:underline block" onClick={() => setShowDeactivateDialog(false)}>Forgot your password?</Link>}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeactivateDialog(false)}>Cancel</Button>
            <Button onClick={handleDeactivateAccount} disabled={isLoading || !password} className="bg-amber-500 hover:bg-amber-600">
              {isLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Deactivating...</> : "Deactivate"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={(open) => { if (!open) resetDialogState(); setShowDeleteDialog(open); }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive"><Trash2 className="h-5 w-5" />Delete Account Permanently</DialogTitle>
            <DialogDescription>This cannot be undone. All your data will be deleted.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20">
              <p className="text-sm text-destructive font-medium">Warning: This will permanently delete:</p>
              <ul className="text-sm text-muted-foreground mt-2 space-y-1 list-disc list-inside">
                <li>Your account and profile</li>
                <li>All uploaded files and data</li>
                <li>Analytics and insights history</li>
              </ul>
            </div>
            <div className="space-y-2">
              <Label htmlFor="delete-password">Password</Label>
              <div className="relative">
                <Input id="delete-password" type={showPassword ? "text" : "password"} placeholder="Enter your password" value={password} onChange={(e) => { setPassword(e.target.value); setError(""); setShowForgotPasswordLink(false); }} className={error ? "border-destructive pr-10" : "pr-10"} />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {error && <div className="flex items-center gap-2 text-sm text-destructive"><AlertTriangle className="h-4 w-4" />{error}</div>}
              {showForgotPasswordLink && <Link to="/forgot-password" className="text-sm text-primary hover:underline block" onClick={() => setShowDeleteDialog(false)}>Forgot your password?</Link>}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDeleteAccount} disabled={isLoading || !password}>
              {isLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Deleting...</> : "Delete Forever"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default Settings;
