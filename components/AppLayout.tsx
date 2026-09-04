import React, { useState, type ReactNode } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  BarChart2,
  Menu,
  LogOut,
  User,
  LayoutDashboard,
  Target,
  BarChart3,
  Route as RouteIcon,
  BookOpen,
  ClipboardList,
  Mail,
  Home as HomeIcon,
  ShieldCheck,
  ChevronDown,
  Sparkles,
  Pencil,
  FileSearch,
  History,
  Building2,
  Settings,
  TrendingUp,
  LogIn,
  Shield,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getMediaUrl } from "@/lib/apiClient";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { NotificationDropdown } from "@/components/NotificationDropdown";
import { FloatingChatbot } from "@/components/FloatingChatbot";
import { GovFooter } from "@/components/GovFooter";
import { NavSlider } from "@/components/GovNavbar";
import { cn } from "@/lib/utils";

// Public navigation links (Guest Officers)
export const publicNavLinks = [
  { to: "/", label: "Home", icon: HomeIcon },
  { to: "/competency", label: "Competency Framework", icon: Target },
  { to: "/contact", label: "Contact", icon: Mail },
] as const;

// Reconciled Learner/Officer Top Horizontal Links
export const learnerNavLinks = [
  { to: "/", label: "Home", icon: HomeIcon },
  { to: "/profile", label: "My Profile", icon: User },
  { to: "/competency", label: "Competency Framework", icon: Target },
  { to: "/skill-intelligence", label: "Skill Intelligence", icon: Sparkles },
  { to: "/skill-gaps", label: "Gap Analysis", icon: BarChart3 },
  { to: "/learning-path", label: "Recommendations", icon: RouteIcon },
  { to: "/my-courses", label: "My Courses", icon: BookOpen },
  { to: "/learning-hub", label: "Learning Hub", icon: BookOpen },
  { to: "/assessments", label: "Assessments", icon: ClipboardList },
  { to: "/quiz-history", label: "Quiz History", icon: History },
  { to: "/materials", label: "Material Analyzer", icon: FileSearch },
  { to: "/dashboard", label: "My Dashboard", icon: LayoutDashboard },
  { to: "/contact", label: "Contact", icon: Mail },
] as const;

// Admin extra links
export const adminNavLinks = [
  { to: "/", label: "Home", icon: HomeIcon },
  { to: "/admin-dashboard", label: "Workforce Overview", icon: Building2 },
  { to: "/admin/distribution", label: "Competency Distribution", icon: BarChart3 },
  { to: "/admin/effectiveness", label: "Training Effectiveness", icon: TrendingUp },
  { to: "/admin/quiz-management", label: "Quiz Management", icon: ClipboardList },
  { to: "/admin/reports", label: "Reports", icon: FileSearch },
  { to: "/competency", label: "Framework", icon: Target },
  { to: "/skill-gaps", label: "Gap Engine", icon: BarChart3 },
  { to: "/contact", label: "Contact", icon: Mail },
] as const;

