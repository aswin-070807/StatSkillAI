import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { CheckCircle2, Clock, PlayCircle, RefreshCw, Award, Sparkles, Check, ShieldAlert } from "lucide-react";
import { AppLayout } from "@/components/AppLayout";
import { TaskAuthModal } from "@/components/TaskAuthModal";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { apiClient } from "@/lib/apiClient";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export interface RecommendedProgramme {
  id: string;
  title: string;
  description?: string;
  provider: string;
  duration_hours: number;
  is_emerging: boolean;
  match_reason: string;
  final_score: number;
}

const mockRecommendations: RecommendedProgramme[] = [
  {
    id: "rec-1",
    title: "National Accounts Statistics & SNA 2008 Methodology",
    description: "In-depth study of GDP estimation, gross value added, and sector accounts according to international standards.",
    provider: "NSSTA",
    duration_hours: 15,
    is_emerging: false,
    match_reason: "direct_gap_match",
    final_score: 96,
  },
  {
    id: "rec-2",
    title: "Python Data Science for Official Statistics",
    description: "Practical automation, pandas, and data cleaning techniques for large-scale survey microdata.",
    provider: "iGOT Karmayogi",
    duration_hours: 12,
    is_emerging: true,
    match_reason: "semantic_match",
    final_score: 91,
  },
  {
    id: "rec-3",
    title: "Sample Survey Design & Variance Estimation",
    description: "Stratified multi-stage sampling, cluster weights, and standard error calculation for national surveys.",
    provider: "NSSTA",
    duration_hours: 18,
    is_emerging: false,
    match_reason: "direct_gap_match",
    final_score: 88,
  },
];

