import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  CheckCircle2,
  CloudUpload,
  Pencil,
  PlayCircle,
  AlertTriangle,
  FileText,
  History,
  Sparkles,
  ShieldAlert,
  FileType,
} from "lucide-react";
import { AppLayout } from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  detectSensitiveData,
  generateQuizFromMaterial,
  cleanMaterialText,
  type QuizQuestion,
  type SensitiveDetectionResult,
} from "@/lib/quiz-generator";
import { cn } from "@/lib/utils";

const processingSteps = ["Text Extraction & Cleaning", "PII & Sensitivity Check", "Topic Chunking", "MCQ Generation"];
const letters = ["A", "B", "C", "D"];

export function MaterialsPage() {
  const navigate = useNavigate();

  const [fileName, setFileName] = useState<string>("");
  const [materialContent, setMaterialContent] = useState<string>("");
  const [difficulty, setDifficulty] = useState<"Easy" | "Medium" | "Hard">("Medium");

  const [isProcessing, setIsProcessing] = useState(false);
  const [sensitiveWarning, setSensitiveWarning] = useState<SensitiveDetectionResult | null>(null);
  const [generatedQuiz, setGeneratedQuiz] = useState<{ title: string; questions: QuizQuestion[] } | null>(null);

  // Process file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const cleanTitle = file.name.replace(/\.[^/.]+$/, "").replace(/[-_.]/g, " ");
    setFileName(file.name);
    setIsProcessing(true);
    setSensitiveWarning(null);
    setGeneratedQuiz(null);

    const reader = new FileReader();
    reader.onload = (event) => {
      const rawContent = (event.target?.result as string) || "";
      const { sanitizedText } = cleanMaterialText(rawContent, cleanTitle);

      setMaterialContent(sanitizedText || cleanTitle);

      // Perform Sensitive Document Check (Aadhaar / PAN / Identity check)
      const sensitiveCheck = detectSensitiveData(rawContent, file.name);

      setTimeout(() => {
        setIsProcessing(false);
        if (sensitiveCheck.isSensitive) {
          setSensitiveWarning(sensitiveCheck);
        } else {
          // Generate quiz questions with sanitized text
          const quiz = generateQuizFromMaterial(sanitizedText, difficulty, cleanTitle);
          setGeneratedQuiz(quiz);
        }
      }, 500);
    };

    reader.readAsText(file);
  };

  // Change difficulty mode
  const handleDifficultyChange = (mode: "Easy" | "Medium" | "Hard") => {
    setDifficulty(mode);
    if ((materialContent || fileName) && !sensitiveWarning?.isSensitive) {
      const quiz = generateQuizFromMaterial(
        materialContent || fileName,
        mode,
        fileName ? fileName.replace(/\.[^/.]+$/, "").replace(/[-_.]/g, " ") : "Custom Study Material"
      );
      setGeneratedQuiz(quiz);
    }
  };

  // Start generated quiz
  const handleStartQuiz = () => {
    if (!generatedQuiz || sensitiveWarning?.isSensitive) return;
    navigate("/quiz", {
      state: {
        quizTitle: generatedQuiz.title,
        questions: generatedQuiz.questions,
        difficulty,
      },
    });
  };

  const previewQ = generatedQuiz?.questions[0];

  return (
    <AppLayout title="Material Analyzer & Quiz Generator" subtitle="Extract topics & generate custom quizzes safely">
      <div className="space-y-6">
        {/* Top Header Actions */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-foreground">Upload Study Material</h2>
            <p className="text-xs text-muted-foreground">
              Upload course material, select difficulty mode, and generate interactive assessments.
            </p>
          </div>
          <Button asChild variant="outline" size="sm">
            <Link to="/quiz-history">
              <History className="size-4 mr-1.5 text-secondary" /> View Quiz History
            </Link>
          </Button>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Left Column: Upload & Options */}
          <div className="space-y-6">
            <Card className="shadow-card border-border">
              <CardHeader>
                <CardTitle className="text-base flex items-center justify-between">
                  <span>1. Select &amp; Upload Document</span>
                  {fileName && (
                    <span className="text-xs font-semibold text-secondary flex items-center gap-1.5 bg-secondary/10 px-2.5 py-1 rounded-full border border-secondary/20">
                      <FileType className="size-3.5" /> {fileName}
                    </span>
                  )}
                </CardTitle>
                <CardDescription>
                  Upload your training document (.txt, .pdf, .docx). Personal identity documents are restricted.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <label className="flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-border bg-muted/30 px-6 py-10 text-center transition-colors hover:border-secondary hover:bg-secondary/5">
                  <CloudUpload className="size-12 text-secondary mb-2" />
                  <p className="text-sm font-medium text-foreground">
                    Click to browse or drag &amp; drop document here
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Supported formats: TXT, PDF, DOCX. Max size: 20MB.
                  </p>
                  <input
                    type="file"
                    className="hidden"
                    accept=".txt,.pdf,.docx,.pptx"
                    onChange={handleFileUpload}
                  />
                </label>
              </CardContent>
            </Card>

            {/* Difficulty Selector */}
            <Card className="shadow-card border-border">
              <CardHeader>
                <CardTitle className="text-base">2. Select Quiz Difficulty Mode</CardTitle>
                <CardDescription>
                  Tailor question complexity, Bloom's taxonomy depth, and analytical rigor.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-3">
                  {(["Easy", "Medium", "Hard"] as const).map((mode) => {
                    const active = difficulty === mode;
                    return (
                      <button
                        key={mode}
                        type="button"
                        onClick={() => handleDifficultyChange(mode)}
                        className={cn(
                          "flex flex-col items-center justify-center rounded-lg border p-3.5 text-center transition-all",
                          active
                            ? "border-secondary bg-secondary/10 font-semibold text-secondary-foreground shadow-sm ring-1 ring-secondary"
                            : "border-border bg-card text-foreground hover:bg-accent",
                        )}
                      >
                        <span className="text-sm font-medium">
                          {mode === "Easy" ? "Easy (Low)" : mode === "Medium" ? "Medium" : "Hard (Advanced)"}
                        </span>
                        <span className="mt-1 text-[11px] text-muted-foreground">
                          {mode === "Easy" ? "Foundational" : mode === "Medium" ? "Intermediate" : "Analytical"}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Sensitive Document Security Warning Alert */}
            {sensitiveWarning?.isSensitive && (
              <Alert variant="destructive" className="border-destructive/60 bg-destructive/10 text-destructive shadow-sm">
                <ShieldAlert className="size-5 shrink-0" />
                <AlertTitle className="font-semibold text-base">Restricted Document Detected</AlertTitle>
                <AlertDescription className="mt-1 text-xs leading-relaxed">
                  {sensitiveWarning.reason}
                  <div className="mt-2 font-medium">
                    Processing has been automatically blocked to prevent uploading personal identity files like Aadhaar cards, PAN cards, or confidential records.
                  </div>
                </AlertDescription>
              </Alert>
            )}

            {/* Processing Steps */}
            {isProcessing && (
              <Card className="shadow-card">
                <CardHeader>
                  <CardTitle className="text-base">Scanning &amp; Processing Material…</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                    <div className="h-full w-3/4 animate-pulse rounded-full bg-secondary" />
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    {processingSteps.map((s) => (
                      <div key={s} className="flex items-center gap-1.5 text-muted-foreground">
                        <CheckCircle2 className="size-3.5 text-secondary" />
                        <span>{s}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right Column: Generated Quiz Preview & Action */}
          <div className="space-y-6">
            <Card className="shadow-card border-border">
              <CardHeader className="flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-base">Generated MCQ Preview</CardTitle>
                  <CardDescription>
                    Mode: <span className="font-semibold text-secondary">{difficulty}</span> • 5 Questions
                  </CardDescription>
                </div>
                <span className="inline-flex items-center gap-1 rounded-full bg-secondary/10 px-3 py-1 text-xs font-semibold text-secondary">
                  <Sparkles className="size-3.5" /> AI Engine Ready
                </span>
              </CardHeader>
              <CardContent className="space-y-4">
                {sensitiveWarning?.isSensitive ? (
                  <div className="rounded-lg border border-dashed border-destructive/40 bg-destructive/5 p-8 text-center">
                    <AlertTriangle className="mx-auto size-8 text-destructive" />
                    <p className="mt-2 text-sm font-semibold text-destructive">
                      Quiz Generation Blocked
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Remove sensitive identification documents (Aadhaar, PAN, passwords) to generate a quiz.
                    </p>
                  </div>
                ) : previewQ ? (
                  <div className="rounded-lg border border-border p-4 bg-card space-y-3">
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>Sample Question 1 of 5</span>
                      <span className="rounded bg-accent/20 px-2 py-0.5 font-medium text-accent-foreground">
                        Topic: {previewQ.topic}
                      </span>
                    </div>
                    <p className="text-sm font-medium text-foreground">Q1. {previewQ.question}</p>
                    <ul className="space-y-2">
                      {previewQ.options.map((o, i) => (
                        <li
                          key={o}
                          className={cn(
                            "flex items-center gap-3 rounded-md border px-3 py-2 text-xs",
                            i === previewQ.answer
                              ? "border-success/50 bg-success/10 font-semibold text-success"
                              : "border-border text-foreground bg-muted/20",
                          )}
                        >
                          <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-muted text-[10px] font-bold">
                            {letters[i]}
                          </span>
                          {o}
                        </li>
                      ))}
                    </ul>
                    <p className="rounded-md bg-muted/50 p-2.5 text-xs text-muted-foreground">
                      <span className="font-semibold text-foreground">Explanation: </span>
                      {previewQ.explanation}
                    </p>
                    <div className="flex flex-wrap gap-2 text-[11px] pt-1">
                      <span className="rounded border border-border px-2 py-0.5 text-muted-foreground">
                        Difficulty: {previewQ.difficulty}
                      </span>
                      <span className="rounded border border-border px-2 py-0.5 text-muted-foreground">
                        Bloom's Level: {previewQ.bloom}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="rounded-lg border border-dashed border-border p-10 text-center">
                    <CloudUpload className="mx-auto size-8 text-muted-foreground mb-2" />
                    <p className="text-sm font-medium text-foreground">No Document Uploaded Yet</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Upload a study document on the left to preview generated assessment questions.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            <div className="flex flex-wrap gap-3">
              <Button
                type="button"
                variant="outline"
                disabled={!generatedQuiz || sensitiveWarning?.isSensitive}
                onClick={() => {
                  if (materialContent || fileName) {
                    const quiz = generateQuizFromMaterial(
                      materialContent || fileName,
                      difficulty,
                      fileName ? fileName.replace(/\.[^/.]+$/, "").replace(/[-_.]/g, " ") : "Custom Document"
                    );
                    setGeneratedQuiz(quiz);
                  }
                }}
              >
                <Pencil className="size-4 mr-1.5" /> Regenerate Questions
              </Button>

              <Button
                type="button"
                disabled={!generatedQuiz || sensitiveWarning?.isSensitive}
                onClick={handleStartQuiz}
                className="bg-secondary text-secondary-foreground hover:bg-secondary/90 flex-1 min-w-[200px]"
                size="lg"
              >
                <PlayCircle className="size-5 mr-2" />
                Start Interactive Quiz ({difficulty} Mode)
              </Button>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
