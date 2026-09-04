import React, { useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Search,
  Download,
  Shield,
  Target,
  Info,
  BookOpen,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  HelpCircle,
  FileText,
  Clock,
  Layers,
  Award,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { AppLayout } from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  NATIONAL_COMPETENCY_FRAMEWORK,
  FRAMEWORK_CONFIG,
  calculateEstHoursForCompetency,
  type CompetencyFrameworkItem,
} from "@/lib/competency-framework-data";
import localCoursesRaw from "@/data/igot_courses.json";
import { cn } from "@/lib/utils";

const domainsList = [
  { key: "statistical", label: "Statistical", color: "border-blue-500/40 bg-blue-500/10 text-blue-700 dark:text-blue-300" },
  { key: "technical", label: "Technical", color: "border-amber-500/40 bg-amber-500/10 text-amber-700 dark:text-amber-300" },
  { key: "digital", label: "Digital Governance", color: "border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300" },
  { key: "behavioural", label: "Behavioural", color: "border-purple-500/40 bg-purple-500/10 text-purple-700 dark:text-purple-300" },
] as const;

const careerStagesList = ["Entry-level", "Mid-career", "Senior/Leadership"] as const;

const jobRolesList = [
  "Statistical Officer",
  "Senior Statistical Officer",
  "Assistant Director",
  "Deputy Director",
  "Joint Director",
] as const;

