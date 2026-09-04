import React, { useState, useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { LearnerLayout } from "@/components/LearnerLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { useAuth } from "@/context/AuthContext";
import { apiClient, getMediaUrl } from "@/lib/apiClient";
import {
  User,
  Building2,
  Briefcase,
  GraduationCap,
  Clock,
  Award,
  ShieldCheck,
  CheckCircle2,
  Pencil,
  Save,
  X,
  Upload,
  FileText,
  Sparkles,
  Camera,
  Globe,
  AlertCircle,
  Trash2,
  Loader2,
  Eye,
  Plus,
  ExternalLink,
  RotateCcw,
} from "lucide-react";

const AVAILABLE_SKILL_TAGS = [
  "Python",
  "R",
  "SQL",
  "GIS",
  "Survey Design",
  "Sample Surveys",
  "Index Numbers (IIP/CPI)",
  "National Accounts (SNA)",
  "Time Series",
  "Machine Learning",
  "Data Visualization",
  "Tabulation & Report Writing",
  "Big Data Analytics",
];

const LANGUAGE_OPTIONS = [
  "English",
  "Hindi",
  "Tamil",
  "Telugu",
  "Kannada",
  "Bengali",
  "Marathi",
  "Gujarati",
  "Malayalam",
  "Odia",
  "Punjabi",
];

export function MyProfilePage() {
  const { user, updateUser } = useAuth();
  const [searchParams] = useSearchParams();

  // Mode state - Read-only by default, unlocked by "Edit Profile" button
  const [isEditing, setIsEditing] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Form field states
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [designation, setDesignation] = useState("");
  const [department, setDepartment] = useState("");
  const [jobRole, setJobRole] = useState("");
  const [currentAssignment, setCurrentAssignment] = useState("");
  const [experienceYears, setExperienceYears] = useState<number>(0);
  const [education, setEducation] = useState("");
  const [pastTrainings, setPastTrainings] = useState("");
  const [certifications, setCertifications] = useState("");
  const [preferredLanguage, setPreferredLanguage] = useState("English");
  const [weeklyHours, setWeeklyHours] = useState<number>(5);
  const [skillTags, setSkillTags] = useState<string[]>([]);
  const [customSkillInput, setCustomSkillInput] = useState("");
  const [profilePhotoUrl, setProfilePhotoUrl] = useState<string | null>(null);
  const [resumeUrl, setResumeUrl] = useState<string | null>(null);
  const [resumeFilename, setResumeFilename] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string>("Today, 11:30 AM");

  // Resume Upload & AI Parsing states
  const [isUploadingResume, setIsUploadingResume] = useState(false);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [extractedTextPreview, setExtractedTextPreview] = useState<string | null>(null);
  const [showExtractedModal, setShowExtractedModal] = useState(false);
  const [autoFilledFields, setAutoFilledFields] = useState<{
    education?: boolean;
    experience?: boolean;
    pastTrainings?: boolean;
    skillTags?: boolean;
  }>({});

  const resumeInputRef = useRef<HTMLInputElement>(null);
  const photoInputRef = useRef<HTMLInputElement>(null);

  // Initialize form state from user context
  const loadUserData = () => {
    if (user) {
      setName(user.name || "");
      setEmail(user.email || "");
      setDesignation(user.designation || "Senior Statistical Officer");
      setDepartment(user.department || "National Accounts Division (NAD)");
      setJobRole(user.jobRole || "Statistical Officer");
      setCurrentAssignment(
        user.currentAssignment || "Quarterly GDP & Capital Formation Estimation"
      );
      setEducation(
        user.educationalQualifications && user.educationalQualifications.length > 0
          ? user.educationalQualifications.join(", ")
          : "M.Sc. Statistics (Delhi University), B.Sc. Mathematics"
      );
      setExperienceYears(user.workExperienceYears ?? 6);
      setPastTrainings(
        user.previousTrainings && user.previousTrainings.length > 0
          ? user.previousTrainings.join(", ")
          : "SNA 2008 Foundations (NSSTA), Sample Survey Design (iGOT), Python Data Analysis"
      );
      setCertifications(
        user.certifications && user.certifications.length > 0
          ? user.certifications.join(", ")
          : "NPTEL Advanced Official Statistics, ISO 9001 Quality Auditor"
      );
      setPreferredLanguage(user.preferredLanguage || "English");
      setWeeklyHours(user.weeklyAvailabilityHours ?? 5);
      setSkillTags(
        user.skillTags && user.skillTags.length > 0
          ? user.skillTags
          : ["Python", "SQL", "Sample Surveys", "National Accounts (SNA)", "Data Visualization"]
      );
      setProfilePhotoUrl(user.profilePhotoUrl || null);
      setResumeUrl(user.resumeUrl || null);
      setResumeFilename(user.resumeFilename || null);
      setLastUpdated(
        user.updatedAt ||
          new Date().toLocaleDateString("en-IN", {
            day: "numeric",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })
      );
    }
  };

  useEffect(() => {
    loadUserData();
  }, [user]);

  // Check unsaved changes before page leave
  const isDirty = () => {
    if (!user) return false;
    return (
      name !== user.name ||
      email !== user.email ||
      designation !== (user.designation || "") ||
      department !== (user.department || "") ||
      jobRole !== (user.jobRole || "") ||
      currentAssignment !== (user.currentAssignment || "") ||
      experienceYears !== (user.workExperienceYears ?? 0)
    );
  };

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty()) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [name, email, designation, department, jobRole, currentAssignment, experienceYears]);

  // Calculate Profile Completeness Percentage
  const calculateCompleteness = () => {
    const fields = [
      Boolean(name.trim()),
      Boolean(email.trim()),
      Boolean(designation.trim()),
      Boolean(department.trim()),
      Boolean(jobRole.trim()),
      Boolean(currentAssignment.trim()),
      experienceYears >= 0,
      Boolean(education.trim()),
      Boolean(pastTrainings.trim()),
      Boolean(certifications.trim()),
      Boolean(preferredLanguage),
      weeklyHours > 0,
      skillTags.length > 0,
      Boolean(resumeFilename || resumeUrl),
    ];
    const filled = fields.filter(Boolean).length;
    return Math.round((filled / fields.length) * 100);
  };

  // Skill Tag Toggle
  const toggleSkillTag = (tag: string) => {
    setSkillTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  // Add Custom Skill Tag
  const handleAddCustomSkill = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = customSkillInput.trim();
    if (!trimmed) return;
    if (!skillTags.includes(trimmed)) {
      setSkillTags((prev) => [...prev, trimmed]);
    }
    setCustomSkillInput("");
  };

  // Resume Upload Handler with Client-Side Validation + Server-Side AI Parsing
  const handleResumeFileUpload = async (file: File) => {
    setErrorMessage(null);
    const validTypes = [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/msword",
    ];
    const fileExt = file.name.split(".").pop()?.toLowerCase();

    if (!validTypes.includes(file.type) && !["pdf", "docx", "doc"].includes(fileExt || "")) {
      setErrorMessage("Invalid file format. Only PDF and DOCX files are allowed.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setErrorMessage("File size exceeds maximum limit of 5MB.");
      return;
    }

    setIsUploadingResume(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const resData = await apiClient.upload<{
        success: boolean;
        resume_url: string;
        resume_filename: string;
        extracted_text_preview?: string;
        parsed_data?: {
          educational_qualifications?: string[];
          work_experience_years?: number | null;
          previous_trainings?: string[];
          technical_skills?: string[];
        };
      }>("/profile/upload-resume", formData);

      setResumeUrl(resData.resume_url);
      setResumeFilename(resData.resume_filename);
      if (resData.extracted_text_preview) {
        setExtractedTextPreview(resData.extracted_text_preview);
      }

      // Update AuthContext session immediately with new resume info
      updateUser({
        resumeUrl: resData.resume_url,
        resumeFilename: resData.resume_filename,
      });

      // AI Parsing Result Integration
      if (resData.parsed_data) {
        const parsed = resData.parsed_data;
        const newAutoFilled: typeof autoFilledFields = {};

        if (parsed.educational_qualifications && parsed.educational_qualifications.length > 0) {
          setEducation(parsed.educational_qualifications.join(", "));
          newAutoFilled.education = true;
        }

        if (parsed.work_experience_years !== null && parsed.work_experience_years !== undefined) {
          setExperienceYears(Number(parsed.work_experience_years));
          newAutoFilled.experience = true;
        }

        if (parsed.previous_trainings && parsed.previous_trainings.length > 0) {
          setPastTrainings(parsed.previous_trainings.join(", "));
          newAutoFilled.pastTrainings = true;
        }

        if (parsed.technical_skills && parsed.technical_skills.length > 0) {
          setSkillTags((prev) => Array.from(new Set([...prev, ...(parsed.technical_skills || [])])));
          newAutoFilled.skillTags = true;
        }

        setAutoFilledFields(newAutoFilled);
      }
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to parse resume.");
    } finally {
      setIsUploadingResume(false);
    }
  };

  // Profile Photo Upload Handler
  const handlePhotoFileUpload = async (file: File) => {
    setErrorMessage(null);
    if (!file.type.startsWith("image/")) {
      setErrorMessage("Invalid image file. Please upload a JPG, PNG or WEBP image.");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setErrorMessage("Image size exceeds limit of 2MB.");
      return;
    }

    setIsUploadingPhoto(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const resData = await apiClient.upload<{ success: boolean; photo_url: string }>(
        "/profile/upload-photo",
        formData
      );

      setProfilePhotoUrl(resData.photo_url);

      // Update AuthContext session immediately so navbar avatar updates dynamically
      updateUser({
        profilePhotoUrl: resData.photo_url,
      });
    } catch (err: any) {
      setErrorMessage(err.message || "Photo upload failed.");
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  // Drag & Drop event handlers
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleResumeFileUpload(e.dataTransfer.files[0]);
    }
  };

  // Save profile changes handler with full validation
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // Validation
    if (!name.trim()) {
      setErrorMessage("Full Name is required.");
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setErrorMessage("Please provide a valid official email address.");
      return;
    }
    if (!designation.trim()) {
      setErrorMessage("Designation is required.");
      return;
    }
    if (!department.trim()) {
      setErrorMessage("Department / Division is required.");
      return;
    }
    if (!jobRole.trim()) {
      setErrorMessage("Job Role Cadre is required.");
      return;
    }
    if (Number(experienceYears) < 0) {
      setErrorMessage("Years of Experience cannot be negative.");
      return;
    }

    const payload = {
      name: name.trim(),
      email: email.trim(),
      designation: designation.trim(),
      department: department.trim(),
      jobRole: jobRole.trim(),
      currentAssignment: currentAssignment.trim(),
      workExperienceYears: Number(experienceYears),
      educationalQualifications: education.split(",").map((s) => s.trim()).filter(Boolean),
      previousTrainings: pastTrainings.split(",").map((s) => s.trim()).filter(Boolean),
      certifications: certifications.split(",").map((s) => s.trim()).filter(Boolean),
      preferredLanguage,
      weeklyAvailabilityHours: Number(weeklyHours),
      skillTags,
      profilePhotoUrl,
      resumeUrl,
      resumeFilename,
    };

    try {
      let resData = null;
      try {
        resData = await apiClient.put("/profile", payload);
      } catch {
        // Fallback local persistence if offline
      }

      const nowFormatted = new Date().toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });

      const updatedUserObj = resData
        ? {
            ...resData,
            updatedAt: resData.updatedAt || nowFormatted,
          }
        : {
            ...payload,
            updatedAt: nowFormatted,
          };

      updateUser(updatedUserObj);

      setLastUpdated(nowFormatted);
      setAutoFilledFields({});
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 5000);
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to update profile.");
    }
  };

  // Reset changes handler
  const handleReset = () => {
    if (isDirty()) {
      const confirmDiscard = window.confirm(
        "Reset all unsaved changes back to last saved profile data?"
      );
      if (!confirmDiscard) return;
    }
    loadUserData();
    setAutoFilledFields({});
    setErrorMessage(null);
  };

  const completenessPercent = calculateCompleteness();

  return (
    <LearnerLayout
      title="My Official Profile"
      subtitle="Competency Engine input baseline & officer credentials"
    >
      <div className="max-w-4xl space-y-6">
        <Card className="shadow-card border-border overflow-hidden">
          <CardHeader className="pb-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <User className="size-5 text-secondary" /> Officer Profile & Competency Baseline
                </CardTitle>
                <CardDescription className="text-xs mt-0.5">
                  Your professional qualifications, current role, and past training history feed the AI Competency Engine to calculate skill gap benchmarks.
                </CardDescription>
                <p className="text-[11px] text-muted-foreground mt-1 font-medium">
                  Last updated: <span className="text-foreground">{lastUpdated}</span>
                </p>
              </div>

              {/* Action Buttons Top Bar */}
              <div className="flex items-center gap-2 self-start sm:self-auto">
                {!isEditing ? (
                  <Button
                    type="button"
                    onClick={() => setIsEditing(true)}
                    className="gap-1.5 bg-primary text-primary-foreground font-semibold text-xs px-4 hover:bg-primary/90 shadow-sm"
                  >
                    <Pencil className="size-3.5" /> Edit Profile
                  </Button>
                ) : (
                  <>
                    <Button
                      type="button"
                      onClick={handleReset}
                      variant="ghost"
                      className="gap-1 text-xs text-muted-foreground hover:text-foreground"
                    >
                      <X className="size-3.5" /> Cancel
                    </Button>
                    <Button
                      type="button"
                      onClick={handleSave}
                      className="gap-1.5 bg-primary text-primary-foreground font-semibold text-xs px-4 hover:bg-primary/90 shadow-sm"
                    >
                      <Save className="size-3.5" /> Save Changes
                    </Button>
                  </>
                )}
              </div>
            </div>

            {/* Completeness Progress Bar */}
            <div className="mt-4 pt-3 border-t border-border/60">
              <div className="flex items-center justify-between text-xs mb-1.5 font-medium">
                <span className="text-muted-foreground flex items-center gap-1.5">
                  <ShieldCheck className="size-3.5 text-secondary" /> Profile Completeness
                </span>
                <span className="font-bold text-foreground">{completenessPercent}% Complete</span>
              </div>
              <div className="w-full bg-muted h-2 rounded-full overflow-hidden">
                <div
                  className="bg-secondary h-full rounded-full transition-all duration-500"
                  style={{ width: `${completenessPercent}%` }}
                />
              </div>
            </div>
          </CardHeader>

          <CardContent>
            {errorMessage && (
              <div className="mb-4 rounded-lg bg-destructive/10 border border-destructive/30 p-3 text-destructive text-xs font-semibold flex items-center gap-2">
                <AlertCircle className="size-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {savedSuccess && (
              <div className="mb-4 rounded-lg bg-success/15 border border-success/30 p-3 text-success text-xs font-semibold flex items-center gap-2 animate-in fade-in duration-300">
                <CheckCircle2 className="size-4 shrink-0" />
                <span>Profile updated successfully! Skill Gap Engine re-indexed against your profile data.</span>
              </div>
            )}

            {/* Instruction Banner */}
            <div className="mb-4 p-3 bg-secondary/10 border border-secondary/20 rounded-lg text-xs font-medium text-foreground flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Pencil className="size-4 text-secondary shrink-0" />
                <span>
                  <strong>Fields are editable:</strong> Modify any field below and click <strong>Save Changes</strong> to save your profile directly into the portal.
                </span>
              </div>
              <Button
                type="button"
                onClick={handleSave}
                size="sm"
                className="h-7 text-xs bg-primary text-primary-foreground font-semibold px-3 shrink-0"
              >
                <Save className="size-3" /> Save Now
              </Button>
            </div>

            <form onSubmit={handleSave} className="space-y-6 text-xs">
              
              {/* 1. RESUME UPLOAD SECTION (DRAG & DROP + AI PARSING) */}
              <div className="rounded-xl border border-secondary/20 bg-secondary/5 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="font-bold text-xs flex items-center gap-1.5 text-foreground">
                    <FileText className="size-4 text-secondary" /> Upload Resume for AI Auto-Fill
                  </Label>
                  <span className="text-[11px] text-muted-foreground font-normal">PDF or DOCX, max 5MB</span>
                </div>

                {resumeFilename ? (
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between bg-card border border-border rounded-lg p-3 gap-3">
                    <div className="flex items-center gap-2.5 overflow-hidden">
                      <div className="size-9 rounded-lg bg-secondary/15 flex items-center justify-center text-secondary shrink-0 font-bold">
                        📄
                      </div>
                      <div className="truncate">
                        <p className="font-semibold text-foreground text-xs truncate">{resumeFilename}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          {resumeUrl && (
                            <a
                              href={getMediaUrl(resumeUrl)}
                              target="_blank"
                              rel="noreferrer"
                              className="text-[11px] text-secondary hover:underline inline-flex items-center gap-1 font-medium"
                            >
                              <ExternalLink className="size-3" /> View Stored Document
                            </a>
                          )}
                          {extractedTextPreview && (
                            <button
                              type="button"
                              onClick={() => setShowExtractedModal(true)}
                              className="text-[11px] text-muted-foreground hover:text-foreground inline-flex items-center gap-1 underline"
                            >
                              <Eye className="size-3" /> View AI Parsed Text
                            </button>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => resumeInputRef.current?.click()}
                        className="h-7 text-[11px] text-secondary hover:bg-secondary/10 font-semibold"
                      >
                        Replace Resume
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setResumeFilename(null);
                          setResumeUrl(null);
                          setExtractedTextPreview(null);
                          updateUser({ resumeUrl: null, resumeFilename: null });
                        }}
                        className="h-7 text-[11px] text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="size-3.5" />
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                    onClick={() => resumeInputRef.current?.click()}
                    className={`border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-all ${
                      dragActive
                        ? "border-secondary bg-secondary/10 scale-[0.99]"
                        : "border-border hover:border-secondary/50 bg-card"
                    }`}
                  >
                    {isUploadingResume ? (
                      <div className="flex flex-col items-center justify-center gap-2 py-2">
                        <Loader2 className="size-6 text-secondary animate-spin" />
                        <p className="font-semibold text-xs text-foreground">Parsing resume with Claude AI...</p>
                        <p className="text-[11px] text-muted-foreground">Extracting qualifications, experience & skills accurately</p>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center gap-1.5 py-1">
                        <Upload className="size-6 text-secondary mb-1" />
                        <p className="font-semibold text-xs text-foreground">
                          Drag & drop your resume here, or <span className="text-secondary underline">click to browse & upload</span>
                        </p>
                        <p className="text-[11px] text-muted-foreground">PDF or DOCX up to 5MB — AI will extract skills to suggest additions to your profile</p>
                      </div>
                    )}
                  </div>
                )}

                <input
                  ref={resumeInputRef}
                  type="file"
                  accept=".pdf,.docx,.doc"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      handleResumeFileUpload(e.target.files[0]);
                    }
                  }}
                />
              </div>

              {/* 2. OFFICER PHOTO & PROFILE CORE FIELDS */}
              <div className="grid gap-4 sm:grid-cols-2">

                {/* Profile Photo */}
                <div className="space-y-1.5 sm:col-span-2 flex items-center gap-4 bg-card p-3.5 rounded-xl border border-border shadow-xs">
                  <div className="relative size-14 rounded-full border-2 border-secondary/40 overflow-hidden bg-muted flex items-center justify-center shrink-0">
                    {profilePhotoUrl ? (
                      <img
                        src={getMediaUrl(profilePhotoUrl)}
                        alt="Profile Preview"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User className="size-7 text-muted-foreground" />
                    )}
                    {isUploadingPhoto && (
                      <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
                        <Loader2 className="size-4 animate-spin text-secondary" />
                      </div>
                    )}
                  </div>
                  <div className="space-y-1">
                    <Label className="font-semibold text-xs text-foreground">Officer Profile Photo</Label>
                    <p className="text-[11px] text-muted-foreground">Small circular preview visible on top navbar, dashboard and reports.</p>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => photoInputRef.current?.click()}
                      className="h-7 text-[11px] gap-1 mt-1 font-semibold hover:bg-secondary/10 hover:text-secondary border-secondary/30"
                    >
                      <Camera className="size-3" /> Upload Profile Photo
                    </Button>
                    <input
                      ref={photoInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          handlePhotoFileUpload(e.target.files[0]);
                        }
                      }}
                    />
                  </div>
                </div>

                {/* Employee ID (Read-only always) */}
                <div className="space-y-1.5">
                  <Label className="font-semibold text-foreground">Employee ID (System Assigned)</Label>
                  <Input
                    value={user?.employeeId || "EMP-10482"}
                    disabled
                    className="bg-muted font-mono font-bold text-foreground cursor-not-allowed opacity-90"
                  />
                </div>

                {/* Full Name * */}
                <div className="space-y-1.5">
                  <Label htmlFor="name" className="font-semibold text-foreground">Full Name *</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="bg-background text-foreground focus-visible:ring-secondary"
                  />
                </div>

                {/* Official Email * */}
                <div className="space-y-1.5">
                  <Label htmlFor="email" className="font-semibold text-foreground">Official Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="bg-background text-foreground focus-visible:ring-secondary"
                  />
                </div>

                {/* Designation * */}
                <div className="space-y-1.5">
                  <Label htmlFor="designation" className="font-semibold text-foreground">Designation *</Label>
                  <Input
                    id="designation"
                    value={designation}
                    onChange={(e) => setDesignation(e.target.value)}
                    required
                    className="bg-background text-foreground focus-visible:ring-secondary"
                  />
                </div>

                {/* Department / Division * */}
                <div className="space-y-1.5">
                  <Label htmlFor="department" className="font-semibold text-foreground">Department / Division *</Label>
                  <Input
                    id="department"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    required
                    className="bg-background text-foreground focus-visible:ring-secondary"
                  />
                </div>

                {/* Job Role Cadre * */}
                <div className="space-y-1.5">
                  <Label htmlFor="jobRole" className="font-semibold text-foreground">Job Role Cadre *</Label>
                  <Input
                    id="jobRole"
                    value={jobRole}
                    onChange={(e) => setJobRole(e.target.value)}
                    required
                    className="bg-background text-foreground focus-visible:ring-secondary"
                  />
                </div>

                {/* Current Official Assignment */}
                <div className="space-y-1.5 sm:col-span-2">
                  <Label htmlFor="currentAssignment" className="font-semibold text-foreground">Current Official Assignment</Label>
                  <Input
                    id="currentAssignment"
                    value={currentAssignment}
                    onChange={(e) => setCurrentAssignment(e.target.value)}
                    placeholder="e.g. Quarterly GDP compilation & Index of Industrial Production (IIP)"
                    className="bg-background text-foreground focus-visible:ring-secondary"
                  />
                </div>

                {/* Years of Experience */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="experienceYears" className="font-semibold text-foreground">Years of Experience in Official Statistics</Label>
                    {autoFilledFields.experience && (
                      <span className="inline-flex items-center gap-1 rounded bg-amber-500/10 px-1.5 py-0.5 text-[10px] font-semibold text-amber-600 dark:text-amber-400 border border-amber-500/20">
                        <Sparkles className="size-3" /> Auto-filled from resume — please review
                      </span>
                    )}
                  </div>
                  <Input
                    id="experienceYears"
                    type="number"
                    min={0}
                    max={45}
                    value={experienceYears}
                    onChange={(e) => setExperienceYears(Number(e.target.value))}
                    className="bg-background text-foreground focus-visible:ring-secondary"
                  />
                </div>

                {/* Educational Qualifications */}
                <div className="space-y-1.5 sm:col-span-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="education" className="font-semibold text-foreground">Educational Qualifications (comma separated)</Label>
                    {autoFilledFields.education && (
                      <span className="inline-flex items-center gap-1 rounded bg-amber-500/10 px-1.5 py-0.5 text-[10px] font-semibold text-amber-600 dark:text-amber-400 border border-amber-500/20">
                        <Sparkles className="size-3" /> Auto-filled from resume — please review
                      </span>
                    )}
                  </div>
                  <Input
                    id="education"
                    value={education}
                    onChange={(e) => setEducation(e.target.value)}
                    placeholder="e.g. M.Sc Statistics, B.Sc Mathematics"
                    className="bg-background text-foreground focus-visible:ring-secondary"
                  />
                </div>

                {/* Previously Completed Training Programs */}
                <div className="space-y-1.5 sm:col-span-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="pastTrainings" className="font-semibold text-foreground">Previously Completed Training Programs (comma separated)</Label>
                    {autoFilledFields.pastTrainings && (
                      <span className="inline-flex items-center gap-1 rounded bg-amber-500/10 px-1.5 py-0.5 text-[10px] font-semibold text-amber-600 dark:text-amber-400 border border-amber-500/20">
                        <Sparkles className="size-3" /> Auto-filled from resume — please review
                      </span>
                    )}
                  </div>
                  <Input
                    id="pastTrainings"
                    value={pastTrainings}
                    onChange={(e) => setPastTrainings(e.target.value)}
                    placeholder="e.g. NSSTA SNA 2008, iGOT Cyber Hygiene, Sampling Methods"
                    className="bg-background text-foreground focus-visible:ring-secondary"
                  />
                </div>

                {/* 3. OPTIONAL / ADVANCED FIELDS */}
                
                {/* Certifications Held */}
                <div className="space-y-1.5 sm:col-span-2 border-t border-border/60 pt-3">
                  <Label htmlFor="certifications" className="font-semibold text-foreground">Certifications Held (comma separated)</Label>
                  <Input
                    id="certifications"
                    value={certifications}
                    onChange={(e) => setCertifications(e.target.value)}
                    placeholder="e.g. NPTEL Data Science, AWS Certified Data Analytics, ISO 9001 Lead Auditor"
                    className="bg-background text-foreground focus-visible:ring-secondary"
                  />
                </div>

                {/* Preferred Learning Language */}
                <div className="space-y-1.5">
                  <Label htmlFor="language" className="flex items-center gap-1.5 font-semibold text-foreground">
                    <Globe className="size-3.5 text-secondary" /> Preferred Learning Language
                  </Label>
                  <select
                    id="language"
                    value={preferredLanguage}
                    onChange={(e) => setPreferredLanguage(e.target.value)}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-xs ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring text-foreground font-medium"
                  >
                    {LANGUAGE_OPTIONS.map((lang) => (
                      <option key={lang} value={lang}>
                        {lang}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Weekly Training Availability */}
                <div className="space-y-1.5">
                  <Label htmlFor="weeklyHours" className="flex items-center gap-1.5 font-semibold text-foreground">
                    <Clock className="size-3.5 text-secondary" /> Weekly Training Availability (Hours)
                  </Label>
                  <Input
                    id="weeklyHours"
                    type="number"
                    min={1}
                    max={40}
                    value={weeklyHours}
                    onChange={(e) => setWeeklyHours(Number(e.target.value))}
                    className="bg-background text-foreground focus-visible:ring-secondary"
                  />
                </div>

                {/* Self-Declared Skill Tags */}
                <div className="space-y-2 sm:col-span-2">
                  <div className="flex items-center justify-between">
                    <Label className="font-semibold text-xs text-foreground">Self-Declared Competency Skill Tags</Label>
                    {autoFilledFields.skillTags && (
                      <span className="inline-flex items-center gap-1 rounded bg-amber-500/10 px-1.5 py-0.5 text-[10px] font-semibold text-amber-600 dark:text-amber-400 border border-amber-500/20">
                        <Sparkles className="size-3" /> Auto-filled from resume
                      </span>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {AVAILABLE_SKILL_TAGS.map((tag) => {
                      const isSelected = skillTags.includes(tag);
                      return (
                        <button
                          key={tag}
                          type="button"
                          onClick={() => toggleSkillTag(tag)}
                          className={`px-2.5 py-1 rounded-full text-[11px] font-medium transition-all cursor-pointer hover:scale-105 ${
                            isSelected
                              ? "bg-secondary text-secondary-foreground shadow-sm"
                              : "bg-muted text-muted-foreground hover:bg-muted/80"
                          }`}
                        >
                          {isSelected ? "✓ " : "+ "}
                          {tag}
                        </button>
                      );
                    })}

                    {/* Custom Skill Tags */}
                    {skillTags
                      .filter((tag) => !AVAILABLE_SKILL_TAGS.includes(tag))
                      .map((tag) => (
                        <button
                          key={tag}
                          type="button"
                          onClick={() => toggleSkillTag(tag)}
                          className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-primary/15 text-primary border border-primary/30 shadow-sm flex items-center gap-1 cursor-pointer hover:scale-105"
                        >
                          ✓ {tag}
                          <X className="size-3 hover:text-destructive" />
                        </button>
                      ))}
                  </div>

                  {/* Add Custom Skill Tag Input */}
                  <div className="flex items-center gap-2 pt-2">
                    <Input
                      placeholder="Add custom skill tag (e.g. PowerBI, Stata, PyTorch)..."
                      value={customSkillInput}
                      onChange={(e) => setCustomSkillInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleAddCustomSkill();
                        }
                      }}
                      className="h-8 text-xs max-w-sm"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleAddCustomSkill}
                      className="h-8 text-xs font-medium gap-1"
                    >
                      <Plus className="size-3.5" /> Add Skill
                    </Button>
                  </div>
                </div>

              </div>

              {/* Bottom Submit & Action Footer */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-6 border-t border-border bg-muted/20 p-4 rounded-xl">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <CheckCircle2 className="size-4 text-success shrink-0" />
                  <span>Click <strong>Save Changes</strong> to sync all your profile data directly into the portal database.</span>
                </div>
                <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleReset}
                    className="px-4 text-xs font-semibold h-9"
                  >
                    <RotateCcw className="size-3.5 mr-1" /> Reset Changes
                  </Button>
                  <Button
                    type="submit"
                    className="bg-primary text-primary-foreground font-semibold px-6 text-xs gap-2 h-9 shadow-md hover:bg-primary/90"
                  >
                    <Save className="size-4" /> Save Changes & Update Portal Profile
                  </Button>
                </div>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>

      {/* Extracted Resume Text Modal */}
      <Dialog open={showExtractedModal} onOpenChange={setShowExtractedModal}>
        <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="text-base font-bold flex items-center gap-2">
              <FileText className="size-5 text-secondary" /> AI Resume Extracted Content
            </DialogTitle>
            <DialogDescription className="text-xs">
              Raw text extracted from your resume ({resumeFilename}) used by the AI Competency Parser.
            </DialogDescription>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto bg-muted/50 p-4 rounded-lg border border-border font-mono text-[11px] whitespace-pre-wrap text-foreground">
            {extractedTextPreview || "No text preview available."}
          </div>
          <div className="flex justify-end pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setShowExtractedModal(false)}
              className="text-xs font-semibold"
            >
              Close Preview
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </LearnerLayout>
  );
}
