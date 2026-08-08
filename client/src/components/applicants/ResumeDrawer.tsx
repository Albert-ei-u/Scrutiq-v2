"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  FileText,
  User,
  MapPin,
  Mail,
  Briefcase,
  ExternalLink,
} from "lucide-react";

interface ResumeDrawerProps {
  candidate: any;
  isOpen: boolean;
  onClose: () => void;
}

export default function ResumeDrawer({
  candidate,
  isOpen,
  onClose,
}: ResumeDrawerProps) {
  if (!candidate) return null;

  const getResumeUrl = (url?: string) => {
    if (!url) return null;
    if (url.startsWith("http")) return url;

    const rawApiUrl =
      process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
    const baseUrl = rawApiUrl.split("/api")[0].replace(/\/$/, "");

    // Robustly handle both old (uploads/resumes/...) and new (resumes/...) path formats
    const sanitizedPath = url.replace(/^(\/?uploads\/)/, "").replace(/^\//, "");
    const cleanPath = `/uploads/${sanitizedPath}`;

    return `${baseUrl}${cleanPath}`;
  };

  const resumeText =
    candidate["resuméText"] ||
    candidate.technicalProfile ||
    "No resume text available.";
  const fullResumeUrl = getResumeUrl(candidate.resumeUrl);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 lg:p-8">
          {/* Backdrop */}
          <motion.div
            onClick={onClose}
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-scrutiq-dark/40 backdrop-blur-md"
          />

          {/* Modal */}
          <motion.div
            key="modal"
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", damping: 28, stiffness: 300 }}
            className="relative w-full max-w-4xl max-h-full bg-scrutiq-surface rounded-3xl shadow-2xl border border-scrutiq-border flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="p-6 border-b border-scrutiq-border/50 flex items-start justify-between bg-scrutiq-bg shrink-0">
              <div className="flex items-center gap-4">
                <div className="size-14 rounded-2xl bg-scrutiq-blue/10 flex items-center justify-center text-2xl font-black text-scrutiq-blue border border-scrutiq-blue/20">
                  {candidate.name?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h2 className="text-lg font-black text-scrutiq-dark uppercase tracking-tight">
                    {candidate.name}
                  </h2>
                  <div className="flex items-center gap-3 mt-1 flex-wrap">
                    <span className="flex items-center gap-1 text-[10px] font-bold text-scrutiq-muted uppercase tracking-widest">
                      <Briefcase className="size-3" /> {candidate.role}
                    </span>
                    {candidate.location && (
                      <span className="flex items-center gap-1 text-[10px] font-bold text-scrutiq-muted uppercase tracking-widest">
                        <MapPin className="size-3" /> {candidate.location}
                      </span>
                    )}
                  </div>
                  {candidate.email &&
                    !candidate.email.includes("@registry.extern") && (
                      <span className="flex items-center gap-1 text-[10px] font-bold text-scrutiq-blue mt-1">
                        <Mail className="size-3" /> {candidate.email}
                      </span>
                    )}
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 text-scrutiq-muted hover:text-scrutiq-dark hover:bg-scrutiq-surface rounded-xl border border-transparent hover:border-scrutiq-border transition-all shrink-0"
              >
                <X className="size-5" />
              </button>
            </div>

            {/* Resume Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4 font-jakarta">
              <div className="flex items-center justify-between border-b border-scrutiq-border/50 pb-3">
                <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-scrutiq-muted">
                  <FileText className="size-4 text-scrutiq-blue" />
                  {candidate.resumeUrl
                    ? "Primary CV Document"
                    : "Extracted CV Text"}
                </div>
                {fullResumeUrl && (
                  <a
                    href={fullResumeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-[10px] font-black uppercase text-scrutiq-blue hover:underline"
                  >
                    <ExternalLink className="size-3" />
                    Open in Full Screen
                  </a>
                )}
              </div>

              {fullResumeUrl ? (
                <div className="h-[600px] w-full rounded-2xl border border-scrutiq-border/50 overflow-hidden bg-scrutiq-bg">
                  <iframe
                    src={
                      fullResumeUrl.includes("google.com/document")
                        ? fullResumeUrl
                        : `${fullResumeUrl}#toolbar=0`
                    }
                    className="w-full h-full border-none"
                    title="Resume Preview"
                  />
                </div>
              ) : (
                <div className="bg-scrutiq-bg rounded-2xl border border-scrutiq-border/50 p-6 whitespace-pre-wrap font-sans text-sm text-scrutiq-dark">
                  {resumeText.trim()}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-scrutiq-border/50 bg-scrutiq-bg shrink-0">
              <p className="text-center text-[10px] font-bold text-scrutiq-muted uppercase tracking-widest">
                ID: {candidate.id} • Extracted from uploaded resume
              </p>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
