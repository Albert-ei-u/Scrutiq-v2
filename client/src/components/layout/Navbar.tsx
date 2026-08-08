"use client";

import { useState, useEffect, useRef } from "react";
import {
  Bell,
  Search,
  LogOut,
  ChevronRight,
  Settings,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Menu,
  Clock,
  Check,
  X,
  ChevronDown,
  CircleUserRound,
} from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "@/lib/toast";
import api from "@/lib/api";
import { useNotifications } from "@/context/NotificationContext";
import { useTheme } from "@/context/ThemeContext";

const IconSun = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="12" r="5" stroke="currentColor" strokeWidth="2"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>;
const IconMoon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>;

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

interface NavbarProps {
  onMenuClick?: () => void;
}

const Navbar = ({ onMenuClick }: NavbarProps) => {
  const pathname = usePathname();
  const {
    notifications: localNotifs,
    removeNotification,
    snoozeNotification,
    toggleExpandNotification,
    contractAll,
    clearAll,
  } = useNotifications();
  const { theme, toggleTheme } = useTheme();
  const router = useRouter();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [user, setUser] = useState<any>(null);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [imgError, setImgError] = useState(false);

  const notificationsRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        notificationsRef.current &&
        !notificationsRef.current.contains(event.target as Node)
      ) {
        setShowNotifications(false);
        contractAll();
      }
      if (
        profileRef.current &&
        !profileRef.current.contains(event.target as Node)
      ) {
        setShowProfile(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    setSearchQuery("");
  }, [pathname]);

  useEffect(() => {
    // Get user from local storage
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }

    // Fetch dynamic notifications
    const fetchNotifications = async () => {
      try {
        const response = await api.get("/stats");
        const stats = response.data.data;
        setNotifications(stats.recentActivity || []);
      } catch (error) {
        setNotifications([]);
      }
    };
    fetchNotifications();

    const handleProfileSync = () => {
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        const parsed = JSON.parse(storedUser);
        console.log("[Navbar] Profile Sync:", parsed);
        setUser(parsed);
      }
    };

    window.addEventListener("user-profile-updated", handleProfileSync);
    return () =>
      window.removeEventListener("user-profile-updated", handleProfileSync);
  }, []);

  const allNotifications = [...localNotifs, ...notifications];

  const handleSignOut = () => {
    toast.info("Signing out of your company portal...");

    // Purge local session persistence
    localStorage.removeItem("user");
    localStorage.removeItem("umurava_chat_history_v1");
    localStorage.removeItem("umurava_notifications_v1");

    setTimeout(() => {
      router.push("/login");
      toast.success("You have been signed out.");
    }, 1000);
  };

  const getBreadcrumbs = () => {
    const paths = pathname.split("/").filter((p) => p);
    return paths.map((path, i) => ({
      name:
        path.charAt(0).toUpperCase() +
        path.slice(1).replace("-", " ").toLowerCase(),
      href: "/" + paths.slice(0, i + 1).join("/"),
    }));
  };

  const breadcrumbs = getBreadcrumbs();

  return (
    <header className="h-20 bg-scrutiq-surface border-b border-scrutiq-border flex items-center justify-between px-4 md:px-8 relative z-30">
      <div className="flex items-center gap-2 md:gap-4">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 text-scrutiq-muted hover:text-scrutiq-blue transition-colors"
        >
          <Menu className="size-5" />
        </button>
        <div className="flex items-center gap-2 text-[10px] md:text-xs font-bold tracking-widest text-scrutiq-muted">
          <span className="hidden sm:inline">
            {user?.company || "Company registry"}
          </span>
          <ChevronRight className="size-3 text-scrutiq-blue hidden sm:inline" />
          {breadcrumbs.slice(-2).map((crumb, i) => (
            <div key={crumb.href} className="flex items-center gap-2">
              <Link
                href={crumb.href}
                className={`hover:text-scrutiq-blue transition-colors ${i === breadcrumbs.slice(-2).length - 1 ? "text-scrutiq-dark" : ""}`}
              >
                {crumb.name}
              </Link>
              {i < breadcrumbs.slice(-2).length - 1 && (
                <ChevronRight className="size-3" />
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-3 md:gap-6">
        <div className="relative group hidden md:flex items-center bg-scrutiq-bg border border-scrutiq-border rounded-xl px-4 py-2 w-48 lg:w-80 focus-within:border-scrutiq-blue focus-within:ring-4 focus-within:ring-scrutiq-blue/5 transition-all">
          <Search className="size-4 text-scrutiq-muted group-focus-within:text-scrutiq-blue" />
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (searchQuery.trim()) {
                router.push(
                  `/dashboard/applicants?search=${encodeURIComponent(searchQuery)}`,
                );
              }
            }}
            className="flex-1 flex items-center"
          >
            <input
              type="text"
              placeholder="Search resumes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent border-none outline-none text-[10px] lg:text-xs font-bold text-scrutiq-dark ml-2.5 w-full tracking-wider placeholder:text-scrutiq-muted/50"
            />
          </form>
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="ml-2 p-0.5 text-scrutiq-muted hover:text-scrutiq-dark transition-colors"
            >
              <X className="size-3" />
            </button>
          )}
        </div>

        <button
          onClick={toggleTheme}
          className="p-2 transition-all rounded-xl border border-transparent hover:border-scrutiq-border bg-scrutiq-bg hover:bg-scrutiq-surface text-scrutiq-muted hover:text-scrutiq-dark"
          title={theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
        >
          {theme === "dark" ? <IconSun /> : <IconMoon />}
        </button>

        <div className="relative" ref={notificationsRef}>
          <button
            onClick={() => {
              setShowNotifications(!showNotifications);
              setShowProfile(false);
            }}
            className={`relative p-2 transition-all rounded-xl border ${
              showNotifications
                ? "bg-scrutiq-blue/5 border-scrutiq-blue/20 text-scrutiq-blue"
                : "text-scrutiq-muted hover:bg-scrutiq-bg hover:text-scrutiq-dark border-transparent hover:border-scrutiq-border"
            }`}
          >
            <Bell className="size-5" />
            <span
              className={`absolute top-2.5 right-2.5 size-1.5 rounded-full ${localNotifs.length > 0 ? "bg-orange-500 animate-pulse" : "bg-emerald-500"}`}
            />
          </button>

          <AnimatePresence>
            {showNotifications && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                className="fixed md:absolute top-[70px] md:top-auto right-4 md:right-0 mt-3 w-[calc(100vw-2rem)] sm:w-[24rem] md:w-[22rem] bg-scrutiq-surface border border-scrutiq-border rounded-2xl shadow-xl overflow-hidden z-[100]"
              >
                <div className="p-4 border-b border-scrutiq-border/50 bg-scrutiq-bg/30 flex items-center justify-between">
                  <p className="text-[10px] font-bold text-scrutiq-dark tracking-widest uppercase">
                    Notifications
                  </p>
                  {localNotifs.length > 0 && (
                    <button
                      onClick={() => {
                        if (
                          window.confirm(
                            "Are you sure you want to delete all notifications? This action cannot be undone.",
                          )
                        ) {
                          clearAll();
                        }
                      }}
                      className="text-[9px] font-bold text-rose-500 hover:text-rose-600 transition-colors tracking-widest uppercase"
                    >
                      Clear All
                    </button>
                  )}
                </div>
                <div className="divide-y divide-scrutiq-border/30 max-h-[28rem] overflow-y-auto custom-scrollbar">
                  {allNotifications.length === 0 ? (
                    <div className="p-10 text-center flex flex-col items-center gap-3">
                      <div className="size-10 rounded-full bg-scrutiq-bg flex items-center justify-center text-scrutiq-muted">
                        <Bell className="size-5 opacity-20" />
                      </div>
                      <p className="text-[10px] font-bold tracking-widest text-scrutiq-muted uppercase">
                        Clean slate
                      </p>
                    </div>
                  ) : (
                    allNotifications.map((n, idx) => {
                      const isLocal = "timestamp" in n;
                      const type = n.type || "info";

                      const iconMap = {
                        success: (
                          <CheckCircle2 className="size-4 text-emerald-500" />
                        ),
                        error: <AlertCircle className="size-4 text-rose-500" />,
                        warning: (
                          <AlertCircle className="size-4 text-amber-500" />
                        ),
                        info: <Bell className="size-4 text-scrutiq-blue" />,
                      };

                      const timeAgo = (ts: number) => {
                        const seconds = Math.floor((Date.now() - ts) / 1000);
                        if (seconds < 60) return "Just now";
                        const minutes = Math.floor(seconds / 60);
                        if (minutes < 60) return `${minutes}m ago`;
                        const hours = Math.floor(minutes / 60);
                        if (hours < 24) return `${hours}h ago`;
                        return `${Math.floor(hours / 24)}d ago`;
                      };

                      return (
                        <div
                          key={n.id || idx}
                          onClick={() =>
                            isLocal && toggleExpandNotification(n.id)
                          }
                          className={`p-4 hover:bg-scrutiq-bg transition-all cursor-pointer group flex items-start gap-4 ${n.isExpanded ? "bg-scrutiq-bg/30" : ""}`}
                        >
                          <div
                            className={`mt-0.5 size-8 rounded-lg flex items-center justify-center shrink-0 ${
                              type === "success"
                                ? "bg-emerald-500/5"
                                : type === "error"
                                  ? "bg-rose-500/5"
                                  : type === "warning"
                                    ? "bg-amber-500/5"
                                    : "bg-scrutiq-blue/5"
                            }`}
                          >
                            {iconMap[type as keyof typeof iconMap] ||
                              iconMap.info}
                          </div>

                          <div className="flex-1 min-w-0">
                            <p
                              className={`text-xs font-bold text-scrutiq-dark tracking-tight transition-colors ${n.isExpanded ? "" : "truncate"}`}
                            >
                              {n.title || n.message}
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                              <p className="text-[9px] font-bold text-scrutiq-muted tracking-widest uppercase">
                                {isLocal
                                  ? timeAgo(n.timestamp)
                                  : n.time || "Recent"}
                              </p>
                              {n.isExpanded && (
                                <span className="text-[9px] font-bold text-scrutiq-blue tracking-widest uppercase px-1.5 py-0.5 bg-scrutiq-blue/5 rounded">
                                  Expanded
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            {isLocal && (
                              <>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    removeNotification(n.id);
                                  }}
                                  className="p-1.5 text-scrutiq-muted hover:text-rose-500 transition-colors"
                                  title="Dismiss"
                                >
                                  <X className="size-3.5" />
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    snoozeNotification(n.id);
                                  }}
                                  className="p-1.5 text-scrutiq-muted hover:text-amber-500 transition-colors"
                                  title="Snooze"
                                >
                                  <Clock className="size-3.5" />
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="h-8 w-px bg-scrutiq-border mx-2" />

        <div className="relative" ref={profileRef}>
          <div className="flex items-center gap-3 pl-2">
            <div className="text-right hidden sm:block">
              <p className="text-xs font-bold text-scrutiq-dark tracking-tight truncate max-w-[120px]">
                {user?.name
                  ? user.name
                      .split(" ")
                      .map(
                        (w: string) =>
                          w.charAt(0).toUpperCase() + w.slice(1).toLowerCase(),
                      )
                      .join(" ")
                  : "Recruiter"}
              </p>
              <p className="text-[10px] font-bold text-scrutiq-blue tracking-widest leading-none">
                Technical portal
              </p>
            </div>
            <button
              onClick={() => {
                setShowProfile(!showProfile);
                setShowNotifications(false);
              }}
              className={`size-10 rounded-xl border flex items-center justify-center transition-all overflow-hidden group ${
                showProfile
                  ? "bg-scrutiq-blue/5 border-scrutiq-blue/20"
                  : "bg-scrutiq-bg border-scrutiq-border hover:bg-scrutiq-surface"
              }`}
            >
              {user?.profilePic && !imgError ? (
                <img
                  src={user.profilePic}
                  alt={user?.name || "User"}
                  className="size-full object-cover"
                  onError={() => setImgError(true)}
                />
              ) : (
                <CircleUserRound
                  className={`size-6 ${showProfile ? "text-scrutiq-blue" : "text-scrutiq-muted group-hover:text-scrutiq-blue"} transition-colors`}
                />
              )}
            </button>
          </div>

          <AnimatePresence>
            {showProfile && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                className="fixed md:absolute top-[70px] md:top-auto right-4 md:right-0 mt-3 w-64 md:w-56 bg-scrutiq-surface border border-scrutiq-border rounded-2xl shadow-xl overflow-hidden z-[100]"
              >
                <div className="p-2">
                  <div className="px-4 py-3 mb-2 border-b border-scrutiq-border/50">
                    <p className="text-[10px] font-bold text-scrutiq-muted tracking-widest">
                      Company account
                    </p>
                    <p className="text-xs font-bold text-scrutiq-dark truncate">
                      {user?.company || "Scrutiq"}
                    </p>
                  </div>
                  <Link
                    href="/dashboard/settings"
                    className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-scrutiq-bg text-scrutiq-muted hover:text-scrutiq-dark transition-all"
                  >
                    <Settings className="size-4" />
                    <span className="text-[11px] font-bold tracking-widest">
                      Account settings
                    </span>
                  </Link>
                  <button
                    onClick={handleSignOut}
                    className="flex w-full items-center gap-3 px-4 py-3 rounded-xl hover:bg-scrutiq-bg text-scrutiq-muted hover:text-rose-500 transition-all text-left"
                  >
                    <LogOut className="size-4" />
                    <span className="text-[11px] font-bold tracking-widest">
                      Sign out
                    </span>
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
