import React, { useState } from "react";
import { LearnerLayout } from "@/components/LearnerLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, Clock, CheckCircle2, Award, PlayCircle, ExternalLink, RefreshCw } from "lucide-react";
import { toast } from "sonner";

interface CourseItem {
  id: string;
  title: string;
  provider: string;
  category: string;
  hoursLogged: number;
  totalHours: number;
  status: "enrolled" | "in-progress" | "completed";
  completedDate?: string;
  certificateId?: string;
}

const initialCourses: CourseItem[] = [
  {
    id: "c-1",
    title: "National Accounts Statistics (SNA 2008 & GDP Estimation)",
    provider: "NSSTA",
    category: "Statistical",
    hoursLogged: 15,
    totalHours: 15,
    status: "completed",
    completedDate: "14 Aug 2026",
    certificateId: "CERT-MoSPI-2026-8891",
  },
  {
    id: "c-2",
    title: "Python Data Science for Official Survey Analytics",
    provider: "iGOT Karmayogi",
    category: "Technical",
    hoursLogged: 8,
    totalHours: 12,
    status: "in-progress",
  },
  {
    id: "c-3",
    title: "Sample Survey Design & Variance Estimation",
    provider: "NSSTA TPAC",
    category: "Statistical",
    hoursLogged: 14,
    totalHours: 18,
    status: "in-progress",
  },
  {
    id: "c-4",
    title: "Cybersecurity & Digital Personal Data Protection",
    provider: "iGOT Karmayogi",
    category: "Digital Governance",
    hoursLogged: 4,
    totalHours: 4,
    status: "completed",
    completedDate: "22 Jul 2026",
    certificateId: "CERT-iGOT-2026-4402",
  },
];

export function MyCoursesPage() {
  const [courses, setCourses] = useState<CourseItem[]>(initialCourses);
  const [filter, setFilter] = useState<"all" | "in-progress" | "completed">("all");
  const [syncing, setSyncing] = useState(false);

  const filtered = courses.filter((c) => filter === "all" || c.status === filter);

  const totalHoursLogged = courses.reduce((acc, c) => acc + c.hoursLogged, 0);
  const completedCount = courses.filter((c) => c.status === "completed").length;

  const handleSync = () => {
    setSyncing(true);
    setTimeout(() => {
      setSyncing(false);
      toast.success("iGOT Karmayogi enrollment sync complete! All hours logged up to date.");
    }, 1200);
  };

  const handleSimulateProgress = (id: string) => {
    setCourses((prev) =>
      prev.map((c) => {
        if (c.id === id) {
          const newHours = Math.min(c.totalHours, c.hoursLogged + 2);
          const isDone = newHours >= c.totalHours;
          const updated: CourseItem = {
            ...c,
            hoursLogged: newHours,
            status: isDone ? "completed" : "in-progress",
          };
          if (isDone) {
            updated.completedDate = new Date().toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
            updated.certificateId = `CERT-iGOT-2026-${Math.floor(1000 + Math.random() * 9000)}`;
          }
          return updated;
        }
        return c;
      })
    );
    toast.success("Learning progress logged successfully!");
  };

  return (
    <LearnerLayout
      title="My Enrolled Courses"
      subtitle="iGOT Karmayogi & NSSTA TPAC Learning Sync"
    >
      <div className="space-y-6">
        {/* Metric Summary Cards */}
        <div className="grid gap-4 sm:grid-cols-3">
          <Card className="shadow-card border-border">
            <CardContent className="p-5 flex items-center gap-4">
              <div className="flex size-12 items-center justify-center rounded-xl bg-primary/15 text-primary">
                <Clock className="size-6" />
              </div>
              <div>
                <p className="text-2xl font-extrabold text-foreground font-mono">{totalHoursLogged} Hrs</p>
                <p className="text-xs text-muted-foreground">Total Learning Hours Logged</p>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-card border-border">
            <CardContent className="p-5 flex items-center gap-4">
              <div className="flex size-12 items-center justify-center rounded-xl bg-success/15 text-success">
                <Award className="size-6" />
              </div>
              <div>
                <p className="text-2xl font-extrabold text-foreground font-mono">{completedCount} Badges</p>
                <p className="text-xs text-muted-foreground font-medium">Completed Certificates</p>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-card border-border">
            <CardContent className="p-5 flex items-center gap-4">
              <div className="flex size-12 items-center justify-center rounded-xl bg-secondary/15 text-secondary">
                <BookOpen className="size-6" />
              </div>
              <div>
                <p className="text-2xl font-extrabold text-foreground font-mono">{courses.length} Enrolled</p>
                <p className="text-xs text-muted-foreground">Active & Completed Programs</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Sync Button */}
        <div className="flex flex-wrap items-center justify-between gap-3 bg-card p-4 rounded-xl border border-border shadow-card">
          <div className="flex gap-2">
            {(["all", "in-progress", "completed"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setFilter(tab)}
                className={`px-3.5 py-1.5 rounded-md text-xs font-semibold capitalize transition-colors ${
                  filter === tab
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:text-foreground"
                }`}
              >
                {tab === "all" ? "All Courses" : tab.replace("-", " ")}
              </button>
            ))}
          </div>

          <Button variant="outline" size="sm" onClick={handleSync} disabled={syncing} className="text-xs font-semibold">
            <RefreshCw className={`size-3.5 mr-1.5 ${syncing ? "animate-spin" : ""}`} /> Sync iGOT Karmayogi
          </Button>
        </div>

        {/* Course Cards Grid */}
        <div className="grid gap-4 md:grid-cols-2">
          {filtered.map((course) => {
            const percent = Math.round((course.hoursLogged / course.totalHours) * 100);
            const isDone = course.status === "completed";

            return (
              <Card key={course.id} className="shadow-card border-border flex flex-col justify-between">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="rounded bg-accent/30 px-2 py-0.5 font-bold text-accent-foreground">
                      {course.provider}
                    </span>
                    <span className="text-muted-foreground font-semibold">{course.category}</span>
                  </div>
                  <CardTitle className="text-base font-bold text-foreground leading-snug">
                    {course.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex justify-between text-xs font-mono mb-1">
                      <span className="text-muted-foreground">Progress:</span>
                      <span className="font-bold text-foreground">
                        {course.hoursLogged} / {course.totalHours} hrs ({percent}%)
                      </span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                      <div
                        className={`h-full transition-all duration-300 ${
                          isDone ? "bg-success" : "bg-secondary"
                        }`}
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>

                  <div className="pt-2 border-t border-border flex items-center justify-between">
                    {isDone ? (
                      <div className="flex items-center gap-1.5 text-xs text-success font-bold">
                        <CheckCircle2 className="size-4" /> Certified ({course.completedDate})
                      </div>
                    ) : (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleSimulateProgress(course.id)}
                        className="text-xs font-semibold h-8"
                      >
                        + Log 2 Hours Study
                      </Button>
                    )}

                    <Button
                      size="sm"
                      className={
                        isDone
                          ? "bg-muted text-foreground hover:bg-accent text-xs font-semibold h-8"
                          : "bg-secondary text-secondary-foreground hover:bg-secondary/90 text-xs font-semibold h-8"
                      }
                      onClick={() =>
                        toast.info(`Opening module in ${course.provider} LMS portal...`)
                      }
                    >
                      <ExternalLink className="size-3.5 mr-1" /> {isDone ? "Review" : "Launch Course"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </LearnerLayout>
  );
}
