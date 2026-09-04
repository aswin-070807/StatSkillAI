import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Download, Search, TrendingDown, TrendingUp, Minus } from "lucide-react";
import { AppLayout } from "@/components/AppLayout";
import { LevelDots } from "@/components/stat-widgets";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { competencyDetails, competencyGroups, type GroupKey } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/competency")({
  head: () => ({
    meta: [
      { title: "My Competency Profile — StatSkill AI" },
      {
        name: "description",
        content:
          "Review competency levels, supporting evidence and trends across statistical, technical, digital governance and behavioural groups.",
      },
      { property: "og:title", content: "My Competency Profile — StatSkill AI" },
      {
        property: "og:description",
        content: "Levels, evidence and trends for every competency in your profile.",
      },
    ],
  }),
  component: CompetencyPage,
});

function Trend({ value }: { value: number }) {
  if (value === 0)
    return (
      <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
        <Minus className="size-3.5" /> 0%
      </span>
    );
  const up = value > 0;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 text-xs font-medium",
        up ? "text-success" : "text-destructive",
      )}
    >
      {up ? <TrendingUp className="size-3.5" /> : <TrendingDown className="size-3.5" />}
      {up ? "+" : ""}
      {value}%
    </span>
  );
}

function CompetencyPage() {
  const [group, setGroup] = useState<GroupKey>("statistical");
  const [query, setQuery] = useState("");

  const rows = competencyDetails[group].filter((r) =>
    r.name.toLowerCase().includes(query.toLowerCase()),
  );

  return (
    <AppLayout title="My Competency" subtitle="Detailed competency profile and evidence">
      <div className="space-y-5">
        <div className="flex flex-wrap gap-2">
          {competencyGroups.map((g) => (
            <button
              key={g.key}
              onClick={() => setGroup(g.key)}
              className={cn(
                "rounded-md border px-4 py-2 text-sm transition-colors",
                group === g.key
                  ? "border-transparent bg-primary font-medium text-primary-foreground"
                  : "border-border bg-card text-foreground hover:bg-accent",
              )}
            >
              {g.label}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="relative min-w-56 flex-1">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search competencies…"
              className="bg-card pl-9"
            />
          </div>
          <Button variant="outline">
            <Download className="size-4" />
            Download Report (PDF)
          </Button>
        </div>

        <Card className="overflow-hidden py-0 shadow-card">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px] text-sm">
                <thead className="bg-muted/60 text-left text-xs uppercase tracking-wide text-muted-foreground">
                  <tr>
                    <th className="px-5 py-3 font-medium">Competency</th>
                    <th className="px-5 py-3 font-medium">Current Level</th>
                    <th className="px-5 py-3 font-medium">Evidence</th>
                    <th className="px-5 py-3 font-medium">Trend</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r) => (
                    <tr key={r.name} className="border-t border-border">
                      <td className="px-5 py-4 font-medium text-foreground">{r.name}</td>
                      <td className="px-5 py-4">
                        <LevelDots level={r.level} />
                      </td>
                      <td className="px-5 py-4 text-muted-foreground">{r.evidence}</td>
                      <td className="px-5 py-4">
                        <Trend value={r.trend} />
                      </td>
                    </tr>
                  ))}
                  {rows.length === 0 && (
                    <tr className="border-t border-border">
                      <td colSpan={4} className="px-5 py-10 text-center text-muted-foreground">
                        No competencies match your search.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