export function LearningPathPage() {
  const { user } = useAuth();
  const [recommendations, setRecommendations] = useState<RecommendedProgramme[]>([]);
  const [enrollmentsMap, setEnrollmentsMap] = useState<Record<string, { id: string; status: string }>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [adaptiveNotice, setAdaptiveNotice] = useState<string | null>(null);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [attemptedProgramme, setAttemptedProgramme] = useState("");

  const fetchPathData = async () => {
    setIsLoading(true);
    try {
      if (user) {
        const [recsData, enrData] = await Promise.all([
          apiClient.get<RecommendedProgramme[]>("/training-programmes/recommended/me").catch(() => []),
          apiClient.get<any[]>("/enrollments/me").catch(() => []),
        ]);

        if (Array.isArray(recsData) && recsData.length > 0) {
          setRecommendations(recsData);
        } else {
          setRecommendations(mockRecommendations);
        }

        const map: Record<string, { id: string; status: string }> = {};
        if (Array.isArray(enrData)) {
          enrData.forEach((e) => {
            map[e.training_programme_id] = { id: e.id, status: e.status };
          });
        }
        setEnrollmentsMap(map);
        setIsLoading(false);
        return;
      }
      setRecommendations(mockRecommendations);
    } catch {
      setRecommendations(mockRecommendations);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPathData();
  }, [user]);

  const handleEnroll = async (programmeId: string, title: string) => {
    if (!user) {
      setAttemptedProgramme(title);
      setAuthModalOpen(true);
      return;
    }

    try {
      const res = await apiClient.post("/enrollments", {
        training_programme_id: programmeId,
        source: "igot_mock",
      });

      setEnrollmentsMap((prev) => ({
        ...prev,
        [programmeId]: { id: res.id, status: res.status },
      }));

      toast.success(`Enrolled in "${title}" successfully!`);
    } catch (err: any) {
      toast.error(err.message || "Enrollment failed.");
    }
  };

  const handleMarkComplete = async (programmeId: string, title: string) => {
    if (!user) {
      setAttemptedProgramme(title);
      setAuthModalOpen(true);
      return;
    }

    const enrInfo = enrollmentsMap[programmeId];
    if (!enrInfo) return;

    try {
      const res = await apiClient.patch(`/enrollments/${enrInfo.id}`, {
        status: "completed",
      });

      setEnrollmentsMap((prev) => ({
        ...prev,
        [programmeId]: { id: res.id, status: "completed" },
      }));

      const notice = `Adaptive Loop Updated! Competency scores linked to "${title}" boosted by +0.5 levels.`;
      setAdaptiveNotice(notice);
      toast.success(notice);

      fetchPathData();
    } catch (err: any) {
      toast.error(err.message || "Completion update failed.");
    }
  };

  const completedCount = Object.values(enrollmentsMap).filter((e) => e.status === "completed").length;
  const overallProgress = recommendations.length > 0
    ? Math.round((completedCount / recommendations.length) * 100)
    : 35;

  return (
    <AppLayout title="Personalised Recommendations" subtitle="Multi-factor AI recommendations & Adaptive Competency Learning Pathways">
      <div className="space-y-6">
        {!user && (
          <div className="rounded-lg border border-primary/20 bg-primary/5 p-3.5 text-xs text-foreground flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <ShieldAlert className="size-4 text-primary shrink-0" />
              <span>Browsing Recommended Learning Pathways as Guest. Sign In required to enroll or sync iGOT Karmayogi progress.</span>
            </div>
            <Button size="sm" onClick={() => setAuthModalOpen(true)} className="bg-primary text-primary-foreground text-xs font-semibold h-8">
              Sign In / Sign Up
            </Button>
          </div>
        )}

        {adaptiveNotice && (
          <div className="rounded-xl border border-success/40 bg-success/10 p-4 text-xs font-semibold text-success flex items-center justify-between shadow-sm">
            <span className="flex items-center gap-2">
              <Sparkles className="size-4 text-success" /> {adaptiveNotice}
            </span>
            <Button size="sm" variant="ghost" onClick={() => setAdaptiveNotice(null)} className="h-6 text-xs text-success">
              Dismiss
            </Button>
          </div>
        )}

        <Card className="shadow-card border-border">
          <CardContent className="flex flex-wrap items-center justify-between gap-4 py-5">
            <div className="min-w-56 flex-1">
              <div className="mb-2 flex items-center justify-between text-sm">
                <span className="font-semibold text-foreground">Adaptive Learning Path Progress</span>
                <span className="text-secondary font-bold font-mono">{overallProgress}%</span>
              </div>
              <div className="h-3 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-secondary transition-all duration-500"
                  style={{ width: `${overallProgress}%` }}
                />
              </div>
            </div>
            <Button variant="outline" onClick={fetchPathData} disabled={isLoading} className="text-xs font-semibold">
              <RefreshCw className={`size-4 mr-1.5 ${isLoading ? "animate-spin" : ""}`} /> Refresh Pathways
            </Button>
          </CardContent>
        </Card>

        <div className="relative space-y-4 pl-8">
          <span className="absolute left-3 top-2 bottom-2 w-px bg-border" />

          {recommendations.map((prog, idx) => {
            const stepNum = idx + 1;
            const enrState = enrollmentsMap[prog.id];
            const isEnrolled = !!enrState;
            const isCompleted = enrState?.status === "completed";

            return (
              <div key={prog.id} className="relative">
                <span
                  className={cn(
                    "absolute -left-8 top-6 flex size-6 items-center justify-center rounded-full border-2 border-background font-semibold text-xs transition-colors",
                    isCompleted
                      ? "bg-success text-success-foreground"
                      : isEnrolled
                      ? "bg-secondary text-secondary-foreground"
                      : "bg-muted text-muted-foreground"
                  )}
                >
                  {isCompleted ? <Check className="size-4" /> : stepNum}
                </span>

                <Card className="shadow-card border-border hover:shadow-md transition-shadow">
                  <CardContent className="flex flex-wrap items-start justify-between gap-4 py-5">
                    <div className="min-w-0 flex-1 space-y-2">
                      <div className="flex flex-wrap items-center gap-2 text-xs">
                        <span className="font-semibold uppercase tracking-wider text-muted-foreground">
                          Step {stepNum} • {isCompleted ? "Completed" : isEnrolled ? "In Progress" : "Recommended"}
                        </span>
                        <span className="rounded bg-accent/20 px-2 py-0.5 text-[11px] font-medium text-accent-foreground">
                          Reason: {prog.match_reason === "direct_gap_match" ? "Direct Skill Gap Match" : "Semantic Vector Match"}
                        </span>
                        {prog.is_emerging && (
                          <span className="rounded bg-secondary/15 px-2 py-0.5 text-[11px] font-bold text-secondary">
                            Emerging Tech
                          </span>
                        )}
                      </div>

                      <h3 className="text-base font-bold text-foreground">{prog.title}</h3>

                      {prog.description && (
                        <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                          {prog.description}
                        </p>
                      )}

                      <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground pt-1">
                        <span className="font-semibold text-foreground bg-muted/60 px-2 py-0.5 rounded">
                          {prog.provider}
                        </span>
                        <span className="inline-flex items-center gap-1 font-mono">
                          <Clock className="size-3.5 text-warning" /> {prog.duration_hours} hrs
                        </span>
                        <span className="font-mono text-xs">
                          Match Score: <strong className="text-foreground">{prog.final_score}</strong>
                        </span>
                      </div>
                    </div>

                    <div className="flex shrink-0 flex-col items-end gap-2 pt-1">
                      {isCompleted ? (
                        <div className="flex flex-col items-end gap-1">
                          <span className="inline-flex items-center gap-1 text-xs font-semibold text-success bg-success/15 px-3 py-1 rounded-full border border-success/30">
                            <Award className="size-3.5" /> Completed (+0.5 Level Lift)
                          </span>
                        </div>
                      ) : isEnrolled ? (
                        <div className="flex flex-col items-end gap-2">
                          <Button
                            size="sm"
                            onClick={() => handleMarkComplete(prog.id, prog.title)}
                            className="bg-success text-success-foreground hover:bg-success/90 font-semibold text-xs"
                          >
                            <CheckCircle2 className="size-4 mr-1.5" /> Mark Complete
                          </Button>
                        </div>
                      ) : (
                        <div className="flex flex-col items-end gap-2">
                          <Button
                            size="sm"
                            onClick={() => handleEnroll(prog.id, prog.title)}
                            className="bg-secondary text-secondary-foreground hover:bg-secondary/90 font-semibold text-xs"
                          >
                            <PlayCircle className="size-4 mr-1.5" /> Enroll Now
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            );
          })}
        </div>
      </div>

      <TaskAuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        taskTitle="Sign In Required to Enroll"
        taskDescription={`Please Sign In or Create an Account to enroll in "${attemptedProgramme || "Recommended Learning Module"}" and track your iGOT Karmayogi progress.`}
      />
    </AppLayout>
  );
}
