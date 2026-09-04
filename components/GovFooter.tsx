import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Shield, Phone, Mail, MapPin, ExternalLink, FileText, CheckCircle2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

export function GovFooter() {
  const [activeModal, setActiveModal] = useState<"privacy" | "terms" | "helpline" | null>(null);
  const { user } = useAuth();
  const isAdmin = user?.role === "admin" || user?.role === "super_admin";

  return (
    <>
      <footer className="border-t border-border bg-card text-foreground">
        {/* Main Footer Content */}
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:py-12">
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {/* Govt & Ministry Info */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="flex size-8 items-center justify-center rounded-md bg-primary text-primary-foreground font-bold text-xs">
                  MoSPI
                </div>
                <span className="font-bold text-sm tracking-tight text-foreground">
                  StatSkill AI Platform
                </span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                National AI-enabled competency mapping & skill intelligence system for India's Official Statistical System.
              </p>
              <div className="flex items-center gap-2 text-[11px] font-semibold text-primary">
                <Shield className="size-3.5" /> Affiliated with MoSPI & iGOT Karmayogi
              </div>
            </div>

            {/* Quick Links */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-foreground">
                Quick Links
              </h4>
              <ul className="space-y-2 text-xs text-muted-foreground">
                <li>
                  <Link to="/" className="hover:text-primary transition-colors">
                    Home
                  </Link>
                </li>
                <li>
                  <Link to="/competency" className="hover:text-primary transition-colors">
                    Competency Framework
                  </Link>
                </li>
                <li>
                  <Link to="/contact" className="hover:text-primary transition-colors">
                    Contact
                  </Link>
                </li>
                <li>
                  {user ? (
                    <Link to={isAdmin ? "/admin-dashboard" : "/dashboard"} className="hover:text-primary transition-colors font-semibold text-primary">
                      My Dashboard
                    </Link>
                  ) : (
                    <Link to="/login" className="hover:text-primary transition-colors">
                      Sign In
                    </Link>
                  )}
                </li>
              </ul>
            </div>

            {/* Legal & Policy */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-foreground">
                Policies & Help
              </h4>
              <ul className="space-y-2 text-xs text-muted-foreground">
                <li>
                  <button
                    onClick={() => setActiveModal("privacy")}
                    className="hover:text-primary transition-colors text-left"
                  >
                    Privacy Policy
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setActiveModal("terms")}
                    className="hover:text-primary transition-colors text-left"
                  >
                    Terms of Service & Usage
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setActiveModal("helpline")}
                    className="hover:text-primary transition-colors text-left"
                  >
                    Helpline & Support Desk
                  </button>
                </li>
                <li>
                  <a href="/contact" className="hover:text-primary transition-colors">
                    Nodal Officers Directory
                  </a>
                </li>
                <li>
                  <a
                    href="https://mospi.gov.in"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 hover:text-primary transition-colors"
                  >
                    MoSPI Official Website <ExternalLink className="size-3" />
                  </a>
                </li>
              </ul>
            </div>

            {/* Support Desk */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-foreground">
                MoSPI Support Desk
              </h4>
              <div className="space-y-2 text-xs text-muted-foreground">
                <div className="flex items-start gap-2">
                  <MapPin className="size-4 shrink-0 text-secondary mt-0.5" />
                  <span>Khurshid Lal Bhawan, Janpath, New Delhi - 110001</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="size-4 shrink-0 text-secondary" />
                  <span>Toll-Free Helpline: 1800-11-2026</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="size-4 shrink-0 text-secondary" />
                  <span>support-statskill@mospi.gov.in</span>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Copyright Strip */}
          <div className="mt-10 pt-6 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-muted-foreground">
            <p className="font-semibold text-foreground/80 text-xs">
              © 2026 StatSkill AI. Built by Team Byte Blazers.
            </p>
            <div className="flex items-center gap-4">
              <button onClick={() => setActiveModal("privacy")} className="hover:underline">
                Privacy
              </button>
              <span>•</span>
              <button onClick={() => setActiveModal("terms")} className="hover:underline">
                Terms
              </button>
              <span>•</span>
              <button onClick={() => setActiveModal("helpline")} className="hover:underline">
                Helpline
              </button>
            </div>
          </div>
        </div>
      </footer>

      {/* Privacy Policy Modal */}
      <Dialog open={activeModal === "privacy"} onOpenChange={(o) => !o && setActiveModal(null)}>
        <DialogContent className="sm:max-w-lg border-border bg-card">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-foreground flex items-center gap-2">
              <Shield className="size-5 text-primary" /> MoSPI Privacy Policy
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Official data protection and privacy guidelines for government officers.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 text-xs text-foreground leading-relaxed py-2">
            <p>
              The StatSkill AI platform complies strictly with the Digital Personal Data Protection (DPDP) Act, 2023 and CERT-In security protocols for official government platforms.
            </p>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground text-[11px]">
              <li>All employee competency metrics and assessment scores are stored in encrypted databases.</li>
              <li>Data is strictly accessible only to authorized departmental administrators and supervisors.</li>
              <li>No personal or performance data is shared with non-government third parties.</li>
            </ul>
          </div>
        </DialogContent>
      </Dialog>

      {/* Terms Modal */}
      <Dialog open={activeModal === "terms"} onOpenChange={(o) => !o && setActiveModal(null)}>
        <DialogContent className="sm:max-w-lg border-border bg-card">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-foreground flex items-center gap-2">
              <FileText className="size-5 text-primary" /> Terms of Service & Usage
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Official usage guidelines for Ministry officers and personnel.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 text-xs text-foreground leading-relaxed py-2">
            <p>
              By accessing the StatSkill AI Platform, officers agree to conduct diagnostic assessments honestly and utilize learning resources for official competency development.
            </p>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground text-[11px]">
              <li>Unauthorized sharing of assessment questions or credentials is strictly prohibited.</li>
              <li>Certifications issued are officially tracked in the MoSPI workforce registry.</li>
            </ul>
          </div>
        </DialogContent>
      </Dialog>

      {/* Helpline Modal */}
      <Dialog open={activeModal === "helpline"} onOpenChange={(o) => !o && setActiveModal(null)}>
        <DialogContent className="sm:max-w-lg border-border bg-card">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-foreground flex items-center gap-2">
              <Phone className="size-5 text-primary" /> National Helpline & Support Desk
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              24/7 technical and administrative support for statistical officers.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 text-xs text-foreground py-2">
            <div className="rounded-lg border border-border p-3 bg-muted/30 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-foreground">Toll-Free Helpline</span>
                <span className="font-bold text-secondary">1800-11-2026</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-semibold text-foreground">Official Email</span>
                <span className="text-muted-foreground">support-statskill@mospi.gov.in</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-semibold text-foreground">Working Hours</span>
                <span className="text-muted-foreground">Mon - Fri: 9:00 AM - 6:00 PM IST</span>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
