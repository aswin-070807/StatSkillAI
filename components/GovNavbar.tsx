import React, { useState } from "react";
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
  ChevronLeft,
  ChevronRight,
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
import { publicNavLinks, learnerNavLinks, adminNavLinks } from "@/components/AppLayout";
import { cn } from "@/lib/utils";

export { publicNavLinks, learnerNavLinks, adminNavLinks };

export function NavSlider({
  links,
}: {
  links: ReadonlyArray<{ to: string; label: string; icon: React.ComponentType<{ className?: string }> }>;
}) {
  const location = useLocation();
  const navRef = React.useRef<HTMLDivElement>(null);
  const activeRef = React.useRef<HTMLAnchorElement>(null);

  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const checkScroll = React.useCallback(() => {
    const el = navRef.current;
    if (!el) return;
    const { scrollLeft, scrollWidth, clientWidth } = el;
    setCanScrollLeft(scrollLeft > 2);
    setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 2);
  }, []);

  React.useEffect(() => {
    checkScroll();
    const el = navRef.current;
    if (el) {
      el.addEventListener("scroll", checkScroll, { passive: true });
      window.addEventListener("resize", checkScroll);
    }
    return () => {
      if (el) el.removeEventListener("scroll", checkScroll);
      window.removeEventListener("resize", checkScroll);
    };
  }, [checkScroll, links]);

  // Auto-scroll active tab into view
  React.useEffect(() => {
    if (activeRef.current) {
      activeRef.current.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
        inline: "center",
      });
    }
  }, [location.pathname]);

  const scrollByAmount = (distance: number) => {
    if (navRef.current) {
      navRef.current.scrollBy({ left: distance, behavior: "smooth" });
    }
  };

  return (
    <div className="relative hidden lg:flex items-center max-w-[62vw] px-1 group">
      {/* Left Chevron indicator */}
      {canScrollLeft && (
        <button
          type="button"
          onClick={() => scrollByAmount(-180)}
          aria-label="Scroll navigation left"
          className="absolute left-0 z-10 flex size-6 items-center justify-center rounded-full bg-card/95 border border-border shadow-md text-foreground hover:bg-accent transition-all shrink-0"
        >
          <ChevronLeft className="size-3.5" />
        </button>
      )}

      {/* Scrollable Container */}
      <nav
        ref={navRef}
        className="flex items-center gap-1 overflow-x-auto py-1 scroll-smooth scrollbar-none max-w-full px-2"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {links.map(({ to, label, icon: Icon }) => {
          const isActive =
            to === "/"
              ? location.pathname === "/"
              : location.pathname === to || location.pathname.startsWith(to + "/");

          return (
            <Link
              key={to}
              to={to}
              ref={isActive ? activeRef : null}
              className={cn(
                "flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold rounded-md transition-all whitespace-nowrap shrink-0",
                isActive
                  ? "bg-primary text-primary-foreground font-bold shadow-sm"
                  : "text-foreground/80 hover:bg-accent hover:text-foreground"
              )}
            >
              <Icon className="size-3.5 opacity-90 shrink-0" />
              <span>{label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Right Chevron indicator */}
      {canScrollRight && (
        <button
          type="button"
          onClick={() => scrollByAmount(180)}
          aria-label="Scroll navigation right"
          className="absolute right-0 z-10 flex size-6 items-center justify-center rounded-full bg-card/95 border border-border shadow-md text-foreground hover:bg-accent transition-all shrink-0"
        >
          <ChevronRight className="size-3.5" />
        </button>
      )}
    </div>
  );
}

export function GovNavbar() {
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
    <header className="sticky top-0 z-40 w-full border-b border-border bg-card/98 backdrop-blur shadow-sm">
      {/* 🧭 Canonical Top Horizontal Navigation Header */}
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
  );
}

export default GovNavbar;
