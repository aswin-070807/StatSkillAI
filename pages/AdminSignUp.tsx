import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { BarChart2, ShieldAlert, Loader2, AlertCircle, CheckCircle2, ArrowRight, Copy, ExternalLink, MailCheck } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/PasswordInput";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Organization } from "@/lib/mockAuthStore";

const ADMIN_ROLE_OPTIONS = [
  "Department Head / Director",
  "NSSTA Training Officer",
  "NSSTA Faculty / Trainer",
  "Capacity Building Commission (CBC) Official",
  "HR / Administrative Officer",
  "Others",
];

export function AdminSignUp() {
  const navigate = useNavigate();
  const { signupAdmin } = useAuth();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [adminRoleSelect, setAdminRoleSelect] = useState("");
  const [customAdminRole, setCustomAdminRole] = useState("");
  const [organizationName, setOrganizationName] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Verification modal state
  const [verificationModalOpen, setVerificationModalOpen] = useState(false);
  const [createdOrg, setCreatedOrg] = useState<Organization | null>(null);
  const [verificationToken, setVerificationToken] = useState("");
  const [registeredEmail, setRegisteredEmail] = useState("");

  const finalAdminRole = adminRoleSelect === "Others" ? customAdminRole : adminRoleSelect;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const trimmedName = name.trim();
    if (!trimmedName || trimmedName.length < 2) {
      setError("Please enter your full name (at least 2 characters).");
      return;
    }

    const trimmedEmail = email.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!trimmedEmail || !emailRegex.test(trimmedEmail)) {
      setError("Please provide a valid official email address format (e.g. admin@mospi.gov.in).");
      return;
    }

    if (!password) {
      setError("Please enter a secure password.");
      return;
    }

    if (password.length < 8) {
      setError("Weak password: Password must be at least 8 characters long.");
      return;
    }

    if (!/[A-Za-z]/.test(password) || !/[0-9]/.test(password)) {
      setError("Weak password: Password must contain at least one letter and one number for administrator security.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match. Please verify your confirmation password.");
      return;
    }

    if (!adminRoleSelect) {
      setError("Please select an administrator role designation.");
      return;
    }

    if (adminRoleSelect === "Others" && !customAdminRole.trim()) {
      setError("Please specify your administrator role description.");
      return;
    }

    if (!organizationName.trim()) {
      setError("Please enter your department or organization name.");
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await signupAdmin({
        name: trimmedName,
        email: trimmedEmail,
        password,
        adminRole: finalAdminRole,
        organizationName: organizationName.trim(),
      });

      if (res.error) {
        const msg = res.error.message.toLowerCase();
        if (msg.includes("already exists") || msg.includes("duplicate")) {
          setError("An account with this email address already exists. Please sign in instead.");
        } else if (msg.includes("weak") || msg.includes("password")) {
          setError("Password does not meet security requirements. Please use at least 8 characters.");
        } else if (msg.includes("network") || msg.includes("failed to fetch") || msg.includes("connect")) {
          setError("Unable to connect to the authentication server. Please check your internet connection and try again.");
        } else if (msg.includes("rate") || msg.includes("too many")) {
          setError("Too many registration attempts. Please wait a moment before trying again.");
        } else {
          setError(res.error.message);
        }
      } else if (res.organization && res.verificationToken) {
        setCreatedOrg(res.organization);
        setVerificationToken(res.verificationToken);
        setRegisteredEmail(trimmedEmail);
        setVerificationModalOpen(true);
      }
    } catch (err: any) {
      const msg = (err?.message || "").toLowerCase();
      if (msg.includes("already exists")) {
        setError("An account with this email address already exists. Please sign in instead.");
      } else if (msg.includes("failed to fetch") || msg.includes("network")) {
        setError("Network connection failure. Please ensure the backend server is reachable.");
      } else {
        setError(err?.message || "Admin registration request failed.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const verificationLink = `/verify-email?email=${encodeURIComponent(registeredEmail)}&token=${encodeURIComponent(verificationToken)}`;

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12 text-foreground font-sans animate-page-fade">
      <div className="w-full max-w-lg space-y-6">
        <div className="rounded-2xl border border-border/80 bg-card p-8 shadow-xl sm:p-10 space-y-6">
          <div className="flex flex-col items-center text-center space-y-2">
            <div className="flex size-14 items-center justify-center rounded-2xl bg-primary/10 border border-primary/20 text-primary shadow-sm mb-1">
              <ShieldAlert className="size-7 text-accent" />
            </div>
            <h1 className="text-2xl font-extrabold tracking-tight text-foreground">
              Administrator Registration
            </h1>
            <p className="text-xs text-muted-foreground font-medium">
              StatSkill AI • Workforce Governance Console
            </p>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="size-4" />
              <AlertTitle>Registration Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div className="space-y-1.5">
              <Label htmlFor="name" className="text-xs font-bold text-foreground">Full Name *</Label>
              <Input
                id="name"
                placeholder="Dr. Rajesh Kumar"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={isSubmitting}
                className="h-11 text-xs rounded-xl border border-input bg-background font-medium focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-xs font-bold text-foreground">Official Email Address *</Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@mospi.gov.in"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isSubmitting}
                className="h-11 text-xs rounded-xl border border-input bg-background font-medium focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                required
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="password" className="text-xs font-bold text-foreground">Password *</Label>
                <PasswordInput
                  id="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isSubmitting}
                  className="h-11 text-xs rounded-xl border border-input bg-background font-medium focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="confirmPassword" className="text-xs font-bold text-foreground">Confirm Password *</Label>
                <PasswordInput
                  id="confirmPassword"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={isSubmitting}
                  className="h-11 text-xs rounded-xl border border-input bg-background font-medium focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="adminRoleSelect" className="text-xs font-bold text-foreground">Official Role *</Label>
              <Select value={adminRoleSelect} onValueChange={setAdminRoleSelect}>
                <SelectTrigger className="h-11 text-xs rounded-xl border-input bg-background font-medium focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all">
                  <SelectValue placeholder="Select Administrator Designation" />
                </SelectTrigger>
                <SelectContent>
                  {ADMIN_ROLE_OPTIONS.map((opt) => (
                    <SelectItem key={opt} value={opt} className="text-xs">
                      {opt}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {adminRoleSelect === "Others" && (
              <div className="space-y-1.5">
                <Label htmlFor="customAdminRole" className="text-xs font-bold text-foreground">Specify Exact Role *</Label>
                <Input
                  id="customAdminRole"
                  placeholder="e.g. Director General, State Directorate of Economics & Statistics"
                  value={customAdminRole}
                  onChange={(e) => setCustomAdminRole(e.target.value)}
                  disabled={isSubmitting}
                  className="h-11 text-xs rounded-xl border border-input bg-background font-medium focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                  required
                />
              </div>
            )}

            <div className="space-y-1.5">
              <Label htmlFor="organizationName" className="text-xs font-bold text-foreground">Organization / Department Name *</Label>
              <Input
                id="organizationName"
                placeholder="e.g. NSSTA – Statistics Training Division"
                value={organizationName}
                onChange={(e) => setOrganizationName(e.target.value)}
                disabled={isSubmitting}
                className="h-11 text-xs rounded-xl border border-input bg-background font-medium focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                required
              />
              <p className="text-[10px] text-muted-foreground mt-0.5 font-medium">
                A unique Organization Code (e.g. NSSTA-4821) will be generated for your department.
              </p>
            </div>

            <Button
              type="submit"
              disabled={isSubmitting}
              className="h-11 w-full bg-primary text-primary-foreground font-bold text-xs rounded-xl shadow-md hover:bg-primary/90 transition-all mt-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" />
                  Generating Organization Code & Sending Email...
                </>
              ) : (
                "Register Administrator Account"
              )}
            </Button>
          </form>

          <div className="mt-6 text-center text-xs">
            <span className="text-muted-foreground">Already registered as Admin? </span>
            <Link to="/login" className="font-bold text-secondary underline-offset-4 hover:underline">
              Sign In Here
            </Link>
          </div>
        </div>

        <div className="text-center text-xs space-y-1">
          <p className="font-semibold text-foreground/80 text-xs">
            © 2026 StatSkill AI. Built by Team Byte Blazers.
          </p>
        </div>
      </div>

      {/* Real Email Verification Confirmation Modal */}
      <Dialog open={verificationModalOpen} onOpenChange={setVerificationModalOpen}>
        <DialogContent className="sm:max-w-md border-border bg-card p-6 space-y-4">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-foreground flex items-center gap-2">
              <MailCheck className="size-5 text-secondary" /> Verification Email Sent
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              A real account activation link has been sent to your email.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 text-xs py-2">
            <div className="rounded-xl bg-secondary/10 border border-secondary/20 p-4 space-y-2">
              <div className="flex items-center justify-between font-semibold text-foreground">
                <span>Organization Generated:</span>
                <span className="text-secondary font-mono font-extrabold">{createdOrg?.name}</span>
              </div>
              <div className="flex items-center justify-between font-semibold text-foreground">
                <span>Unique Org Code:</span>
                <span className="bg-primary text-primary-foreground font-mono px-2 py-0.5 rounded font-bold">
                  {createdOrg?.orgCode}
                </span>
              </div>
            </div>

            <div className="rounded-xl bg-primary/5 border border-primary/20 p-4 space-y-2 text-center">
              <p className="text-xs text-foreground font-medium">
                Verification email sent to <strong className="text-primary font-bold">{registeredEmail}</strong>.
              </p>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                Please check your inbox (and spam folder) and click the link inside to activate your account before logging in.
              </p>
            </div>

            {verificationToken && (
              <div className="rounded-xl bg-muted/60 p-3 border border-border text-[11px] text-muted-foreground flex items-center justify-between gap-2">
                <span>Verification Link (Immediate Access):</span>
                <Link
                  to={verificationLink}
                  className="font-bold text-secondary hover:underline flex items-center gap-1 shrink-0"
                >
                  Verify Now <ExternalLink className="size-3" />
                </Link>
              </div>
            )}

            <Button
              onClick={() => {
                setVerificationModalOpen(false);
                navigate("/login", {
                  state: {
                    message: `Admin registration submitted for ${registeredEmail}. Please verify your email before signing in.`,
                    registeredEmail,
                  },
                });
              }}
              className="w-full bg-primary text-primary-foreground font-bold text-xs h-11 rounded-xl shadow-md"
            >
              Proceed to Sign In
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
