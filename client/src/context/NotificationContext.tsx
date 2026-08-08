"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { toast } from "@/lib/toast";

export interface Notification {
  id: string;
  title: string;
  time: string;
  timestamp: number;
  type: "success" | "error" | "info" | "warning";
  isRead: boolean;
  isExpanded?: boolean;
}

interface NotificationContextType {
  notifications: Notification[];
  addNotification: (
    message: string,
    type?: "success" | "error" | "info" | "warning",
  ) => void;
  notify: (
    message: string,
    type?: "success" | "error" | "info" | "warning",
  ) => void;
  removeNotification: (id: string) => void;
  snoozeNotification: (id: string) => void;
  toggleExpandNotification: (id: string) => void;
  contractAll: () => void;
  clearAll: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(
  undefined,
);

const BASE_STORAGE_KEY = "umurava_notifications";
const VERSION = "v1";

const getStorageKey = (userId?: string) => {
  const id = userId || "anonymous";
  return `${BASE_STORAGE_KEY}_${id}_${VERSION}`;
};


export const NotificationProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);
  const [userId, setUserId] = useState<string>("anonymous");


  // Track user changes for isolation
  useEffect(() => {
    const updateUser = () => {
      const stored = localStorage.getItem("user");
      if (stored) {
        try {
          const user = JSON.parse(stored);
          if (user.id !== userId) {
            setUserId(user.id);
            setIsInitialized(false); // Trigger reload for new user
          }
        } catch (e) {
          setUserId("anonymous");
        }
      } else if (userId !== "anonymous") {
        setUserId("anonymous");
        setIsInitialized(false);
      }
    };

    updateUser();
    
    // Sync across tabs for user login/logout
    const handleUserSync = (e: StorageEvent) => {
      if (e.key === "user") updateUser();
    };

    window.addEventListener("storage", handleUserSync);
    window.addEventListener("user-profile-updated", updateUser);
    return () => {
      window.removeEventListener("storage", handleUserSync);
      window.removeEventListener("user-profile-updated", updateUser);
    };
  }, [userId]);

  const STORAGE_KEY = getStorageKey(userId);

  // Load from localStorage on mount or when userId changes
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        setNotifications(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse notifications", e);
        setNotifications([]);
      }
    } else {
      setNotifications([]);
    }
    setIsInitialized(true);
  }, [STORAGE_KEY]);

  // Save to localStorage whenever notifications change
  useEffect(() => {
    if (isInitialized) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(notifications));
    }
  }, [notifications, isInitialized, STORAGE_KEY]);

  // Sync across tabs for notifications
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) {
        if (e.newValue) {
          try {
            const parsed = JSON.parse(e.newValue);
            setNotifications(parsed);
          } catch (err) {
            console.error("Failed to sync notifications across tabs", err);
          }
        } else {
          setNotifications([]);
        }
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, [STORAGE_KEY]);



  const addNotification = useCallback(
    (
      message: string,
      type: "success" | "error" | "info" | "warning" = "info",
    ) => {
      const newId = Math.random().toString(36).substr(2, 9);
      const newNotif: Notification = {
        id: newId,
        title: message,
        time: "Just now",
        timestamp: Date.now(),
        type,
        isRead: false,
        isExpanded: false,
      };
      setNotifications((prev) => [newNotif, ...prev]);
    },
    [],
  );

  // Listen for global toast events
  useEffect(() => {
    const handleGlobalToast = (event: any) => {
      const { message, type } = event.detail;
      addNotification(message, type);
    };

    window.addEventListener("app-toast", handleGlobalToast);
    return () => window.removeEventListener("app-toast", handleGlobalToast);
  }, [addNotification]);

  const notify = useCallback(
    (
      message: string,
      type: "success" | "error" | "info" | "warning" = "info",
    ) => {
      // Calling our custom toast will trigger the 'app-toast' event
      // which in turn will call addNotification thanks to the listener above.
      toast[type](message);
    },
    [],
  );

  const removeNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const toggleExpandNotification = useCallback((id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isExpanded: !n.isExpanded } : { ...n, isExpanded: false })),
    );
  }, []);

  const contractAll = useCallback(() => {
    setNotifications((prev) =>
      prev.map((n) => ({ ...n, isExpanded: false })),
    );
  }, []);

  const clearAll = useCallback(() => {
    setNotifications([]);
    localStorage.removeItem(STORAGE_KEY);
  }, [STORAGE_KEY]);


  const snoozeNotification = useCallback(
    (id: string) => {
      const notif = notifications.find((n) => n.id === id);
      if (notif) {
        removeNotification(id);
        toast.warning("Notification snoozed for 5 minutes.");

        // Resend after 5 minutes
        setTimeout(
          () => {
            addNotification(notif.title, notif.type);
            toast.info(`Back from snooze: ${notif.title}`);
          },
          5 * 60 * 1000,
        );
      }
    },
    [notifications, addNotification, removeNotification],
  );

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        addNotification,
        notify,
        removeNotification,
        snoozeNotification,
        toggleExpandNotification,
        contractAll,
        clearAll,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context)
    throw new Error(
      "useNotifications must be used within a NotificationProvider",
    );
  return context;
};
