import { useNavigate } from "react-router-dom";
import { ShieldAlert, Clock, LogOut, MailCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useAuth } from "@/context/AuthContext";

export function AdminPendingPage() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    navigate("/login", { replace: true });
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-auth px-4 py-12">
      <Card className="w-full max-w-md shadow-elevated border-border">
        <CardHeader className="text-center pb-2">
          <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-warning/20 text-warning mb-3">
            <Clock className="size-8 animate-pulse" />
          </div>
          <CardTitle className="text-2xl font-bold text-foreground">Admin Account Pending Approval</CardTitle>
          <CardDescription>Super Admin Review Required</CardDescription>
        </CardHeader>
        <CardContent className="space-y-5 text-center">
          <p className="text-sm text-muted-foreground leading-relaxed">
            Welcome, <strong className="text-foreground">{user?.name || "Officer"}</strong>. Your administrative account (<code className="text-foreground">{user?.email}</code>) is registered and awaiting verification by the Super Administrator.
          </p>

          <div className="rounded-lg border border-primary/30 bg-primary/10 p-4 text-left text-xs space-y-2 text-foreground">
            <div className="flex items-center gap-1.5 font-bold text-primary">
              <MailCheck className="size-4" /> Review Request Dispatched:
            </div>
            <p className="text-muted-foreground text-xs leading-relaxed">
              An authorization email has been sent to Super Admin <strong className="text-foreground">dhinesh0805@gmail.com</strong>. As soon as the Super Admin approves your request, your login credentials (email &amp; password) will immediately become active.
            </p>
          </div>

          <div className="rounded-lg border border-warning/30 bg-warning/10 p-4 text-left text-xs space-y-2 text-warning-foreground">
            <div className="flex items-center gap-1.5 font-bold">
              <ShieldAlert className="size-4 text-warning" /> MoSPI Security Safeguard:
            </div>
            <p>
              To protect organization-wide officer competency metrics, administrative dashboards are restricted until approval is granted.
            </p>
          </div>


          <div className="flex flex-col gap-3 pt-2">
            <Button onClick={() => window.location.reload()} variant="outline" className="w-full">
              Check Approval Status Again
            </Button>
            <Button onClick={handleLogout} variant="ghost" className="w-full text-muted-foreground">
              <LogOut className="size-4 mr-1.5" /> Sign Out &amp; Return to Login
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
