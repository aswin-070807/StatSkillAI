import React, { useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Bell,
  CheckCircle2,
  AlertTriangle,
  BookOpen,
  TrendingUp,
  Award,
  ShieldAlert,
  ShieldCheck,
  Trash2,
  CheckCheck,
  Search,
  Filter,
  ExternalLink,
  Sparkles,
  Inbox,
} from "lucide-react";
import { AppLayout } from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useNotifications, NotificationItem } from "@/hooks/useNotifications";
import { formatRelativeTime, getNotificationTypeConfig } from "@/components/NotificationDropdown";
import { cn } from "@/lib/utils";

type FilterTab = "all" | "unread" | "skill_gap" | "course" | "assessment" | "admin";

export function NotificationsPage() {
  const navigate = useNavigate();
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
  } = useNotifications();

  const [activeTab, setActiveTab] = useState<FilterTab>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredNotifications = useMemo(() => {
    return notifications.filter((item) => {
      // Tab filter
      if (activeTab === "unread" && item.is_read) return false;
      if (activeTab === "skill_gap" && item.type !== "skill_gap_alert") return false;
      if (activeTab === "course" && item.type !== "course_recommendation" && item.type !== "enrollment_update") return false;
      if (activeTab === "assessment" && item.type !== "assessment_result" && item.type !== "competency_updated") return false;
      if (activeTab === "admin" && item.type !== "admin_approval_request" && item.type !== "admin_account_approved" && item.type !== "system") return false;

      // Search query filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchTitle = item.title.toLowerCase().includes(query);
        const matchMsg = item.message.toLowerCase().includes(query);
        return matchTitle || matchMsg;
      }

      return true;
    });
  }, [notifications, activeTab, searchQuery]);

  const handleItemClick = async (item: NotificationItem) => {
    if (!item.is_read) {
      await markAsRead(item.id);
    }
    if (item.link) {
      navigate(item.link);
    }
  };

  const counts = useMemo(() => {
    return {
      all: notifications.length,
      unread: unreadCount,
      skill_gap: notifications.filter((n) => n.type === "skill_gap_alert").length,
      course: notifications.filter((n) => n.type === "course_recommendation" || n.type === "enrollment_update").length,
      assessment: notifications.filter((n) => n.type === "assessment_result" || n.type === "competency_updated").length,
      admin: notifications.filter((n) => n.type === "admin_approval_request" || n.type === "admin_account_approved" || n.type === "system").length,
    };
  }, [notifications, unreadCount]);

  return (
    <AppLayout
      title="Notifications Center"
      subtitle="Track your competency alerts, course recommendations, and system events in real-time"
    >
      <div className="space-y-6 max-w-5xl mx-auto">
        {/* Top Header Card */}
        <Card className="shadow-card border-border">
          <CardHeader className="pb-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <CardTitle className="text-xl flex items-center gap-2">
                  <Bell className="size-5 text-primary" />
                  Your Notifications
                </CardTitle>
                <CardDescription className="mt-1">
                  You have <span className="font-semibold text-foreground">{unreadCount}</span> unread alert{unreadCount === 1 ? "" : "s"}
                </CardDescription>
              </div>

              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => markAllAsRead()}
                    className="text-xs font-semibold"
                  >
                    <CheckCheck className="size-4 mr-1.5 text-primary" />
                    Mark all as read
                  </Button>
                )}
              </div>
            </div>

            {/* Filter Tabs & Search Bar */}
            <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 mt-5 pt-4 border-t border-border">
              {/* Tabs */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
                {[
                  { key: "all", label: "All", count: counts.all },
                  { key: "unread", label: "Unread", count: counts.unread },
                  { key: "skill_gap", label: "Skill Gaps", count: counts.skill_gap },
                  { key: "course", label: "Courses", count: counts.course },
                  { key: "assessment", label: "Assessments", count: counts.assessment },
                  { key: "admin", label: "Admin & System", count: counts.admin },
                ].map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key as FilterTab)}
                    className={cn(
                      "px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 shrink-0",
                      activeTab === tab.key
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : "bg-muted/70 text-muted-foreground hover:text-foreground hover:bg-muted"
                    )}
                  >
                    <span>{tab.label}</span>
                    {tab.count > 0 && (
                      <span
                        className={cn(
                          "px-1.5 py-0.2 rounded-full text-[10px] font-semibold",
                          activeTab === tab.key
                            ? "bg-primary-foreground/20 text-primary-foreground"
                            : "bg-background text-muted-foreground border"
                        )}
                      >
                        {tab.count}
                      </span>
                    )}
                  </button>
                ))}
              </div>

              {/* Search input */}
              <div className="relative w-full md:w-64">
                <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search notifications..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 text-xs h-9 bg-background"
                />
              </div>
            </div>
          </CardHeader>

          {/* List of Notifications */}
          <CardContent className="p-0">
            {filteredNotifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
                <div className="size-16 rounded-2xl bg-muted/50 flex items-center justify-center mb-4 text-muted-foreground/60 border border-border">
                  <Inbox className="size-8" />
                </div>
                <h3 className="text-base font-semibold text-foreground">No notifications found</h3>
                <p className="text-xs text-muted-foreground mt-1 max-w-sm">
                  {searchQuery
                    ? `No notifications matching "${searchQuery}". Try a different search keyword.`
                    : activeTab === "unread"
                    ? "You've read all your notifications! Check back later for updates."
                    : "You do not have any notifications in this category yet."}
                </p>
                {searchQuery && (
                  <Button
                    variant="link"
                    size="sm"
                    onClick={() => setSearchQuery("")}
                    className="mt-3 text-xs"
                  >
                    Clear search filter
                  </Button>
                )}
              </div>
            ) : (
              <div className="divide-y divide-border">
                {filteredNotifications.map((item) => {
                  const config = getNotificationTypeConfig(item.type);
                  const Icon = config.icon;

                  return (
                    <div
                      key={item.id}
                      className={cn(
                        "group relative flex flex-col sm:flex-row sm:items-center justify-between p-4 sm:p-5 transition-all gap-4",
                        !item.is_read
                          ? "bg-primary/5 dark:bg-primary/10 border-l-4 border-l-primary"
                          : "bg-card hover:bg-muted/40"
                      )}
                    >
                      <div className="flex items-start gap-3.5 min-w-0 flex-1">
                        {/* Type Icon */}
                        <div
                          className={cn(
                            "size-10 rounded-xl flex items-center justify-center shrink-0 border mt-0.5",
                            config.color
                          )}
                        >
                          <Icon className="size-5" />
                        </div>

                        {/* Details */}
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2 mb-1">
                            <Badge
                              variant="outline"
                              className={cn("text-[10px] font-semibold uppercase tracking-wider py-0 px-1.5", config.color)}
                            >
                              {config.label}
                            </Badge>

                            {!item.is_read && (
                              <Badge className="bg-primary text-primary-foreground text-[10px] font-bold px-1.5 py-0">
                                New
                              </Badge>
                            )}

                            <span className="text-[11px] text-muted-foreground">
                              {formatRelativeTime(item.created_at)}
                            </span>
                          </div>

                          <h4
                            onClick={() => handleItemClick(item)}
                            className={cn(
                              "text-sm font-semibold text-foreground cursor-pointer hover:text-primary transition-colors",
                              !item.is_read ? "font-bold text-foreground" : "font-medium"
                            )}
                          >
                            {item.title}
                          </h4>

                          <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                            {item.message}
                          </p>
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                        {item.link && (
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => handleItemClick(item)}
                            className="text-xs font-semibold h-8"
                          >
                            <span>Open</span>
                            <ExternalLink className="size-3.5 ml-1" />
                          </Button>
                        )}

                        {!item.is_read && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => markAsRead(item.id)}
                            className="text-xs text-muted-foreground hover:text-foreground h-8"
                            title="Mark as read"
                          >
                            <CheckCircle2 className="size-4" />
                          </Button>
                        )}

                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => deleteNotification(item.id)}
                          className="text-xs text-muted-foreground hover:text-destructive h-8 px-2"
                          title="Delete notification"
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
