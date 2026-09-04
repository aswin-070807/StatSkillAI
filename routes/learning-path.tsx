import { createFileRoute, Link } from "@tanstack/react-router";
import { CheckCircle2, Clock, Lock, PlayCircle, RefreshCw } from "lucide-react";
import { AppLayout } from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { learningPath } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/learning-path")({
  head: () => ({
    meta: [
      { title: "Personalised Learning Path — StatSkill AI" },
      {
        name: "description",
        content:
          "A sequenced learning journey from iGOT and NSSTA courses, generated from your competency gaps and role requirements.",
      },
      { property: "og:title", content: "Personalised Learning Path — StatSkill AI" },
      {
        property: "og:description",
        content: "Step-by-step courses generated from your competency gaps.",
      },
    ],
  }),
  component: LearningPathPage,
});

function LearningPathPage() {
  const overall = 34;

  return (
    <AppLayout title="Personalised Learning Path" subtitle="Generated from your skill gap profile">
      <div className="space-y-6">
        <Card className="shadow-card">
          <CardContent className="flex flex-wrap items-center gap-4 py-5">
            <div className="min-w-56 flex-1">
              <div className="mb-2 flex items-center justify-between text-sm">
                <span className="font-medium text-foreground">Overall Progress</span>
                <span className="text-muted-foreground">{overall}%</span>
              </div>
              <div className="h-3 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-secondary"
                  style={{ width: `${overall}%` }}
                />
              </div>
            </div>
            <Button variant="outline">
              <RefreshCw className="size-4" /> Regenerate Path
            </Button>
          </CardContent>
        </Card>

        <div className="relative space-y-4 pl-8">
          <span className="absolute left-3 top-2 bottom-2 w-px bg-border" />
          {learningPath.map((s) => {
            const locked = s.status === "locked";
            return (
              <div key={s.step} className="relative">
                <span
                  className={cn(
                    "absolute -left-8 top-6 flex size-6 items-center justify-center rounded-full border-2 border-background",
                    s.status === "completed" && "bg-success text-success-foreground",
                    s.status === "in-progress" && "bg-secondary text-secondary-foreground",
                    s.status === "not-started" && "bg-muted text-muted-foreground",
                    locked && "bg-muted text-muted-foreground",
                  )}
                >
                  {s.status === "completed" ? (
                    <CheckCircle2 className="size-4" />
                  ) : locked ? (
                    <Lock className="size-3.5" />
                  ) : (
                    <span className="text-[11px] font-semibold">{s.step}</span>
                  )}
                </span>

                <Card className={cn("shadow-card", locked && "opacity-60")}>
                  <CardContent className="flex flex-wrap items-start justify-between gap-4 py-5">
                    <div className="min-w-0 space-y-2">
                      <p className="text-xs uppercase tracking-wide text-muted-foreground">
                        Step {s.step} ·{" "}
                        {s.status === "completed"
                          ? "Completed"
                          : s.status === "in-progress"
                            ? "In Progress"
                            : s.status === "locked"
                              ? "Locked"
                              : "Not Started"}
                      </p>
                      <h2 className="text-base font-semibold text-foreground">{s.title}</h2>
                      <p className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                        <span className="rounded bg-accent px-1.5 py-0.5 font-medium text-accent-foreground">
                          {s.provider}
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <Clock className="size-3" /> {s.hours} hrs
                        </span>
                        {s.tags.map((t) => (
                          <span
                            key={t}
                            className="rounded-full border border-border px-2 py-0.5"
                          >
                            {t}
                          </span>
                        ))}
                      </p>
                      {s.status === "in-progress" && (
                        <div className="max-w-xs pt-1">
                          <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                            <div
                              className="h-full rounded-full bg-secondary"
                              style={{ width: `${s.progress}%` }}
                            />
                          </div>
                          <p className="mt-1 text-xs text-muted-foreground">
                            {s.progress}% complete
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="flex shrink-0 flex-col items-end gap-2">
                      {s.status === "completed" && (
                        <button className="text-sm font-medium text-secondary hover:underline">
                          View Certificate
                        </button>
                      )}
                      {s.status === "in-progress" && (
                        <Button className="bg-secondary text-secondary-foreground hover:bg-secondary/90">
                          <PlayCircle className="size-4" /> Continue Learning
                        </Button>
                      )}
                      {s.status === "not-started" && (
                        <>
                          <Button variant="outline">Enrol Now</Button>
                          <Link
                            to="/skill-gaps"
                            className="text-xs font-medium text-secondary hover:underline"
                          >
                            Why this?
                          </Link>
                        </>
                      )}
                      {locked && (
                        <Button variant="outline" disabled>
                          <Lock className="size-4" /> Locked
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            );
          })}
        </div>
      </div>
    </AppLayout>
  );
}
