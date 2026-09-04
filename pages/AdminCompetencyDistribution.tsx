import React, { useState } from "react";
import { AdminLayout } from "@/components/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PieChart, Grid3x3, BarChart as BarChartIcon, Filter, Download } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from "recharts";

const departmentData = [
  { department: "National Accounts (NAD)", statistical: 4.2, technical: 3.8, digital: 4.0, behavioural: 4.1 },
  { department: "Survey Design (NSO)", statistical: 4.5, technical: 3.5, digital: 3.6, behavioural: 3.9 },
  { department: "Industrial Statistics (CSO)", statistical: 3.9, technical: 3.4, digital: 3.8, behavioural: 3.7 },
  { department: "Price Statistics & CPI", statistical: 4.1, technical: 3.9, digital: 4.2, behavioural: 4.0 },
  { department: "State Directorates (DES)", statistical: 3.2, technical: 2.9, digital: 3.1, behavioural: 3.5 },
];

const roleData = [
  { role: "Director General", statistical: 4.8, technical: 4.2, digital: 4.5, behavioural: 4.9 },
  { role: "Additional Director", statistical: 4.6, technical: 4.0, digital: 4.3, behavioural: 4.7 },
  { role: "Senior Statistical Officer", statistical: 4.2, technical: 3.6, digital: 3.8, behavioural: 4.1 },
  { role: "Junior Statistical Officer", statistical: 3.5, technical: 3.2, digital: 3.4, behavioural: 3.6 },
];

export function AdminCompetencyDistributionPage() {
  const [segmentBy, setSegmentBy] = useState<"department" | "role">("department");
  const [selectedDomain, setSelectedDomain] = useState("all");

  const currentData = segmentBy === "department" ? departmentData : roleData;

  const handleExportCSV = () => {
    const headers = ["Segment", "Statistical", "Technical", "Digital Governance", "Behavioural"];
    const rows = currentData.map((d: any) => [
      `"${d.department || d.role}"`,
      d.statistical,
      d.technical,
      d.digital,
      d.behavioural,
    ]);
    const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `StatSkill_Competency_Distribution_${segmentBy}_${Date.now()}.csv`;
    link.click();
  };

  return (
    <AdminLayout
      title="Org-Wide Competency Distribution"
      subtitle="Heatmap and comparative segment benchmarks across MoSPI departments & cadres"
    >
      <div className="space-y-6">
        {/* Controls Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 bg-card p-4 rounded-xl border border-border shadow-card">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-muted-foreground flex items-center gap-1">
                <Filter className="size-3.5" /> Segment By:
              </span>
              <div className="flex rounded-md border border-border bg-muted p-0.5 text-xs font-semibold">
                <button
                  onClick={() => setSegmentBy("department")}
                  className={`px-3 py-1 rounded-sm transition-colors ${
                    segmentBy === "department" ? "bg-primary text-primary-foreground" : "text-muted-foreground"
                  }`}
                >
                  Department / Division
                </button>
                <button
                  onClick={() => setSegmentBy("role")}
                  className={`px-3 py-1 rounded-sm transition-colors ${
                    segmentBy === "role" ? "bg-primary text-primary-foreground" : "text-muted-foreground"
                  }`}
                >
                  Cadre / Role
                </button>
              </div>
            </div>

            <Select value={selectedDomain} onValueChange={setSelectedDomain}>
              <SelectTrigger className="w-52 bg-background text-xs">
                <SelectValue placeholder="Competency Domain" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All 4 Domains</SelectItem>
                <SelectItem value="statistical">Statistical Competencies</SelectItem>
                <SelectItem value="technical">Technical Competencies</SelectItem>
                <SelectItem value="digital">Digital Governance</SelectItem>
                <SelectItem value="behavioural">Behavioural & Managerial</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button variant="outline" size="sm" onClick={handleExportCSV} className="text-xs font-semibold">
            <Download className="size-4 mr-1.5" /> Export Data (CSV)
          </Button>
        </div>

        {/* Recharts Bar Chart */}
        <Card className="shadow-card border-border">
          <CardHeader>
            <CardTitle className="text-base font-bold text-foreground">
              Average Competency Scores (Scale 1.0 - 5.0) Segmented by {segmentBy === "department" ? "Department" : "Role"}
            </CardTitle>
            <CardDescription className="text-xs">
              Higher score indicates greater organizational mastery in domain skills.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[360px] w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={currentData} margin={{ top: 10, right: 30, left: 0, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                  <XAxis
                    dataKey={segmentBy === "department" ? "department" : "role"}
                    tick={{ fontSize: 11 }}
                    interval={0}
                  />
                  <YAxis domain={[0, 5]} tick={{ fontSize: 11 }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: "#1e293b", borderRadius: "8px", color: "#fff", fontSize: "12px" }}
                  />
                  <Legend wrapperStyle={{ fontSize: "11px", paddingTop: "10px" }} />
                  {(selectedDomain === "all" || selectedDomain === "statistical") && (
                    <Bar dataKey="statistical" name="Statistical" fill="#1A3A5C" radius={[4, 4, 0, 0]} />
                  )}
                  {(selectedDomain === "all" || selectedDomain === "technical") && (
                    <Bar dataKey="technical" name="Technical" fill="#2E86AB" radius={[4, 4, 0, 0]} />
                  )}
                  {(selectedDomain === "all" || selectedDomain === "digital") && (
                    <Bar dataKey="digital" name="Digital Governance" fill="#27AE60" radius={[4, 4, 0, 0]} />
                  )}
                  {(selectedDomain === "all" || selectedDomain === "behavioural") && (
                    <Bar dataKey="behavioural" name="Behavioural" fill="#F39C12" radius={[4, 4, 0, 0]} />
                  )}
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Heatmap Grid Cards */}
        <Card className="shadow-card border-border">
          <CardHeader>
            <CardTitle className="text-base font-bold text-foreground">Distribution Heatmap Matrix</CardTitle>
            <CardDescription className="text-xs">
              Color intensity indicates overall proficiency level (Green = Level 4+, Yellow = Level 3-4, Red = &lt;3.0).
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
              {currentData.map((d: any) => {
                const title = d.department || d.role;
                const avg = (
                  (d.statistical + d.technical + d.digital + d.behavioural) /
                  4
                ).toFixed(1);

                return (
                  <div
                    key={title}
                    className="rounded-xl border border-border bg-card p-4 space-y-3 shadow-xs hover:border-primary/40 transition-colors"
                  >
                    <div className="border-b border-border pb-2">
                      <p className="text-xs font-bold text-foreground line-clamp-1">{title}</p>
                      <p className="text-[10px] text-muted-foreground mt-0.5 font-mono">
                        Avg Score: <strong className="text-primary">{avg} / 5.0</strong>
                      </p>
                    </div>

                    <div className="space-y-1.5 text-[11px] font-mono">
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Statistical:</span>
                        <span className={`font-bold ${d.statistical >= 4.0 ? "text-success" : "text-warning"}`}>
                          {d.statistical}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Technical:</span>
                        <span className={`font-bold ${d.technical >= 3.5 ? "text-secondary" : "text-destructive"}`}>
                          {d.technical}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Digital:</span>
                        <span className="font-bold text-foreground">{d.digital}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Behavioural:</span>
                        <span className="font-bold text-foreground">{d.behavioural}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
