import React from "react";
import { AdminLayout } from "@/components/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Download, Filter, Building2 } from "lucide-react";

export function AdminReportsPage() {
  return (
    <AdminLayout
      title="Executive Workforce Reports"
      subtitle="Export official competency audits, departmental skill gap summaries & training logs"
    >
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4 bg-card p-5 rounded-xl border border-border shadow-card">
          <div>
            <h2 className="text-base font-bold text-foreground flex items-center gap-2">
              <FileText className="size-5 text-secondary" /> Ministry Audit & Progress Reports
            </h2>
            <p className="text-xs text-muted-foreground">
              Generate PDF/CSV audit reports for MoSPI HQ, National Statistical Commission, and iGOT Karmayogi administration.
            </p>
          </div>
          <Button className="bg-primary text-primary-foreground font-semibold text-xs gap-1.5">
            <Download className="size-4" /> Download Executive Summary (PDF)
          </Button>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <Card className="shadow-card border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold text-foreground flex items-center gap-2">
                <Building2 className="size-4 text-primary" /> Departmental Audits
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-xs">
              <p className="text-muted-foreground">Competency distribution across NAD, NSO, CSO, and Price Statistics divisions.</p>
              <Button variant="outline" size="sm" className="w-full text-xs font-semibold">
                Generate Audit
              </Button>
            </CardContent>
          </Card>

          <Card className="shadow-card border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold text-foreground flex items-center gap-2">
                <Filter className="size-4 text-secondary" /> Skill-Gap Inventory
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-xs">
              <p className="text-muted-foreground">Detailed gap analysis reports highlighting high-priority training demands across cadres.</p>
              <Button variant="outline" size="sm" className="w-full text-xs font-semibold">
                Export Gap Matrix
              </Button>
            </CardContent>
          </Card>

          <Card className="shadow-card border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold text-foreground flex items-center gap-2">
                <FileText className="size-4 text-success" /> iGOT Training Sync Logs
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-xs">
              <p className="text-muted-foreground">Official record of completed certifications, learning hours, and badges awarded.</p>
              <Button variant="outline" size="sm" className="w-full text-xs font-semibold">
                Export Sync Logs
              </Button>
            </CardContent>
          </Card>
        </div>

        <Card className="shadow-card border-border">
          <CardHeader>
            <CardTitle className="text-base font-bold">Reports Generator Placeholder</CardTitle>
            <CardDescription className="text-xs">
              Custom report builder with date range filters, cadre selections, and multi-format exports.
            </CardDescription>
          </CardHeader>
          <CardContent className="py-12 text-center text-xs text-muted-foreground space-y-2">
            <p className="font-semibold text-foreground">Custom report builder and official archive console.</p>
            <p>Provides standardized reporting templates matching Ministry of Statistics guidelines.</p>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
