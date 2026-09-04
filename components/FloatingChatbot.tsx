import React, { useState, useRef, useEffect } from "react";
import { Bot, X, Send, Sparkles, MessageSquare, ChevronDown, User, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useAuth } from "@/context/AuthContext";
import { apiClient } from "@/lib/apiClient";

export function FloatingChatbot() {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Array<{ sender: "bot" | "user"; text: string; time: string }>>([
    {
      sender: "bot",
      text: `Namaste ${user?.name ? user.name.split(" ")[0] : "Officer"}! I am StatBot, your AI Learning Copilot. How can I assist you today with competency mapping, iGOT courses, or statistical methodologies?`,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isOpen]);

  const quickPrompts = [
    "What courses address my top skill gap?",
    "Explain Neyman Allocation in Sampling",
    "How do I sync my iGOT learning hours?",
    "What is the required level for National Accounts?",
  ];

  const handleSend = async (queryText?: string) => {
    const text = queryText || input;
    if (!text.trim() || loading) return;

    const timeStr = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    setMessages((prev) => [...prev, { sender: "user", text, time: timeStr }]);
    if (!queryText) setInput("");
    setLoading(true);

    try {
      // Try backend AI chatbot service if available
      const response = await apiClient
        .post<{ reply: string }>("/assistant/chat", { prompt: text })
        .catch(() => null);

      let botReply = response?.reply;

      if (!botReply) {
        const lower = text.toLowerCase();
        if (lower.includes("gap") || lower.includes("skill")) {
          botReply = `Based on your profile as a ${user?.designation || "Statistical Officer"}, your top priority gap is Survey Design & National Accounts. We recommend enrolling in NSSTA's "Sampling & SNA 2008" module.`;
        } else if (lower.includes("neyman") || lower.includes("sampling")) {
          botReply = "Neyman Allocation calculates stratum sample sizes proportional to (N_h * S_h), where N_h is stratum population size and S_h is standard deviation. This minimizes variance for a fixed sample size.";
        } else if (lower.includes("igot") || lower.includes("sync") || lower.includes("hour")) {
          botReply = "StatSkill AI automatically synchronizes with iGOT Karmayogi via standard webhooks. Your completed learning hours update in real-time on your 'My Courses' and 'My Dashboard' pages.";
        } else if (lower.includes("account") || lower.includes("sna")) {
          botReply = "For National Accounts Statistics, Level 3.0 proficiency is required for Statistical Officers, covering GDP quarterly estimates, FISIM allocation, and IPP capital formation.";
        } else {
          botReply = `Regarding "${text}": StatSkill AI recommends consulting official MoSPI guidelines or exploring the curated iGOT & NSSTA TPAC modules in your Recommendations tab.`;
        }
      }

      setMessages((prev) => [...prev, { sender: "bot", text: botReply, time: timeStr }]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          sender: "bot",
          text: "I am currently running in offline mode. Please consult the Learning Hub or re-try your query shortly.",
          time: timeStr,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col items-end">
      {/* Floating Toggle Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-2.5 rounded-full bg-primary text-primary-foreground px-4 py-3 shadow-elevated hover:bg-primary/90 transition-all hover:scale-105 group focus:outline-none focus:ring-2 focus:ring-secondary"
          aria-label="Open AI Assistant"
        >
          <span className="flex size-8 items-center justify-center rounded-full bg-secondary text-secondary-foreground shadow-xs">
            <Bot className="size-5" />
          </span>
          <span className="text-xs font-bold tracking-wide pr-1">StatBot AI Copilot</span>
          <span className="flex size-2.5 rounded-full bg-success animate-pulse" />
        </button>
      )}

      {/* Expanded Chat Widget */}
      {isOpen && (
        <Card className="w-[360px] sm:w-[400px] h-[520px] shadow-elevated border-border bg-card flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-200">
          {/* Header */}
          <CardHeader className="bg-primary text-primary-foreground p-3.5 flex flex-row items-center justify-between space-y-0 shrink-0">
            <div className="flex items-center gap-2.5">
              <span className="flex size-8 items-center justify-center rounded-full bg-secondary text-secondary-foreground">
                <Bot className="size-4" />
              </span>
              <div>
                <CardTitle className="text-xs font-bold tracking-wide flex items-center gap-1.5">
                  StatBot AI Assistant <Sparkles className="size-3 text-secondary" />
                </CardTitle>
                <p className="text-[10px] text-primary-foreground/80">MoSPI & iGOT Karmayogi Copilot</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="rounded-full p-1 hover:bg-primary-foreground/10 text-primary-foreground/80 hover:text-primary-foreground transition-colors"
            >
              <X className="size-4" />
            </button>
          </CardHeader>

          {/* Messages Body */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3 bg-muted/20 text-xs">
            {messages.map((m, idx) => (
              <div
                key={idx}
                className={`flex gap-2 ${m.sender === "user" ? "justify-end" : "justify-start"}`}
              >
                {m.sender === "bot" && (
                  <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-secondary/20 text-secondary mt-0.5">
                    <Bot className="size-3.5" />
                  </span>
                )}
                <div className="space-y-1 max-w-[82%]">
                  <div
                    className={`rounded-2xl px-3.5 py-2.5 leading-relaxed ${
                      m.sender === "user"
                        ? "bg-primary text-primary-foreground font-medium rounded-tr-none"
                        : "bg-card text-foreground border border-border shadow-xs rounded-tl-none"
                    }`}
                  >
                    {m.text}
                  </div>
                  <span
                    className={`block text-[9px] text-muted-foreground ${
                      m.sender === "user" ? "text-right pr-1" : "pl-1"
                    }`}
                  >
                    {m.time}
                  </span>
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex items-center gap-2 text-muted-foreground text-xs p-2">
                <Bot className="size-4 animate-spin text-secondary" />
                <span>StatBot is thinking...</span>
              </div>
            )}
          </div>

          {/* Quick Prompts */}
          <div className="p-2 border-t border-border bg-card overflow-x-auto whitespace-nowrap flex gap-1.5 scrollbar-none shrink-0">
            {quickPrompts.map((p) => (
              <button
                key={p}
                onClick={() => handleSend(p)}
                className="rounded-full bg-muted border border-border px-2.5 py-1 text-[10px] font-medium text-muted-foreground hover:bg-accent hover:text-foreground transition-colors shrink-0"
              >
                {p}
              </button>
            ))}
          </div>

          {/* Input Box */}
          <div className="p-3 border-t border-border bg-card flex gap-2 shrink-0">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder="Ask StatBot about competencies or courses..."
              className="bg-background text-xs h-9"
            />
            <Button
              size="sm"
              onClick={() => handleSend()}
              disabled={loading}
              className="bg-primary text-primary-foreground h-9 px-3 shrink-0"
            >
              <Send className="size-3.5" />
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}
