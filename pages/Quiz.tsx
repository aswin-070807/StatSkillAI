import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { AppLayout } from "@/components/AppLayout";
import {
  ChevronLeft,
  ChevronRight,
  Timer,
  Award,
  Download,
  History,
  RotateCcw,
  CheckCircle2,
  XCircle,
  Lightbulb,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  generateQuizFromMaterial,
  saveQuizAttempt,
  type QuizQuestion,
  type QuizAttempt,
} from "@/lib/quiz-generator";
import { cn } from "@/lib/utils";

const letters = ["A", "B", "C", "D"];

export function QuizPage() {
  const location = useLocation();
  const navigate = useNavigate();

  // Get custom questions from location state if coming from Material Analyzer
  const stateData = location.state as {
    quizTitle?: string;
    questions?: QuizQuestion[];
    difficulty?: "Easy" | "Medium" | "Hard";
  } | null;

  const quizTitle = stateData?.quizTitle || "Statistical Competency Assessment";
  const difficulty = stateData?.difficulty || "Medium";
  const questions: QuizQuestion[] =
    stateData?.questions && stateData.questions.length > 0
      ? stateData.questions
      : generateQuizFromMaterial("Default Sample Material", difficulty).questions;

  const totalQuestions = questions.length;

  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<number, number>>({});
  const [secondsElapsed, setSecondsElapsed] = useState(0);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [attemptRecord, setAttemptRecord] = useState<QuizAttempt | null>(null);

  // Timer interval
  useEffect(() => {
    if (isSubmitted) return;
    const timer = setInterval(() => {
      setSecondsElapsed((s) => s + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [isSubmitted]);

  const formatTimer = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleSelectOption = (optionIndex: number) => {
    if (isSubmitted) return;
    setUserAnswers((prev) => ({
      ...prev,
      [currentIndex]: optionIndex,
    }));
  };

  const handleSubmitQuiz = () => {
    let correctCount = 0;
    const topicsMap: Record<string, { total: number; correct: number }> = {};

    questions.forEach((q, idx) => {
      const isCorrect = userAnswers[idx] === q.answer;
      if (isCorrect) correctCount++;

      if (!topicsMap[q.topic]) {
        topicsMap[q.topic] = { total: 0, correct: 0 };
      }
      topicsMap[q.topic]!.total += 1;
      if (isCorrect) topicsMap[q.topic]!.correct += 1;
    });

    const scorePercentage = Math.round((correctCount / totalQuestions) * 100);

    // Build Knowledge Improvement Suggestions ("Where to Improve")
    const improvementsNeeded: { topic: string; recommendation: string }[] = [];
    Object.entries(topicsMap).forEach(([topicName, stats]) => {
      if (stats.correct < stats.total) {
        improvementsNeeded.push({
          topic: topicName,
          recommendation: `Review ${topicName} fundamentals. Focus on problem solving and standardized statistical protocols.`,
        });
      }
    });

    if (improvementsNeeded.length === 0) {
      improvementsNeeded.push({
        topic: "Overall Mastery",
        recommendation: "Excellent performance! Maintain proficiency by taking advanced analytical assessments.",
      });
    }

    const attempt: QuizAttempt = {
      id: "attempt-" + Date.now(),
      title: quizTitle,
      date: new Date().toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }),
      difficulty,
      totalQuestions,
      correctAnswers: correctCount,
      scorePercentage,
      timeSpentSeconds: secondsElapsed,
      topicsCovered: Array.from(new Set(questions.map((q) => q.topic))),
      improvementsNeeded,
    };

    saveQuizAttempt(attempt);
    setAttemptRecord(attempt);
    setIsSubmitted(true);
  };

  // Download printable / text result report
  const handleDownloadResult = () => {
    if (!attemptRecord) return;

    const reportText = `=======================================================
STATSKILL AI - OFFICIAL QUIZ PERFORMANCE REPORT
Ministry of Statistics & Programme Implementation (MoSPI)
=======================================================

Assessment: ${attemptRecord.title}
Difficulty Mode: ${attemptRecord.difficulty}
Date Completed: ${attemptRecord.date}
Time Taken: ${formatTimer(attemptRecord.timeSpentSeconds)}

FINAL SCORE & MARKS:
-------------------------------------------------------
Total Questions : ${attemptRecord.totalQuestions}
Correct Answers : ${attemptRecord.correctAnswers}
Score Percentage: ${attemptRecord.scorePercentage}%
Performance Grade: ${
      attemptRecord.scorePercentage >= 80
        ? "Distinction (Exemplary Competency)"
        : attemptRecord.scorePercentage >= 60
        ? "Satisfactory (Proficient)"
        : "Needs Improvement"
    }

WHERE TO IMPROVE (KNOWLEDGE GAP ANALYSIS):
-------------------------------------------------------
${attemptRecord.improvementsNeeded
  .map(
    (imp, i) => `${i + 1}. Topic: ${imp.topic}
   Recommendation: ${imp.recommendation}`
  )
  .join("\n\n")}

DETAILED QUESTION BREAKDOWN:
-------------------------------------------------------
${questions
  .map((q, idx) => {
    const userChoice = userAnswers[idx];
    const isCorrect = userChoice === q.answer;
    return `Q${idx + 1}: ${q.question}
   Your Answer: ${userChoice !== undefined ? `${letters[userChoice]}. ${q.options[userChoice]}` : "Unanswered"}
   Correct Answer: ${letters[q.answer]}. ${q.options[q.answer]}
   Result: ${isCorrect ? "[CORRECT]" : "[INCORRECT]"}
   Explanation: ${q.explanation}
`;
  })
  .join("\n")}
=======================================================
Report Generated by StatSkill AI Competency Engine
`;

    const blob = new Blob([reportText], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `StatSkill_Quiz_Result_${Date.now()}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const currentQ = questions[currentIndex] || questions[0]!;

  // -------------------------------------------------------------
  // Render Quiz Summary & Score View after submission
  // -------------------------------------------------------------
  if (isSubmitted && attemptRecord) {
    return (
      <AppLayout title="Quiz Performance & Score Breakdown" subtitle={`${attemptRecord.title} • ${attemptRecord.difficulty} Mode`}>
        <div className="mx-auto max-w-3xl space-y-6">
          <Card className="border-border shadow-elevated">
            <CardHeader className="text-center pb-2">
              <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-secondary/15 text-secondary mb-3">
                <Award className="size-8" />
              </div>
              <CardTitle className="text-2xl font-bold text-foreground">Quiz Results Summary</CardTitle>
              <CardDescription>{attemptRecord.title} • {attemptRecord.difficulty} Mode</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Score Display Box */}
              <div className="rounded-xl border border-border bg-card p-6 text-center shadow-card">
                <div className="text-5xl font-extrabold text-primary">
                  {attemptRecord.scorePercentage}%
                </div>
                <p className="mt-2 text-sm font-medium text-muted-foreground">
                  Score: <span className="text-foreground font-semibold">{attemptRecord.correctAnswers}</span> / {attemptRecord.totalQuestions} Questions Correct
                </p>
                <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-accent/20 px-3 py-1 text-xs font-semibold text-accent-foreground">
                  Time Spent: {formatTimer(attemptRecord.timeSpentSeconds)}
                </div>
              </div>

              {/* Where to Improve Analysis */}
              <Card className="border-secondary/30 bg-secondary/5 shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2 text-primary">
                    <Lightbulb className="size-5 text-secondary" />
                    Where to Improve (Knowledge Gap Analysis)
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {attemptRecord.improvementsNeeded.map((imp) => (
                    <div key={imp.topic} className="rounded-lg border border-border bg-card p-3.5 text-xs">
                      <p className="font-semibold text-foreground">{imp.topic}</p>
                      <p className="mt-1 text-muted-foreground">{imp.recommendation}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Detailed Answers Review */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                  Question Review
                </h3>
                {questions.map((q, idx) => {
                  const userChoice = userAnswers[idx];
                  const isCorrect = userChoice === q.answer;
                  return (
                    <div
                      key={q.id}
                      className={cn(
                        "rounded-lg border p-4 text-xs space-y-2",
                        isCorrect ? "border-success/40 bg-success/5" : "border-destructive/40 bg-destructive/5"
                      )}
                    >
                      <div className="flex items-start justify-between gap-2 font-medium text-sm text-foreground">
                        <span>Q{idx + 1}. {q.question}</span>
                        {isCorrect ? (
                          <span className="flex items-center gap-1 shrink-0 text-success text-xs font-semibold">
                            <CheckCircle2 className="size-4" /> Correct
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 shrink-0 text-destructive text-xs font-semibold">
                            <XCircle className="size-4" /> Incorrect
                          </span>
                        )}
                      </div>

                      <div className="text-muted-foreground">
                        <span>Your choice: </span>
                        <span className={cn("font-medium", isCorrect ? "text-success" : "text-destructive")}>
                          {userChoice !== undefined ? `${letters[userChoice]}. ${q.options[userChoice]}` : "Unanswered"}
                        </span>
                      </div>

                      {!isCorrect && (
                        <div className="text-foreground font-medium">
                          Correct choice: <span className="text-success">{letters[q.answer]}. {q.options[q.answer]}</span>
                        </div>
                      )}

                      <p className="rounded bg-muted/60 p-2 text-muted-foreground">
                        <span className="font-semibold text-foreground">Explanation: </span>
                        {q.explanation}
                      </p>
                    </div>
                  );
                })}
              </div>

              {/* Actions: Download Report, History, Retake */}
              <div className="flex flex-wrap gap-3 pt-4 border-t border-border">
                <Button onClick={handleDownloadResult} className="bg-primary text-primary-foreground hover:bg-primary/90 flex-1">
                  <Download className="size-4 mr-1.5" /> Download Result Report
                </Button>
                <Button variant="outline" onClick={() => navigate("/quiz-history")}>
                  <History className="size-4 mr-1.5" /> View Quiz History
                </Button>
                <Button variant="outline" onClick={() => { setIsSubmitted(false); setUserAnswers({}); setSecondsElapsed(0); setCurrentIndex(0); }}>
                  <RotateCcw className="size-4 mr-1.5" /> Retake Quiz
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </AppLayout>
    );
  }

  // -------------------------------------------------------------
  // Render Interactive Quiz Taking Interface
  // -------------------------------------------------------------
  const isLastQuestion = currentIndex === totalQuestions - 1;
  const selectedOption = userAnswers[currentIndex];

  return (
    <AppLayout title={quizTitle} subtitle={`Question ${currentIndex + 1} of ${totalQuestions} • ${difficulty} Mode`}>
      <div className="mx-auto max-w-3xl space-y-6">
        <div className="flex items-center justify-between gap-4 p-4 border border-border bg-card rounded-lg shadow-sm">
          <div>
            <h1 className="text-sm font-semibold text-foreground truncate max-w-xs sm:max-w-md">
              {quizTitle}
            </h1>
            <p className="text-xs text-muted-foreground">
              Question {currentIndex + 1} of {totalQuestions} • {difficulty} Mode
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1.5 rounded-md border border-border bg-muted/30 px-3 py-1.5 text-xs font-mono font-medium text-foreground">
              <Timer className="size-3.5 text-warning" />
              {formatTimer(secondsElapsed)}
            </span>
          </div>
        </div>
        {/* Progress Bar */}
        <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-secondary transition-all duration-300"
            style={{ width: `${((currentIndex + 1) / totalQuestions) * 100}%` }}
          />
        </div>

        {/* Quiz Question Body */}
        <Card className="shadow-card border-border">
          <CardContent className="py-6 space-y-6">
            <div className="flex items-center justify-between text-xs text-muted-foreground border-b border-border pb-3">
              <span className="rounded bg-accent/20 px-2 py-0.5 font-medium text-accent-foreground">
                Topic: {currentQ.topic}
              </span>
              <span>Bloom's Level: {currentQ.bloom}</span>
            </div>

            <h2 className="text-base sm:text-lg font-semibold text-foreground leading-snug">
              {currentQ.question}
            </h2>

            <div className="space-y-3" role="radiogroup">
              {currentQ.options.map((optionText, i) => {
                const isSelected = selectedOption === i;
                return (
                  <button
                    key={optionText}
                    type="button"
                    onClick={() => handleSelectOption(i)}
                    className={cn(
                      "flex w-full items-center gap-3.5 rounded-lg border px-4 py-3.5 text-left text-sm transition-all",
                      isSelected
                        ? "border-secondary bg-secondary/10 font-medium text-foreground ring-1 ring-secondary"
                        : "border-border bg-card text-foreground hover:bg-accent/60"
                    )}
                  >
                    <span
                      className={cn(
                        "flex size-6 shrink-0 items-center justify-center rounded-full border text-xs font-semibold transition-colors",
                        isSelected
                          ? "border-secondary bg-secondary text-secondary-foreground"
                          : "border-border text-muted-foreground bg-muted/40"
                      )}
                    >
                      {letters[i]}
                    </span>
                    <span className="flex-1">{optionText}</span>
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Navigation Buttons */}
        <div className="mt-6 flex items-center justify-between gap-3">
          <Button
            variant="outline"
            disabled={currentIndex === 0}
            onClick={() => setCurrentIndex((i) => Math.max(0, i - 1))}
          >
            <ChevronLeft className="size-4 mr-1" /> Previous
          </Button>

          <div className="flex items-center gap-2">
            {!isLastQuestion ? (
              <Button
                onClick={() => setCurrentIndex((i) => Math.min(totalQuestions - 1, i + 1))}
                className="bg-secondary text-secondary-foreground hover:bg-secondary/90"
              >
                Next <ChevronRight className="size-4 ml-1" />
              </Button>
            ) : (
              <Button
                onClick={handleSubmitQuiz}
                className="bg-success text-success-foreground hover:bg-success/90 font-semibold"
                size="lg"
              >
                Submit &amp; View Result <ArrowRight className="size-4 ml-1.5" />
              </Button>
            )}
          </div>
        </div>

        <div className="mt-8 text-center text-xs text-muted-foreground">
          <Link to="/materials" className="hover:underline">
            Exit to Material Analyzer
          </Link>
        </div>
      </div>
    </AppLayout>
  );
}
