import React from "react";
import { AdminLayout } from "@/components/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { TrendingUp, Award, CheckCircle2, BarChart2 } from "lucide-react";

export function AdminTrainingEffectivenessPage() {
  return (
    <AdminLayout
      title="Training Effectiveness Analytics"
      subtitle="Evaluate ROI and skill improvements post iGOT & NSSTA training interventions"
    >
      <div className="space-y-6">
        <div className="rounded-xl border border-primary/20 bg-primary/5 p-6 space-y-2">
          <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
            <TrendingUp className="size-5 text-primary" /> Training Impact & Skill Acquisition Overview
          </h2>
          <p className="text-xs text-muted-foreground leading-relaxed">
            This module measures pre- and post-training competency score differentials across all completed iGOT Karmayogi and NSSTA TPAC courses. Detailed course evaluation metrics, retention tracking, and training feedback analytics will be aggregated here.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <Card className="shadow-card border-border">
            <CardContent className="p-5 flex items-center gap-4">
              <div className="flex size-12 items-center justify-center rounded-xl bg-success/15 text-success">
                <TrendingUp className="size-6" />
              </div>
              <div>
                <p className="text-2xl font-extrabold text-foreground font-mono">+24.5%</p>
                <p className="text-xs text-muted-foreground font-medium">Average Competency Growth</p>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-card border-border">
            <CardContent className="p-5 flex items-center gap-4">
              <div className="flex size-12 items-center justify-center rounded-xl bg-secondary/15 text-secondary">
                <Award className="size-6" />
              </div>
              <div>
                <p className="text-2xl font-extrabold text-foreground font-mono">1,420</p>
                <p className="text-xs text-muted-foreground font-medium">Officers Upskilled</p>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-card border-border">
            <CardContent className="p-5 flex items-center gap-4">
              <div className="flex size-12 items-center justify-center rounded-xl bg-primary/15 text-primary">
                <CheckCircle2 className="size-6" />
              </div>
              <div>
                <p className="text-2xl font-extrabold text-foreground font-mono">94.2%</p>
                <p className="text-xs text-muted-foreground font-medium">Course Completion Rate</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="shadow-card border-border">
          <CardHeader>
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <BarChart2 className="size-5 text-secondary" /> Training Effectiveness Dashboard Placeholder
            </CardTitle>
            <CardDescription className="text-xs">
              Detailed breakdown of course ratings, pre/post evaluation scores, and departmental ROI benchmarks.
            </CardDescription>
          </CardHeader>
          <CardContent className="py-12 text-center text-xs text-muted-foreground space-y-2">
            <p className="font-semibold text-foreground">Interactive effectiveness chart modules are being loaded...</p>
            <p>Monitors long-term impact on survey quality and data processing precision across MoSPI divisions.</p>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