export function AppLayout({
  title,
  subtitle,
  children,
}: {
  title?: string;
  subtitle?: string;
  children: ReactNode;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  const getInitials = (name?: string) => {
    if (!name) return "US";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .substring(0, 2)
      .toUpperCase();
  };

  const isAdmin = user?.role === "admin" || user?.role === "super_admin";
  const currentNavLinks = !user
    ? publicNavLinks
    : isAdmin
    ? adminNavLinks
    : learnerNavLinks;

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground font-sans">
      {/* 🧭 Canonical Top Horizontal Navigation Header */}
      <header className="sticky top-0 z-40 w-full border-b border-border bg-card/98 backdrop-blur shadow-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-2.5 sm:px-6">
          {/* Brand & Logo */}
          <Link to="/" className="flex items-center gap-2.5 group focus:outline-none shrink-0">
            <div className="flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm group-hover:bg-primary/90 transition-colors">
              <BarChart2 className="size-5 text-accent" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="text-base font-bold tracking-tight text-foreground leading-none">
                  StatSkill AI
                </span>
                <span className="rounded bg-secondary/15 px-1.5 py-0.5 text-[9px] font-bold text-secondary uppercase tracking-wider">
                  MoSPI
                </span>
              </div>
              <span className="text-[10px] font-medium text-muted-foreground leading-tight mt-0.5">
                Skill Intelligence Platform
              </span>
            </div>
          </Link>

          {/* Desktop Top Horizontal Nav Bar (Slider with smooth scroll & indicators) */}
          <NavSlider links={currentNavLinks} />

          {/* Right Aligned Header Actions & Profile Dropdown */}
          <div className="flex items-center gap-2 shrink-0">
            {user ? (
              <>
                {/* Real-time Notifications Bell */}
                <NotificationDropdown />

                {/* Profile Avatar Menu */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="flex items-center gap-2 rounded-full border border-border bg-card p-1 pr-2.5 hover:bg-accent transition-colors focus:outline-none">
                      <Avatar className="size-8 border border-primary/20">
                        {user.profilePhotoUrl && (
                          <AvatarImage src={getMediaUrl(user.profilePhotoUrl)} alt={user.name} />
                        )}
                        <AvatarFallback className="bg-primary text-xs font-bold text-primary-foreground">
                          {getInitials(user.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="hidden sm:flex flex-col text-left text-xs leading-tight">
                        <span className="font-semibold text-foreground truncate max-w-[110px]">
                          {user.name}
                        </span>
                        <span className="text-[10px] text-muted-foreground truncate max-w-[110px]">
                          {user.designation || (isAdmin ? "Administrator" : "Officer")}
                        </span>
                      </div>
                      <ChevronDown className="size-3.5 text-muted-foreground" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-60">
                    <DropdownMenuLabel>
                      <div className="font-semibold text-foreground">{user.name}</div>
                      <div className="text-xs text-muted-foreground font-normal">{user.email}</div>
                      <div className="text-[10px] text-muted-foreground mt-0.5 font-medium">
                        ID: {user.employeeId} • {user.department || "MoSPI"}
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => navigate("/profile")} className="cursor-pointer">
                      <User className="mr-2 size-4" />
                      <span>My Profile</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate("/profile?edit=true")} className="cursor-pointer text-secondary font-medium">
                      <Pencil className="mr-2 size-4 text-secondary" />
                      <span>Edit Profile</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate("/dashboard")} className="cursor-pointer">
                      <LayoutDashboard className="mr-2 size-4" />
                      <span>My Dashboard</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate("/progress")} className="cursor-pointer">
                      <TrendingUp className="mr-2 size-4" />
                      <span>My Progress & Trajectory</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate("/settings")} className="cursor-pointer">
                      <Settings className="mr-2 size-4" />
                      <span>Settings & Security</span>
                    </DropdownMenuItem>

                    {isAdmin && (
                      <>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => navigate("/admin-dashboard")} className="cursor-pointer font-bold text-primary">
                          <Building2 className="mr-2 size-4 text-primary" />
                          <span>Admin Workforce Portal</span>
                        </DropdownMenuItem>
                      </>
                    )}

                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout} className="text-destructive cursor-pointer">
                      <LogOut className="mr-2 size-4" />
                      <span>Sign Out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate("/login")}
                  className="text-xs font-semibold border-primary/30 text-primary hover:bg-primary/5 gap-1.5"
                >
                  <LogIn className="size-3.5" /> Sign In
                </Button>
              </div>
            )}

            {/* Mobile Sheet Menu Trigger */}
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="lg:hidden text-foreground hover:bg-accent"
                  aria-label="Open mobile navigation menu"
                >
                  <Menu className="size-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-72 bg-card p-0">
                <SheetTitle className="sr-only">Mobile Navigation Menu</SheetTitle>
                <div className="flex flex-col h-full">
                  <div className="p-4 border-b border-border bg-muted/40 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="flex size-9 items-center justify-center rounded-md bg-primary text-primary-foreground">
                        <BarChart2 className="size-5 text-secondary" />
                      </div>
                      <div>
                        <p className="font-bold text-sm text-foreground">StatSkill AI</p>
                        <p className="text-[10px] text-muted-foreground">Govt. of India • MoSPI</p>
                      </div>
                    </div>
                  </div>

                  {user && (
                    <div className="p-3 border-b border-border bg-accent/20 flex items-center gap-3">
                      <Avatar className="size-9 border border-primary/30">
                        {user.profilePhotoUrl && (
                          <AvatarImage src={getMediaUrl(user.profilePhotoUrl)} alt={user.name} />
                        )}
                        <AvatarFallback className="bg-primary text-xs font-bold text-primary-foreground">
                          {getInitials(user.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0 flex-1 text-xs">
                        <p className="font-bold truncate text-foreground">{user.name}</p>
                        <p className="text-[10px] text-muted-foreground truncate">{user.email}</p>
                      </div>
                    </div>
                  )}

                  <nav className="flex-1 overflow-y-auto p-3 space-y-1">
                    {currentNavLinks.map(({ to, label, icon: Icon }) => {
                      const isActive =
                        to === "/"
                          ? location.pathname === "/"
                          : location.pathname === to || location.pathname.startsWith(to + "/");

                      return (
                        <Link
                          key={to}
                          to={to}
                          onClick={() => setMobileOpen(false)}
                          className={cn(
                            "flex items-center gap-3 px-3 py-2.5 text-xs font-semibold rounded-md transition-colors",
                            isActive
                              ? "bg-primary text-primary-foreground font-bold shadow-sm"
                              : "text-foreground/80 hover:bg-accent hover:text-foreground"
                          )}
                        >
                          <Icon className="size-4 shrink-0" />
                          <span>{label}</span>
                        </Link>
                      );
                    })}

                    {user && (
                      <>
                        <div className="my-2 border-t border-border" />
                        <Link
                          to="/progress"
                          onClick={() => setMobileOpen(false)}
                          className="flex items-center gap-3 px-3 py-2.5 text-xs font-semibold text-foreground/80 hover:bg-accent rounded-md"
                        >
                          <TrendingUp className="size-4 shrink-0" />
                          <span>My Progress</span>
                        </Link>
                        <Link
                          to="/settings"
                          onClick={() => setMobileOpen(false)}
                          className="flex items-center gap-3 px-3 py-2.5 text-xs font-semibold text-foreground/80 hover:bg-accent rounded-md"
                        >
                          <Settings className="size-4 shrink-0" />
                          <span>Settings</span>
                        </Link>
                      </>
                    )}
                  </nav>

                  {user && (
                    <div className="p-3 border-t border-border bg-muted/20">
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={handleLogout}
                        className="w-full text-xs font-semibold gap-2"
                      >
                        <LogOut className="size-3.5" /> Sign Out
                      </Button>
                    </div>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>

      {/* 📄 Page Title Banner (Rendered when title is provided) */}
      {title && (
        <div className="border-b border-border bg-card/60 py-5 px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <h1 className="text-xl sm:text-2xl font-extrabold text-foreground tracking-tight">{title}</h1>
            {subtitle && <p className="text-xs sm:text-sm text-muted-foreground mt-1 font-medium">{subtitle}</p>}
          </div>
        </div>
      )}

      {/* 📦 Main Page Body Container */}
      <main className="flex-1 max-w-7xl mx-auto w-full p-4 sm:p-6 lg:p-8 animate-fade-in">{children}</main>

      {/* 🤖 Persistent Floating AI Assistant (StatBot) on Every Page */}
      <FloatingChatbot />

      {/* 🏛️ Official Government Footer */}
      <GovFooter />
    </div>
  );
}

export default AppLayout;
