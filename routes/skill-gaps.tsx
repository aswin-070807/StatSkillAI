import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Download, Grid3x3, Sparkles } from "lucide-react";
import { AppLayout } from "@/components/AppLayout";
import { PriorityBadge } from "@/components/stat-widgets";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { skillGaps } from "@/lib/mock-data";

export const Route = createFileRoute("/skill-gaps")({
  head: () => ({
    meta: [
      { title: "Skill Gap Analysis — StatSkill AI" },
      {
        name: "description",
        content:
          "Compare current versus required competency levels, filter by group, department and priority, and act on AI-generated insights.",
      },
      { property: "og:title", content: "Skill Gap Analysis — StatSkill AI" },
      {
        property: "og:description",
        content: "Current vs required levels with prioritised gaps and AI recommendations.",
      },
    ],
  }),
  component: SkillGapsPage,
});

function SkillGapsPage() {
  const [group, setGroup] = useState("all");
  const [dept, setDept] = useState("all");
  const [priority, setPriority] = useState("all");

  const rows = skillGaps.filter(
    (r) =>
      (group === "all" || r.group === group) &&
      (dept === "all" || r.department === dept) &&
      (priority === "all" || r.priority === priority),
  );

  return (
    <AppLayout title="Skill Gap Analysis" subtitle="Role-benchmarked competency gaps">
      <div className="space-y-5">
        <div className="flex flex-wrap gap-3">
          <Select value={group} onValueChange={setGroup}>
            <SelectTrigger className="w-52 bg-card">
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

          <Select value={dept} onValueChange={setDept}>
            <SelectTrigger className="w-52 bg-card">
              <SelectValue placeholder="Department" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Departments</SelectItem>
              <SelectItem value="NSO">NSO</SelectItem>
              <SelectItem value="CSO">CSO</SelectItem>
              <SelectItem value="State Directorates">State Directorates</SelectItem>
            </SelectContent>
          </Select>

          <Select value={priority} onValueChange={setPriority}>
            <SelectTrigger className="w-44 bg-card">
              <SelectValue placeholder="Priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Priorities</SelectItem>
              <SelectItem value="Critical">Critical</SelectItem>
              <SelectItem value="High">High</SelectItem>
              <SelectItem value="Medium">Medium</SelectItem>
              <SelectItem value="Low">Low</SelectItem>
            </SelectContent>
          </Select>

          <div className="ml-auto flex gap-2">
            <Button variant="outline">
              <Download className="size-4" /> Export as PDF
            </Button>
            <Button variant="outline">
              <Grid3x3 className="size-4" /> View Heatmap
            </Button>
          </div>
        </div>

        <Card className="overflow-hidden py-0 shadow-card">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[820px] text-sm">
                <thead className="bg-muted/60 text-left text-xs uppercase tracking-wide text-muted-foreground">
                  <tr>
                    <th className="px-5 py-3 font-medium">Competency</th>
                    <th className="px-5 py-3 font-medium">Current Level</th>
                    <th className="px-5 py-3 font-medium">Required Level</th>
                    <th className="px-5 py-3 font-medium">Gap</th>
                    <th className="px-5 py-3 font-medium">Priority</th>
                    <th className="px-5 py-3 font-medium">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r) => (
                    <tr key={r.competency} className="border-t border-border">
                      <td className="px-5 py-4 font-medium text-foreground">{r.competency}</td>
                      <td className="px-5 py-4 text-muted-foreground">{r.current}/5</td>
                      <td className="px-5 py-4 text-muted-foreground">{r.required}/5</td>
                      <td className="px-5 py-4 font-semibold text-foreground">{r.gap}</td>
                      <td className="px-5 py-4">
                        <PriorityBadge priority={r.priority} />
                      </td>
                      <td className="px-5 py-4">
                        <Button variant="outline" size="sm">
                          Learn More
                        </Button>
                      </td>
                    </tr>
                  ))}
                  {rows.length === 0 && (
                    <tr className="border-t border-border">
                      <td colSpan={6} className="px-5 py-10 text-center text-muted-foreground">
                        No gaps match the selected filters.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        <Card className="border-secondary/30 bg-secondary/5 shadow-card">
          <CardContent className="flex gap-3 py-5">
            <Sparkles className="mt-0.5 size-5 shrink-0 text-secondary" />
            <div>
              <p className="text-sm font-semibold text-primary">AI Insight</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Your Python gap is critical for your role. We recommend "Python for Statistical
                Analysis" as a starter.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
