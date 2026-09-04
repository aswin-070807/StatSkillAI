import { createFileRoute, Link } from "@tanstack/react-router";
import { Bot, ClipboardCheck, Clock, ArrowRight } from "lucide-react";
import { AppLayout } from "@/components/AppLayout";
import { Gauge, LabeledBar, PriorityBadge } from "@/components/stat-widgets";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { competencyGroups, recommendedCourses, skillGaps, user } from "@/lib/mock-data";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — StatSkill AI Competency Overview" },
      {
        name: "description",
        content:
          "Track your overall competency score, priority skill gaps and recommended courses in one enterprise dashboard.",
      },
      { property: "og:title", content: "Dashboard — StatSkill AI" },
      {
        property: "og:description",
        content: "Overall competency, priority gaps and recommended learning at a glance.",
      },
    ],
  }),
  component: DashboardPage,
});

function DashboardPage() {
  const priorityGaps = skillGaps.slice(0, 4);

  return (
    <AppLayout>
      <div className="grid gap-6 xl:grid-cols-2">
        <div className="space-y-6">
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="text-base">Competency Snapshot</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center gap-2">
              <Gauge value={user.overall} delta={user.growth} />
              <p className="text-center text-xs text-muted-foreground">
                {user.role} • {user.experience}
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="text-base">Competency Groups</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {competencyGroups.map((g) => (
                <LabeledBar key={g.key} label={g.label} value={g.score} color={g.token} />
              ))}
            </CardContent>
          </Card>

          <div className="flex flex-wrap gap-3">
            <Button asChild className="bg-secondary text-secondary-foreground hover:bg-secondary/90">
              <Link to="/quiz">
                <ClipboardCheck className="size-4" />
                Take Assessment
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link to="/assistant">
                <Bot className="size-4" />
                Ask StatBot
              </Link>
            </Button>
          </div>
        </div>

        <div className="space-y-6">
          <Card className="shadow-card">
            <CardHeader className="flex-row items-center justify-between space-y-0">
              <CardTitle className="text-base">Priority Skill Gaps</CardTitle>
              <Link
                to="/skill-gaps"
                className="text-xs font-medium text-secondary hover:underline"
              >
                View all
              </Link>
            </CardHeader>
            <CardContent className="space-y-3">
              {priorityGaps.map((g) => (
                <div
                  key={g.competency}
                  className="flex items-center justify-between rounded-lg border border-border px-4 py-3"
                >
                  <div>
                    <p className="text-sm font-medium text-foreground">{g.competency}</p>
                    <p className="text-xs text-muted-foreground">
                      {g.current}/5 → {g.required}/5
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-semibold text-foreground">gap {g.gap}</span>
                    <PriorityBadge priority={g.priority} />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="text-base">Recommended Next</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {recommendedCourses.map((c) => (
                <div
                  key={c.title}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border p-4"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground">{c.title}</p>
                    <p className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                      <span className="rounded bg-accent px-1.5 py-0.5 font-medium text-accent-foreground">
                        {c.provider}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <Clock className="size-3" /> {c.hours} hrs
                      </span>
                    </p>
                  </div>
                  <Button
                    asChild
                    size="sm"
                    className="bg-secondary text-secondary-foreground hover:bg-secondary/90"
                  >
                    <Link to="/learning-path">
                      Start <ArrowRight className="size-3.5" />
                    </Link>
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
