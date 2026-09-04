import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Users,
  BarChart3,
  BookOpen,
  TrendingUp,
  BrainCircuit,
  Download,
  Building2,
  ShieldCheck,
  RefreshCw,
  Lock,
  ArrowUpRight,
  Activity,
  CheckCircle2,
  UserCheck,
  Copy,
  UserX,
  MailCheck,
  Clock,
  Check,
  X,
  ShieldAlert,
} from "lucide-react";
import { AdminLayout } from "@/components/AdminLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useAuth } from "@/context/AuthContext";
import {
  getOrganizationLearners,
  getStoredOrgs,
  getStoredJoinRequests,
  processJoinRequest,
  AdminLearnerView,
  JoinRequest,
} from "@/lib/mockAuthStore";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export function AdminDashboard() {
  const { user } = useAuth();
  const isSuperAdmin = user?.role === "super_admin";

  const [learners, setLearners] = useState<AdminLearnerView[]>([]);
  const [joinRequests, setJoinRequests] = useState<JoinRequest[]>([]);
  const [orgCode, setOrgCode] = useState<string>("");
  const [orgName, setOrgName] = useState<string>("");
  const [copiedCode, setCopiedCode] = useState(false);

  const [isLoading, setIsLoading] = useState(false);

  const loadData = () => {
    setIsLoading(true);
    const orgs = getStoredOrgs();
    const currentOrg = orgs.find((o) => o.id === user?.organizationId || o.createdByAdminId === user?.id) || orgs[0];

    if (currentOrg) {
      setOrgCode(currentOrg.orgCode);
      setOrgName(currentOrg.name);

      const learnerList = getOrganizationLearners(currentOrg.id);
      setLearners(learnerList);

      const allReqs = getStoredJoinRequests();
      const pendingForOrg = allReqs.filter((r) => r.organizationId === currentOrg.id && r.status === "pending");
      setJoinRequests(pendingForOrg);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    loadData();
  }, [user]);

  const handleCopyCode = () => {
    if (!orgCode) return;
    navigator.clipboard.writeText(orgCode);
    setCopiedCode(true);
    toast.success(`Organization Code '${orgCode}' copied to clipboard!`);
    setTimeout(() => setCopiedCode(false), 2500);
  };

  const handleApproveRequest = (reqId: string) => {
    const success = processJoinRequest(reqId, "approve");
    if (success) {
      toast.success("Join request approved! Learner added to organization.");
      loadData();
    }
  };

  const handleRejectRequest = (reqId: string) => {
    const success = processJoinRequest(reqId, "reject");
    if (success) {
      toast.info("Join request rejected.");
      loadData();
    }
  };

  const handleDeactivateLearner = (learnerId: string, learnerName: string) => {
    setLearners((prev) => prev.filter((l) => l.id !== learnerId));
    toast.info(`Official '${learnerName}' deactivated from organization registry.`);
  };

  // Static mock stats for dashboard visual balance
  const activeLearnerCount = learners.filter((l) => l.status === "active").length;
  const pendingVerificationCount = learners.filter((l) => l.status === "pending_verification").length;

  return (
    <AdminLayout
      title="Workforce Governance Console"
      subtitle="Organization learner management, unique join code distribution & competency analytics"
    >
      <div className="space-y-6">
        {/* =========================================
            PROMINENT ORGANIZATION CODE BANNER
        ========================================= */}
        <div className="rounded-xl border border-secondary/30 bg-card p-6 shadow-card space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="flex size-7 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  <Building2 className="size-4 text-secondary" />
                </span>
                <h2 className="text-base font-bold text-foreground">
                  {orgName || user?.organizationName || "NSSTA – Statistics Training Division"}
                </h2>
              </div>
              <p className="text-xs text-muted-foreground">
                Official MoSPI Organization Registry • Shared Access Governance
              </p>
            </div>

            {/* Organization Code Copy Box */}
            <div className="flex items-center gap-3 bg-muted/60 p-2.5 rounded-lg border border-border">
              <div className="text-right leading-tight">
                <span className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  Organization Join Code
                </span>
                <span className="text-sm font-extrabold font-mono text-primary tracking-widest">
                  {orgCode || "NSSTA-4821"}
                </span>
              </div>
              <Button
                onClick={handleCopyCode}
                size="sm"
                className="bg-primary text-primary-foreground hover:bg-primary/90 font-semibold text-xs gap-1.5 shadow-sm"
              >
                {copiedCode ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
                {copiedCode ? "Copied!" : "Copy Code"}
              </Button>
            </div>
          </div>
          <p className="text-[11px] text-muted-foreground border-t border-border/60 pt-3">
            <strong>Administrator Instructions:</strong> Share this unique code with statistical officers in your department. When learners sign up with this code, they will automatically link to your organization upon email verification.
          </p>
        </div>

        {/* =========================================
            1. STAT SUMMARY CARDS ROW
        ========================================= */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card className="shadow-card border-border">
            <CardContent className="p-5 flex items-center justify-between">
              <div>
                <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Total Organization Learners</p>
                <p className="text-2xl font-extrabold text-foreground mt-1 font-mono">{learners.length || 1}</p>
                <p className="text-[11px] text-success font-semibold mt-0.5 flex items-center gap-0.5">
                  <ArrowUpRight className="size-3" /> Registered Officers
                </p>
              </div>
              <div className="flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Users className="size-6 text-secondary" />
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-card border-border">
            <CardContent className="p-5 flex items-center justify-between">
              <div>
                <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Active Verified Accounts</p>
                <p className="text-2xl font-extrabold text-foreground mt-1 font-mono">{activeLearnerCount}</p>
                <p className="text-[11px] text-success font-semibold mt-0.5 flex items-center gap-0.5">
                  <CheckCircle2 className="size-3" /> Email Verified
                </p>
              </div>
              <div className="flex size-12 items-center justify-center rounded-xl bg-success/15 text-success">
                <ShieldCheck className="size-6" />
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-card border-border">
            <CardContent className="p-5 flex items-center justify-between">
              <div>
                <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Pending Email Verifications</p>
                <p className="text-2xl font-extrabold text-foreground mt-1 font-mono">{pendingVerificationCount}</p>
                <p className="text-[11px] text-warning font-semibold mt-0.5 flex items-center gap-0.5">
                  <Clock className="size-3" /> Verification Sent
                </p>
              </div>
              <div className="flex size-12 items-center justify-center rounded-xl bg-warning/15 text-warning-foreground">
                <MailCheck className="size-6 text-warning" />
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-card border-border">
            <CardContent className="p-5 flex items-center justify-between">
              <div>
                <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Avg Competency Score</p>
                <p className="text-2xl font-extrabold text-foreground mt-1 font-mono">3.8 / 5.0</p>
                <p className="text-[11px] text-success font-semibold mt-0.5 flex items-center gap-0.5">
                  <TrendingUp className="size-3" /> Level 3 Proficiency
                </p>
              </div>
              <div className="flex size-12 items-center justify-center rounded-xl bg-secondary/15 text-secondary">
                <BarChart3 className="size-6" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* =========================================
            PENDING JOIN REQUESTS SECTION (STRETCH FEATURE)
        ========================================= */}
        {joinRequests.length > 0 && (
          <Card className="border-warning/40 bg-warning/5 shadow-card">
            <CardHeader className="flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base flex items-center gap-2 text-warning font-bold">
                  <UserCheck className="size-5" /> Pending Organization Join Requests
                </CardTitle>
                <CardDescription className="text-xs">
                  Officers requesting to join <strong>{orgName}</strong> without a direct Org Code
                </CardDescription>
              </div>
              <span className="rounded-full bg-warning/20 px-3 py-1 text-xs font-bold text-warning-foreground border border-warning/30">
                {joinRequests.length} Pending
              </span>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-muted/60 uppercase tracking-wide text-muted-foreground">
                    <tr>
                      <th className="px-4 py-2.5 font-semibold">Officer Name</th>
                      <th className="px-4 py-2.5 font-semibold">Email</th>
                      <th className="px-4 py-2.5 font-semibold">Designation</th>
                      <th className="px-4 py-2.5 font-semibold">Requested At</th>
                      <th className="px-4 py-2.5 font-semibold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {joinRequests.map((req) => (
                      <tr key={req.id} className="border-t border-border">
                        <td className="px-4 py-3 font-semibold text-foreground">{req.learnerName}</td>
                        <td className="px-4 py-3 text-muted-foreground font-mono">{req.learnerEmail}</td>
                        <td className="px-4 py-3 text-muted-foreground">{req.learnerDesignation}</td>
                        <td className="px-4 py-3 text-muted-foreground font-mono">
                          {new Date(req.requestedAt).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-3 text-right space-x-2">
                          <Button
                            size="sm"
                            onClick={() => handleApproveRequest(req.id)}
                            className="bg-success text-success-foreground font-semibold text-xs h-7 gap-1"
                          >
                            <Check className="size-3.5" /> Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleRejectRequest(req.id)}
                            className="font-semibold text-xs h-7 gap-1"
                          >
                            <X className="size-3.5" /> Reject
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}

        {/* =========================================
            2. OFFICIAL LEARNER MANAGEMENT TABLE (HARD REQUIREMENT: ZERO PASSWORDS DISPLAYED)
        ========================================= */}
        <Card className="shadow-card border-border">
          <CardHeader className="flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <Users className="size-5 text-primary" /> Organization Official Learners Registry
              </CardTitle>
              <CardDescription className="text-xs">
                Manage registered officials linked to <strong>{orgName}</strong>. Gated by email verification status.
              </CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={loadData} className="text-xs font-semibold">
              <RefreshCw className={`size-3.5 mr-1.5 ${isLoading ? "animate-spin" : ""}`} /> Refresh Table
            </Button>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-muted/60 uppercase tracking-wide text-muted-foreground">
                  <tr>
                    <th className="px-4 py-3 font-semibold">Official Name</th>
                    <th className="px-4 py-3 font-semibold">Designation</th>
                    <th className="px-4 py-3 font-semibold">Email Address</th>
                    <th className="px-4 py-3 font-semibold">Account Status</th>
                    <th className="px-4 py-3 font-semibold">Date Joined</th>
                    <th className="px-4 py-3 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {learners.map((learner) => (
                    <tr key={learner.id} className="border-t border-border hover:bg-accent/40 transition-colors">
                      <td className="px-4 py-3.5 font-bold text-foreground">
                        {learner.name}
                        <span className="block text-[10px] font-mono text-muted-foreground font-normal">
                          ID: {learner.employeeId}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-muted-foreground font-medium">
                        {learner.designation}
                      </td>
                      <td className="px-4 py-3.5 text-muted-foreground font-mono">
                        {learner.email}
                      </td>
                      <td className="px-4 py-3.5 font-semibold">
                        {learner.status === "active" ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-success/15 border border-success/30 px-2.5 py-0.5 text-[11px] text-success">
                            <CheckCircle2 className="size-3" /> Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full bg-warning/15 border border-warning/30 px-2.5 py-0.5 text-[11px] text-warning-foreground">
                            <Clock className="size-3 text-warning" /> Pending Verification
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3.5 text-muted-foreground font-mono">
                        {new Date(learner.joinedAt).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </td>
                      <td className="px-4 py-3.5 text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeactivateLearner(learner.id, learner.name)}
                          className="text-destructive hover:bg-destructive/10 text-xs font-semibold h-7 gap-1"
                        >
                          <UserX className="size-3.5" /> Deactivate
                        </Button>
                      </td>
                    </tr>
                  ))}

                  {learners.length === 0 && (
                    <tr className="border-t border-border">
                      <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                        No learners registered under your organization code yet. Share code <strong>{orgCode}</strong> to invite officials.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Competency Overview Grid */}
        <div className="grid gap-6 md:grid-cols-2">
          <Card className="shadow-card border-border">
            <CardHeader>
              <CardTitle className="text-base font-bold">Top Department Skill Gaps</CardTitle>
              <CardDescription className="text-xs">
                Aggregate gaps detected across official cadres in your organization
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-xs">
              {[
                { name: "Survey Sampling & Variance Estimation", gap: 2.2, group: "Statistical" },
                { name: "Python for Official Survey Analytics", gap: 1.8, group: "Technical" },
                { name: "National Accounts Statistics (SNA 2008)", gap: 1.5, group: "Statistical" },
                { name: "Cybersecurity & Data Privacy (DPDP)", gap: 1.2, group: "Digital Governance" },
              ].map((g) => (
                <div key={g.name} className="space-y-1">
                  <div className="flex justify-between font-semibold">
                    <span className="text-foreground">{g.name}</span>
                    <span className="text-destructive font-mono">+{g.gap} level gap</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full bg-destructive"
                      style={{ width: `${(g.gap / 3) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="shadow-card border-border">
            <CardHeader>
              <CardTitle className="text-base font-bold">iGOT Karmayogi Training Impact</CardTitle>
              <CardDescription className="text-xs">
                Course completion rates & score improvements across active officers
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-xs">
              {[
                { title: "National Accounts (SNA 2008)", rate: "92%", lift: "+1.8 Levels" },
                { title: "Python Data Science for Officials", rate: "85%", lift: "+2.1 Levels" },
                { title: "Sample Survey Design", rate: "88%", lift: "+1.4 Levels" },
                { title: "Cyber Hygiene & DPDP", rate: "96%", lift: "+0.9 Levels" },
              ].map((t) => (
                <div key={t.title} className="flex items-center justify-between border-b border-border pb-2">
                  <div>
                    <p className="font-semibold text-foreground">{t.title}</p>
                    <p className="text-[10px] text-muted-foreground">Completion Rate: {t.rate}</p>
                  </div>
                  <span className="font-bold text-success bg-success/15 px-2 py-0.5 rounded border border-success/30">
                    {t.lift}
                  </span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* AI-Generated Predictive Trends Note Box (Feature 10) */}
        <Card className="border-secondary/30 bg-secondary/5 shadow-card">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-bold flex items-center gap-2 text-primary">
                <BrainCircuit className="size-5 text-secondary" /> Emerging Skill Requirement Strategic Forecast
              </CardTitle>
              <span className="rounded-full bg-secondary/15 px-3 py-1 text-[10px] font-bold text-secondary border border-secondary/30 uppercase tracking-wider">
                AI-Generated Insight
              </span>
            </div>
            <CardDescription className="text-xs">
              Automated predictive trend analysis across MoSPI statistical cadres (Generated Insight — Not a Guaranteed Forecast)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-lg border border-border bg-card p-4 text-xs text-foreground leading-relaxed">
              <p>
                <strong>Emerging Skill Demand:</strong> AI/ML, Python Data Analytics, and Cloud Computing show the widest skill gaps across Ministry divisions this quarter. Strategic focus on structured iGOT Karmayogi learning pathways for survey microdata processing is recommended to accelerate official data dissemination timelines by up to 35%.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
