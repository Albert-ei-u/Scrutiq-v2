"use client";

import { useState, useRef, useEffect } from "react";
import {
  Briefcase,
  MapPin,
  Users,
  ShieldCheck,
  ChevronRight,
  MoreVertical,
  Edit3,
  Archive,
  ExternalLink,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "@/lib/toast";
import api from "@/lib/api";

interface JobCardProps {
  job: {
    _id?: string;
    id: string;
    title: string;
    department: string;
    location: string;
    applicantsCount: number;
    status: string;
    description: string;
  };
  index: number;
  onRefresh: () => void;
  onEdit: (job: any) => void;
  viewMode?: "grid" | "list";
}

const JobCard = ({
  job,
  index,
  onRefresh,
  onEdit,
  viewMode = "grid",
}: JobCardProps) => {
  const router = useRouter();
  const [showActions, setShowActions] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const actionsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        actionsRef.current &&
        !actionsRef.current.contains(event.target as Node)
      ) {
        setShowActions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const actions = [
    { label: "Edit job", icon: Edit3, color: "text-scrutiq-muted" },
    { label: "View details", icon: ExternalLink, color: "text-scrutiq-blue" },
    job.status === "Archived"
      ? { label: "Restore job", icon: Briefcase, color: "text-emerald-500" }
      : { label: "Archive job", icon: Archive, color: "text-amber-500" },
    { label: "Delete job", icon: Trash2, color: "text-rose-500" },
  ];

  const handleAction = async (label: string) => {
    setShowActions(false);
    const jobId = job._id || job.id;

    if (label === "View details") {
      router.push(`/dashboard/jobs/${jobId}`);
      return;
    }

    if (label === "Edit job") {
      onEdit(job);
      return;
    }

    if (label === "Archive job") {
      if (
        !confirm(
          "Are you sure you want to archive this job? It will not be available for screening.",
        )
      )
        return;
      setIsProcessing(true);
      try {
        await api.put(`/jobs/${jobId}`, { status: "Archived" });
        toast.success("Job archived and hidden from screening.");
        onRefresh();
      } catch (err) {
        toast.error("Failed to archive job.");
      } finally {
        setIsProcessing(false);
      }
      return;
    }

    if (label === "Restore job") {
      if (!confirm("Are you sure you want to restore this job?")) return;
      setIsProcessing(true);
      try {
        await api.put(`/jobs/${jobId}`, { status: "Active" });
        toast.success("Job restored to Active state.");
        onRefresh();
      } catch (err) {
        toast.error("Failed to restore job.");
      } finally {
        setIsProcessing(false);
      }
      return;
    }

    if (label === "Delete job") {
      if (!confirm("Are you sure you want to PERMANENTLY delete this job?"))
        return;
      setIsProcessing(true);
      try {
        await api.delete(`/jobs/${jobId}`);
        toast.success("Job deleted successfully.");
        onRefresh();
      } catch (err) {
        toast.error("Failed to delete job.");
      } finally {
        setIsProcessing(false);
      }
      return;
    }
  };

  if (viewMode === "list") {
    return (
      <div className="admin-card !overflow-visible group hover:border-scrutiq-blue transition-all cursor-default flex items-center p-4 gap-6">
        <div className="size-10 rounded-xl bg-scrutiq-blue/5 border border-scrutiq-blue/10 flex items-center justify-center group-hover:bg-scrutiq-blue transition-all shrink-0">
          <Briefcase className="size-5 text-scrutiq-blue group-hover:text-white transition-colors" />
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-black text-scrutiq-dark tracking-tight group-hover:text-scrutiq-blue transition-colors truncate">
            {job.title}
          </h3>
          <p className="text-[10px] font-bold text-scrutiq-muted leading-none">
            {job.department} team
          </p>
        </div>

        <div className="hidden md:flex items-center gap-6">
          <div className="flex items-center gap-2 text-scrutiq-muted min-w-[120px]">
            <MapPin className="size-3" />
            <span className="text-[10px] font-bold tracking-widest">
              {job.location}
            </span>
          </div>
          <div className="flex items-center gap-2 text-scrutiq-muted min-w-[100px]">
            <Users className="size-3" />
            <span className="text-[10px] font-bold tracking-widest">
              {job.applicantsCount} profiles
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <span
            className={`px-2.5 py-1 rounded-lg text-[9px] font-bold tracking-wider border flex items-center gap-1.5 ${
              job.status === "Closed" || job.status === "Archived"
                ? "bg-rose-50 text-rose-600 border-rose-100"
                : "bg-emerald-50 text-emerald-600 border-emerald-100"
            }`}
          >
            {job.status}
          </span>
          <div className="relative" ref={actionsRef}>
            <button
              onClick={() => setShowActions(!showActions)}
              className={`p-1.5 rounded-lg border transition-all ${showActions ? "bg-scrutiq-blue text-white border-scrutiq-blue" : "text-scrutiq-muted hover:text-scrutiq-dark hover:bg-scrutiq-bg border-transparent hover:border-scrutiq-border"}`}
            >
              <MoreVertical className="size-4" />
            </button>
            <AnimatePresence>
              {showActions && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 10 }}
                  className="absolute right-0 mt-2 w-48 bg-scrutiq-surface border border-scrutiq-border rounded-xl shadow-xl z-10 overflow-hidden"
                >
                  <div className="p-1.5">
                    {actions.map((action) => (
                      <button
                        key={action.label}
                        onClick={() => handleAction(action.label)}
                        className="flex w-full items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-scrutiq-bg text-left transition-all group/item"
                      >
                        <action.icon className={`size-3.5 ${action.color}`} />
                        <span className="text-[10px] font-bold text-scrutiq-muted group-hover/item:text-scrutiq-dark transition-colors">
                          {action.label}
                        </span>
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-card !overflow-visible group hover:border-scrutiq-blue transition-all cursor-default relative">
      <div className="p-6 space-y-5">
        <div className="flex items-start justify-between">
          <div className="size-12 rounded-xl bg-scrutiq-blue/5 border border-scrutiq-blue/10 flex items-center justify-center group-hover:bg-scrutiq-blue transition-all">
            <Briefcase className="size-6 text-scrutiq-blue group-hover:text-white transition-colors" />
          </div>
          <div className="relative" ref={actionsRef}>
            <button
              onClick={() => setShowActions(!showActions)}
              className={`p-1.5 rounded-lg border transition-all ${
                showActions
                  ? "bg-scrutiq-blue text-white border-scrutiq-blue"
                  : "text-scrutiq-muted hover:text-scrutiq-dark hover:bg-scrutiq-bg border-transparent hover:border-scrutiq-border"
              }`}
            >
              <MoreVertical className="size-4" />
            </button>

            <AnimatePresence>
              {showActions && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 10 }}
                  className="absolute right-0 mt-2 w-48 bg-scrutiq-surface border border-scrutiq-border rounded-xl shadow-xl z-10 overflow-hidden"
                >
                  <div className="p-1.5">
                    {actions.map((action) => (
                      <button
                        key={action.label}
                        onClick={() => handleAction(action.label)}
                        className="flex w-full items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-scrutiq-bg text-left transition-all group/item"
                      >
                        <action.icon className={`size-3.5 ${action.color}`} />
                        <span className="text-[10px] font-bold text-scrutiq-muted group-hover/item:text-scrutiq-dark transition-colors">
                          {action.label}
                        </span>
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        <div className="space-y-1">
          <h3 className="text-base font-black text-scrutiq-dark tracking-tight group-hover:text-scrutiq-blue transition-colors">
            {job.title}
          </h3>
          <p className="text-[10px] font-bold text-scrutiq-muted leading-none">
            {job.department} team
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 pb-1">
          <div className="flex items-center gap-2 text-scrutiq-muted">
            <MapPin className="size-3" />
            <span className="text-[10px] font-bold tracking-widest leading-none">
              {job.location}
            </span>
          </div>
          <div className="flex items-center gap-2 text-scrutiq-muted">
            <Users className="size-3" />
            <span className="text-[10px] font-bold tracking-widest leading-none">
              {job.applicantsCount} profiles
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between pt-5 border-t border-scrutiq-border/50">
          <span
            className={`px-2.5 py-1 rounded-lg text-[10px] font-bold tracking-wider border flex items-center gap-1.5 ${
              job.status === "Closed" || job.status === "Archived"
                ? "bg-rose-50 text-rose-600 border-rose-100"
                : "bg-emerald-50 text-emerald-600 border-emerald-100"
            }`}
          >
            <ShieldCheck className="size-3" />
            {job.status}
          </span>
          <Link
            href={`/dashboard/jobs/${job._id || job.id}`}
            className="text-[10px] font-bold text-scrutiq-blue hover:underline tracking-widest flex items-center gap-1"
          >
            Manage <ChevronRight className="size-3" />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default JobCard;
