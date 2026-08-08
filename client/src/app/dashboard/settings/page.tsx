"use client";

import { useState, useEffect } from "react";
import {
  User,
  Building2,
  Globe,
  ShieldCheck,
  RefreshCcw,
  Save,
  Bell,
  Palette,
  Moon,
  Sun,
  Cloud,
} from "lucide-react";
import { toast } from "@/lib/toast";
import api from "@/lib/api";
import { motion } from "framer-motion";
import AuditLogModal from "@/components/settings/AuditLogModal";
import { useTheme } from "@/context/ThemeContext";

export default function SettingsPage() {
  const { theme, toggleTheme } = useTheme();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isAuditModalOpen, setIsAuditModalOpen] = useState(false);
  const [user, setUser] = useState<any>(null);

  const [profileData, setProfileData] = useState({
    fullName: "",
    companyName: "",
  });

  const [notificationPrefs, setNotificationPrefs] = useState({
    candidateAlerts: true,
    screeningCompletions: true,
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        const parsed = JSON.parse(storedUser);
        setUser(parsed);

        // Load initial prefs from user object
        if (parsed.notifications) {
          setNotificationPrefs(parsed.notifications);
        }

        api
          .get(`/auth/profile/${parsed.id}`)
          .then((res) => {
            if (res.data?.data) {
              const fresh = { ...parsed, ...res.data.data };
              localStorage.setItem("user", JSON.stringify(fresh));
              setUser(fresh);
              setProfileData({
                fullName: fresh.name || "",
                companyName: fresh.company || "",
              });
              if (fresh.notifications) {
                setNotificationPrefs(fresh.notifications);
              }
            }
          })
          .catch((err) => {
            console.error("Profile refresh fault:", err);
            setProfileData({
              fullName: parsed.name || "",
              companyName: parsed.company || "",
            });
          });
      }
      setIsLoading(false);
    }
  }, []);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id) return;

    setIsSaving(true);
    try {
      const response = await api.put(`/auth/profile/${user.id}`, {
        ...profileData,
        notifications: notificationPrefs,
      });

      const updatedUser = {
        ...user,
        name: response.data.data.name,
        company: response.data.data.company,
        notifications: response.data.data.notifications,
      };

      localStorage.setItem("user", JSON.stringify(updatedUser));
      setUser(updatedUser);
      window.dispatchEvent(new Event("user-profile-updated"));

      toast.success("Account preferences synchronized successfully.");
    } catch (error) {
      toast.error("Failed to update portal preferences.");
    } finally {
      setIsSaving(false);
    }
  };

  const toggleNotification = (key: keyof typeof notificationPrefs) => {
    setNotificationPrefs((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  if (isLoading) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center space-y-4">
        <RefreshCcw className="size-10 text-scrutiq-blue animate-spin" />
        <p className="text-xs font-bold text-scrutiq-muted tracking-widest">
          Loading account configuration...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-10 animate-in fade-in duration-700 pb-20 font-jakarta">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between bg-scrutiq-surface p-6 sm:p-8 rounded-2xl border border-scrutiq-border shadow-sm gap-6">
        <div className="space-y-2">
          <h1 className="text-3xl md:text-4xl font-black text-scrutiq-dark tracking-tighter">
            Settings
          </h1>
          <p className="text-xs sm:text-sm font-bold text-scrutiq-muted tracking-wide max-w-lg">
            Manage your profile, notification preferences, and account security.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => window.location.reload()}
            className="p-4 rounded-xl border border-scrutiq-border bg-scrutiq-surface transition-all hover:bg-scrutiq-bg"
          >
            <RefreshCcw className="size-5 text-scrutiq-muted" />
          </button>
          <button
            form="profile-form"
            type="submit"
            disabled={isSaving}
            className="btn-primary flex items-center gap-2 px-8 shadow-xl shadow-scrutiq-blue/20"
          >
            {isSaving ? (
              <RefreshCcw className="size-4 animate-spin" />
            ) : (
              <Save className="size-4" />
            )}
            <span>{isSaving ? "Saving..." : "Save preferences"}</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-8">
          <section className="admin-card p-6 sm:p-10 bg-scrutiq-surface space-y-8">
            <div className="flex items-center gap-4 border-b border-scrutiq-border/50 pb-6">
              <div className="size-16 rounded-3xl bg-scrutiq-blue flex items-center justify-center text-white text-3xl font-black shadow-xl shadow-scrutiq-blue/20">
                <User className="size-8" />
              </div>
              <div>
                <h2 className="text-2xl font-black text-scrutiq-dark tracking-tight">
                  Recruiter profile
                </h2>
                <p className="text-xs font-bold text-scrutiq-muted tracking-widest leading-none mt-1 uppercase">
                  Identify yourself on the platform
                </p>
              </div>
            </div>

            <form
              id="profile-form"
              onSubmit={handleUpdateProfile}
              className="grid grid-cols-1 md:grid-cols-2 gap-8"
            >
              <div className="space-y-2">
                <label className="text-[10px] font-black text-scrutiq-muted tracking-widest uppercase ml-1">
                  Full name
                </label>
                <div className="relative group">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-scrutiq-muted group-focus-within:text-scrutiq-blue transition-colors" />
                  <input
                    type="text"
                    value={profileData.fullName}
                    onChange={(e) =>
                      setProfileData({
                        ...profileData,
                        fullName: e.target.value,
                      })
                    }
                    className="form-input pl-12"
                    placeholder="Your full name"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-scrutiq-muted tracking-widest uppercase ml-1">
                  Email address
                </label>
                <div className="relative opacity-60">
                  <Globe className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-scrutiq-muted" />
                  <input
                    type="email"
                    value={user?.email || "loading..."}
                    disabled
                    className="form-input pl-12 bg-scrutiq-bg cursor-not-allowed"
                  />
                </div>
              </div>

              <div className="space-y-2 md:col-span-2">
                <label className="text-[10px] font-black text-scrutiq-muted tracking-widest uppercase ml-1">
                  Company information
                </label>
                <div className="relative group">
                  <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-scrutiq-muted group-focus-within:text-scrutiq-blue transition-colors" />
                  <input
                    type="text"
                    value={profileData.companyName}
                    onChange={(e) =>
                      setProfileData({
                        ...profileData,
                        companyName: e.target.value,
                      })
                    }
                    className="form-input pl-12"
                    placeholder="Your company"
                    required
                  />
                </div>
              </div>
            </form>
          </section>

          <section className="admin-card p-6 sm:p-10 bg-scrutiq-surface space-y-8">
            <div className="flex items-center gap-4 border-b border-scrutiq-border/50 pb-6">
              <div className="size-12 rounded-2xl bg-scrutiq-bg border border-scrutiq-border flex items-center justify-center text-scrutiq-blue">
                <Bell className="size-6" />
              </div>
              <div>
                <h2 className="text-xl font-black text-scrutiq-dark tracking-tight">
                  Notification preferences
                </h2>
                <p className="text-[10px] font-bold text-scrutiq-muted tracking-widest uppercase mt-1">
                  Control your operational awareness
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-2xl hover:bg-scrutiq-bg transition-colors">
                <div className="space-y-1">
                  <p className="text-sm font-black text-scrutiq-dark tracking-tight">
                    New candidate alerts
                  </p>
                  <p className="text-[10px] font-bold text-scrutiq-muted tracking-widest">
                    Get notified when a new resume is uploaded.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => toggleNotification("candidateAlerts")}
                  className={`w-12 h-6 rounded-full relative transition-all duration-300 ${notificationPrefs.candidateAlerts ? "bg-scrutiq-blue" : "bg-scrutiq-muted/20"}`}
                >
                  <div
                    className={`absolute top-1 size-4 bg-white rounded-full shadow-sm transition-all duration-300 ${notificationPrefs.candidateAlerts ? "right-1" : "left-1"}`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between p-4 rounded-2xl hover:bg-scrutiq-bg transition-colors">
                <div className="space-y-1">
                  <p className="text-sm font-black text-scrutiq-dark tracking-tight">
                    Screening completions
                  </p>
                  <p className="text-[10px] font-bold text-scrutiq-muted tracking-widest">
                    Get notified when an AI screening analysis finishes.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => toggleNotification("screeningCompletions")}
                  className={`w-12 h-6 rounded-full relative transition-all duration-300 ${notificationPrefs.screeningCompletions ? "bg-scrutiq-blue" : "bg-scrutiq-muted/20"}`}
                >
                  <div
                    className={`absolute top-1 size-4 bg-white rounded-full shadow-sm transition-all duration-300 ${notificationPrefs.screeningCompletions ? "right-1" : "left-1"}`}
                  />
                </button>
              </div>
            </div>
          </section>

          <section className="admin-card p-6 sm:p-10 bg-scrutiq-surface space-y-8">
            <div className="flex items-center gap-4 border-b border-scrutiq-border/50 pb-6">
              <div className="size-12 rounded-2xl bg-scrutiq-bg border border-scrutiq-border flex items-center justify-center text-scrutiq-blue">
                <Palette className="size-6" />
              </div>
              <div>
                <h2 className="text-xl font-black text-scrutiq-dark tracking-tight">
                  Portal appearance
                </h2>
                <p className="text-[10px] font-bold text-scrutiq-muted tracking-widest uppercase mt-1">
                  Personalize your visual environment
                </p>
              </div>
            </div>
            <div className="flex items-center justify-between p-4 rounded-2xl hover:bg-scrutiq-bg transition-colors">
              <div className="space-y-1">
                <p className="text-sm font-black text-scrutiq-dark tracking-tight">
                  Dark mode theme
                </p>
                <p className="text-[10px] font-bold text-scrutiq-muted tracking-widest uppercase tracking-widest">
                  Optimize for low-light screening
                </p>
              </div>
              <button
                type="button"
                onClick={toggleTheme}
                className={`w-14 h-7 rounded-full relative transition-all duration-300 ${theme === "dark" ? "bg-scrutiq-blue" : "bg-scrutiq-muted/20"}`}
              >
                <div
                  className={`absolute top-1 size-5 rounded-full shadow-sm flex items-center justify-center transition-all duration-300 ${theme === "dark" ? "left-8 bg-scrutiq-surface" : "left-1 bg-scrutiq-surface"}`}
                >
                  {theme === "dark" ? (
                    <Moon className="size-3 text-scrutiq-blue" />
                  ) : (
                    <Sun className="size-3 text-amber-500" />
                  )}
                </div>
              </button>
            </div>
          </section>
        </div>

        <div className="space-y-8">
          <div className="admin-card p-8 bg-scrutiq-blue/5 border-primary/20 flex flex-col items-center text-center space-y-6">
            <div className="size-20 rounded-3xl bg-scrutiq-surface flex items-center justify-center shadow-lg shadow-scrutiq-blue/5 border border-scrutiq-border">
              <ShieldCheck className="size-10 text-scrutiq-blue" />
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-black text-scrutiq-dark tracking-tight">
                Security & Governance
              </h3>
              <p className="text-[10px] font-bold text-scrutiq-muted tracking-widest leading-relaxed">
                Review your administrative footprint.
              </p>
            </div>
            <button
              onClick={() => setIsAuditModalOpen(true)}
              className="btn-primary w-full shadow-lg shadow-scrutiq-blue/10"
            >
              View Audit Trail
            </button>
          </div>
        </div>
      </div>

      <AuditLogModal
        userId={user?.id}
        isOpen={isAuditModalOpen}
        onClose={() => setIsAuditModalOpen(false)}
      />
    </div>
  );
}
