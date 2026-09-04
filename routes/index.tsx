import { createFileRoute, Link } from "@tanstack/react-router";
import { BarChart2, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "StatSkill AI — Sign in to Competency Intelligence" },
      {
        name: "description",
        content:
          "Secure SSO sign-in to StatSkill AI, the competency intelligence and personalised learning platform for India's Official Statistical System.",
      },
      { property: "og:title", content: "StatSkill AI — Sign in" },
      {
        property: "og:description",
        content:
          "Assess. Identify. Learn. Improve. Competency intelligence for India's Official Statistical System.",
      },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-auth px-4 py-12">
      <div className="w-full max-w-md">
        <div className="rounded-xl border border-border bg-card p-8 shadow-elevated sm:p-10">
          <div className="flex flex-col items-center text-center">
            <span className="flex size-14 items-center justify-center rounded-xl bg-gradient-brand">
              <BarChart2 className="size-7 text-secondary-foreground" />
            </span>
            <h1 className="mt-5 text-2xl font-semibold tracking-tight text-primary">
              StatSkill AI
            </h1>
            <p className="mt-1.5 text-sm text-muted-foreground">
              Assess. Identify. Learn. Improve.
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Ministry of Statistics &amp; Programme Implementation
            </p>
          </div>

          <div className="my-7 h-px bg-border" />

          <Button
            asChild
            size="lg"
            className="w-full bg-secondary text-secondary-foreground hover:bg-secondary/90"
          >
            <Link to="/dashboard">
              <ShieldCheck className="size-4" />
              Login with SSO
            </Link>
          </Button>

          <p className="mt-4 text-center text-xs text-muted-foreground">
            Access is granted through your official NIC / Parichay identity.
          </p>
        </div>

        <p className="mt-6 text-center text-xs text-primary-foreground/80">
          Secure • Role-Based • Auditable
        </p>
      </div>
    </div>
  );
}
