import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { CheckCircle2, Clock, PlayCircle, ShieldAlert } from "lucide-react";
import { AppLayout } from "@/components/AppLayout";
import { TaskAuthModal } from "@/components/TaskAuthModal";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/context/AuthContext";

const pending = [
  { title: "Technical Competency Diagnostic", questions: 15, minutes: 20 },
  { title: "Sampling Techniques — Module Quiz", questions: 10, minutes: 15 },
  { title: "National Accounts & SNA 2008 Diagnostic", questions: 20, minutes: 25 },
];

const completed = [
  { title: "Statistical Foundations Diagnostic", score: "78%", date: "12 Aug 2026" },
  { title: "Cyber Hygiene Mandatory Module", score: "92%", date: "28 Jul 2026" },
];

export function AssessmentsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [selectedQuizTitle, setSelectedQuizTitle] = useState("");

  const handleStartQuiz = (title: string) => {
    if (!user) {
      setSelectedQuizTitle(title);
      setAuthModalOpen(true);
    } else {
      navigate("/quiz");
    }
  };

  return (
    <AppLayout title="Assessments" subtitle="Diagnostics, module quizzes and official certifications">
      <div className="space-y-5">
        {!user && (
          <div className="rounded-lg border border-primary/20 bg-primary/5 p-3.5 text-xs text-foreground flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <ShieldAlert className="size-4 text-primary shrink-0" />
              <span>Browsing available diagnostic assessments as Guest. Sign In required to attempt tests and issue certificates.</span>
            </div>
            <Button size="sm" onClick={() => setAuthModalOpen(true)} className="bg-primary text-primary-foreground text-xs font-semibold h-8">
              Sign In / Sign Up
            </Button>
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-2">
          <Card className="shadow-card border-border">
            <CardHeader>
              <CardTitle className="text-base font-bold text-foreground">Available Diagnostics & Tests</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {pending.map((a) => (
                <div
                  key={a.title}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border p-4 hover:border-primary/30 transition-colors"
                >
                  <div>
                    <p className="text-sm font-semibold text-foreground">{a.title}</p>
                    <p className="mt-1 inline-flex items-center gap-2 text-xs text-muted-foreground">
                      {a.questions} questions
                      <span className="inline-flex items-center gap-1">
                        <Clock className="size-3" /> {a.minutes} min
                      </span>
                    </p>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => handleStartQuiz(a.title)}
                    className="bg-secondary text-secondary-foreground hover:bg-secondary/90 text-xs font-semibold"
                  >
                    <PlayCircle className="size-4 mr-1" /> Take Test
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="shadow-card border-border">
            <CardHeader>
              <CardTitle className="text-base font-bold text-foreground">Completed Officer Records</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {completed.map((a) => (
                <div
                  key={a.title}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border p-4"
                >
                  <div>
                    <p className="text-sm font-semibold text-foreground">{a.title}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{a.date}</p>
                  </div>
                  <span className="inline-flex items-center gap-1.5 text-xs font-bold text-success bg-success/10 px-2.5 py-1 rounded-full border border-success/20">
                    <CheckCircle2 className="size-3.5" /> Score: {a.score}
                  </span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>

      <TaskAuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        taskTitle="Sign In Required to Attempt Tests"
        taskDescription={`Please Sign In or Create an Account to start "${selectedQuizTitle || "Diagnostic Assessment"}" and record official test scores.`}
      />
    </AppLayout>
  );
}
