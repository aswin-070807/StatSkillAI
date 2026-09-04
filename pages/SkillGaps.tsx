import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Download, Grid3x3, Table, Sparkles, BookOpen, ExternalLink, RefreshCw, ShieldAlert } from "lucide-react";
import { AppLayout } from "@/components/AppLayout";
import { PriorityBadge } from "@/components/stat-widgets";
import { TaskAuthModal } from "@/components/TaskAuthModal";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { apiClient } from "@/lib/apiClient";
import { useAuth } from "@/context/AuthContext";
import { skillGaps as mockSkillGaps, type Priority } from "@/lib/mock-data";

import { computeOfficerSkillGaps } from "@/lib/scoringEngine";

export interface SkillGapRecord {
  competency_id?: string;
  competency: string;
  group: string;
  description?: string;
  current: number;
  required: number;
  gap: number;
  priority: Priority | string;
  department: string;
  ai_insight?: string;
}

export function SkillGapsPage() {
  const { user } = useAuth();
  const [group, setGroup] = useState("all");
  const [dept, setDept] = useState("all");
  const [priority, setPriority] = useState("all");
  const [viewMode, setViewMode] = useState<"table" | "heatmap">("table");
  const [authModalOpen, setAuthModalOpen] = useState(false);

  const [gapsData, setGapsData] = useState<SkillGapRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch real gap data from backend GET /skill-gaps/me or calculate via officer scoring engine
  const fetchGaps = async () => {
    setIsLoading(true);
    try {
      if (user) {
        const queryParams = new URLSearchParams();
        if (group !== "all") queryParams.append("group", group);
        if (priority !== "all") queryParams.append("priority", priority);
        if (dept !== "all") queryParams.append("department", dept);

        const endpoint = `/skill-gaps/me${queryParams.toString() ? `?${queryParams.toString()}` : ""}`;
        const data = await apiClient.get<SkillGapRecord[]>(endpoint);

        if (Array.isArray(data) && data.length > 0) {
          setGapsData(data);
          setIsLoading(false);
          return;
        }
      }
      useFallbackData();
    } catch {
      useFallbackData();
    } finally {
      setIsLoading(false);
    }
  };

  const useFallbackData = () => {
    const computed = computeOfficerSkillGaps(user);
    const filtered = computed
      .filter(
        (r) =>
          (group === "all" || r.group.toLowerCase() === group.toLowerCase()) &&
          (dept === "all" || r.department.toLowerCase().includes(dept.toLowerCase())) &&
          (priority === "all" || r.priority.toLowerCase() === priority.toLowerCase())
      )
      .map((r) => ({
        competency: r.competency,
        group: r.group,
        description: r.description,
        current: r.current,
        required: r.required,
        gap: r.gap,
        priority: r.priority,
        department: r.department,
        ai_insight: r.ai_insight || (r.gap >= 1.0 ? `Your ${r.competency} gap of ${r.gap} is priority for your role. Recommended course training available on iGOT Karmayogi.` : undefined),
      }));
    setGapsData(filtered);
  };

  useEffect(() => {
    fetchGaps();
  }, [group, dept, priority, user]);

  // Export gaps data as downloadable CSV file
  const handleExportCSV = () => {
    if (!user) {
      setAuthModalOpen(true);
      return;
    }
    if (gapsData.length === 0) return;

    const headers = ["Competency", "Group", "Current Level", "Required Level", "Gap", "Priority", "Department", "AI Insight"];
    const csvRows = [
      headers.join(","),
      ...gapsData.map((g) =>
        [
          `"${g.competency}"`,
          `"${g.group}"`,
          g.current,
          g.required,
          g.gap,
          `"${g.priority}"`,
          `"${g.department}"`,
          `"${(g.ai_insight || "").replace(/"/g, '""')}"`,
        ].join(",")
      ),
    ];

    const csvContent = "data:text/csv;charset=utf-8," + csvRows.join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `StatSkill_Skill_Gap_Analysis_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Top AI insights extracted from response
  const topInsights = gapsData.filter((g) => g.ai_insight && g.ai_insight.trim().length > 0);

  return (
    <AppLayout title="Skill Gap Analysis" subtitle="Role-benchmarked competency gaps & AI Insights">
      <div className="space-y-6">
        {!user && (
          <div className="rounded-lg border border-primary/20 bg-primary/5 p-3.5 text-xs text-foreground flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <ShieldAlert className="size-4 text-primary shrink-0" />
              <span>Viewing MoSPI National Skill Gap Analytics as Guest. Sign In required to export personal officer diagnostics.</span>
            </div>
            <Button size="sm" onClick={() => setAuthModalOpen(true)} className="bg-primary text-primary-foreground text-xs font-semibold h-8">
              Sign In / Sign Up
            </Button>
          </div>
        )}

        {/* Filters and Action Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 bg-card p-4 rounded-xl border border-border shadow-card">
          <div className="flex flex-wrap items-center gap-3 flex-1">
            {/* Competency Group Filter */}
            <Select value={group} onValueChange={setGroup}>
              <SelectTrigger className="w-52 bg-background text-xs">
                <SelectValue placeholder="Competency Group" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Competency Groups</SelectItem>
                <SelectItem value="statistical">Statistical</SelectItem>
                <SelectItem value="technical">Technical</SelectItem>
                <SelectItem value="digital">Digital Governance</SelectItem>
                <SelectItem value="behavioural">Behavioural</SelectItem>
              </SelectContent>
            </Select>

            {/* Department Filter */}
            <Select value={dept} onValueChange={setDept}>
              <SelectTrigger className="w-52 bg-background text-xs">
                <SelectValue placeholder="Department" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Departments</SelectItem>
                <SelectItem value="National Accounts Division">National Accounts Division</SelectItem>
                <SelectItem value="NSO">NSO</SelectItem>
                <SelectItem value="CSO">CSO</SelectItem>
                <SelectItem value="State Directorates">State Directorates</SelectItem>
              </SelectContent>
            </Select>

            {/* Priority Filter */}
            <Select value={priority} onValueChange={setPriority}>
              <SelectTrigger className="w-44 bg-background text-xs">
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priorities</SelectItem>
                <SelectItem value="High">High (Gap ≥ 2.0)</SelectItem>
                <SelectItem value="Medium">Medium (1.0 ≤ Gap &lt; 2.0)</SelectItem>
                <SelectItem value="Low">Low (Gap &lt; 1.0)</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="ghost" size="sm" onClick={fetchGaps} title="Refresh Data">
              <RefreshCw className={`size-4 ${isLoading ? "animate-spin" : ""}`} />
            </Button>
          </div>

          <div className="flex items-center gap-2">
            {/* Export CSV Button */}
            <Button variant="outline" onClick={handleExportCSV} className="text-xs font-semibold">
              <Download className="size-4 mr-1.5" /> Export Report (CSV)
            </Button>

            {/* Heatmap / Table View Toggle */}
            <Button
              variant={viewMode === "heatmap" ? "secondary" : "outline"}
              onClick={() => setViewMode((v) => (v === "table" ? "heatmap" : "table"))}
              className="text-xs font-semibold"
            >
              {viewMode === "table" ? (
                <>
                  <Grid3x3 className="size-4 mr-1.5" /> Heatmap View
                </>
              ) : (
                <>
                  <Table className="size-4 mr-1.5" /> Table View
                </>
              )}
            </Button>
          </div>
        </div>

        {/* AI Insight Panel */}
        {topInsights.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
              <Sparkles className="size-4 text-secondary" /> AI Priority Recommendations
            </h3>
            <div className="grid gap-3 sm:grid-cols-2">
              {topInsights.slice(0, 3).map((g) => (
                <Card key={g.competency} className="border-secondary/30 bg-secondary/5 shadow-sm">
                  <CardContent className="flex gap-3 py-4">
                    <Sparkles className="mt-0.5 size-5 shrink-0 text-secondary" />
                    <div>
                      <p className="text-xs font-bold text-primary uppercase tracking-wide">
                        {g.competency} • Gap: {g.gap}
                      </p>
                      <p className="mt-1 text-xs text-foreground leading-relaxed">
                        {g.ai_insight}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* View Mode 1: Table View */}
        {viewMode === "table" && (
          <Card className="overflow-hidden py-0 shadow-card border-border">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[820px] text-sm">
                  <thead className="bg-muted/60 text-left text-xs uppercase tracking-wide text-muted-foreground">
                    <tr>
                      <th className="px-5 py-3.5 font-semibold">Competency</th>
                      <th className="px-5 py-3.5 font-semibold">Group</th>
                      <th className="px-5 py-3.5 font-semibold">Current Level</th>
                      <th className="px-5 py-3.5 font-semibold">Required Level</th>
                      <th className="px-5 py-3.5 font-semibold">Gap</th>
                      <th className="px-5 py-3.5 font-semibold">Priority</th>
                      <th className="px-5 py-3.5 font-semibold">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {gapsData.map((r) => (
                      <tr key={r.competency} className="border-t border-border hover:bg-muted/20 transition-colors">
                        <td className="px-5 py-4 font-semibold text-foreground">
                          {r.competency}
                          {r.description && (
                            <p className="text-xs text-muted-foreground font-normal line-clamp-1 mt-0.5">
                              {r.description}
                            </p>
                          )}
                        </td>
                        <td className="px-5 py-4 text-xs font-semibold uppercase text-muted-foreground">
                          {r.group}
                        </td>
                        <td className="px-5 py-4 text-muted-foreground font-mono">{r.current} / 5.0</td>
                        <td className="px-5 py-4 text-muted-foreground font-mono">{r.required} / 5.0</td>
                        <td className="px-5 py-4 font-bold text-foreground font-mono">
                          {r.gap > 0 ? `+${r.gap}` : `${r.gap}`}
                        </td>
                        <td className="px-5 py-4">
                          <PriorityBadge priority={r.priority as Priority} />
                        </td>
                        <td className="px-5 py-4">
                          <Link to={`/skill-intelligence?search=${encodeURIComponent(r.competency)}`}>
                            <Button variant="outline" size="sm" className="h-8 text-xs font-semibold">
                              <BookOpen className="size-3.5 mr-1" /> Training
                            </Button>
                          </Link>
                        </td>
                      </tr>
                    ))}
                    {gapsData.length === 0 && (
                      <tr className="border-t border-border">
                        <td colSpan={7} className="px-5 py-12 text-center text-muted-foreground text-xs">
                          No competency gaps match the selected filters.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}

        {/* View Mode 2: Heatmap Visual Grid */}
        {viewMode === "heatmap" && (
          <div className="space-y-4">
            <Card className="border-border shadow-card p-6">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-foreground">Competency Gap Intensity Heatmap</h3>
                  <p className="text-xs text-muted-foreground">Visual comparison of current vs required competency levels</p>
                </div>
                <div className="flex items-center gap-4 text-xs font-medium">
                  <span className="flex items-center gap-1.5">
                    <span className="size-3 rounded bg-destructive inline-block" /> High Gap (≥2.0)
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="size-3 rounded bg-warning inline-block" /> Medium Gap (1.0-1.9)
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="size-3 rounded bg-success inline-block" /> Target Met (&lt;1.0)
                  </span>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                {gapsData.map((g) => {
                  let bgClass = "border-success/40 bg-success/10 text-success-foreground";
                  if (g.gap >= 2.0) {
                    bgClass = "border-destructive/40 bg-destructive/10 text-destructive-foreground";
                  } else if (g.gap >= 1.0) {
                    bgClass = "border-warning/40 bg-warning/10 text-warning-foreground";
                  }

                  return (
                    <div
                      key={g.competency}
                      className={`rounded-xl border p-4 transition-all hover:shadow-md ${bgClass}`}
                    >
                      <div className="flex items-start justify-between">
                        <span className="text-xs font-bold uppercase tracking-wider opacity-80">{g.group}</span>
                        <PriorityBadge priority={g.priority as Priority} />
                      </div>
                      <h4 className="mt-2 text-sm font-bold text-foreground">{g.competency}</h4>

                      {/* Visual Level Bars */}
                      <div className="mt-3 space-y-2 text-xs">
                        <div>
                          <div className="flex justify-between font-mono text-[11px] mb-1">
                            <span>Current Level:</span>
                            <span className="font-bold">{g.current} / 5</span>
                          </div>
                          <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                            <div
                              className="h-full bg-primary transition-all duration-300"
                              style={{ width: `${(g.current / 5) * 100}%` }}
                            />
                          </div>
                        </div>

                        <div>
                          <div className="flex justify-between font-mono text-[11px] mb-1">
                            <span>Required Benchmark:</span>
                            <span className="font-bold">{g.required} / 5</span>
                          </div>
                          <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                            <div
                              className="h-full bg-secondary transition-all duration-300"
                              style={{ width: `${(g.required / 5) * 100}%` }}
                            />
                          </div>
                        </div>
                      </div>

                      <div className="mt-4 pt-3 border-t border-border/50 flex items-center justify-between text-xs">
                        <span className="font-bold">Gap: +{g.gap}</span>
                        <Link to={`/skill-intelligence?search=${encodeURIComponent(g.competency)}`} className="text-secondary hover:underline flex items-center gap-1 font-medium">
                          Train <ExternalLink className="size-3" />
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          </div>
        )}
      </div>

      <TaskAuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        taskTitle="Sign In Required to Export Reports"
        taskDescription="Please Sign In or Register to export officer skill gap CSV reports and sync personalized analytics."
      />
    </AppLayout>
  );
}