export function CompetencyPage() {
  const navigate = useNavigate();

  // Navigation & View States
  const [selectedDomain, setSelectedDomain] = useState<string>("statistical");
  const [viewMode, setViewMode] = useState<"domain" | "career_stage" | "job_role">("domain");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRole, setSelectedRole] = useState<string>("Statistical Officer");
  const [expandedLevels, setExpandedLevels] = useState<Record<string, boolean>>({});

  // Toggle level definitions expansion
  const toggleExpanded = (id: string) => {
    setExpandedLevels((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // Pre-calculate estimated hours for each competency from live catalog data (Requirement 5)
  const coursesCatalog = useMemo(() => localCoursesRaw as any[], []);

  // Filter competencies based on independent search query
  const filteredFramework = useMemo(() => {
    if (!searchQuery.trim()) return NATIONAL_COMPETENCY_FRAMEWORK;
    const q = searchQuery.trim().toLowerCase();
    return NATIONAL_COMPETENCY_FRAMEWORK.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q) ||
        c.category.toLowerCase().includes(q) ||
        (c.standard_reference && c.standard_reference.toLowerCase().includes(q))
    );
  }, [searchQuery]);

  // Navigate directly to related competency (Requirement 2 & Part 3 verification)
  const handleJumpToCompetency = (targetName: string) => {
    const targetComp = NATIONAL_COMPETENCY_FRAMEWORK.find(
      (c) => c.name.toLowerCase() === targetName.toLowerCase()
    );
    if (targetComp) {
      if (viewMode === "domain") {
        setSelectedDomain(targetComp.domain);
      }
      setSearchQuery("");
      setTimeout(() => {
        const el = document.getElementById(`comp-${targetComp.id}`);
        if (el) {
          el.scrollIntoView({ behavior: "smooth", block: "center" });
          el.classList.add("ring-2", "ring-primary");
          setTimeout(() => el.classList.remove("ring-2", "ring-primary"), 2500);
        }
      }, 100);
    }
  };

  // Download Official PDF / Text Report (Requirement 7)
  const handleDownloadPDFReport = () => {
    const reportText = `=======================================================
MINISTRY OF STATISTICS & PROGRAMME IMPLEMENTATION (MoSPI)
NATIONAL COMPETENCY FRAMEWORK FOR OFFICIAL STATISTICS
=======================================================

Framework Version: ${FRAMEWORK_CONFIG.version}
Last Official Review: ${FRAMEWORK_CONFIG.lastReviewedDate}
Export Date: ${new Date().toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}

OVERVIEW:
Standardized 5-level competency taxonomy spanning Statistical, Technical,
Digital Governance, and Behavioural domains for Indian Statistical Service (ISS)
and Subordinate Statistical Service (SSS) officers.

=======================================================
NATIONAL COMPETENCY TAXONOMY & LEVEL DEFINITIONS
=======================================================

${filteredFramework
  .map((c, i) => {
    const estHours = calculateEstHoursForCompetency(c.name, coursesCatalog);
    const levelsStr = c.level_definitions
      .map((l) => `  • Level ${l.level} (${l.title}): ${l.description}`)
      .join("\n");

    const roleReqsStr = Object.entries(c.required_level_by_role)
      .map(([role, lvl]) => `${role}: Level ${lvl}`)
      .join(" | ");

    return `${i + 1}. ${c.name.toUpperCase()} [${c.category}]
   Domain: ${c.domain.toUpperCase()} | Career Stage: ${c.career_stage}
   Standard Reference: ${c.standard_reference || "N/A"}
   Assessment Method: ${c.assessment_method}
   Est. Learning Catalog Hours: ~${estHours} hrs to advance
   Prerequisites: ${c.prerequisites.length > 0 ? c.prerequisites.join(", ") : "None"}

   Description:
   ${c.description}

   Level 1-5 Proficiency Definitions:
${levelsStr}

   Benchmark Requirements by Cadre Role:
   ${roleReqsStr}
-------------------------------------------------------`;
  })
  .join("\n\n")}

=======================================================
StatSkill AI - MoSPI National Workforce Framework
=======================================================
`;

    const blob = new Blob([reportText], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `MoSPI_National_Competency_Framework_${FRAMEWORK_CONFIG.version}_${Date.now()}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <AppLayout
      title="National Competency Framework"
      subtitle="Standardized competency taxonomy, 5-level proficiency definitions, and cadre benchmarks for MoSPI officers"
    >
      <div className="space-y-6 max-w-7xl mx-auto">
        {/* =========================================
            HEADER BAR: VERSION, EXPLAINER & PDF EXPORT
        ========================================= */}
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-border bg-card p-4 sm:p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Shield className="size-5 text-secondary" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-foreground text-sm sm:text-base">
                  National Competency Standards
                </span>
                <Badge variant="outline" className="text-[10px] font-mono border-primary/30 text-primary font-bold">
                  {FRAMEWORK_CONFIG.version}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                Official MoSPI Cadre Standard • Last Reviewed: <span className="font-semibold text-foreground">{FRAMEWORK_CONFIG.lastReviewedDate}</span>
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Scoring Formula Explainer Modal (Requirement 10) */}
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="text-xs font-semibold gap-1.5 border-border hover:bg-accent">
                  <Info className="size-3.5 text-secondary" /> How Competencies are Scored
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md bg-card border-border">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2 text-base font-bold text-foreground">
                    <Sparkles className="size-4 text-secondary" /> Five-Factor Competency Scoring Formula
                  </DialogTitle>
                  <DialogDescription className="text-xs text-muted-foreground pt-1">
                    How individual officer proficiency scores are calculated across official statistics datasets.
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-3 py-2 text-xs">
                  <p className="text-muted-foreground leading-relaxed bg-muted/40 p-3 rounded-lg border border-border">
                    {FRAMEWORK_CONFIG.scoringExplainerFormula}
                  </p>

                  <div className="space-y-2 font-mono text-[11px]">
                    <div className="flex justify-between p-2 rounded bg-card border border-border">
                      <span>Educational Qualifications:</span>
                      <span className="font-bold text-primary">15% Weight</span>
                    </div>
                    <div className="flex justify-between p-2 rounded bg-card border border-border">
                      <span>Work Experience Years:</span>
                      <span className="font-bold text-primary">20% Weight</span>
                    </div>
                    <div className="flex justify-between p-2 rounded bg-card border border-border">
                      <span>Completed Training Courses:</span>
                      <span className="font-bold text-primary">30% Weight</span>
                    </div>
                    <div className="flex justify-between p-2 rounded bg-card border border-border">
                      <span>Resume &amp; Skill Tag Match:</span>
                      <span className="font-bold text-primary">20% Weight</span>
                    </div>
                    <div className="flex justify-between p-2 rounded bg-card border border-border">
                      <span>Verified Self-Assessment:</span>
                      <span className="font-bold text-primary">15% Weight</span>
                    </div>
                  </div>

                  <p className="text-[11px] text-muted-foreground italic pt-1">
                    Note: To view your personal score audit, visit the <strong>Skill Intelligence</strong> tab.
                  </p>
                </div>
              </DialogContent>
            </Dialog>

            {/* Official PDF Export Button (Requirement 7) */}
            <Button
              onClick={handleDownloadPDFReport}
              size="sm"
              className="bg-primary text-primary-foreground hover:bg-primary/90 font-semibold text-xs gap-1.5 shadow-sm"
            >
              <Download className="size-3.5" /> Download Official Framework PDF
            </Button>
          </div>
        </div>

        {/* =========================================
            SEARCH BAR & VIEW TOGGLE CONTROLS
        ========================================= */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          {/* Independent Search Bar (Requirement 9) */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search competencies, standards, or keywords..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 text-xs bg-card border-border"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-2.5 text-xs text-muted-foreground hover:text-foreground"
              >
                Clear
              </button>
            )}
          </div>

          {/* View Toggle (Requirement 8): By Domain vs By Career Stage vs By Job Role */}
          <div className="flex items-center gap-1.5 bg-muted/60 p-1.5 rounded-xl border border-border shrink-0 self-start md:self-auto">
            <span className="text-[11px] font-bold text-muted-foreground px-2 flex items-center gap-1">
              <Layers className="size-3.5" /> View:
            </span>
            <button
              onClick={() => setViewMode("domain")}
              className={cn(
                "px-3 py-1.5 text-xs font-bold rounded-lg transition-all",
                viewMode === "domain"
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground hover:bg-card"
              )}
            >
              By Domain
            </button>
            <button
              onClick={() => setViewMode("career_stage")}
              className={cn(
                "px-3 py-1.5 text-xs font-bold rounded-lg transition-all",
                viewMode === "career_stage"
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground hover:bg-card"
              )}
            >
              By Career Stage
            </button>
            <button
              onClick={() => setViewMode("job_role")}
              className={cn(
                "px-3 py-1.5 text-xs font-bold rounded-lg transition-all",
                viewMode === "job_role"
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground hover:bg-card"
              )}
            >
              By Job Role
            </button>
          </div>
        </div>

        {/* =========================================
            MODE 1: BY DOMAIN TABS (Default View)
        ========================================= */}
        {viewMode === "domain" && (
          <div className="space-y-6">
            {/* Domain Filter Pills */}
            <div className="flex flex-wrap items-center gap-2">
              {domainsList.map((d) => {
                const count = filteredFramework.filter((c) => c.domain === d.key).length;
                const isSelected = selectedDomain === d.key;
                return (
                  <button
                    key={d.key}
                    onClick={() => setSelectedDomain(d.key)}
                    className={cn(
                      "px-4 py-2 text-xs font-bold rounded-xl border transition-all flex items-center gap-2",
                      isSelected
                        ? "bg-primary text-primary-foreground border-primary shadow-sm"
                        : "bg-card text-foreground border-border hover:bg-accent"
                    )}
                  >
                    <span>{d.label}</span>
                    <span className="rounded-full bg-background/20 px-2 py-0.5 text-[10px] font-mono font-extrabold">
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Competency Cards Grid for Selected Domain */}
            <CompetencyGrid
              items={filteredFramework.filter((c) => c.domain === selectedDomain)}
              coursesCatalog={coursesCatalog}
              expandedLevels={expandedLevels}
              onToggleExpanded={toggleExpanded}
              onJumpToCompetency={handleJumpToCompetency}
            />
          </div>
        )}

        {/* =========================================
            MODE 2: BY CAREER STAGE
        ========================================= */}
        {viewMode === "career_stage" && (
          <div className="space-y-8">
            {careerStagesList.map((stage) => {
              const stageItems = filteredFramework.filter((c) => c.career_stage === stage);
              if (stageItems.length === 0) return null;

              return (
                <div key={stage} className="space-y-4">
                  <div className="flex items-center gap-2 border-b border-border pb-2">
                    <Award className="size-5 text-secondary" />
                    <h2 className="text-base font-bold text-foreground">
                      {stage} Competencies ({stageItems.length})
                    </h2>
                  </div>

                  <CompetencyGrid
                    items={stageItems}
                    coursesCatalog={coursesCatalog}
                    expandedLevels={expandedLevels}
                    onToggleExpanded={toggleExpanded}
                    onJumpToCompetency={handleJumpToCompetency}
                  />
                </div>
              );
            })}
          </div>
        )}

        {/* =========================================
            MODE 3: BY JOB ROLE BENCHMARKS
        ========================================= */}
        {viewMode === "job_role" && (
          <div className="space-y-6">
            <div className="flex flex-wrap items-center gap-2 border-b border-border pb-4">
              <span className="text-xs font-bold text-muted-foreground mr-2">Select Designation / Cadre:</span>
              {jobRolesList.map((role) => (
                <button
                  key={role}
                  onClick={() => setSelectedRole(role)}
                  className={cn(
                    "px-3.5 py-1.5 text-xs font-bold rounded-lg border transition-all",
                    selectedRole === role
                      ? "bg-primary text-primary-foreground border-primary shadow-sm"
                      : "bg-card text-foreground border-border hover:bg-accent"
                  )}
                >
                  {role}
                </button>
              ))}
            </div>

            <div className="rounded-xl border border-border bg-card p-4 space-y-4 shadow-sm">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-bold text-foreground flex items-center gap-2">
                  <Target className="size-5 text-secondary" /> Benchmark Standards for: <span className="text-primary">{selectedRole}</span>
                </h2>
                <Badge variant="outline" className="text-xs font-mono">
                  {filteredFramework.length} Total Competencies Defined
                </Badge>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {filteredFramework.map((comp) => {
                  const reqLvl = comp.required_level_by_role[selectedRole] ?? 3.0;
                  const estHours = calculateEstHoursForCompetency(comp.name, coursesCatalog);

                  return (
                    <Card key={comp.id} className="border-border bg-card shadow-sm hover:border-primary/40 transition-all">
                      <CardHeader className="pb-2">
                        <div className="flex items-center justify-between gap-2">
                          <CardTitle className="text-sm font-bold text-foreground">
                            {comp.name}
                          </CardTitle>
                          <Badge className="bg-primary/15 text-primary border-primary/30 font-bold font-mono text-[10px]">
                            Req: Level {reqLvl}
                          </Badge>
                        </div>
                        <CardDescription className="text-[11px] text-muted-foreground capitalize">
                          Domain: {comp.domain} • {comp.category}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-3 text-xs">
                        <p className="text-muted-foreground text-[11px] line-clamp-2">
                          {comp.description}
                        </p>
                        <div className="flex items-center justify-between text-[10px] font-mono text-muted-foreground pt-2 border-t border-border">
                          <span>Method: {comp.assessment_method}</span>
                          <span className="text-primary font-bold">~{estHours} hrs to target</span>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}

// ============================================================================
// HELPER COMPONENT: COMPETENCY GRID & CARDS (Person-Agnostic)
// ============================================================================
function CompetencyGrid({
  items,
  coursesCatalog,
  expandedLevels,
  onToggleExpanded,
  onJumpToCompetency,
}: {
  items: CompetencyFrameworkItem[];
  coursesCatalog: any[];
  expandedLevels: Record<string, boolean>;
  onToggleExpanded: (id: string) => void;
  onJumpToCompetency: (name: string) => void;
}) {
  if (items.length === 0) {
    return (
      <div className="p-12 text-center border border-dashed border-border rounded-xl bg-card">
        <Target className="size-10 text-muted-foreground mx-auto mb-2 opacity-50" />
        <p className="text-sm font-bold text-foreground">No competencies match your filter query.</p>
        <p className="text-xs text-muted-foreground mt-1">Try clearing your search keyword.</p>
      </div>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {items.map((comp) => {
        // Requirement 5: Dynamically calculate estimated hours from catalog
        const estHours = calculateEstHoursForCompetency(comp.name, coursesCatalog);
        const isExpanded = !!expandedLevels[comp.id];

        return (
          <Card
            key={comp.id}
            id={`comp-${comp.id}`}
            className="shadow-card border-border hover:border-primary/40 transition-all flex flex-col justify-between"
          >
            <CardHeader className="pb-3">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-mono font-bold text-primary">{comp.id}</span>
                    <Badge variant={comp.category === "Mandatory Core" ? "default" : "secondary"} className="text-[10px] font-bold">
                      {comp.category}
                    </Badge>
                    {comp.standard_reference && (
                      <Badge variant="outline" className="text-[10px] font-mono border-secondary/40 text-secondary font-bold">
                        {comp.standard_reference}
                      </Badge>
                    )}
                  </div>
                  <CardTitle className="text-base font-bold text-foreground">
                    {comp.name}
                  </CardTitle>
                </div>

                <Badge className="bg-accent/40 text-accent-foreground font-semibold text-[10px] capitalize">
                  {comp.career_stage}
                </Badge>
              </div>

              <CardDescription className="text-xs text-muted-foreground leading-relaxed pt-2">
                {comp.description}
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4 pt-0">
              {/* Metadata Badges Bar */}
              <div className="grid grid-cols-2 gap-2 text-[11px] p-2.5 rounded-lg bg-muted/40 border border-border">
                <div>
                  <span className="text-muted-foreground block text-[10px]">Assessment Method:</span>
                  <span className="font-semibold text-foreground">{comp.assessment_method}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[10px]">Learning Catalog Estimate:</span>
                  <span className="font-bold text-primary flex items-center gap-1">
                    <Clock className="size-3" /> ~{estHours} hrs to next level
                  </span>
                </div>
              </div>

              {/* Related / Prerequisite Competency Linked Chips (Requirement 2 & Part 3 verification) */}
              {comp.prerequisites.length > 0 && (
                <div className="space-y-1.5">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
                    Prerequisites &amp; Related Competencies:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {comp.prerequisites.map((prereq) => (
                      <button
                        key={prereq}
                        onClick={() => onJumpToCompetency(prereq)}
                        className="inline-flex items-center gap-1 rounded-md border border-primary/20 bg-primary/5 px-2 py-1 text-[11px] font-semibold text-primary hover:bg-primary/15 transition-colors cursor-pointer"
                      >
                        <Target className="size-3 text-secondary" />
                        <span>{prereq}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* 5-Level Proficiency Definitions Matrix Toggle */}
              <div className="border-t border-border pt-3">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onToggleExpanded(comp.id)}
                  className="w-full justify-between text-xs font-bold text-foreground hover:bg-accent py-1.5 h-auto"
                >
                  <span>View 5-Level Proficiency Definitions ({isExpanded ? "Collapse" : "Expand"})</span>
                  {isExpanded ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
                </Button>

                {isExpanded && (
                  <div className="mt-3 space-y-2 pt-2 border-t border-border">
                    {comp.level_definitions.map((lvl) => (
                      <div key={lvl.level} className="p-2 rounded bg-card border border-border space-y-0.5 text-xs">
                        <div className="flex items-center justify-between font-bold">
                          <span className="text-primary font-mono text-[11px]">Level {lvl.level}: {lvl.title}</span>
                        </div>
                        <p className="text-[11px] text-muted-foreground leading-snug">{lvl.description}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

export default CompetencyPage;
