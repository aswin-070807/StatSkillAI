import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
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
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { useNotifications, NotificationItem } from "@/hooks/useNotifications";
import { cn } from "@/lib/utils";

export function formatRelativeTime(dateString: string): string {
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (isNaN(diffInSeconds) || diffInSeconds < 0) return "just now";
    if (diffInSeconds < 60) return "just now";
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;
    const diffInWeeks = Math.floor(diffInDays / 7);
    if (diffInWeeks < 4) return `${diffInWeeks}w ago`;
    const diffInMonths = Math.floor(diffInDays / 30);
    if (diffInMonths < 12) return `${diffInMonths}mo ago`;
    return `${Math.floor(diffInDays / 365)}y ago`;
  } catch {
    return "recently";
  }
}

export function getNotificationTypeConfig(type: NotificationItem["type"]) {
  switch (type) {
    case "skill_gap_alert":
      return {
        icon: AlertTriangle,
        color: "text-amber-500 bg-amber-500/10 border-amber-500/20",
        label: "Skill Gap",
      };
    case "course_recommendation":
      return {
        icon: BookOpen,
        color: "text-sky-500 bg-sky-500/10 border-sky-500/20",
        label: "Course",
      };
    case "enrollment_update":
      return {
        icon: Award,
        color: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20",
        label: "Training",
      };
    case "competency_updated":
      return {
        icon: TrendingUp,
        color: "text-purple-500 bg-purple-500/10 border-purple-500/20",
        label: "Competency",
      };
    case "admin_approval_request":
      return {
        icon: ShieldAlert,
        color: "text-rose-500 bg-rose-500/10 border-rose-500/20",
        label: "Admin Request",
      };
    case "admin_account_approved":
      return {
        icon: ShieldCheck,
        color: "text-teal-500 bg-teal-500/10 border-teal-500/20",
        label: "Approved",
      };
    case "assessment_result":
      return {
        icon: CheckCircle2,
        color: "text-blue-500 bg-blue-500/10 border-blue-500/20",
        label: "Assessment",
      };
    case "system":
    default:
      return {
        icon: Bell,
        color: "text-muted-foreground bg-muted border-border",
        label: "System",
      };
  }
}

export function NotificationDropdown() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    refetch,
  } = useNotifications();

  const handleItemClick = async (item: NotificationItem) => {
    if (!item.is_read) {
      await markAsRead(item.id);
    }
    setOpen(false);
    if (item.link) {
      navigate(item.link);
    }
  };

  const handleViewAll = () => {
    setOpen(false);
    navigate("/notifications");
  };

  const previewItems = notifications.slice(0, 8);

  return (
    <Popover open={open} onOpenChange={(val) => {
      setOpen(val);
      if (val) refetch();
    }}>
      <PopoverTrigger asChild>
        <button
          className="relative rounded-md p-2 text-muted-foreground hover:bg-accent hover:text-foreground transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          aria-label="Notifications"
        >
          <Bell className="size-5" />
          {unreadCount > 0 && (
            <span
              className={cn(
                "absolute -top-1 -right-1 flex min-w-4.5 h-4.5 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-bold text-destructive-foreground shadow-sm animate-in zoom-in-50 duration-200"
              )}
            >
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </button>
      </PopoverTrigger>

      <PopoverContent
        align="end"
        className="w-80 sm:w-96 p-0 shadow-elevated border-border rounded-xl overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border bg-card px-4 py-3">
          <div className="flex items-center gap-2">
            <h4 className="font-semibold text-sm text-foreground">Notifications</h4>
            {unreadCount > 0 && (
              <Badge variant="secondary" className="px-1.5 py-0 text-[10px] font-bold">
                {unreadCount} unread
              </Badge>
            )}
          </div>

          {unreadCount > 0 && (
            <button
              onClick={() => markAllAsRead()}
              className="flex items-center gap-1 text-[11px] font-medium text-primary hover:text-primary/80 transition-colors"
            >
              <CheckCheck className="size-3.5" />
              Mark all read
            </button>
          )}
        </div>

        {/* List of Notifications */}
        <ScrollArea className="max-h-[360px] divide-y divide-border">
          {previewItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-8 text-center">
              <div className="size-12 rounded-full bg-muted flex items-center justify-center mb-3 text-muted-foreground/60">
                <Sparkles className="size-6" />
              </div>
              <p className="text-sm font-medium text-foreground">No new notifications</p>
              <p className="text-xs text-muted-foreground mt-1 max-w-[200px]">
                You're all caught up! New alerts and course recommendations will appear here.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {previewItems.map((item) => {
                const config = getNotificationTypeConfig(item.type);
                const Icon = config.icon;

                return (
                  <div
                    key={item.id}
                    onClick={() => handleItemClick(item)}
                    className={cn(
                      "group relative flex items-start gap-3 p-3.5 transition-colors cursor-pointer text-left hover:bg-accent/60",
                      !item.is_read ? "bg-primary/5 dark:bg-primary/10" : "bg-card"
                    )}
                  >
                    {/* Unread indicator bar */}
                    {!item.is_read && (
                      <span className="absolute left-1 top-4 h-6 w-1 rounded-full bg-primary" />
                    )}

                    {/* Icon */}
                    <div
                      className={cn(
                        "size-8 rounded-lg flex items-center justify-center shrink-0 border mt-0.5",
                        config.color
                      )}
                    >
                      <Icon className="size-4" />
                    </div>

                    {/* Text content */}
                    <div className="flex-1 min-w-0 pr-6">
                      <div className="flex items-center justify-between gap-1">
                        <p
                          className={cn(
                            "text-xs truncate",
                            !item.is_read
                              ? "font-semibold text-foreground"
                              : "font-medium text-foreground/90"
                          )}
                        >
                          {item.title}
                        </p>
                      </div>

                      <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5 leading-relaxed">
                        {item.message}
                      </p>

                      <div className="flex items-center gap-2 mt-1.5 text-[10px] text-muted-foreground font-medium">
                        <span>{formatRelativeTime(item.created_at)}</span>
                        {item.link && (
                          <>
                            <span>•</span>
                            <span className="text-primary group-hover:underline flex items-center gap-0.5">
                              View <ArrowRight className="size-2.5" />
                            </span>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Delete action button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteNotification(item.id);
                      }}
                      className="opacity-0 group-hover:opacity-100 transition-opacity absolute right-2.5 top-3 p-1 rounded hover:bg-muted text-muted-foreground hover:text-destructive"
                      aria-label="Delete notification"
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </ScrollArea>

        {/* Footer */}
        <div className="border-t border-border bg-card p-2 text-center">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleViewAll}
            className="w-full text-xs font-medium text-primary hover:text-primary"
          >
            View all notifications
            <ArrowRight className="size-3.5 ml-1.5" />
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
