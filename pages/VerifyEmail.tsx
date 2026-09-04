import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { BarChart2, CheckCircle2, AlertCircle, ArrowRight, MailCheck, ShieldCheck } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export function VerifyEmailPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { verifyEmail } = useAuth();

  const email = searchParams.get("email") || "";
  const token = searchParams.get("token") || "";

  const [status, setStatus] = useState<"verifying" | "success" | "error">("verifying");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!email || !token) {
      setStatus("error");
      setMessage("Invalid verification link. Missing email or verification token.");
      return;
    }

    verifyEmail(email, token).then((res) => {
      if (res.success) {
        setStatus("success");
        setMessage("Your official email address has been verified successfully! Your account is now active.");
      } else {
        setStatus("error");
        setMessage("Verification link expired or invalid token.");
      }
    });
  }, [email, token, verifyEmail]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-auth px-4 py-12 animate-page-fade">
      <div className="w-full max-w-md">
        <Card className="border-border bg-card shadow-elevated p-8 text-center space-y-6">
          <div className="flex flex-col items-center">
            <span className="flex size-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-sm mb-3">
              <BarChart2 className="size-7 text-secondary" />
            </span>
            <h1 className="text-xl font-bold text-foreground">StatSkill AI</h1>
            <p className="text-xs text-muted-foreground">Official Email Verification Portal</p>
          </div>

          <div className="py-4 space-y-4">
            {status === "verifying" && (
              <div className="space-y-3">
                <div className="mx-auto size-12 rounded-full border-4 border-primary border-t-transparent animate-spin" />
                <p className="text-xs font-semibold text-muted-foreground">Verifying email credentials...</p>
              </div>
            )}

            {status === "success" && (
              <div className="space-y-4">
                <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-success/15 text-success">
                  <CheckCircle2 className="size-8" />
                </div>
                <div className="space-y-1">
                  <h2 className="text-base font-bold text-foreground">Email Verified ✓</h2>
                  <p className="text-xs text-muted-foreground leading-relaxed">{message}</p>
                </div>
                <div className="rounded-lg bg-accent/40 p-3 border border-border text-left text-xs space-y-1">
                  <div className="flex items-center gap-1.5 font-semibold text-foreground">
                    <ShieldCheck className="size-4 text-secondary" /> Account Status: Active
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    Verified for: <strong className="text-foreground">{email}</strong>
                  </p>
                </div>
                <Button
                  onClick={() => navigate("/login", { state: { message: "Email verified successfully! You can now log in with your credentials.", registeredEmail: email } })}
                  className="w-full bg-primary text-primary-foreground font-semibold text-xs py-2.5 gap-2"
                >
                  Proceed to Sign In <ArrowRight className="size-4" />
                </Button>
              </div>
            )}

            {status === "error" && (
              <div className="space-y-4">
                <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-destructive/15 text-destructive">
                  <AlertCircle className="size-8" />
                </div>
                <div className="space-y-1">
                  <h2 className="text-base font-bold text-foreground">Verification Failed</h2>
                  <p className="text-xs text-muted-foreground leading-relaxed">{message}</p>
                </div>
                <Button
                  onClick={() => navigate("/login")}
                  variant="outline"
                  className="w-full border-primary/30 text-primary font-semibold text-xs py-2.5"
                >
                  Return to Sign In
                </Button>
              </div>
            )}
          </div>

          <div className="pt-2 border-t border-border text-[11px] text-muted-foreground">
            Ministry of Statistics & Programme Implementation • Govt. of India
          </div>
        </Card>
      </div>
    </div>
  );
}
