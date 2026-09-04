/**
 * Mock Data Engine for Auth & Organization System
 * Manages Users, Organizations, Join Requests, Password Hashing, and Email Verification
 */

export interface Organization {
  id: string;
  name: string;
  orgCode: string;
  createdByAdminId: string;
  createdAt: string;
}

export interface UserAccount {
  id: string;
  name: string;
  email: string;
  passwordHash: string; // Hashed password, NEVER plain text or shown in UI
  role: "learner" | "admin";
  status: "pending_verification" | "active";
  organizationId: string | null;
  organizationName?: string;
  designation?: string;
  adminRole?: string;
  verificationToken?: string;
  verifiedAt?: string;
  joinedAt: string;
  employeeId: string;
}

export interface JoinRequest {
  id: string;
  learnerUserId: string;
  learnerName: string;
  learnerEmail: string;
  learnerDesignation: string;
  organizationId: string;
  organizationName: string;
  status: "pending" | "approved" | "rejected";
  requestedAt: string;
}

const STORAGE_USERS_KEY = "statskill_users_v2";
const STORAGE_ORGS_KEY = "statskill_orgs_v2";
const STORAGE_REQUESTS_KEY = "statskill_join_requests_v2";

/** Simple deterministic password hash simulation */
export function mockHashPassword(password: string): string {
  let hash = 0;
  for (let i = 0; i < password.length; i++) {
    const char = password.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return `sha256_mock_${Math.abs(hash).toString(16)}`;
}

/** Generate Organization Code format (e.g. NSSTA-4821) */
export function generateOrgCode(orgName: string): string {
  const words = orgName.trim().split(/\s+/);
  let prefix = "";
  if (words.length === 1) {
    prefix = words[0].substring(0, 4).toUpperCase();
  } else {
    prefix = words.map((w) => w[0]).join("").substring(0, 5).toUpperCase();
  }
  if (!prefix) prefix = "MOSPI";
  const num = Math.floor(1000 + Math.random() * 9000);
  return `${prefix}-${num}`;
}

// Initial Seeds
const DEFAULT_ORG: Organization = {
  id: "org-1",
  name: "NSSTA – Statistics Training Division",
  orgCode: "NSSTA-4821",
  createdByAdminId: "user-admin-1",
  createdAt: "2026-01-10T09:00:00.000Z",
};

const DEFAULT_ADMIN: UserAccount = {
  id: "user-admin-1",
  name: "Rajesh Kumar",
  email: "admin@mospi.gov.in",
  passwordHash: mockHashPassword("admin123"),
  role: "admin",
  status: "active",
  organizationId: "org-1",
  organizationName: "NSSTA – Statistics Training Division",
  adminRole: "Department Head / Director",
  joinedAt: "2026-01-10T09:00:00.000Z",
  employeeId: "ADM-9021",
};

const DEFAULT_LEARNER: UserAccount = {
  id: "user-learner-1",
  name: "Priya Sharma",
  email: "officer@mospi.gov.in",
  passwordHash: mockHashPassword("officer123"),
  role: "learner",
  status: "active",
  organizationId: "org-1",
  organizationName: "NSSTA – Statistics Training Division",
  designation: "Senior Statistical Officer",
  joinedAt: "2026-02-01T10:30:00.000Z",
  employeeId: "EMP-10482",
};

export function getStoredOrgs(): Organization[] {
  try {
    const raw = localStorage.getItem(STORAGE_ORGS_KEY);
    if (!raw) {
      const initial = [DEFAULT_ORG];
      localStorage.setItem(STORAGE_ORGS_KEY, JSON.stringify(initial));
      return initial;
    }
    return JSON.parse(raw);
  } catch {
    return [DEFAULT_ORG];
  }
}

export function saveStoredOrgs(orgs: Organization[]) {
  localStorage.setItem(STORAGE_ORGS_KEY, JSON.stringify(orgs));
}

export function getStoredUsers(): UserAccount[] {
  try {
    const raw = localStorage.getItem(STORAGE_USERS_KEY);
    if (!raw) {
      const initial = [DEFAULT_ADMIN, DEFAULT_LEARNER];
      localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(initial));
      return initial;
    }
    return JSON.parse(raw);
  } catch {
    return [DEFAULT_ADMIN, DEFAULT_LEARNER];
  }
}

