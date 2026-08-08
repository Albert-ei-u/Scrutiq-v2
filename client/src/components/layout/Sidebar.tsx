"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Briefcase,
  Users,
  Search,
  Settings,
  ShieldCheck,
  BarChart3,
  Activity,
  X,
  Bot,
  Clock,
} from "lucide-react";
import { useState, useEffect } from "react";
import api from "@/lib/api";

interface SidebarProps {
  onClose?: () => void;
}

const Sidebar = ({ onClose }: SidebarProps) => {
  const pathname = usePathname();
  const [lastUpdate, setLastUpdate] = useState("Just Now");
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const parsed = JSON.parse(storedUser);
      setUser(parsed);

      // Background Sync: If branding is missing, repair the session silently
      if (!parsed.profilePic && parsed.id) {
        api
          .get(`/auth/profile/${parsed.id}`)
          .then((res) => {
            if (res.data.status === "success") {
              const updated = {
                ...parsed,
                profilePic: res.data.data.profilePic,
              };
              localStorage.setItem("user", JSON.stringify(updated));
              setUser(updated);
              window.dispatchEvent(new CustomEvent("user-profile-updated"));
            }
          })
          .catch(() => {});
      }
    }

    const handleProfileSync = () => {
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        const parsed = JSON.parse(storedUser);
        console.log("[Sidebar] Profile Sync:", parsed);
        setUser(parsed);
      }
    };

    window.addEventListener("user-profile-updated", handleProfileSync);

    const timer = setInterval(() => {
      const now = new Date();
      setLastUpdate(
        `${now.getHours()}:${now.getMinutes().toString().padStart(2, "0")}:${now.getSeconds().toString().padStart(2, "0")}`,
      );
    }, 5000);

    return () => {
      clearInterval(timer);
      window.removeEventListener("user-profile-updated", handleProfileSync);
    };
  }, []);

  const menuItems = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Jobs", href: "/dashboard/jobs", icon: Briefcase },
    { name: "Applicants", href: "/dashboard/applicants", icon: Users },
    {
      name: "Screening",
      href: "/dashboard/screenings",
      icon: ShieldCheck,
    },
    {
      name: "Chat Bot",
      href: "/dashboard/chat",
      icon: Bot,
    },
    { name: "System analytics", href: "/dashboard/analytics", icon: BarChart3 },
    { name: "Settings", href: "/dashboard/settings", icon: Settings },
  ];

  return (
    <div className="w-72 bg-scrutiq-surface border-r border-scrutiq-border flex flex-col h-full shadow-2xl lg:shadow-none font-jakarta">
      <div className="p-8 border-b border-scrutiq-border/50 flex items-center justify-between">
        <Link
          href="/dashboard"
          className="flex items-center gap-3 group"
          onClick={onClose}
        >
          <img
            src="/Untitled_design-removebg-preview.svg"
            alt="Scrutiq"
            className="size-10 group-hover:rotate-6 transition-all duration-500"
            style={{ filter: "var(--stq-logo-filter)" }}
          />
          <div>
            <h1 className="text-xl font-black text-scrutiq-dark tracking-tighter leading-none group-hover:text-scrutiq-blue transition-colors">
              Scrutiq
            </h1>
            <span className="text-[11px] font-bold text-scrutiq-muted tracking-widest">
              Recruitment portal
            </span>
          </div>
        </Link>
        <button
          onClick={onClose}
          className="lg:hidden p-2 text-scrutiq-muted hover:text-scrutiq-blue transition-colors"
        >
          <X className="size-5" />
        </button>
      </div>

      <nav className="flex-1 p-6 space-y-1.5 overflow-y-auto custom-scrollbar">
        {menuItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/dashboard" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={onClose}
              className={`flex items-center gap-4 px-5 py-4 rounded-2xl transition-all group ${
                isActive
                  ? "bg-scrutiq-surface text-scrutiq-blue shadow-lg shadow-scrutiq-blue/5 border border-scrutiq-border/50 scale-[1.02]"
                  : "text-scrutiq-muted hover:bg-scrutiq-surface hover:text-scrutiq-dark hover:shadow-sm"
              }`}
            >
              <item.icon
                className={`size-5.5 ${isActive ? "text-scrutiq-blue" : "text-scrutiq-muted group-hover:text-scrutiq-blue transition-colors"}`}
              />
              <span
                className={`text-[15px] font-bold tracking-tight ${isActive ? "text-scrutiq-blue" : ""}`}
              >
                {item.name}
              </span>
            </Link>
          );
        })}
      </nav>

      <div className="p-6 border-t border-scrutiq-border/50">
        <div className="bg-scrutiq-bg p-5 rounded-2xl border border-scrutiq-border/50 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
            <Activity className="size-12 text-scrutiq-blue" />
          </div>
          <p className="text-[10px] font-black text-scrutiq-muted tracking-widest mb-1.5 flex items-center justify-between">
            System status
            <span className="text-emerald-500">●</span>
          </p>
          <div className="space-y-1 relative z-10">
            <div className="flex items-center gap-2">
              <span className="text-xs font-black text-scrutiq-dark tracking-tight">
                All systems
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[9px] font-bold text-scrutiq-muted tracking-widest">
                Online & Synced
              </span>
              <div className="flex items-center gap-1">
                <Clock className="size-2.5 text-scrutiq-blue" />
                <span className="text-[9px] font-black text-scrutiq-blue tracking-widest">
                  {lastUpdate}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
