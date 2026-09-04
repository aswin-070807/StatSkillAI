import React, { useState, useEffect } from "react";
import { AppLayout } from "@/components/AppLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/context/AuthContext";
import {
  BookOpen,
  Bot,
  TrendingUp,
  Settings as SettingsIcon,
  Send,
  Sparkles,
  Award,
  Clock,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
} from "lucide-react";

export function LearningHubPage() {
  const modules = [
    { title: "National Accounts Statistics (SNA 2008)", provider: "NSSTA", hours: 12, rating: "4.9", category: "Statistical" },
    { title: "Python for Official Data Analytics", provider: "iGOT", hours: 8, rating: "4.8", category: "Technical" },
    { title: "Sample Survey Design & Variance Estimation", provider: "NSSTA", hours: 15, rating: "4.9", category: "Statistical" },
    { title: "Cybersecurity & Digital Personal Data Protection", provider: "iGOT", hours: 4, rating: "4.7", category: "Digital Governance" },
    { title: "Index of Industrial Production (IIP) Methodology", provider: "NSSTA", hours: 6, rating: "4.8", category: "Statistical" },
    { title: "Leadership & Effective Communication for Officials", provider: "iGOT", hours: 5, rating: "4.6", category: "Behavioural" },
  ];

  return (
    <AppLayout title="Learning Hub" subtitle="Curated repositories from iGOT Karmayogi & NSSTA">
      <div className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {modules.map((m) => (
            <Card key={m.title} className="shadow-card border-border flex flex-col justify-between">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="rounded bg-accent/20 px-2 py-0.5 font-semibold text-accent-foreground">
                    {m.provider}
                  </span>
                  <span className="text-muted-foreground">{m.category}</span>
                </div>
                <CardTitle className="text-sm font-semibold text-foreground leading-snug">{m.title}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span className="inline-flex items-center gap-1">
                    <Clock className="size-3.5" /> {m.hours} hours
                  </span>
                  <span className="font-semibold text-warning">★ {m.rating}</span>
                </div>
                <Button variant="outline" size="sm" className="w-full">
                  <ExternalLink className="size-3.5 mr-1.5" /> Explore Module
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </AppLayout>
  );
}

export function AssistantPage() {
  const [messages, setMessages] = useState<Array<{ sender: "user" | "bot"; text: string }>>([
    {
      sender: "bot",
      text: "Namaste Officer! I am StatBot, your AI Assistant for India's Official Statistical System. How can I assist you today with National Accounts, Sampling Design, or CPI calculations?",
    },
  ]);
  const [inputQuery, setInputQuery] = useState("");

  const samplePrompts = [
    "Explain Neyman Allocation in Stratified Sampling",
    "What are the major components of SNA 2008?",
    "How is the Index of Industrial Production (IIP) base year revised?",
    "What are CERT-In guidelines for official cloud storage?",
  ];

  const handleSend = (textToSend?: string) => {
    const query = textToSend || inputQuery;
    if (!query.trim()) return;

    setMessages((prev) => [...prev, { sender: "user", text: query }]);
    if (!textToSend) setInputQuery("");

    setTimeout(() => {
      let botResponse = `Regarding "${query}": StatSkill AI reference guidelines dictate following standardized MoSPI methodologies and CERT-In compliance protocols. For detailed calculations, consult the NSSTA training modules.`;
      if (query.toLowerCase().includes("neyman")) {
        botResponse = "Neyman Allocation assigns sample size n_h to stratum h proportional to N_h * S_h (population size x standard deviation). This minimizes overall sampling variance for a fixed sample size.";
      } else if (query.toLowerCase().includes("sna")) {
        botResponse = "SNA 2008 is the international statistical standard for National Accounts, incorporating Intellectual Property Products (R&D) as capital formation and refined FISIM allocation across sectors.";
      }

      setMessages((prev) => [...prev, { sender: "bot", text: botResponse }]);
    }, 600);
  };

  return (
    <AppLayout title="AI Assistant (StatBot)" subtitle="Statistical query & competency copilot">
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 flex flex-col h-[520px] rounded-xl border border-border bg-card shadow-card">
          <div className="border-b border-border p-4 flex items-center justify-between bg-muted/30">
            <div className="flex items-center gap-2">
              <span className="flex size-8 items-center justify-center rounded-lg bg-secondary text-secondary-foreground">
                <Bot className="size-4" />
              </span>
              <div>
                <h3 className="text-sm font-semibold text-foreground">StatBot AI Copilot</h3>
                <p className="text-[11px] text-muted-foreground">MoSPI Official Intelligence Engine</p>
              </div>
            </div>
            <span className="flex items-center gap-1 text-[11px] text-success font-medium">
              <span className="size-2 rounded-full bg-success animate-pulse" /> Active
            </span>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.map((m, i) => (
              <div
                key={i}
                className={`flex gap-2.5 ${m.sender === "user" ? "justify-end" : "justify-start"}`}
              >
                {m.sender === "bot" && (
                  <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-secondary/15 text-secondary text-xs">
                    <Bot className="size-4" />
                  </span>
                )}
                <div
                  className={`max-w-[80%] rounded-xl px-4 py-2.5 text-xs leading-relaxed ${
                    m.sender === "user"
                      ? "bg-primary text-primary-foreground font-medium"
                      : "bg-muted text-foreground border border-border"
                  }`}
                >
                  {m.text}
                </div>
              </div>
            ))}
          </div>

          <div className="p-3 border-t border-border bg-card flex gap-2">
            <Input
              placeholder="Ask StatBot a statistical question..."
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              className="bg-card text-xs"
            />
            <Button onClick={() => handleSend()} className="bg-secondary text-secondary-foreground">
              <Send className="size-4" />
            </Button>
          </div>
        </div>

        <div className="space-y-4">
          <Card className="shadow-card border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold flex items-center gap-1.5">
                <Sparkles className="size-4 text-secondary" /> Sample Queries
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {samplePrompts.map((p) => (
                <button
                  key={p}
                  onClick={() => handleSend(p)}
                  className="w-full text-left rounded-md border border-border p-2.5 text-xs text-foreground hover:bg-accent transition-colors"
                >
                  "{p}"
                </button>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}

export function ProgressPage() {
  const milestones = [
    { title: "Foundational Statistics Diagnostic", date: "15 Jul 2026", status: "Completed", score: "88%" },
    { title: "National Accounts Module (SNA 2008)", date: "02 Aug 2026", status: "Completed", score: "92%" },
    { title: "Python Data Analysis Certificate", date: "In Progress", status: "Active", score: "60%" },
  ];

  return (
    <AppLayout title="My Progress" subtitle="Quarterly competency growth, trajectory & badges">
      <div className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-3">
          <Card className="shadow-card border-border">
            <CardContent className="p-5 flex items-center gap-4">
              <div className="flex size-12 items-center justify-center rounded-xl bg-secondary/15 text-secondary">
                <TrendingUp className="size-6" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">+14%</p>
                <p className="text-xs text-muted-foreground">Competency Growth (Q3)</p>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-card border-border">
            <CardContent className="p-5 flex items-center gap-4">
              <div className="flex size-12 items-center justify-center rounded-xl bg-success/15 text-success">
                <Award className="size-6" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">6 Badges</p>
                <p className="text-xs text-muted-foreground">Certified Competencies</p>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-card border-border">
            <CardContent className="p-5 flex items-center gap-4">
              <div className="flex size-12 items-center justify-center rounded-xl bg-primary/15 text-primary">
                <CheckCircle2 className="size-6" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">18 Hrs</p>
                <p className="text-xs text-muted-foreground">iGOT Learning Completed</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="shadow-card border-border">
          <CardHeader>
            <CardTitle className="text-base">Milestone Accomplishments</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {milestones.map((m) => (
              <div key={m.title} className="flex items-center justify-between rounded-lg border border-border p-4 text-xs">
                <div>
                  <p className="font-semibold text-foreground">{m.title}</p>
                  <p className="text-muted-foreground mt-0.5">{m.date}</p>
                </div>
                <span className="font-semibold text-success bg-success/10 px-2.5 py-1 rounded-full border border-success/20">
                  {m.score}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}

export function SettingsPage() {
  const { user, updateUser } = useAuth();

  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [department, setDepartment] = useState(user?.department || "");
  const [designation, setDesignation] = useState(user?.designation || "");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name);
      setEmail(user.email);
      setDepartment(user.department);
      setDesignation(user.designation);
    }
  }, [user]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateUser({
      name,
      email,
      department,
      designation,
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <AppLayout title="Settings" subtitle="Account preferences & security parameters">
      <div className="max-w-2xl space-y-6">
        <Card className="shadow-card border-border">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <SettingsIcon className="size-5 text-secondary" /> Officer Profile Details
            </CardTitle>
            <CardDescription>Official registration credentials &amp; department assignment</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label>Employee ID</Label>
                  <Input value={user?.employeeId || "EMP-10482"} disabled className="bg-muted" />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="email">Official Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="designation">Designation</Label>
                  <Input
                    id="designation"
                    value={designation}
                    onChange={(e) => setDesignation(e.target.value)}
                  />
                </div>

                <div className="space-y-1.5 sm:col-span-2">
                  <Label htmlFor="department">Department / Division</Label>
                  <Input
                    id="department"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                  />
                </div>
              </div>

              {saved && (
                <div className="rounded-md bg-success/15 p-3 text-success font-medium flex items-center gap-2">
                  <ShieldCheck className="size-4" /> Profile updated successfully! Changes reflected across your dashboard and navigation header.
                </div>
              )}

              <Button type="submit" className="bg-primary text-primary-foreground">
                Save Profile Changes
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
