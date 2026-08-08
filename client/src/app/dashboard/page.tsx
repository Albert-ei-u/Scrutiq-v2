"use client";

import { useState, useEffect } from "react";
import {
  Users,
  Briefcase,
  Search,
  Plus,
  BarChart3,
  ShieldCheck,
  RefreshCcw,
  Upload,
} from "lucide-react";
import Link from "next/link";
import api from "@/lib/api";
import { toast } from "@/lib/toast";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

const DashboardPage = () => {
  const [stats, setStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchStats = async () => {
    try {
      const response = await api.get(`/stats`);
      setStats(response.data.data);
    } catch (error) {
      console.error("Stats Retrieval Fault:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const metaStats = [
    {
      label: "Screenings",
      value: stats?.assessments || 0,
      icon: ShieldCheck,
      color: "blue",
    },
    {
      label: "Active jobs",
      value: stats?.activeJobs || 0,
      icon: Briefcase,
      color: "emerald",
    },
    {
      label: "Total applicants",
      value: stats?.candidates || 0,
      icon: Users,
      color: "amber",
    },
  ];

  const getColorStyles = (color: string) => {
    switch (color) {
      case "blue":
        return "bg-scrutiq-blue/10 text-scrutiq-blue border-scrutiq-blue/20";
      case "emerald":
        return "bg-emerald-500/10 text-emerald-500 border-emerald-500/20";
      case "amber":
        return "bg-amber-500/10 text-amber-500 border-amber-500/20";
      case "rose":
        return "bg-rose-500/10 text-rose-500 border-rose-500/20";
      default:
        return "bg-scrutiq-bg text-scrutiq-muted border-scrutiq-border";
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between bg-scrutiq-surface p-4 md:p-6 rounded-3xl border border-scrutiq-border shadow-sm gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl md:text-3xl font-black text-scrutiq-dark tracking-tighter">
            Dashboard
          </h1>
          <p className="text-xs font-bold text-scrutiq-muted tracking-widest">
            Dashboard overview
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-4">
          <Link
            href="/dashboard/applicants"
            className="btn-secondary flex items-center gap-2 group"
          >
            <Upload className="size-4 group-hover:translate-y-[-2px] transition-transform" />
            <span>Upload Resumes</span>
          </Link>
          <Link
            href="/dashboard/screenings"
            className="btn-primary flex items-center gap-2 px-6 shadow-lg shadow-scrutiq-blue/20 group"
          >
            <ShieldCheck className="size-4 group-hover:scale-110 transition-transform" />
            <span>Start Screening</span>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {metaStats.map((stat) => (
          <div
            key={stat.label}
            className="admin-card p-6 flex items-start gap-4 hover:border-scrutiq-blue transition-all cursor-default group"
          >
            <div
              className={`size-12 rounded-xl border flex items-center justify-center transition-all group-hover:scale-110 ${getColorStyles(stat.color)}`}
            >
              <stat.icon className="size-6" />
            </div>
            <div className="space-y-0.5">
              <p className="text-[10px] font-black text-scrutiq-muted tracking-widest leading-none mb-1">
                {stat.label}
              </p>
              <h3 className="text-2xl font-black text-scrutiq-dark tracking-tighter">
                {isLoading ? "..." : stat.value}
              </h3>
            </div>
          </div>
        ))}
      </div>

      <div className="lg:col-span-3 space-y-4">
        <div className="admin-card p-6 bg-scrutiq-surface relative overflow-hidden group">
          <div className="relative z-10 space-y-6">
            <div className="space-y-2">
              <h2 className="text-2xl font-black text-scrutiq-dark tracking-tight">
                Workflow guide
              </h2>
              <p className="text-xs font-bold text-scrutiq-muted tracking-widest max-w-md">
                Follow these simple steps to find your best talent.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Link
                href="/dashboard/applicants"
                className="p-6 bg-scrutiq-bg border border-scrutiq-border rounded-2xl hover:border-scrutiq-blue hover:shadow-xl transition-all group/card"
              >
                <div className="size-10 rounded-xl bg-scrutiq-surface border border-scrutiq-border flex items-center justify-center mb-4 group-hover/card:bg-scrutiq-blue group-hover/card:text-white transition-all">
                  <Upload className="size-5" />
                </div>
                <p className="text-[10px] font-black text-scrutiq-blue tracking-widest mb-1">
                  First step
                </p>
                <h4 className="text-sm font-black text-scrutiq-dark tracking-tight mb-2">
                  Upload resumes
                </h4>
                <p className="text-[10px] font-bold text-scrutiq-muted tracking-widest leading-relaxed">
                  Add PDF applicant resumes to your profile list.
                </p>
              </Link>
              <Link
                href="/dashboard/screenings"
                className="p-6 bg-scrutiq-bg border border-scrutiq-border rounded-2xl hover:border-scrutiq-blue hover:shadow-xl transition-all group/card"
              >
                <div className="size-10 rounded-xl bg-scrutiq-surface border border-scrutiq-border flex items-center justify-center mb-4 group-hover/card:bg-scrutiq-blue group-hover/card:text-white transition-all">
                  <ShieldCheck className="size-5" />
                </div>
                <p className="text-[10px] font-black text-scrutiq-blue tracking-widest mb-1">
                  Final step
                </p>
                <h4 className="text-sm font-black text-scrutiq-dark tracking-tight mb-2">
                  Screening
                </h4>
                <p className="text-[10px] font-bold text-scrutiq-muted tracking-widest leading-relaxed">
                  Run the screening to instantly rank your top applicants.
                </p>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
