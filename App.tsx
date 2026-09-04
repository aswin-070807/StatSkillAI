import { Routes, Route, Navigate } from "react-router-dom";
import { Home } from "@/pages/Home";
import { ContactPage } from "@/pages/ContactPage";
import { Login } from "@/pages/Login";
import { SignUp } from "@/pages/SignUp";
import { AdminSignUp } from "@/pages/AdminSignUp";
import { AdminPendingPage } from "@/pages/AdminPending";
import { AdminApprovalPage } from "@/pages/AdminApproval";
import { Dashboard } from "@/pages/Dashboard";
import { AdminDashboard } from "@/pages/AdminDashboard";
import { CompetencyPage } from "@/pages/Competency";
import { SkillGapsPage } from "@/pages/SkillGaps";
import { LearningPathPage } from "@/pages/LearningPath";
import { MaterialsPage } from "@/pages/Materials";
import { AssessmentsPage } from "@/pages/Assessments";
import { QuizPage } from "@/pages/Quiz";
import { QuizHistoryPage } from "@/pages/QuizHistory";
import { MyProfilePage } from "@/pages/MyProfile";
import { MyCoursesPage } from "@/pages/MyCourses";
import { SkillIntelligencePage } from "@/pages/SkillIntelligence";
import { AdminCompetencyDistributionPage } from "@/pages/AdminCompetencyDistribution";
import { AdminTrainingEffectivenessPage } from "@/pages/AdminTrainingEffectiveness";
import { AdminQuizManagementPage } from "@/pages/AdminQuizManagement";
import { AdminReportsPage } from "@/pages/AdminReports";
import { VerifyEmailPage } from "@/pages/VerifyEmail";
import {
  LearningHubPage,
  AssistantPage,
  ProgressPage,
  SettingsPage,
} from "@/pages/GenericPages";
import { NotificationsPage } from "@/pages/Notifications";
import { ProtectedRoute, AdminProtectedRoute, useAuth } from "@/context/AuthContext";
import { NotificationProvider } from "@/hooks/useNotifications";

function PublicHomeRoute() {
  const { user, loading } = useAuth();

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

  if (user) {
    const role = (user.role || "").toLowerCase();
    if (role === "admin" || role === "super_admin") {
      return <Navigate to="/admin-dashboard" replace />;
    }
    return <Navigate to="/dashboard" replace />;
  }

  return <Home />;
}

export function App() {
  return (
    <NotificationProvider>
      <Routes>
        {/* 🌐 Public Portal Routes */}
        <Route path="/" element={<PublicHomeRoute />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/competency" element={<CompetencyPage />} />
        <Route path="/my-competency" element={<CompetencyPage />} />

        {/* Public Auth & Verification Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/admin-signup" element={<AdminSignUp />} />
        <Route path="/verify-email" element={<VerifyEmailPage />} />
        <Route path="/admin-approval" element={<AdminApprovalPage />} />
        <Route path="/admin/decision" element={<AdminApprovalPage />} />

        {/* 🔒 Learner Protected Routes */}
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <MyProfilePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/my-profile"
          element={
            <ProtectedRoute>
              <MyProfilePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/skill-gaps"
          element={
            <ProtectedRoute>
              <SkillGapsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/learning-path"
          element={
            <ProtectedRoute>
              <LearningPathPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/recommendations"
          element={
            <ProtectedRoute>
              <LearningPathPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/my-courses"
          element={
            <ProtectedRoute>
              <MyCoursesPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/skill-intelligence"
          element={
            <ProtectedRoute>
              <SkillIntelligencePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/courses"
          element={
            <ProtectedRoute>
              <SkillIntelligencePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/courses"
          element={
            <ProtectedRoute>
              <SkillIntelligencePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/assessments"
          element={
            <ProtectedRoute>
              <AssessmentsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/assessment"
          element={
            <ProtectedRoute>
              <AssessmentsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/learning-hub"
          element={
            <ProtectedRoute>
              <LearningHubPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/quiz"
          element={
            <ProtectedRoute>
              <QuizPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/quiz-history"
          element={
            <ProtectedRoute>
              <QuizHistoryPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/assistant"
          element={
            <ProtectedRoute>
              <AssistantPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/materials"
          element={
            <ProtectedRoute>
              <MaterialsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/progress"
          element={
            <ProtectedRoute>
              <ProgressPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <SettingsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/notifications"
          element={
            <ProtectedRoute>
              <NotificationsPage />
            </ProtectedRoute>
          }
        />

        {/* 🔐 Admin Protected Routes */}
        <Route
          path="/admin-pending"
          element={
            <ProtectedRoute>
              <AdminPendingPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin-dashboard"
          element={
            <AdminProtectedRoute>
              <AdminDashboard />
            </AdminProtectedRoute>
          }
        />
        <Route
          path="/admin/dashboard"
          element={
            <AdminProtectedRoute>
              <AdminDashboard />
            </AdminProtectedRoute>
          }
        />
        <Route
          path="/admin/distribution"
          element={
            <AdminProtectedRoute>
              <AdminCompetencyDistributionPage />
            </AdminProtectedRoute>
          }
        />
        <Route
          path="/admin/effectiveness"
          element={
            <AdminProtectedRoute>
              <AdminTrainingEffectivenessPage />
            </AdminProtectedRoute>
          }
        />
        <Route
          path="/admin/quiz-management"
          element={
            <AdminProtectedRoute>
              <AdminQuizManagementPage />
            </AdminProtectedRoute>
          }
        />
        <Route
          path="/admin/reports"
          element={
            <AdminProtectedRoute>
              <AdminReportsPage />
            </AdminProtectedRoute>
          }
        />

        {/* Catch-all route -> Homepage */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </NotificationProvider>
  );
}

export default App;
