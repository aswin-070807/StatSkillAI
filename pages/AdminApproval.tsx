import { useState, useEffect } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { ShieldCheck, ShieldAlert, CheckCircle2, XCircle, Loader2, ArrowRight, Building2, User, Mail, FileText, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { apiClient } from "@/lib/apiClient";
import { toast } from "sonner";

export function AdminApprovalPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const token = searchParams.get("token") || "";
  const initialAction = searchParams.get("action") || "approve";

  const [applicant, setApplicant] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [decisionResult, setDecisionResult] = useState<{ status: string; message: string } | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      setError("No authorization token provided. Please use the valid link from the Super Admin review email.");
      setLoading(false);
      return;
    }

    const fetchInfo = async () => {
      setLoading(true);
      try {
        const data = await apiClient.get<any>(`/auth/admin/decision/info?token=${encodeURIComponent(token)}`);
        setApplicant(data);
      } catch (err: any) {
        setError(err.message || "Invalid or expired authorization token. This request may have already been processed.");
      } finally {
        setLoading(false);
      }
    };

    fetchInfo();
  }, [token]);

  const handleDecision = async (actionToPerform: "approve" | "reject") => {
    setProcessing(true);
    setError(null);
    try {
      const res = await apiClient.post<any>("/auth/admin/decision", {
        token,
        action: actionToPerform,
      });

      setDecisionResult({
        status: res.status,
        message: res.message || (actionToPerform === "approve" ? "Admin approved successfully." : "Admin request rejected."),
      });

      if (actionToPerform === "approve") {
        toast.success(`Admin account approved and credentials activated!`);
      } else {
        toast.info("Admin access request was rejected.");
      }
    } catch (err: any) {
      setError(err.message || "Failed to process authorization decision.");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-auth px-4 py-12">
      <div className="w-full max-w-lg">
        <Card className="shadow-elevated border-border">
          <CardHeader className="text-center pb-4">
            <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-gradient-brand text-secondary-foreground mb-3">
              <ShieldCheck className="size-7" />
            </div>
            <CardTitle className="text-2xl font-bold tracking-tight">Super Admin Authorization Portal</CardTitle>
            <CardDescription className="text-xs">
              Ministry of Statistics &amp; Programme Implementation (MoSPI)
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-10 gap-3">
                <Loader2 className="size-8 animate-spin text-primary" />
                <p className="text-sm text-muted-foreground font-medium">Verifying authorization token...</p>
              </div>
            ) : decisionResult ? (
              <div className="space-y-5 text-center py-4">
                {decisionResult.status === "approved" ? (
                  <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-500">
                    <CheckCircle2 className="size-10" />
                  </div>
                ) : (
                  <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-destructive/20 text-destructive">
                    <XCircle className="size-10" />
                  </div>
                )}

                <div className="space-y-2">
                  <h3 className="text-xl font-bold text-foreground">
                    {decisionResult.status === "approved" ? "Admin Access Granted" : "Request Rejected"}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {decisionResult.message}
                  </p>
                </div>

                {decisionResult.status === "approved" && (
                  <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-4 text-xs text-left text-emerald-400 space-y-1.5">
                    <p className="font-semibold">Credentials Activated:</p>
                    <p>
                      The officer can now log in using their email (<strong className="text-foreground">{applicant?.email}</strong>) and password via the Admin Portal.
                    </p>
                  </div>
                )}

                <div className="flex flex-col gap-3 pt-3">
                  <Button onClick={() => navigate("/admin-dashboard")} className="w-full bg-primary font-semibold">
                    Go to Admin Dashboard <ArrowRight className="size-4 ml-1.5" />
                  </Button>
                  <Button onClick={() => navigate("/login")} variant="outline" className="w-full">
                    Return to Login Page
                  </Button>
                </div>
              </div>
            ) : error ? (
              <div className="space-y-5 py-4">
                <Alert variant="destructive">
                  <AlertCircle className="size-4" />
                  <AlertTitle>Authorization Error</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>

                <div className="text-center">
                  <Button onClick={() => navigate("/login")} variant="outline" className="w-full">
                    Return to Login
                  </Button>
                </div>
              </div>
            ) : (
              applicant && (
                <div className="space-y-5">
                  <div className="rounded-lg border border-border bg-card/60 p-4 space-y-3">
                    <div className="flex items-center justify-between pb-2 border-b border-border">
                      <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Applicant Details</span>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-warning/20 text-warning font-semibold">Pending Review</span>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div>
                        <span className="text-muted-foreground">Name:</span>
                        <p className="font-bold text-foreground">{applicant.name}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Admin / Employee ID:</span>
                        <p className="font-bold text-foreground">{applicant.employeeId}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Email Address:</span>
                        <p className="font-bold text-foreground truncate">{applicant.email}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Department:</span>
                        <p className="font-bold text-foreground">{applicant.department || "National Statistical Office"}</p>
                      </div>
                    </div>

                    {applicant.adminJustification && (
                      <div className="pt-2 border-t border-border">
                        <span className="text-xs text-muted-foreground font-semibold">Reason for Admin Access:</span>
                        <p className="text-xs italic bg-muted/40 p-2.5 rounded-md mt-1 text-foreground">
                          "{applicant.adminJustification}"
                        </p>
                      </div>
                    )}
                  </div>

                  <p className="text-xs text-muted-foreground text-center">
                    As Super Administrator (<strong>dhinesh0805@gmail.com</strong>), please choose an action for this administrator account:
                  </p>

                  <div className="grid grid-cols-2 gap-3 pt-1">
                    <Button
                      onClick={() => handleDecision("approve")}
                      disabled={processing}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
                    >
                      {processing ? <Loader2 className="size-4 animate-spin mr-1.5" /> : <CheckCircle2 className="size-4 mr-1.5" />}
                      Accept &amp; Grant Access
                    </Button>

                    <Button
                      onClick={() => handleDecision("reject")}
                      disabled={processing}
                      variant="destructive"
                      className="font-bold"
                    >
                      {processing ? <Loader2 className="size-4 animate-spin mr-1.5" /> : <XCircle className="size-4 mr-1.5" />}
                      Reject Request
                    </Button>
                  </div>
                </div>
              )
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
export default AdminApprovalPage;
