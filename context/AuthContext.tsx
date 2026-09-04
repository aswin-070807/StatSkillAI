import React, { createContext, useContext, useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { apiClient, setStoredToken, removeStoredToken, getStoredToken } from "@/lib/apiClient";
import {
  loginUserAccount,
  registerAdminAccount,
  registerLearnerAccount,
  verifyEmailToken,
  resendVerificationEmailToken,
  validateOrgCode,
  UserAccount,
  Organization,
} from "@/lib/mockAuthStore";

export interface AuthSession {
  access_token: string;
}

export type UserRole = "learner" | "admin" | "employee" | "trainer" | "super_admin";

export interface User {
  id: string;
  employeeId: string;
  name: string;
  email: string;
  designation: string;
  department: string;
  jobRole: string;
  role: UserRole;
  status?: "pending_verification" | "active";
  organizationId?: string | null;
  organizationName?: string;
  adminRole?: string;
  orgCode?: string;
  currentAssignment?: string;
  educationalQualifications?: string[];
  workExperienceYears?: number;
  previousTrainings?: string[];
  certifications?: string[];
  preferredLanguage?: string;
  weeklyAvailabilityHours?: number;
  skillTags?: string[];
  profilePhotoUrl?: string | null;
  resumeUrl?: string | null;
  resumeFilename?: string | null;
  updatedAt?: string;
  is_approved?: boolean;
  admin_justification?: string;
  competencyScores?: Record<string, number>;
}

export interface LearnerSignUpData {
  name: string;
  email: string;
  password: string;
  designation: string;
  orgCode: string;
}

export interface AdminSignUpData {
  name: string;
  email: string;
  password: string;
  adminRole: string;
  organizationName: string;
}

interface AuthContextType {
  user: User | null;
  session: AuthSession | null;
  loading: boolean;
  login: (email: string, password: string, expectedRole?: "learner" | "admin") => Promise<{ error: Error | null; user?: User; requiresVerification?: boolean }>;
  signupLearner: (data: LearnerSignUpData) => Promise<{ error: Error | null; user?: User; organization?: Organization; verificationToken?: string }>;
  signupAdmin: (data: AdminSignUpData) => Promise<{ error: Error | null; user?: User; organization?: Organization; verificationToken?: string }>;
  verifyEmail: (email: string, token: string) => Promise<{ success: boolean; user?: User }>;
  resendVerification: (email: string) => Promise<{ success: boolean; token?: string }>;
  validateOrgCode: (code: string) => { valid: boolean; organization?: Organization };
  logout: () => Promise<{ error: Error | null }>;
  updateUser: (partialUser: Partial<User>) => void;
}

const LOCAL_STORAGE_SESSION_KEY = "statskill_user_session_v2";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function mapAccountToUser(acc: UserAccount): User {
  return {
    id: acc.id,
    employeeId: acc.employeeId,
    name: acc.name,
    email: acc.email,
    designation: acc.designation || (acc.role === "admin" ? "Administrator" : "Statistical Officer"),
    department: acc.organizationName || "Ministry of Statistics & Programme Implementation",
    jobRole: acc.role === "admin" ? (acc.adminRole || "Admin") : (acc.designation || "Officer"),
    role: acc.role,
    status: acc.status,
    organizationId: acc.organizationId,
    organizationName: acc.organizationName,
    adminRole: acc.adminRole,
  };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<{ access_token: string } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const checkInitialSession = async () => {
      const token = getStoredToken();
      const rawSession = localStorage.getItem(LOCAL_STORAGE_SESSION_KEY);

      if (token) {
        try {
          const profile = await apiClient.get<User>("/auth/me");
          if (isMounted && profile) {
            setUser(profile);
            setSession({ access_token: token });
            localStorage.setItem(LOCAL_STORAGE_SESSION_KEY, JSON.stringify(profile));
            setLoading(false);
            return;
          }
        } catch (err: any) {
          if (err?.status === 401) {
            removeStoredToken();
            localStorage.removeItem(LOCAL_STORAGE_SESSION_KEY);
          } else if (rawSession) {
            try {
              const cached = JSON.parse(rawSession);
              if (isMounted && cached) {
                setUser(cached);
                setSession({ access_token: token });
                setLoading(false);
                return;
              }
            } catch {
              // ignore
            }
          }
        }
      } else if (rawSession) {
        try {
          const parsed = JSON.parse(rawSession);
          if (isMounted && parsed) {
            setUser(parsed);
            setLoading(false);
            return;
          }
        } catch {
          localStorage.removeItem(LOCAL_STORAGE_SESSION_KEY);
        }
      }

      if (isMounted) {
        setUser(null);
        setSession(null);
        setLoading(false);
      }
    };

    checkInitialSession();

    return () => {
      isMounted = false;
    };
  }, []);

  const login = async (email: string, password: string, expectedRole?: "learner" | "admin") => {
    setLoading(true);
    const normalizedEmail = email.toLowerCase().trim();

    // 1. Primary: FastAPI backend login
    try {
      const res = await apiClient.post<{ access_token: string; user: User }>("/auth/login", {
        email: normalizedEmail,
        password,
      });

      if (res.access_token && res.user) {
        setStoredToken(res.access_token);
        setUser(res.user);
        setSession({ access_token: res.access_token });
        localStorage.setItem(LOCAL_STORAGE_SESSION_KEY, JSON.stringify(res.user));
        setLoading(false);
        return { error: null, user: res.user };
      }
    } catch (err: any) {
      if (err?.status === 403 || err?.message?.toLowerCase().includes("verify your email")) {
        setLoading(false);
        return {
          error: new Error("Please verify your email before logging in. Check your inbox for the verification link."),
          requiresVerification: true,
        };
      }
      if (err?.status === 401) {
        setLoading(false);
        return { error: new Error("Invalid email credentials or password.") };
      }
      if (err?.status === 404) {
        setLoading(false);
        return { error: new Error("Account not found. Please check your email or register.") };
      }
      if (err?.status === 429) {
        setLoading(false);
        return { error: new Error("Too many sign-in attempts. Please wait a moment and try again.") };
      }
      // If network error / backend offline, fallback to mock store for local demo accounts
      console.warn("Backend login failed or unreachable, checking local demo store:", err);
    }

    // 2. Fallback: Local demo store
    const mockRes = loginUserAccount(normalizedEmail, password, expectedRole);
    if (mockRes.user) {
      if (mockRes.requiresVerification) {
        setLoading(false);
        return {
          error: new Error("Please verify your email before logging in. Check your inbox for the verification link."),
          requiresVerification: true,
          user: mapAccountToUser(mockRes.user),
        };
      }
      const loggedInUser = mapAccountToUser(mockRes.user);
      setUser(loggedInUser);
      setSession({ access_token: "mock_demo_token" });
      localStorage.setItem(LOCAL_STORAGE_SESSION_KEY, JSON.stringify(loggedInUser));
      setLoading(false);
      return { error: null, user: loggedInUser };
    }

    setLoading(false);
    return { error: mockRes.error || new Error("Invalid email or password.") };
  };

  const signupLearner = async (data: LearnerSignUpData) => {
    setLoading(true);
    const normalizedEmail = data.email.toLowerCase().trim();
    let backendToken: string | undefined;
    let backendUser: User | undefined;

    // 1. Primary: Submit to FastAPI backend /auth/signup
    try {
      const apiRes = await apiClient.post<{
        access_token: string;
        user: User;
        requires_verification?: boolean;
        verification_token?: string;
      }>("/auth/signup", {
        name: data.name.trim(),
        email: normalizedEmail,
        password: data.password,
        designation: data.designation.trim() || "Statistical Officer",
        orgCode: data.orgCode.trim(),
      });

      if (apiRes) {
        backendUser = apiRes.user;
        backendToken = apiRes.verification_token;
      }
    } catch (err: any) {
      // If duplicate email error from backend
      if (err?.status === 400 || err?.status === 409 || err?.message?.toLowerCase().includes("already exists")) {
        setLoading(false);
        return { error: new Error("An account with this email address already exists. Please sign in instead.") };
      }
      if (err?.status === 422) {
        setLoading(false);
        return { error: new Error("Invalid registration details. Please check all fields and try again.") };
      }
      console.warn("Backend signup notice:", err);
    }

    // 2. Synchronize local store
    try {
      const mockRes = registerLearnerAccount(data);
      const token = backendToken || mockRes.verificationToken;
      const mappedUser = backendUser || mapAccountToUser(mockRes.user);

      // Trigger verification email dispatch if backend signup wasn't reached directly
      if (!backendUser) {
        try {
          await apiClient.post("/auth/send-verification", {
            email: normalizedEmail,
            name: data.name,
            token,
          });
        } catch {
          // ignore
        }
      }

      setLoading(false);
      return {
        error: null,
        user: mappedUser,
        organization: mockRes.organization,
        verificationToken: token,
      };
    } catch (err: any) {
      if (backendUser) {
        setLoading(false);
        return {
          error: null,
          user: backendUser,
          verificationToken: backendToken,
        };
      }
      setLoading(false);
      return { error: err instanceof Error ? err : new Error(String(err)) };
    }
  };

  const signupAdmin = async (data: AdminSignUpData) => {
    setLoading(true);
    const normalizedEmail = data.email.toLowerCase().trim();
    let backendToken: string | undefined;
    let backendUser: User | undefined;

    // 1. Primary: Submit to FastAPI backend /auth/admin/signup
    try {
      const apiRes = await apiClient.post<{
        access_token: string;
        user: User;
        requires_verification?: boolean;
        verification_token?: string;
      }>("/auth/admin/signup", {
        name: data.name.trim(),
        email: normalizedEmail,
        password: data.password,
        adminRole: data.adminRole,
        organizationName: data.organizationName,
      });

      if (apiRes) {
        backendUser = apiRes.user;
        backendToken = apiRes.verification_token;
      }
    } catch (err: any) {
      if (err?.status === 400 || err?.status === 409 || err?.message?.toLowerCase().includes("already exists")) {
        setLoading(false);
        return { error: new Error("An account with this email address already exists. Please sign in instead.") };
      }
      console.warn("Backend admin signup notice:", err);
    }

    // 2. Synchronize local store
    try {
      const mockRes = registerAdminAccount(data);
      const token = backendToken || mockRes.verificationToken;
      const mappedUser = backendUser || mapAccountToUser(mockRes.user);

      if (!backendUser) {
        try {
          await apiClient.post("/auth/send-verification", {
            email: normalizedEmail,
            name: data.name,
            token,
          });
        } catch {
          // ignore
        }
      }

      setLoading(false);
      return {
        error: null,
        user: mappedUser,
        organization: mockRes.organization,
        verificationToken: token,
      };
    } catch (err: any) {
      if (backendUser) {
        setLoading(false);
        return {
          error: null,
          user: backendUser,
          organization: { id: "org-1", name: data.organizationName, orgCode: "MOSPI", createdByAdminId: "", createdAt: "" },
          verificationToken: backendToken,
        };
      }
      setLoading(false);
      return { error: err instanceof Error ? err : new Error(String(err)) };
    }
  };

  const verifyEmail = async (email: string, token: string) => {
    const normalizedEmail = email.toLowerCase().trim();
    let verified = false;

    // 1. Primary: Backend verify-email endpoint
    try {
      const apiRes = await apiClient.post<{ success: boolean; message?: string }>("/auth/verify-email", {
        email: normalizedEmail,
        token,
      });
      if (apiRes && apiRes.success) {
        verified = true;
      }
    } catch (err) {
      console.warn("Backend API email verification notice:", err);
    }

    // 2. Update local mock store
    const res = verifyEmailToken(normalizedEmail, token);
    if (res.success && res.user) {
      verified = true;
      const mappedUser = mapAccountToUser(res.user);
      if (user && user.email.toLowerCase() === normalizedEmail) {
        setUser(mappedUser);
        localStorage.setItem(LOCAL_STORAGE_SESSION_KEY, JSON.stringify(mappedUser));
      }
      return { success: true, user: mappedUser };
    }

    if (verified) {
      return { success: true };
    }

    return { success: false };
  };

  const resendVerification = async (email: string) => {
    const normalizedEmail = email.toLowerCase().trim();
    let sent = false;
    let token: string | undefined;

    // 1. Primary: Backend send-verification
    try {
      const apiRes = await apiClient.post<{ success: boolean; token?: string; message?: string }>("/auth/send-verification", {
        email: normalizedEmail,
      });
      if (apiRes) {
        sent = true;
        token = apiRes.token;
      }
    } catch (err) {
      console.warn("Backend resend verification notice:", err);
    }

    // 2. Update local store
    const res = resendVerificationEmailToken(normalizedEmail);
    if (res.success) {
      sent = true;
      token = token || res.token;
    }

    return { success: sent, token };
  };

  const updateUser = (partialUser: Partial<User>) => {
    setUser((prev) => {
      if (!prev) return null;
      const updated = { ...prev, ...partialUser };
      localStorage.setItem(LOCAL_STORAGE_SESSION_KEY, JSON.stringify(updated));
      return updated;
    });
  };

  const logout = async () => {
    setLoading(true);
    removeStoredToken();
    localStorage.removeItem(LOCAL_STORAGE_SESSION_KEY);
    setUser(null);
    setSession(null);
    setLoading(false);
    return { error: null };
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        loading,
        login,
        signupLearner,
        signupAdmin,
        verifyEmail,
        resendVerification,
        validateOrgCode,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

export function ProtectedRoute({ children }: { children?: React.ReactNode }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <div className="size-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          <p className="text-xs font-semibold text-muted-foreground">Verifying authentication status...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children ? <>{children}</> : null;
}

export function AdminProtectedRoute({ children }: { children?: React.ReactNode }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <div className="size-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          <p className="text-xs font-semibold text-muted-foreground">Verifying administrator authorization...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  const role = (user.role || "").toLowerCase();
  if (role !== "admin" && role !== "super_admin") {
    return <Navigate to="/dashboard" replace />;
  }

  return children ? <>{children}</> : null;
}
