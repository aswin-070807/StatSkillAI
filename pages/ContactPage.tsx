import React, { useState } from "react";
import { AppLayout } from "@/components/AppLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Phone, Mail, MapPin, Clock, Send, ShieldCheck, CheckCircle2 } from "lucide-react";

export function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    designation: "",
    department: "",
    subject: "",
    message: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setFormData({
        name: "",
        email: "",
        designation: "",
        department: "",
        subject: "",
        message: "",
      });
    }, 4000);
  };

  return (
    <AppLayout title="Contact & Support Desk" subtitle="Official support directory and helpdesk for MoSPI officers">
      <div className="space-y-8">
        {/* Page Header */}
        <div className="border-b border-border pb-6">
          <div className="flex items-center gap-2 text-xs font-semibold text-secondary uppercase tracking-wider mb-1">
            <ShieldCheck className="size-4" /> Official MoSPI Support Directory
          </div>
          <h1 className="text-2xl font-extrabold sm:text-3xl text-foreground">
            Contact & Support Desk
          </h1>
          <p className="text-sm text-muted-foreground mt-1 max-w-3xl">
            Get in touch with the StatSkill AI administration, technical support team, or nodal officers at the Ministry of Statistics & Programme Implementation (MoSPI).
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Contact Details & Office Info */}
          <div className="space-y-6 lg:col-span-1">
            <Card className="shadow-card border-border">
              <CardHeader>
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <MapPin className="size-5 text-primary" /> Central Office
                </CardTitle>
                <CardDescription>Ministry Headquarters</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 text-xs text-muted-foreground">
                <p className="leading-relaxed">
                  <strong className="text-foreground block">Ministry of Statistics & Programme Implementation</strong>
                  Khurshid Lal Bhawan, Janpath, Connaught Place, New Delhi - 110001
                </p>
                <div className="border-t border-border pt-3 space-y-2">
                  <div className="flex items-center gap-2 text-foreground font-medium">
                    <Phone className="size-4 text-secondary" /> Toll-Free Helpline: 1800-11-2026
                  </div>
                  <div className="flex items-center gap-2 text-foreground font-medium">
                    <Mail className="size-4 text-secondary" /> support-statskill@mospi.gov.in
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Clock className="size-4 text-secondary" /> Working Hours: Mon - Fri (9:00 AM - 6:00 PM IST)
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-card border-border">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-bold">Nodal Officer Contacts</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-xs">
                <div className="border-b border-border pb-2.5">
                  <p className="font-semibold text-foreground">Director (Training & Capacity Building)</p>
                  <p className="text-muted-foreground">National Statistical Systems Training Academy (NSSTA)</p>
                  <p className="text-secondary font-mono mt-0.5">nssta-training@mospi.gov.in</p>
                </div>
                <div>
                  <p className="font-semibold text-foreground">Technical Helpdesk Lead</p>
                  <p className="text-muted-foreground">StatSkill AI Platform Division</p>
                  <p className="text-secondary font-mono mt-0.5">helpdesk-ai@mospi.gov.in</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Official Inquiry Form */}
          <div className="lg:col-span-2">
            <Card className="shadow-card border-border">
              <CardHeader>
                <CardTitle className="text-base font-bold">Submit Official Inquiry or Feedback</CardTitle>
                <CardDescription>
                  Officers and users may submit technical queries, competency mapping requests, or platform support tickets below.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {submitted ? (
                  <div className="rounded-lg bg-success/15 border border-success/30 p-6 text-center space-y-2">
                    <CheckCircle2 className="size-10 text-success mx-auto" />
                    <h3 className="text-base font-bold text-foreground">Inquiry Submitted Successfully</h3>
                    <p className="text-xs text-muted-foreground max-w-md mx-auto">
                      Thank you. Your message has been dispatched to the MoSPI StatSkill AI Support Desk. A confirmation email has been sent to your inbox.
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-4 text-xs">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-1.5">
                        <Label htmlFor="name">Full Name *</Label>
                        <Input
                          id="name"
                          placeholder="e.g. Officer Rajesh Kumar"
                          required
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="email">Official Email Address *</Label>
                        <Input
                          id="email"
                          type="email"
                          placeholder="name@mospi.gov.in"
                          required
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="designation">Designation / Role</Label>
                        <Input
                          id="designation"
                          placeholder="e.g. Senior Statistical Officer"
                          value={formData.designation}
                          onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="department">Department / Office</Label>
                        <Input
                          id="department"
                          placeholder="e.g. NSSO (FOD) Delhi"
                          value={formData.department}
                          onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="subject">Subject / Topic *</Label>
                      <Input
                        id="subject"
                        placeholder="e.g. Query regarding Statistical Competency Diagnostic"
                        required
                        value={formData.subject}
                        onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="message">Detailed Inquiry *</Label>
                      <Textarea
                        id="message"
                        rows={5}
                        placeholder="Please describe your question or issue in detail..."
                        required
                        value={formData.message}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      />
                    </div>

                    <Button type="submit" className="bg-primary text-primary-foreground font-semibold px-6 gap-2">
                      <Send className="size-4" /> Submit Official Inquiry
                    </Button>
                  </form>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
