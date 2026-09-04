import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { BarChart2, UserCheck, Loader2, AlertCircle, CheckCircle2, Search, Building2, MailCheck, ExternalLink } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/PasswordInput";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { getStoredOrgs, Organization, createJoinRequest } from "@/lib/mockAuthStore";

export function SignUp() {
  const navigate = useNavigate();
  const { signupLearner, validateOrgCode } = useAuth();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [designation, setDesignation] = useState("");
  const [orgCode, setOrgCode] = useState("");

  const [orgValidation, setOrgValidation] = useState<{
    tested: boolean;
    valid: boolean;
    organization?: Organization;
  }>({ tested: false, valid: false });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Verification modal state
  const [verificationModalOpen, setVerificationModalOpen] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState("");
  const [verificationToken, setVerificationToken] = useState("");

  // Request to Join modal state (Stretch Feature)
  const [joinModalOpen, setJoinModalOpen] = useState(false);
  const [selectedOrgId, setSelectedOrgId] = useState("");
  const [requestSubmitted, setRequestSubmitted] = useState(false);

  // Live Organization Code Validation
  useEffect(() => {
    if (!orgCode.trim()) {
      setOrgValidation({ tested: false, valid: false });
      return;
    }
    const res = validateOrgCode(orgCode);
    setOrgValidation({
      tested: true,
      valid: res.valid,
      organization: res.organization,
    });
  }, [orgCode, validateOrgCode]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // 1. Client-side field validations
    const trimmedName = name.trim();
    if (!trimmedName || trimmedName.length < 2) {
      setError("Please enter your full name (at least 2 characters).");
      return;
    }

    const trimmedEmail = email.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!trimmedEmail || !emailRegex.test(trimmedEmail)) {
      setError("Please provide a valid official email address format (e.g. officer@mospi.gov.in).");
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
      setError("Weak password: Password must contain at least one letter and one number for account security.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match. Please verify your confirmation password.");
      return;
    }

    if (!designation.trim()) {
      setError("Please enter your official designation (e.g. Statistical Officer).");
      return;
    }

    if (!orgCode.trim()) {
      setError("Please enter your department organization code (e.g. NSSTA-4821) or request to join.");
      return;
    }

    if (!orgValidation.valid || !orgValidation.organization) {
      setError("Organization code not recognized. Please check your department code or use 'Request to Join'.");
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await signupLearner({
        name: trimmedName,
        email: trimmedEmail,
        password,
        designation: designation.trim(),
        orgCode: orgCode.trim(),
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
      } else if (res.user && res.verificationToken) {
        setRegisteredEmail(trimmedEmail);
        setVerificationToken(res.verificationToken);
        setVerificationModalOpen(true);
      }
    } catch (err: any) {
      const msg = (err?.message || "").toLowerCase();
      if (msg.includes("already exists")) {
        setError("An account with this email address already exists. Please sign in instead.");
      } else if (msg.includes("failed to fetch") || msg.includes("network")) {
        setError("Network connection failure. Please ensure the backend server is reachable.");
      } else {
        setError(err?.message || "Registration failed. Please check your details and try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const availableOrgs = getStoredOrgs();

  const handleSendJoinRequest = () => {
    if (!name || !email || !selectedOrgId) {
      setError("Please enter your name, email, and select an organization to request.");
      return;
    }
    const targetOrg = availableOrgs.find((o) => o.id === selectedOrgId);
    if (!targetOrg) return;

    createJoinRequest({
      learnerUserId: `temp-${Date.now()}`,
      learnerName: name,
      learnerEmail: email.toLowerCase().trim(),
      learnerDesignation: designation || "Statistical Officer",
      organizationId: targetOrg.id,
      organizationName: targetOrg.name,
    });

    setRequestSubmitted(true);
    setTimeout(() => {
      setJoinModalOpen(false);
      setRequestSubmitted(false);
      // Auto-fill org code if available
      setOrgCode(targetOrg.orgCode);
    }, 1800);
  };

  const verificationLink = `/verify-email?email=${encodeURIComponent(registeredEmail)}&token=${encodeURIComponent(verificationToken)}`;

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12 text-foreground font-sans animate-page-fade">
      <div className="w-full max-w-lg space-y-6">
        <div className="rounded-2xl border border-border/80 bg-card p-8 shadow-xl sm:p-10 space-y-6">
          <div className="flex flex-col items-center text-center space-y-2">
            <div className="flex size-14 items-center justify-center rounded-2xl bg-primary/10 border border-primary/20 text-primary shadow-sm mb-1">
              <UserCheck className="size-7 text-accent" />
            </div>
            <h1 className="text-2xl font-extrabold tracking-tight text-foreground">
              Official / Learner Registration
            </h1>
            <p className="text-xs text-muted-foreground font-medium">
              StatSkill AI • Skill Intelligence Platform
            </p>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="size-4" />
              <AlertTitle>Registration Notice</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div className="space-y-1.5">
              <Label htmlFor="name" className="text-xs font-bold text-foreground">Full Name *</Label>
              <Input
                id="name"
                placeholder="Priya Sharma"
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
                placeholder="officer@mospi.gov.in"
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
              <Label htmlFor="designation" className="text-xs font-bold text-foreground">Designation *</Label>
              <Input
                id="designation"
                placeholder="e.g. Senior Statistical Officer, Investigator"
                value={designation}
                onChange={(e) => setDesignation(e.target.value)}
                disabled={isSubmitting}
                className="h-11 text-xs rounded-xl border border-input bg-background font-medium focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                required
              />
            </div>

            {/* Organization Code Field + Live Validation */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="orgCode" className="text-xs font-bold text-foreground">Organization Code *</Label>
                <button
                  type="button"
                  onClick={() => setJoinModalOpen(true)}
                  className="text-[11px] font-bold text-secondary hover:underline"
                >
                  Don't have a code? Request to Join
                </button>
              </div>
              <Input
                id="orgCode"
                placeholder="e.g. NSSTA-4821"
                value={orgCode}
                onChange={(e) => setOrgCode(e.target.value)}
                disabled={isSubmitting}
                className="h-11 text-xs rounded-xl border border-input bg-background font-mono font-bold tracking-wider uppercase focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                required
              />

              {/* Live Confirmation Badge vs Inline Error */}
              {orgValidation.tested && (
                <div className="pt-1">
                  {orgValidation.valid && orgValidation.organization ? (
                    <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/30 p-2.5 text-emerald-700 dark:text-emerald-300 font-bold text-[11px] flex items-center gap-2">
                      <CheckCircle2 className="size-4 shrink-0 text-emerald-600" />
                      <span>Joining: <strong>{orgValidation.organization.name}</strong> ✓</span>
                    </div>
                  ) : (
                    <p className="text-[11px] font-bold text-destructive flex items-center gap-1">
                      <AlertCircle className="size-3.5" /> Organization code not found.
                    </p>
                  )}
                </div>
              )}
            </div>

            <Button
              type="submit"
              disabled={isSubmitting || (orgValidation.tested && !orgValidation.valid)}
              className="h-11 w-full bg-primary text-primary-foreground font-bold text-xs rounded-xl shadow-md hover:bg-primary/90 transition-all mt-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" />
                  Creating Account & Sending Email...
                </>
              ) : (
                "Create Official / Learner Account"
              )}
            </Button>
          </form>

          <div className="mt-6 text-center text-xs">
            <span className="text-muted-foreground">Already have an account? </span>
            <Link to="/login" className="font-bold text-primary underline-offset-4 hover:underline">
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
                  className="font-bold text-primary hover:underline flex items-center gap-1 shrink-0"
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
                    message: `Verification link sent to ${registeredEmail}. Please verify your account before logging in.`,
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

      {/* Request to Join Organization Modal (Stretch Feature) */}
      <Dialog open={joinModalOpen} onOpenChange={setJoinModalOpen}>
        <DialogContent className="sm:max-w-md border-border bg-card p-6">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-foreground flex items-center gap-2">
              <Building2 className="size-5 text-primary" /> Request to Join Organization
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Select your department to submit a join request to the Organization Administrator.
            </DialogDescription>
          </DialogHeader>

          {requestSubmitted ? (
            <div className="py-6 text-center space-y-2">
              <CheckCircle2 className="size-10 text-success mx-auto" />
              <p className="font-bold text-foreground text-sm">Join Request Submitted!</p>
              <p className="text-xs text-muted-foreground">The Admin will review your request in their portal.</p>
            </div>
          ) : (
            <div className="space-y-4 text-xs py-2">
              <div className="space-y-1.5">
                <Label>Select Target Organization</Label>
                <select
                  value={selectedOrgId}
                  onChange={(e) => setSelectedOrgId(e.target.value)}
                  className="w-full rounded-md border border-border bg-background p-2.5 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-secondary/20"
                >
                  <option value="">-- Select Organization --</option>
                  {availableOrgs.map((org) => (
                    <option key={org.id} value={org.id}>
                      {org.name} ({org.orgCode})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" size="sm" onClick={() => setJoinModalOpen(false)} className="text-xs">
                  Cancel
                </Button>
                <Button size="sm" onClick={handleSendJoinRequest} className="bg-primary text-primary-foreground text-xs font-semibold">
                  Send Request
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
