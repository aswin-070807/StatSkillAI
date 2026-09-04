import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Bot, ClipboardCheck, Clock, ArrowRight, ShieldAlert, LogIn, UserPlus } from "lucide-react";
import { AppLayout } from "@/components/AppLayout";
import { Gauge, LabeledBar, PriorityBadge } from "@/components/stat-widgets";
import { TaskAuthModal } from "@/components/TaskAuthModal";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { competencyGroups, recommendedCourses, skillGaps } from "@/lib/mock-data";
import { useAuth } from "@/context/AuthContext";

export function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const priorityGaps = skillGaps.slice(0, 4);

  const handleTaskAction = (actionPath: string) => {
    if (!user) {
      setAuthModalOpen(true);
    } else {
      navigate(actionPath);
    }
  };

  return (
    <AppLayout
      title={user ? `Welcome back, ${user.name}` : "Workforce Competency Dashboards"}
      subtitle={user ? `${user.designation || "Officer"} • ${user.department || "MoSPI"}` : "National Statistical System Overview & Cadre Analytics"}
    >
      <div className="space-y-6">
        {!user && (
          <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 text-xs text-foreground flex flex-wrap items-center justify-between gap-3 shadow-xs">
            <div className="flex items-center gap-2.5">
              <ShieldAlert className="size-5 text-primary shrink-0" />
              <div>
                <span className="font-bold block text-sm">Public Worksite Overview</span>
                <span className="text-muted-foreground">You are browsing public national statistical benchmarks. Sign In to view your personalized officer scores & records.</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button size="sm" variant="outline" onClick={() => navigate("/login")} className="text-xs font-semibold">
                <LogIn className="size-3.5 mr-1" /> Sign In
              </Button>
              <Button size="sm" onClick={() => navigate("/signup")} className="bg-primary text-primary-foreground text-xs font-semibold">
                <UserPlus className="size-3.5 mr-1" /> Sign Up
              </Button>
            </div>
          </div>
        )}

        <div className="grid gap-6 xl:grid-cols-2">
          <div className="space-y-6">
            <Card className="shadow-card border-border">
              <CardHeader>
                <CardTitle className="text-base font-bold text-foreground">Competency Index Snapshot</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col items-center gap-2">
                <Gauge value={user?.competencyScores ? 78 : 78} delta="+5% this quarter" />
                <p className="text-center text-xs text-muted-foreground">
                  {user ? `${user.jobRole || "Statistical Officer"} • ${user.workExperienceYears ?? 5} years exp.` : "National Statistical Cadre Average Benchmark"}
                </p>
              </CardContent>
            </Card>

            <Card className="shadow-card border-border">
              <CardHeader>
                <CardTitle className="text-base font-bold text-foreground">Competency Group Benchmarks</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {competencyGroups.map((g) => (
                  <LabeledBar key={g.key} label={g.label} value={g.score} color={g.token} />
                ))}
              </CardContent>
            </Card>

            <div className="flex flex-wrap gap-3">
              <Button
                onClick={() => handleTaskAction("/quiz")}
                className="bg-secondary text-secondary-foreground hover:bg-secondary/90 text-xs font-semibold"
              >
                <ClipboardCheck className="size-4 mr-1.5" />
                Take Assessment
              </Button>
              <Button
                variant="outline"
                onClick={() => handleTaskAction("/assistant")}
                className="text-xs font-semibold"
              >
                <Bot className="size-4 mr-1.5 text-secondary" />
                Ask StatBot AI
              </Button>
            </div>
          </div>

          <div className="space-y-6">
            <Card className="shadow-card border-border">
              <CardHeader className="flex-row items-center justify-between space-y-0">
                <CardTitle className="text-base font-bold text-foreground">Priority Skill Gaps</CardTitle>
                <Link
                  to="/skill-gaps"
                  className="text-xs font-semibold text-secondary hover:underline"
                >
                  View all
                </Link>
              </CardHeader>
              <CardContent className="space-y-3">
                {priorityGaps.map((g) => (
                  <div
                    key={g.competency}
                    className="flex items-center justify-between rounded-lg border border-border px-4 py-3 hover:border-primary/30 transition-colors"
                  >
                    <div>
                      <p className="text-sm font-semibold text-foreground">{g.competency}</p>
                      <p className="text-xs text-muted-foreground">
                        {g.current}/5 → {g.required}/5
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-bold font-mono text-foreground">gap {g.gap}</span>
                      <PriorityBadge priority={g.priority} />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="shadow-card border-border">
              <CardHeader>
                <CardTitle className="text-base font-bold text-foreground">Recommended Training Programmes</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {recommendedCourses.map((c) => (
                  <div
                    key={c.title}
                    className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border p-4 hover:border-primary/30 transition-colors"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-foreground">{c.title}</p>
                      <p className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                        <span className="rounded bg-accent/60 px-1.5 py-0.5 font-semibold text-accent-foreground">
                          {c.provider}
                        </span>
                        <span className="inline-flex items-center gap-1 font-mono">
                          <Clock className="size-3" /> {c.hours} hrs
                        </span>
                      </p>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => handleTaskAction("/learning-path")}
                      className="bg-secondary text-secondary-foreground hover:bg-secondary/90 text-xs font-semibold"
                    >
                      Start <ArrowRight className="size-3.5 ml-1" />
                    </Button>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <TaskAuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        taskTitle="Sign In Required to Access Personal Dashboard"
        taskDescription="Please Sign In or Create an Account to take assessments, consult the AI copilot, or track your personal learning history."
      />
    </AppLayout>
  );
}
