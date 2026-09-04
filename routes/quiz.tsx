import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ChevronLeft, ChevronRight, Timer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { quizQuestions } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/quiz")({
  head: () => ({
    meta: [
      { title: "Assessment in Progress — StatSkill AI Quiz" },
      {
        name: "description",
        content:
          "Focused, timed quiz interface for StatSkill AI competency assessments with question navigation and instant submission.",
      },
      { property: "og:title", content: "Assessment in Progress — StatSkill AI" },
      {
        property: "og:description",
        content: "Timed competency assessment with 15 questions.",
      },
    ],
  }),
  component: QuizPage,
});

const letters = ["A", "B", "C", "D"];
const TOTAL = 15;

function QuizPage() {
  const [index, setIndex] = useState(2);
  const [answers, setAnswers] = useState<Record<number, number>>({});

  const q = quizQuestions[index % quizQuestions.length];
  const isLast = index === TOTAL - 1;
  const selected = answers[index];

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="mx-auto flex max-w-3xl flex-wrap items-center gap-3 px-4 py-4 sm:px-6">
          <div className="min-w-48 flex-1">
            <p className="mb-2 text-sm font-medium text-foreground">
              Question {index + 1} of {TOTAL}
            </p>
            <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-secondary transition-all"
                style={{ width: `${((index + 1) / TOTAL) * 100}%` }}
              />
            </div>
          </div>
          <span className="inline-flex items-center gap-2 rounded-md border border-border px-3 py-1.5 text-sm font-medium text-foreground">
            <Timer className="size-4 text-warning" />
            12:34 remaining
          </span>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
        <Card className="shadow-card">
          <CardContent className="py-6">
            <h1 className="text-lg font-semibold text-foreground">{q.question}</h1>

            <div className="mt-6 space-y-3" role="radiogroup" aria-label="Answer options">
              {q.options.map((o, i) => {
                const active = selected === i;
                return (
                  <button
                    key={o}
                    role="radio"
                    aria-checked={active}
                    onClick={() => setAnswers((a) => ({ ...a, [index]: i }))}
                    className={cn(
                      "flex w-full items-center gap-3 rounded-lg border px-4 py-3 text-left text-sm transition-colors",
                      active
                        ? "border-secondary bg-secondary/10 font-medium text-foreground"
                        : "border-border bg-card text-foreground hover:bg-accent",
                    )}
                  >
                    <span
                      className={cn(
                        "flex size-6 shrink-0 items-center justify-center rounded-full border text-xs font-semibold",
                        active
                          ? "border-secondary bg-secondary text-secondary-foreground"
                          : "border-border text-muted-foreground",
                      )}
                    >
                      {letters[i]}
                    </span>
                    {o}
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
          <Button
            variant="outline"
            disabled={index === 0}
            onClick={() => setIndex((i) => Math.max(0, i - 1))}
          >
            <ChevronLeft className="size-4" /> Previous
          </Button>

          <div className="flex gap-3">
            {!isLast && (
              <Button
                className="bg-secondary text-secondary-foreground hover:bg-secondary/90"
                onClick={() => setIndex((i) => Math.min(TOTAL - 1, i + 1))}
              >
                Next <ChevronRight className="size-4" />
              </Button>
            )}
            {isLast && (
              <Button asChild className="bg-success text-success-foreground hover:bg-success/90">
                <Link to="/dashboard">Submit Quiz</Link>
              </Button>
            )}
          </div>
        </div>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          <Link to="/assessments" className="hover:underline">
            Exit to Assessments
          </Link>
        </p>
      </main>
    </div>
  );
}
