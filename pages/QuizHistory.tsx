import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Award, Clock, Trash2, ArrowLeft, Lightbulb, PlayCircle } from "lucide-react";
import { AppLayout } from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { getQuizHistory, clearQuizHistory, type QuizAttempt } from "@/lib/quiz-generator";
import { cn } from "@/lib/utils";

export function QuizHistoryPage() {
  const [history, setHistory] = useState<QuizAttempt[]>([]);

  useEffect(() => {
    setHistory(getQuizHistory());
  }, []);

  const handleClearHistory = () => {
    if (window.confirm("Are you sure you want to clear your quiz history logs?")) {
      clearQuizHistory();
      setHistory([]);
    }
  };

  const formatTimer = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins}m ${secs}s`;
  };

  return (
    <AppLayout title="Quiz History & Performance Records" subtitle="Track past quiz scores, difficulty levels, and knowledge gap analyses">
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <Button asChild variant="outline" size="sm">
            <Link to="/materials">
              <ArrowLeft className="size-4 mr-1.5" /> Back to Material Analyzer
            </Link>
          </Button>

          {history.length > 0 && (
            <Button variant="outline" size="sm" onClick={handleClearHistory} className="text-destructive hover:bg-destructive/10">
              <Trash2 className="size-4 mr-1.5" /> Clear History
            </Button>
          )}
        </div>

        {history.length === 0 ? (
          <Card className="shadow-card text-center py-12">
            <CardContent className="space-y-3">
              <Award className="mx-auto size-12 text-muted-foreground" />
              <h3 className="text-base font-semibold text-foreground">No Quiz Attempts Found</h3>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                You haven't completed any quizzes yet. Upload material in the Material Analyzer to generate and take your first quiz!
              </p>
              <Button asChild className="bg-secondary text-secondary-foreground hover:bg-secondary/90 mt-2">
                <Link to="/materials">
                  <PlayCircle className="size-4 mr-1.5" /> Generate New Quiz
                </Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {history.map((attempt) => {
              const isHigh = attempt.scorePercentage >= 80;
              const isMid = attempt.scorePercentage >= 60 && attempt.scorePercentage < 80;

              return (
                <Card key={attempt.id} className="shadow-card border-border">
                  <CardContent className="p-5 space-y-4">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-base font-semibold text-foreground">{attempt.title}</h3>
                          <span
                            className={cn(
                              "rounded-full px-2.5 py-0.5 text-xs font-semibold border",
                              attempt.difficulty === "Easy"
                                ? "bg-accent/15 text-accent-foreground border-accent/30"
                                : attempt.difficulty === "Hard"
                                ? "bg-destructive/15 text-destructive border-destructive/30"
                                : "bg-secondary/15 text-secondary border-secondary/30"
                            )}
                          >
                            {attempt.difficulty} Mode
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground flex items-center gap-3">
                          <span>{attempt.date}</span>
                          <span>•</span>
                          <span className="inline-flex items-center gap-1">
                            <Clock className="size-3" /> {formatTimer(attempt.timeSpentSeconds)}
                          </span>
                        </p>
                      </div>

                      <div className="text-right">
                        <div
                          className={cn(
                            "text-2xl font-extrabold",
                            isHigh ? "text-success" : isMid ? "text-secondary" : "text-destructive"
                          )}
                        >
                          {attempt.scorePercentage}%
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {attempt.correctAnswers} / {attempt.totalQuestions} Marks
                        </p>
                      </div>
                    </div>

                    {/* Topics Covered */}
                    <div className="flex flex-wrap items-center gap-1.5 text-xs">
                      <span className="font-semibold text-foreground mr-1">Topics:</span>
                      {attempt.topicsCovered.map((t) => (
                        <span key={t} className="rounded-md bg-muted px-2 py-0.5 text-[11px] text-muted-foreground">
                          {t}
                        </span>
                      ))}
                    </div>

                    {/* Improvement Suggestions */}
                    {attempt.improvementsNeeded.length > 0 && (
                      <div className="rounded-lg border border-border bg-muted/30 p-3 text-xs space-y-1.5">
                        <p className="font-semibold text-primary flex items-center gap-1.5">
                          <Lightbulb className="size-3.5 text-secondary" /> Where to Improve:
                        </p>
                        <ul className="list-disc list-inside space-y-1 text-muted-foreground pl-1">
                          {attempt.improvementsNeeded.map((imp) => (
                            <li key={imp.topic}>
                              <span className="font-medium text-foreground">{imp.topic}:</span> {imp.recommendation}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
