import React from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Shield,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  UserCheck,
  BrainCircuit,
  BookOpen,
  LineChart,
  Bot,
  Lock,
  Layers,
  Sparkles,
  BarChart2,
  Users,
  Building2,
  Cpu,
  Globe,
} from "lucide-react";
import { GovNavbar } from "@/components/GovNavbar";
import { GovFooter } from "@/components/GovFooter";
import { FloatingChatbot } from "@/components/FloatingChatbot";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/context/AuthContext";

export function Home() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const isAdmin = user?.role === "admin" || user?.role === "super_admin";

  const handleSignInRedirect = () => {
    if (user) {
      if (isAdmin) {
        navigate("/admin-dashboard");
      } else {
        navigate("/dashboard");
      }
    } else {
      navigate("/login");
    }
  };

  // Step flow items
  const steps = [
    {
      step: "01",
      title: "Build Your Competency Profile",
      desc: "Input your official role, department assignment, years of experience, and past training history.",
      icon: UserCheck,
    },
    {
      step: "02",
      title: "AI Framework & Gap Detection",
      desc: "AI compares your profile against standardized national competency frameworks to pinpoint exact skill gaps.",
      icon: BrainCircuit,
    },
    {
      step: "03",
      title: "Personalized Recommendations",
      desc: "Receive AI-curated learning pathways directly mapped to iGOT Karmayogi and NSSTA TPAC courses.",
      icon: BookOpen,
    },
    {
      step: "04",
      title: "Assessments & Progress Tracking",
      desc: "Take AI-generated domain quizzes, earn certified badges, and monitor growth on your dashboard.",
      icon: LineChart,
    },
  ];

  // Key features grid items (8 items)
  const keyFeatures = [
    {
      title: "AI-Based Competency Assessment",
      desc: "Automatically benchmarks official skills against role frameworks.",
      icon: BrainCircuit,
    },
    {
      title: "Automated Skill-Gap Analysis",
      desc: "Identifies precision target areas requiring training intervention.",
      icon: LineChart,
    },
    {
      title: "Seamless iGOT Karmayogi Integration",
      desc: "Syncs real-time course catalog and official learning records.",
      icon: Layers,
    },
    {
      title: "Personalized Learning Recommendations",
      desc: "Tailored training pathways from iGOT Karmayogi & NSSTA TPAC programs.",
      icon: BookOpen,
    },
    {
      title: "AI-Generated MCQs & Quizzes",
      desc: "Instantly creates domain-specific evaluation tests from uploaded content.",
      icon: Sparkles,
    },
    {
      title: "Interactive Dashboards",
      desc: "Real-time workforce analytics for Learners and Administrators.",
      icon: BarChart2,
    },
    {
      title: "AI Virtual Assistant Support",
      desc: "24/7 StatBot copilot for methodology guidelines and quick queries.",
      icon: Bot,
    },
    {
      title: "Secure & Role-Based Access",
      desc: "Enterprise government security with strict DPDP compliance & SSO readiness.",
      icon: Lock,
    },
  ];

  // Competency Domains Overview (4 cards)
  const competencyDomains = [
    {
      domain: "Statistical Competencies",
      icon: BarChart2,
      skills: ["Survey Design", "Sampling Methods", "National Accounts (SNA 2008)", "Index Numbers", "SDMX Standards"],
      badge: "Domain 1",
    },
    {
      domain: "Technical & Data Analytics",
      icon: Cpu,
      skills: ["Python", "R", "SQL", "GIS Spatial", "AI/ML", "Cloud Computing"],
      badge: "Domain 2",
    },
    {
      domain: "Digital Governance",
      icon: Globe,
      skills: ["Cybersecurity", "Data Privacy (DPDP)", "Digital Signatures", "Government Cloud"],
      badge: "Domain 3",
    },
    {
      domain: "Behavioural & Managerial",
      icon: Users,
      skills: ["Leadership", "Communication", "Project Management", "Decision Making"],
      badge: "Domain 4",
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground font-sans">
      {/* Official Government Top Navigation */}
      <GovNavbar />

      <main className="flex-1 animate-page-fade">
        {/* =========================================
            SECTION 1: HERO SECTION
        ========================================= */}
        <section className="relative border-b border-border bg-gradient-to-b from-primary/10 via-primary/5 to-background py-16 sm:py-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
          <div className="mx-auto max-w-6xl">
            <div className="grid gap-12 lg:grid-cols-12 lg:items-center">
              <div className="space-y-6 lg:col-span-7">
                {/* Government Trust Badge */}
                <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-card px-3.5 py-1.5 text-xs font-semibold text-primary shadow-xs">
                  <Shield className="size-4 text-secondary" />
                  <span>Ministry of Statistics &amp; Programme Implementation (MoSPI)</span>
                </div>

                <div className="space-y-3">
                  <span className="block text-xs font-extrabold uppercase tracking-widest text-secondary font-mono">
                    National Skill Intelligence Platform
                  </span>
                  <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl lg:text-5xl text-foreground leading-[1.15]">
                    AI-Powered Skill Intelligence for India's Official Statistical System
                  </h1>
                  <p className="text-sm sm:text-base text-muted-foreground leading-relaxed max-w-2xl">
                    An AI-enabled platform that assesses officials' competencies, identifies skill gaps, and recommends personalized learning pathways from iGOT Karmayogi and NSSTA's TPAC training programs.
                  </p>
                </div>

                {/* Primary CTA Buttons */}
                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <Button
                    size="lg"
                    onClick={handleSignInRedirect}
                    className="bg-primary text-primary-foreground hover:bg-primary/90 font-semibold shadow-md gap-2 text-sm"
                  >
                    {user ? (isAdmin ? "Go to Admin Console" : "Go to Learner Dashboard") : "Sign In to Platform"}
                    <ArrowRight className="size-4" />
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    onClick={() => navigate("/competency")}
                    className="border-primary/30 font-semibold text-primary hover:bg-primary/5 text-sm gap-2"
                  >
                    Explore Competency Framework
                  </Button>
                </div>

                {/* Trust Highlights */}
                <div className="flex flex-wrap items-center gap-6 pt-4 text-xs font-medium text-muted-foreground border-t border-border/60">
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 className="size-4 text-success" /> iGOT Karmayogi Aligned
                  </span>
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 className="size-4 text-success" /> NSSTA TPAC Integrated
                  </span>
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 className="size-4 text-success" /> Enterprise Role-Based Access
                  </span>
                </div>
              </div>

              {/* Hero Visual Card */}
              <div className="lg:col-span-5">
                <Card className="border-primary/20 bg-card shadow-elevated overflow-hidden h-full flex flex-col justify-between">
                  <div className="bg-primary p-6 text-primary-foreground text-center space-y-1.5">
                    <div className="mx-auto flex size-14 items-center justify-center rounded-xl bg-card/10 text-secondary border border-primary-foreground/20 mb-2">
                      <BarChart2 className="size-7" />
                    </div>
                    <h2 className="text-base font-bold tracking-wide uppercase">
                      Skill Intelligence Engine
                    </h2>
                    <p className="text-xs text-primary-foreground/80">
                      Empowering Official Statistical Cadres Across India
                    </p>
                  </div>
                  <CardContent className="p-6 space-y-4 text-xs">
                    <div className="grid grid-cols-2 gap-3 text-center">
                      <div className="rounded-lg border border-border p-3.5 bg-muted/40">
                        <span className="block text-2xl font-extrabold text-foreground font-mono">4</span>
                        <span className="text-[11px] text-muted-foreground font-medium">Competency Domains</span>
                      </div>
                      <div className="rounded-lg border border-border p-3.5 bg-muted/40">
                        <span className="block text-2xl font-extrabold text-secondary font-mono">40+</span>
                        <span className="text-[11px] text-muted-foreground font-medium">Mapped Competencies</span>
                      </div>
                    </div>

                    <div className="rounded-lg bg-secondary/10 border border-secondary/20 p-3.5 space-y-1.5">
                      <div className="flex items-center justify-between font-semibold text-foreground">
                        <span>{user ? "Active Officer Session" : "Public Overview Mode"}</span>
                        <span className="text-secondary font-bold">{user ? (user.name || "Authenticated") : "Open Access"}</span>
                      </div>
                      <p className="text-[11px] text-muted-foreground leading-relaxed">
                        {user
                          ? `Authenticated as ${user.name} (${isAdmin ? "Administrator" : "Statistical Officer"}). All AI diagnostic tools and personalized learning pathways are active.`
                          : "Explore general competency frameworks and platform capabilities freely. Sign in to generate officer profiles and track personalized recommendations."}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* =========================================
            SECTION 2: THE PROBLEM
        ========================================= */}
        <section className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 border-b border-border bg-background">
          <div className="mx-auto max-w-6xl space-y-12">
            <div className="text-center max-w-3xl mx-auto space-y-3">
              <span className="rounded-full bg-destructive/10 px-3 py-1 text-xs font-bold text-destructive uppercase tracking-wider">
                The Problem
              </span>
              <h2 className="text-2xl font-extrabold sm:text-3xl text-foreground">
                The Upskilling Challenge in India's Official Statistics System
              </h2>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed max-w-2xl mx-auto">
                Officials in India's Official Statistics System must continuously upskill in AI/ML, GIS, cloud computing, and modern statistical methods. iGOT Karmayogi offers many courses, but there's no personalized way for officials to know exactly what they need.
              </p>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-4">
              {[
                { title: "AI & Machine Learning", desc: "Automating data validation & predictive estimation" },
                { title: "GIS & Spatial Analytics", desc: "Mapping survey frames and geo-statistical indicators" },
                { title: "Cloud & Big Data Infrastructure", desc: "Processing micro-data securely at national scale" },
                { title: "Modern Statistical Methods", desc: "Updating sampling frames & SNA 2008 standards" },
              ].map((item, idx) => (
                <Card key={idx} className="border-border bg-card shadow-card h-full flex flex-col justify-between">
                  <CardContent className="p-5 space-y-3">
                    <div className="flex size-10 items-center justify-center rounded-lg bg-destructive/10 text-destructive">
                      <AlertTriangle className="size-5" />
                    </div>
                    <h3 className="text-xs font-bold text-foreground">{item.title}</h3>
                    <p className="text-[11px] text-muted-foreground leading-relaxed">{item.desc}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* =========================================
            SECTION 3: THE SOLUTION
        ========================================= */}
        <section className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 border-b border-border bg-muted/20">
          <div className="mx-auto max-w-6xl">
            <div className="grid gap-10 lg:grid-cols-12 lg:items-center">
              <div className="space-y-4 lg:col-span-7">
                <span className="rounded-full bg-success/15 px-3 py-1 text-xs font-bold text-success uppercase tracking-wider">
                  The Solution
                </span>
                <h2 className="text-2xl font-extrabold sm:text-3xl text-foreground">
                  AI-Driven Competency Intelligence Platform
                </h2>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed max-w-2xl">
                  This platform uses AI to automatically build competency profiles, detect skill gaps against role-based frameworks, and recommend personalized learning paths — integrating with iGOT Karmayogi and NSSTA TPAC.
                </p>
                <div className="space-y-2.5 text-xs font-medium text-foreground pt-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="size-4 text-success shrink-0" />
                    <span>Automated role benchmark comparisons against national statistical standards.</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="size-4 text-success shrink-0" />
                    <span>Personalized course mapping connecting officials to exact iGOT &amp; NSSTA modules.</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="size-4 text-success shrink-0" />
                    <span>Real-time officer diagnostics and departmental capacity analytics.</span>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-5">
                <Card className="border-success/30 bg-card shadow-card p-6 space-y-4 h-full flex flex-col justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex size-11 items-center justify-center rounded-xl bg-success/15 text-success">
                      <Lightbulb className="size-6" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-foreground">StatSkill AI Advantage</h3>
                      <p className="text-[11px] text-muted-foreground">Tailored for MoSPI &amp; State Statistical Cadres</p>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Eliminates guesswork by analyzing official assignments, past training, and designated role expectations to create a precision learning road-map.
                  </p>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* =========================================
            SECTION 4: HOW IT WORKS (4-STEP FLOW)
        ========================================= */}
        <section className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 border-b border-border bg-background">
          <div className="mx-auto max-w-6xl space-y-12">
            <div className="text-center max-w-3xl mx-auto space-y-3">
              <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary uppercase tracking-wider">
                Step-By-Step
              </span>
              <h2 className="text-2xl font-extrabold sm:text-3xl text-foreground">
                How It Works
              </h2>
              <p className="text-xs sm:text-sm text-muted-foreground max-w-2xl mx-auto">
                Four simple steps from profile setup to AI assessment and skill certification.
              </p>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {steps.map((item) => {
                const Icon = item.icon;
                return (
                  <Card key={item.step} className="shadow-card border-border hover:border-primary/40 transition-all h-full flex flex-col justify-between">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-2xl font-extrabold text-primary/40 font-mono">
                          {item.step}
                        </span>
                        <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                          <Icon className="size-5" />
                        </div>
                      </div>
                      <CardTitle className="text-sm font-bold text-foreground leading-snug">
                        {item.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        {item.desc}
                      </p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </section>

        {/* =========================================
            SECTION 5: KEY FEATURES GRID (8 ITEMS)
        ========================================= */}
        <section className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 border-b border-border bg-card">
          <div className="mx-auto max-w-6xl space-y-12">
            <div className="text-center max-w-3xl mx-auto space-y-3">
              <span className="rounded-full bg-secondary/15 px-3 py-1 text-xs font-bold text-secondary uppercase tracking-wider">
                Platform Features
              </span>
              <h2 className="text-2xl font-extrabold sm:text-3xl text-foreground">
                Key Platform Capabilities
              </h2>
              <p className="text-xs sm:text-sm text-muted-foreground max-w-2xl mx-auto">
                Engineered specifically for the needs of statistical officers and administrators.
              </p>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {keyFeatures.map((feat, idx) => {
                const Icon = feat.icon;
                return (
                  <div
                    key={idx}
                    className="rounded-xl border border-border bg-background p-5 space-y-3 hover:border-primary/40 hover:shadow-card transition-all h-full flex flex-col justify-between"
                  >
                    <div className="space-y-3">
                      <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        <Icon className="size-5" />
                      </div>
                      <h3 className="text-xs font-bold text-foreground leading-snug">{feat.title}</h3>
                    </div>
                    <p className="text-[11px] text-muted-foreground leading-relaxed">{feat.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* =========================================
            SECTION 6: COMPETENCY DOMAINS OVERVIEW (4 CARDS)
        ========================================= */}
        <section className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 border-b border-border bg-background">
          <div className="mx-auto max-w-6xl space-y-12">
            <div className="text-center max-w-3xl mx-auto space-y-3">
              <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary uppercase tracking-wider">
                Framework Matrix
              </span>
              <h2 className="text-2xl font-extrabold sm:text-3xl text-foreground">
                Competency Domains Overview
              </h2>
              <p className="text-xs sm:text-sm text-muted-foreground max-w-2xl mx-auto">
                Comprehensive taxonomy covering the 4 core competency domains for official statistics.
              </p>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {competencyDomains.map((cd) => {
                const Icon = cd.icon;
                return (
                  <Card key={cd.domain} className="shadow-card border-border h-full flex flex-col justify-between">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                          <Icon className="size-5" />
                        </div>
                        <span className="rounded bg-accent px-2 py-0.5 text-[10px] font-bold text-accent-foreground font-mono">
                          {cd.badge}
                        </span>
                      </div>
                      <CardTitle className="text-base font-bold text-foreground">
                        {cd.domain}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                        Example Skills:
                      </p>
                      <ul className="space-y-1.5 text-xs text-foreground">
                        {cd.skills.map((skill) => (
                          <li key={skill} className="flex items-center gap-2">
                            <span className="size-1.5 rounded-full bg-primary" />
                            <span>{skill}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </section>

        {/* =========================================
            SECTION 7: WHO IS THIS FOR? (2 SIDE-BY-SIDE CARDS - PUBLIC ONLY)
        ========================================= */}
        {!user && (
          <section className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 border-b border-border bg-muted/20">
            <div className="mx-auto max-w-6xl space-y-12">
              <div className="text-center max-w-3xl mx-auto space-y-3">
                <span className="rounded-full bg-secondary/15 px-3 py-1 text-xs font-bold text-secondary uppercase tracking-wider">
                  Role-Based Portals
                </span>
                <h2 className="text-2xl font-extrabold sm:text-3xl text-foreground">
                  Who Is This For?
                </h2>
                <p className="text-xs sm:text-sm text-muted-foreground max-w-2xl mx-auto">
                  Tailored views and functionalities for learners and workforce administrators.
                </p>
              </div>

              <div className="grid gap-8 md:grid-cols-2">
                {/* Card 1: For Officials/Learners */}
                <Card className="shadow-card border-border hover:border-primary/40 transition-all h-full flex flex-col justify-between p-6 space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="flex size-12 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
                        <UserCheck className="size-6 text-secondary" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-foreground">For Officials / Learners</h3>
                        <p className="text-xs text-muted-foreground">Statistical Officers &amp; Field Cadres</p>
                      </div>
                    </div>
                    <ul className="space-y-2.5 text-xs text-foreground">
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="size-4 text-success shrink-0 mt-0.5" />
                        <span>Personalized learning paths tailored to your current assignment &amp; role.</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="size-4 text-success shrink-0 mt-0.5" />
                        <span>Real-time progress tracking with iGOT Karmayogi learning sync.</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="size-4 text-success shrink-0 mt-0.5" />
                        <span>AI-generated assessments &amp; instant feedback copilot (StatBot).</span>
                      </li>
                    </ul>
                  </div>
                  <Button onClick={handleSignInRedirect} className="bg-primary text-primary-foreground font-semibold text-xs w-full py-2.5">
                    Sign In as Official / Learner
                  </Button>
                </Card>

                {/* Card 2: For Administrators */}
                <Card className="shadow-card border-border hover:border-primary/40 transition-all h-full flex flex-col justify-between p-6 space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="flex size-12 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
                        <Building2 className="size-6 text-secondary" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-foreground">For Administrators</h3>
                        <p className="text-xs text-muted-foreground">MoSPI HQ &amp; Departmental Leads</p>
                      </div>
                    </div>
                    <ul className="space-y-2.5 text-xs text-foreground">
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="size-4 text-success shrink-0 mt-0.5" />
                        <span>Workforce analytics and organizational competency heatmaps.</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="size-4 text-success shrink-0 mt-0.5" />
                        <span>Training effectiveness tracking and skill acquisition ROI.</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="size-4 text-success shrink-0 mt-0.5" />
                        <span>Predictive skill-demand insights and assessment management console.</span>
                      </li>
                    </ul>
                  </div>
                  <Button onClick={handleSignInRedirect} variant="outline" className="border-primary text-primary font-semibold text-xs w-full py-2.5">
                    Sign In as Administrator
                  </Button>
                </Card>
              </div>
            </div>
          </section>
        )}


      </main>

      {/* =========================================
          SECTION 9: FOOTER
      ========================================= */}
      <FloatingChatbot />
      <GovFooter />
    </div>
  );
}
