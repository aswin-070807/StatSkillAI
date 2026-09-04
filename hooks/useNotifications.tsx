import { useState, useEffect, useCallback, createContext, useContext, ReactNode } from "react";
import { apiClient } from "@/lib/apiClient";
import { useAuth } from "@/context/AuthContext";

export interface NotificationItem {
  id: string;
  user_id: string;
  type:
    | "skill_gap_alert"
    | "course_recommendation"
    | "enrollment_update"
    | "competency_updated"
    | "admin_approval_request"
    | "admin_account_approved"
    | "assessment_result"
    | "system";
  title: string;
  message: string;
  is_read: boolean;
  link?: string | null;
  created_at: string;
}

interface NotificationContextType {
  notifications: NotificationItem[];
  unreadCount: number;
  isLoading: boolean;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (id: string) => Promise<void>;
  refetch: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const fetchUnreadCount = useCallback(async () => {
    if (!user) return;
    try {
      const data = await apiClient.get<{ unread_count: number }>("/notifications/me/unread-count");
      if (typeof data?.unread_count === "number") {
        setUnreadCount(data.unread_count);
      }
    } catch {
      // ignore transient network errors
    }
  }, [user]);

  const fetchNotifications = useCallback(async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      const data = await apiClient.get<NotificationItem[]>("/notifications/me");
      if (Array.isArray(data)) {
        setNotifications(data);
        const unread = data.filter((n) => !n.is_read).length;
        setUnreadCount(unread);
      }
    } catch {
      // ignore
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  const refetch = useCallback(async () => {
    await Promise.all([fetchNotifications(), fetchUnreadCount()]);
  }, [fetchNotifications, fetchUnreadCount]);

  // Initial fetch and 30-second interval polling
  useEffect(() => {
    if (!user) {
      setNotifications([]);
      setUnreadCount(0);
      return;
    }

    fetchNotifications();
    fetchUnreadCount();

    const interval = setInterval(() => {
      fetchUnreadCount();
    }, 30000);

    return () => clearInterval(interval);
  }, [user, fetchNotifications, fetchUnreadCount]);

  const markAsRead = async (id: string) => {
    // Optimistic UI update
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));

    try {
      await apiClient.patch(`/notifications/${id}/read`, {});
    } catch (e) {
      console.error("Failed to mark notification as read:", e);
      fetchNotifications();
    }
  };

  const markAllAsRead = async () => {
    // Optimistic UI update
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    setUnreadCount(0);

    try {
      await apiClient.patch("/notifications/me/read-all", {});
    } catch (e) {
      console.error("Failed to mark all notifications as read:", e);
      fetchNotifications();
    }
  };

  const deleteNotification = async (id: string) => {
    const itemToDelete = notifications.find((n) => n.id === id);
    const wasUnread = itemToDelete ? !itemToDelete.is_read : false;

    // Optimistic UI update
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    if (wasUnread) {
      setUnreadCount((prev) => Math.max(0, prev - 1));
    }

    try {
      await apiClient.delete(`/notifications/${id}`);
    } catch (e) {
      console.error("Failed to delete notification:", e);
      fetchNotifications();
    }
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        isLoading,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        refetch,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error("useNotifications must be used within a NotificationProvider");
  }
  return context;
}