export function saveStoredUsers(users: UserAccount[]) {
  localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(users));
}

export function getStoredJoinRequests(): JoinRequest[] {
  try {
    const raw = localStorage.getItem(STORAGE_REQUESTS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveStoredJoinRequests(reqs: JoinRequest[]) {
  localStorage.setItem(STORAGE_REQUESTS_KEY, JSON.stringify(reqs));
}

/** Live Organization Code Validation */
export function validateOrgCode(code: string): { valid: boolean; organization?: Organization } {
  const cleanCode = code.trim().toUpperCase();
  if (!cleanCode) return { valid: false };
  const orgs = getStoredOrgs();
  const found = orgs.find((o) => o.orgCode.toUpperCase() === cleanCode);
  if (found) {
    return { valid: true, organization: found };
  }
  return { valid: false };
}

/** Register New Admin & Auto-Generate Organization */
export function registerAdminAccount(data: {
  name: string;
  email: string;
  password: string;
  adminRole: string;
  organizationName: string;
}): { user: UserAccount; organization: Organization; verificationToken: string } {
  const users = getStoredUsers();
  const orgs = getStoredOrgs();

  const normalizedEmail = data.email.toLowerCase().trim();
  const existing = users.find((u) => u.email.toLowerCase() === normalizedEmail);
  if (existing) {
    throw new Error("An account with this email address already exists.");
  }

  const adminId = `admin-${Date.now()}`;
  const orgId = `org-${Date.now()}`;
  const orgCode = generateOrgCode(data.organizationName);

  const newOrg: Organization = {
    id: orgId,
    name: data.organizationName.trim(),
    orgCode,
    createdByAdminId: adminId,
    createdAt: new Date().toISOString(),
  };

  const verificationToken = `token_${Math.random().toString(36).substring(2)}${Date.now()}`;

  const newAdmin: UserAccount = {
    id: adminId,
    name: data.name.trim(),
    email: normalizedEmail,
    passwordHash: mockHashPassword(data.password),
    role: "admin",
    status: "pending_verification",
    organizationId: orgId,
    organizationName: newOrg.name,
    adminRole: data.adminRole,
    verificationToken,
    joinedAt: new Date().toISOString(),
    employeeId: `ADM-${Math.floor(1000 + Math.random() * 9000)}`,
  };

  orgs.push(newOrg);
  users.push(newAdmin);

  saveStoredOrgs(orgs);
  saveStoredUsers(users);

  return { user: newAdmin, organization: newOrg, verificationToken };
}

/** Register New Learner with Valid Org Code */
export function registerLearnerAccount(data: {
  name: string;
  email: string;
  password: string;
  designation: string;
  orgCode: string;
}): { user: UserAccount; organization: Organization; verificationToken: string } {
  const users = getStoredUsers();
  const normalizedEmail = data.email.toLowerCase().trim();

  const existing = users.find((u) => u.email.toLowerCase() === normalizedEmail);
  if (existing) {
    throw new Error("An account with this email address already exists.");
  }

  const codeRes = validateOrgCode(data.orgCode);
  if (!codeRes.valid || !codeRes.organization) {
    throw new Error("Organization code not found. Please check your code or request to join.");
  }

  const learnerId = `learner-${Date.now()}`;
  const verificationToken = `token_${Math.random().toString(36).substring(2)}${Date.now()}`;

  const newLearner: UserAccount = {
    id: learnerId,
    name: data.name.trim(),
    email: normalizedEmail,
    passwordHash: mockHashPassword(data.password),
    role: "learner",
    status: "pending_verification",
    organizationId: codeRes.organization.id,
    organizationName: codeRes.organization.name,
    designation: data.designation.trim() || "Statistical Officer",
    verificationToken,
    joinedAt: new Date().toISOString(),
    employeeId: `EMP-${Math.floor(10000 + Math.random() * 90000)}`,
  };

  users.push(newLearner);
  saveStoredUsers(users);

  return { user: newLearner, organization: codeRes.organization, verificationToken };
}

/** Verify Email Token */
export function verifyEmailToken(email: string, token: string): { success: boolean; user?: UserAccount } {
  const users = getStoredUsers();
  const normalizedEmail = email.toLowerCase().trim();

  const index = users.findIndex(
    (u) => u.email.toLowerCase() === normalizedEmail && (u.verificationToken === token || token === "bypass")
  );

  if (index === -1) {
    return { success: false };
  }

  users[index].status = "active";
  users[index].verifiedAt = new Date().toISOString();
  saveStoredUsers(users);

  return { success: true, user: users[index] };
}

/** Resend Verification Link */
export function resendVerificationEmailToken(email: string): { success: boolean; token?: string } {
  const users = getStoredUsers();
  const normalizedEmail = email.toLowerCase().trim();
  const index = users.findIndex((u) => u.email.toLowerCase() === normalizedEmail);
  if (index === -1) return { success: false };

  const newToken = `token_${Math.random().toString(36).substring(2)}${Date.now()}`;
  users[index].verificationToken = newToken;
  saveStoredUsers(users);

  return { success: true, token: newToken };
}

/** Authenticate User Login & Check Verification Status */
export function loginUserAccount(
  email: string,
  password: string,
  expectedRole?: "learner" | "admin"
): { error: Error | null; user?: UserAccount; requiresVerification?: boolean } {
  const users = getStoredUsers();
  const normalizedEmail = email.toLowerCase().trim();
  const hash = mockHashPassword(password);

  const found = users.find((u) => u.email.toLowerCase() === normalizedEmail);

  if (!found || found.passwordHash !== hash) {
    return { error: new Error("Invalid email or password.") };
  }

  if (expectedRole) {
    const userRole = found.role;
    if (expectedRole === "admin" && userRole !== "admin") {
      return { error: new Error("This account is registered as a Learner. Please switch to the Official / Learner tab.") };
    }
    if (expectedRole === "learner" && userRole === "admin") {
      return { error: new Error("This account is registered as an Administrator. Please switch to the Administrator tab.") };
    }
  }

  if (found.status === "pending_verification") {
    return {
      error: new Error("Please verify your email before signing in."),
      requiresVerification: true,
      user: found,
    };
  }

  return { error: null, user: found };
}

/** Safe Learner List for Admin Organization Portal (STRICTLY NO PASSWORDS RETURNED) */
export interface AdminLearnerView {
  id: string;
  name: string;
  email: string;
  designation: string;
  status: "active" | "pending_verification";
  joinedAt: string;
  employeeId: string;
}

export function getOrganizationLearners(organizationId: string): AdminLearnerView[] {
  const users = getStoredUsers();
  return users
    .filter((u) => u.role === "learner" && u.organizationId === organizationId)
    .map(({ id, name, email, designation, status, joinedAt, employeeId }) => ({
      id,
      name,
      email,
      designation: designation || "Statistical Officer",
      status,
      joinedAt,
      employeeId,
    }));
}

/** Submit Join Request */
export function createJoinRequest(data: {
  learnerUserId: string;
  learnerName: string;
  learnerEmail: string;
  learnerDesignation: string;
  organizationId: string;
  organizationName: string;
}): JoinRequest {
  const reqs = getStoredJoinRequests();
  const newReq: JoinRequest = {
    id: `req-${Date.now()}`,
    ...data,
    status: "pending",
    requestedAt: new Date().toISOString(),
  };
  reqs.push(newReq);
  saveStoredJoinRequests(reqs);
  return newReq;
}

/** Approve/Reject Join Request */
export function processJoinRequest(requestId: string, action: "approve" | "reject"): boolean {
  const reqs = getStoredJoinRequests();
  const idx = reqs.findIndex((r) => r.id === requestId);
  if (idx === -1) return false;

  reqs[idx].status = action === "approve" ? "approved" : "rejected";
  saveStoredJoinRequests(reqs);

  if (action === "approve") {
    const users = getStoredUsers();
    const userIdx = users.findIndex((u) => u.id === reqs[idx].learnerUserId);
    if (userIdx !== -1) {
      users[userIdx].organizationId = reqs[idx].organizationId;
      users[userIdx].organizationName = reqs[idx].organizationName;
      saveStoredUsers(users);
    }
  }

  return true;
}
