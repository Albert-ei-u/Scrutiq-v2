"use client";

import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  CheckCircle2,
  AlertCircle,
  FileText,
  User,
  ShieldCheck,
  BarChart,
  Target,
} from "lucide-react";
import { ScreeningResult } from "@/store/slices/screeningSlice";

interface CandidateDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  result: ScreeningResult | null;
}

const CandidateDetailModal = ({
  isOpen,
  onClose,
  result,
}: CandidateDetailModalProps) => {
  if (!result) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-scrutiq-dark/40 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-2xl bg-scrutiq-surface rounded-3xl border border-scrutiq-border shadow-2xl overflow-hidden"
          >
            <div className="p-8 border-b border-scrutiq-border/50 flex items-start justify-between bg-scrutiq-bg/30">
              <div className="flex items-center gap-5">
                <div className="size-16 rounded-2xl bg-scrutiq-blue flex items-center justify-center shadow-lg shadow-scrutiq-blue/20">
                  <User className="size-8 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-black text-scrutiq-dark uppercase tracking-tighter">
                    {result.candidateName}
                  </h2>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center gap-1.5">
                      <ShieldCheck className="size-3" />
                      Screened
                    </span>
                    <span className="text-[10px] font-bold text-scrutiq-muted uppercase tracking-widest px-2.5 py-1 bg-scrutiq-surface border border-scrutiq-border rounded-lg">
                      ID: {result.candidateId}
                    </span>
                  </div>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 text-scrutiq-muted hover:text-scrutiq-blue hover:bg-scrutiq-surface rounded-xl border border-transparent hover:border-scrutiq-border transition-all"
              >
                <X className="size-5" />
              </button>
            </div>

            <div className="p-8 space-y-8 max-h-[70vh] overflow-y-auto custom-scrollbar">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-scrutiq-bg p-5 rounded-2xl border border-scrutiq-border/50 space-y-1">
                  <div className="flex items-center gap-2 text-scrutiq-muted">
                    <BarChart className="size-4" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-scrutiq-muted">
                      Match Score
                    </span>
                  </div>
                  <p className="text-2xl font-black text-scrutiq-blue">
                    {result.matchScore}%
                  </p>
                </div>
                <div className="bg-scrutiq-bg p-5 rounded-2xl border border-scrutiq-border/50 space-y-1">
                  <div className="flex items-center gap-2 text-scrutiq-muted">
                    <Target className="size-4" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-scrutiq-muted">
                      Recommendation
                    </span>
                  </div>
                  <p className="text-sm font-black text-scrutiq-dark uppercase tracking-tight">
                    {result.finalRecommendation ||
                      (result as any).recommendation}
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <FileText className="size-4 text-scrutiq-blue" />
                  <h3 className="text-sm font-black text-scrutiq-dark uppercase tracking-tight">
                    Summary
                  </h3>
                </div>
                <div className="bg-scrutiq-surface border border-scrutiq-border/50 p-6 rounded-2xl">
                  <p className="text-sm font-medium text-scrutiq-muted leading-relaxed italic">
                    {result.reasoning}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4 border-t border-scrutiq-border/30">
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="size-4 text-emerald-500" />
                    <h3 className="text-sm font-black text-scrutiq-dark uppercase tracking-tight">
                      Strengths
                    </h3>
                  </div>
                  <div className="space-y-2">
                    {(result.strengths || []).length > 0 ? (
                      (result.strengths || []).map((strength, i) => (
                        <div key={i} className="flex items-start gap-2 group">
                          <div className="size-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0 group-hover:scale-125 transition-transform" />
                          <p className="text-[11px] font-bold text-scrutiq-muted leading-tight uppercase tracking-tight">
                            {strength}
                          </p>
                        </div>
                      ))
                    ) : (
                      <p className="text-[10px] font-bold text-scrutiq-muted/50 uppercase italic">
                        No specific strengths noted
                      </p>
                    )}
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="size-4 text-rose-500" />
                    <h3 className="text-sm font-black text-scrutiq-dark uppercase tracking-tight">
                      Weaknesses
                    </h3>
                  </div>
                  <div className="space-y-2">
                    {(result.weaknesses || (result as any).gaps || []).length >
                    0 ? (
                      (result.weaknesses || (result as any).gaps || []).map(
                        (weakness, i) => (
                          <div key={i} className="flex items-start gap-2 group">
                            <div className="size-1.5 rounded-full bg-rose-500 mt-1.5 shrink-0 group-hover:scale-125 transition-transform" />
                            <p className="text-[11px] font-bold text-scrutiq-muted leading-tight uppercase tracking-tight">
                              {weakness}
                            </p>
                          </div>
                        ),
                      )
                    ) : (
                      <p className="text-[10px] font-bold text-scrutiq-muted/50 uppercase italic">
                        No critical weaknesses identified
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="p-8 border-t border-scrutiq-border/50 bg-scrutiq-bg/30 flex justify-end gap-4">
              {(result as any).candidateResume && (
                <button
                  onClick={() => {
                    const rawApiUrl =
                      process.env.NEXT_PUBLIC_API_URL ||
                      "http://localhost:5000/api";
                    const baseUrl = rawApiUrl
                      .split("/api")[0]
                      .replace(/\/$/, "");
                    const url = (result as any).candidateResume;
                    if (url.startsWith("http")) {
                      window.open(url, "_blank");
                      return;
                    }
                    const sanitizedPath = url
                      .replace(/^(\/?uploads\/)/, "")
                      .replace(/^\//, "");
                    const cleanPath = `/uploads/${sanitizedPath}`;
                    window.open(`${baseUrl}${cleanPath}`, "_blank");
                  }}
                  className="btn-secondary flex items-center gap-2"
                >
                  <FileText className="size-4" />
                  View Original PDF
                </button>
              )}
              <button onClick={onClose} className="btn-secondary">
                Close
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default CandidateDetailModal;
