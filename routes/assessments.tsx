import { createFileRoute, Link } from "@tanstack/react-router";
import { CheckCircle2, Clock, PlayCircle } from "lucide-react";
import { AppLayout } from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const Route = createFileRoute("/assessments")({
  head: () => ({
    meta: [
      { title: "My Assessments — StatSkill AI" },
      {
        name: "description",
        content:
          "Pending and completed competency assessments, diagnostic tests and AI-generated quizzes for statistical officials.",
      },
      { property: "og:title", content: "My Assessments — StatSkill AI" },
      {
        property: "og:description",
        content: "Pending and completed competency assessments in one place.",
      },
    ],
  }),
  component: AssessmentsPage,
});

const pending = [
  { title: "Technical Competency Diagnostic", questions: 15, minutes: 20 },
  { title: "Sampling Techniques — Module Quiz", questions: 10, minutes: 15 },
];

const completed = [
  { title: "Statistical Foundations Diagnostic", score: "78%", date: "12 Aug 2026" },
  { title: "Cyber Hygiene Mandatory Module", score: "92%", date: "28 Jul 2026" },
];

function AssessmentsPage() {
  return (
    <AppLayout title="Assessments" subtitle="Diagnostics, module quizzes and certifications">
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="text-base">Pending</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {pending.map((a) => (
              <div
                key={a.title}
                className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border p-4"
              >
                <div>
                  <p className="text-sm font-medium text-foreground">{a.title}</p>
                  <p className="mt-1 inline-flex items-center gap-2 text-xs text-muted-foreground">
                    {a.questions} questions
                    <span className="inline-flex items-center gap-1">
                      <Clock className="size-3" /> {a.minutes} min
                    </span>
                  </p>
                </div>
                <Button
                  asChild
                  size="sm"
                  className="bg-secondary text-secondary-foreground hover:bg-secondary/90"
                >
                  <Link to="/quiz">
                    <PlayCircle className="size-4" /> Start
                  </Link>
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="text-base">Completed</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {completed.map((a) => (
              <div
                key={a.title}
                className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border p-4"
              >
                <div>
                  <p className="text-sm font-medium text-foreground">{a.title}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{a.date}</p>
                </div>
                <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-success">
                  <CheckCircle2 className="size-4" /> {a.score}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
