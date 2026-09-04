import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { BarChart2, ShieldCheck, Loader2, AlertCircle, CheckCircle2, UserCheck, ShieldAlert, MailWarning, ExternalLink } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/PasswordInput";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

export function Login() {
  const location = useLocation();
  const navigate = useNavigate();
  const { login, resendVerification } = useAuth();

  const [accountType, setAccountType] = useState<"learner" | "admin">("learner");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Pending verification alert state
  const [isPendingVerification, setIsPendingVerification] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);
  const [resentToken, setResentToken] = useState("");

  useEffect(() => {
    if (location.state?.message) {
      setSuccessMessage(location.state.message);
    }
    if (location.state?.registeredEmail) {
      setEmail(location.state.registeredEmail);
    }
  }, [location.state]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedEmail = email.trim().toLowerCase();
    if (!trimmedEmail || !password) {
      setError("Please enter both your official email address and password.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      setError("Please enter a valid official email address format.");
      return;
    }

    setError(null);
    setIsPendingVerification(false);
    setResendSuccess(false);
    setIsSubmitting(true);

    try {
      const res = await login(trimmedEmail, password, accountType);

      if (res.requiresVerification) {
        setIsPendingVerification(true);
        setError("Please verify your email before logging in. Check your inbox for the verification link.");
        setIsSubmitting(false);
        return;
      }

      if (res.error || !res.user) {
        const msg = res.error?.message?.toLowerCase() || "";
        if (msg.includes("verify your email") || msg.includes("unverified")) {
          setIsPendingVerification(true);
          setError("Please verify your email before logging in. Check your inbox for the verification link.");
        } else if (msg.includes("not found") || msg.includes("no account")) {
          setError("No account found with this email. Please check your email address or register.");
        } else if (msg.includes("password") || msg.includes("credential")) {
          setError("Invalid email credentials or password. Please verify your credentials.");
        } else if (msg.includes("network") || msg.includes("failed to fetch") || msg.includes("connect")) {
          setError("Unable to connect to the authentication server. Please check your network connection.");
        } else if (msg.includes("too many") || msg.includes("rate")) {
          setError("Too many login attempts. Please wait a moment before trying again.");
        } else {
          setError(res.error?.message || "Failed to sign in. Please check your credentials.");
        }
      } else {
        const userRole = (res.user.role || "learner").toLowerCase();
        const fromPath = (location.state as any)?.from?.pathname;
        const defaultDestination = userRole === "admin" || userRole === "super_admin" ? "/admin-dashboard" : "/dashboard";
        const destination = fromPath && fromPath !== "/login" ? fromPath : defaultDestination;

        navigate(destination, { replace: true });
      }
    } catch (err: unknown) {
      const msg = (err instanceof Error ? err.message : "").toLowerCase();
      if (msg.includes("network") || msg.includes("failed to fetch")) {
        setError("Unable to connect to the authentication server. Please check your internet connection.");
      } else {
        setError(err instanceof Error ? err.message : "An unexpected authentication error occurred.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResendClick = async () => {
    if (!email) return;
    const res = await resendVerification(email.trim().toLowerCase());
    if (res.success) {
      if (res.token) setResentToken(res.token);
      setResendSuccess(true);
    }
  };

  const handleSSOLogin = async () => {
    setError(null);
    setIsSubmitting(true);
    // Simulate SSO login for active demo officer account
    const res = await login("officer@mospi.gov.in", "officer123", "learner");
    setIsSubmitting(false);
    if (res.user) {
      navigate("/dashboard", { replace: true });
    } else {
      setError("SSO simulation login failed.");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12 text-foreground font-sans animate-page-fade">
      <div className="w-full max-w-md space-y-6">
        <div className="rounded-2xl border border-border/80 bg-card p-8 shadow-xl sm:p-10 space-y-6">
          <div className="flex flex-col items-center text-center space-y-2">
            <div className="flex size-14 items-center justify-center rounded-2xl bg-primary/10 border border-primary/20 text-primary shadow-sm mb-1">
              <BarChart2 className="size-7 text-accent" />
            </div>
            <h1 className="text-2xl font-extrabold tracking-tight text-foreground">
              StatSkill AI
            </h1>
            <p className="text-xs text-muted-foreground font-medium">
              Skill Intelligence & Competency Platform
            </p>
          </div>

          {/* Segmented Control Role Toggle ("Official / Learner" vs "Administrator") */}
          <div className="grid grid-cols-2 gap-1 rounded-xl bg-muted/80 p-1.5 border border-border">
            <button
              type="button"
              onClick={() => {
                setAccountType("learner");
                setError(null);
                setIsPendingVerification(false);
              }}
              className={cn(
                "py-2.5 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-2",
                accountType === "learner"
                  ? "bg-primary text-primary-foreground shadow-md"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <UserCheck className="size-4" /> Official / Learner
            </button>

            <button
              type="button"
              onClick={() => {
                setAccountType("admin");
                setError(null);
                setIsPendingVerification(false);
              }}
              className={cn(
                "py-2.5 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-2",
                accountType === "admin"
                  ? "bg-primary text-primary-foreground shadow-md"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <ShieldAlert className="size-4" /> Administrator
            </button>
          </div>

          {successMessage && (
            <Alert className="border-success/40 bg-success/10 text-success">
              <CheckCircle2 className="size-4" />
              <AlertTitle>Registration Successful</AlertTitle>
              <AlertDescription>{successMessage}</AlertDescription>
            </Alert>
          )}

          {error && (
            <Alert variant="destructive" className="space-y-2">
              <div className="flex items-center gap-2">
                {isPendingVerification ? <MailWarning className="size-4 shrink-0" /> : <AlertCircle className="size-4 shrink-0" />}
                <AlertTitle>{isPendingVerification ? "Verification Required" : "Authentication Notice"}</AlertTitle>
              </div>
              <AlertDescription className="text-xs">{error}</AlertDescription>

              {isPendingVerification && (
                <div className="pt-2 border-t border-destructive/20 flex flex-col gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleResendClick}
                    className="text-xs bg-background hover:bg-muted font-semibold text-destructive border-destructive/30"
                  >
                    Resend Verification Email
                  </Button>

                  {resendSuccess && (
                    <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-[11px] text-emerald-700 dark:text-emerald-300 font-medium space-y-1">
                      <p>✓ Verification email sent to {email}. Please check your inbox (and spam folder).</p>
                      {resentToken && (
                        <div className="pt-1 flex items-center justify-between">
                          <span className="text-[10px] text-muted-foreground">Immediate access link:</span>
                          <Link
                            to={`/verify-email?email=${encodeURIComponent(email)}&token=${encodeURIComponent(resentToken)}`}
                            className="text-[10px] font-bold text-primary hover:underline"
                          >
                            Verify Now →
                          </Link>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-xs font-bold text-foreground">
                {accountType === "admin" ? "Admin Official Email" : "Official / Learner Email"}
              </Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                placeholder={accountType === "admin" ? "admin@mospi.gov.in" : "officer@mospi.gov.in"}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isSubmitting}
                className="h-11 text-xs rounded-xl border border-input bg-background font-medium focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-xs font-bold text-foreground">Password</Label>
              <PasswordInput
                id="password"
                autoComplete="current-password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isSubmitting}
                className="h-11 text-xs rounded-xl border border-input bg-background font-medium focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                required
              />
            </div>

            <Button
              type="submit"
              disabled={isSubmitting}
              className="h-11 w-full bg-primary text-primary-foreground font-bold text-xs rounded-xl shadow-md hover:bg-primary/90 transition-all"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" />
                  Authenticating...
                </>
              ) : accountType === "admin" ? (
                "Sign In as Administrator"
              ) : (
                "Sign In as Official / Learner"
              )}
            </Button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-3 text-muted-foreground text-[10px] font-semibold">Or quick access with</span>
            </div>
          </div>

          <Button
            type="button"
            variant="outline"
            onClick={handleSSOLogin}
            disabled={isSubmitting}
            className="h-10 w-full text-xs border border-secondary/40 text-secondary hover:bg-secondary/10 font-bold rounded-xl flex items-center justify-center gap-2"
          >
            <ShieldCheck className="size-4 text-secondary" />
            Login with SSO (NIC / Parichay Simulation)
          </Button>

          {/* Account Type Specific Signup Link */}
          <div className="mt-6 text-center text-xs">
            {accountType === "admin" ? (
              <>
                <span className="text-muted-foreground">Need an admin account? </span>
                <Link to="/admin-signup" className="font-bold text-secondary underline-offset-4 hover:underline">
                  Register Administrator Access
                </Link>
              </>
            ) : (
              <>
                <span className="text-muted-foreground">Don't have an account? </span>
                <Link to="/signup" className="font-bold text-primary underline-offset-4 hover:underline">
                  Create an Officer Account
                </Link>
              </>
            )}
          </div>
        </div>

        <div className="text-center text-xs space-y-1">
          <p className="font-semibold text-foreground/80 text-xs">
            © 2026 StatSkill AI. Built by Team Byte Blazers.
          </p>
        </div>
      </div>
    </div>
  );
}
