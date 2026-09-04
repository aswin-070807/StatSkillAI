import React from "react";
import { AdminLayout } from "@/components/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileSearch, Plus, CheckCircle2, HelpCircle } from "lucide-react";

export function AdminQuizManagementPage() {
  return (
    <AdminLayout
      title="Quiz & Assessment Management"
      subtitle="Configure AI MCQ generators, edit official question banks & assign evaluations"
    >
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4 bg-card p-5 rounded-xl border border-border shadow-card">
          <div>
            <h2 className="text-base font-bold text-foreground flex items-center gap-2">
              <FileSearch className="size-5 text-secondary" /> Assessment Configuration Console
            </h2>
            <p className="text-xs text-muted-foreground">
              Manage AI-generated quizzes, document upload parsers, and official domain evaluations.
            </p>
          </div>
          <Button className="bg-primary text-primary-foreground font-semibold text-xs gap-1.5">
            <Plus className="size-4" /> Create New Assessment
          </Button>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <Card className="shadow-card border-border">
            <CardContent className="p-5 flex items-center gap-4">
              <div className="flex size-12 items-center justify-center rounded-xl bg-primary/15 text-primary">
                <HelpCircle className="size-6" />
              </div>
              <div>
                <p className="text-2xl font-extrabold text-foreground font-mono">48</p>
                <p className="text-xs text-muted-foreground font-medium">Active Quiz Banks</p>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-card border-border">
            <CardContent className="p-5 flex items-center gap-4">
              <div className="flex size-12 items-center justify-center rounded-xl bg-secondary/15 text-secondary">
                <FileSearch className="size-6" />
              </div>
              <div>
                <p className="text-2xl font-extrabold text-foreground font-mono">1,250+</p>
                <p className="text-xs text-muted-foreground font-medium">AI Generated MCQs</p>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-card border-border">
            <CardContent className="p-5 flex items-center gap-4">
              <div className="flex size-12 items-center justify-center rounded-xl bg-success/15 text-success">
                <CheckCircle2 className="size-6" />
              </div>
              <div>
                <p className="text-2xl font-extrabold text-foreground font-mono">3,890</p>
                <p className="text-xs text-muted-foreground font-medium">Completed Evaluations</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="shadow-card border-border">
          <CardHeader>
            <CardTitle className="text-base font-bold">Quiz Management Placeholder</CardTitle>
            <CardDescription className="text-xs">
              Tools to upload manual PDFs/docs, trigger LLM question generation, set passing cutoffs, and review officer answer keys.
            </CardDescription>
          </CardHeader>
          <CardContent className="py-12 text-center text-xs text-muted-foreground space-y-2">
            <p className="font-semibold text-foreground">Assessment management table and AI generator controls.</p>
            <p>Allows administrators to review and approve AI-generated test questions before publishing to learners.</p>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
