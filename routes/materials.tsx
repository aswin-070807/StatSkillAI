import { createFileRoute, Link } from "@tanstack/react-router";
import { CheckCircle2, CloudUpload, Pencil, PlayCircle, Save } from "lucide-react";
import { AppLayout } from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { quizQuestions } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/materials")({
  head: () => ({
    meta: [
      { title: "Material Analyzer — AI Assessment Engine | StatSkill AI" },
      {
        name: "description",
        content:
          "Upload training material and let the AI assessment engine extract topics and generate tagged multiple-choice questions automatically.",
      },
      { property: "og:title", content: "Material Analyzer — StatSkill AI" },
      {
        property: "og:description",
        content: "Turn PDFs, decks and documents into ready-to-use assessments.",
      },
    ],
  }),
  component: MaterialsPage,
});

const steps = ["Text Extraction", "Topic Detection", "Chunking", "Embedding"];
const letters = ["A", "B", "C", "D"];

function MaterialsPage() {
  const q = quizQuestions[0];
  const progress = 90;

  return (
    <AppLayout title="Material Analyzer" subtitle="AI assessment engine">
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-6">
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="text-base">Upload Material</CardTitle>
            </CardHeader>
            <CardContent>
              <label className="flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-border bg-muted/40 px-6 py-14 text-center transition-colors hover:border-secondary hover:bg-secondary/5">
                <CloudUpload className="size-10 text-secondary" />
                <p className="mt-4 text-sm font-medium text-foreground">
                  Drag &amp; Drop your file here, or click to browse
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Supported: PDF, PPTX, DOCX, TXT. Max size: 20MB.
                </p>
                <input type="file" className="hidden" accept=".pdf,.pptx,.docx,.txt" />
              </label>
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="text-base">Processing… {progress}%</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="h-2.5 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-secondary transition-all"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <ol className="grid gap-2 sm:grid-cols-2">
                {steps.map((s, i) => {
                  const done = i < 3;
                  return (
                    <li
                      key={s}
                      className={cn(
                        "flex items-center gap-2 rounded-md border px-3 py-2 text-xs",
                        done
                          ? "border-success/30 bg-success/8 text-success"
                          : "border-border text-muted-foreground",
                      )}
                    >
                      <CheckCircle2 className="size-4" />
                      {s}
                    </li>
                  );
                })}
              </ol>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="text-base">Generated Questions (Preview)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-lg border border-border p-4">
                <p className="text-sm font-medium text-foreground">Q1. {q.question}</p>
                <ul className="mt-3 space-y-2">
                  {q.options.map((o, i) => (
                    <li
                      key={o}
                      className={cn(
                        "flex items-center gap-3 rounded-md border px-3 py-2 text-sm",
                        i === q.answer
                          ? "border-success/40 bg-success/10 font-medium text-success"
                          : "border-border text-foreground",
                      )}
                    >
                      <span className="text-xs font-semibold">{letters[i]}</span>
                      {o}
                    </li>
                  ))}
                </ul>
                <p className="mt-3 rounded-md bg-muted/60 p-3 text-xs text-muted-foreground">
                  <span className="font-semibold text-foreground">Explanation: </span>
                  {q.explanation}
                </p>
                <div className="mt-3 flex flex-wrap gap-2 text-xs">
                  <span className="rounded-full border border-border px-2.5 py-0.5 text-muted-foreground">
                    Difficulty: {q.difficulty}
                  </span>
                  <span className="rounded-full border border-border px-2.5 py-0.5 text-muted-foreground">
                    Bloom's Level: {q.bloom}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex flex-wrap gap-3">
            <Button variant="outline">
              <Pencil className="size-4" /> Edit Questions
            </Button>
            <Button variant="outline">
              <Save className="size-4" /> Save to My Assessments
            </Button>
            <Button asChild className="bg-secondary text-secondary-foreground hover:bg-secondary/90">
              <Link to="/quiz">
                <PlayCircle className="size-4" /> Start Quiz Now
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
