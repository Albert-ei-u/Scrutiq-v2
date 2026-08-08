"use client";

import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  AlertTriangle,
  FileText,
  CheckCircle2,
  Trash2,
  RefreshCcw,
} from "lucide-react";

interface DuplicateResolutionModalProps {
  isOpen: boolean;
  onClose: () => void;
  candidate: any;
  onResolve: (id: string, action: "keep_original" | "keep_new") => void;
}

const DuplicateResolutionModal = ({
  isOpen,
  onClose,
  candidate,
  onResolve,
}: DuplicateResolutionModalProps) => {
  if (!candidate) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="bg-scrutiq-surface w-full max-w-xl rounded-2xl shadow-2xl overflow-hidden border border-scrutiq-border"
          >
            {/* Header */}
            <div className="p-6 border-b border-scrutiq-border flex items-center justify-between bg-amber-50/50">
              <div className="flex items-center gap-3 text-amber-600">
                <AlertTriangle className="size-6" />
                <h2 className="text-xl font-black tracking-tight">
                  Duplicate Conflict
                </h2>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-scrutiq-surface rounded-xl transition-colors"
              >
                <X className="size-5 text-scrutiq-muted" />
              </button>
            </div>

            <div className="p-8 space-y-8">
              <div className="p-5 bg-scrutiq-bg rounded-xl border border-scrutiq-border space-y-3">
                <p className="text-[10px] font-black text-scrutiq-muted tracking-widest uppercase">
                  Detection Intelligence
                </p>
                <p className="text-xs font-bold text-scrutiq-dark leading-relaxed">
                  Our AI analysis has detected a{" "}
                  {Math.round(candidate.similarityScore || 0)}% semantic
                  similarity between this document and an existing profile in
                  your registry. Resolution is required to maintain data
                  integrity.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-6">
                {/* Keep Original Option */}
                <div className="space-y-4">
                  <div className="p-5 rounded-2xl border border-scrutiq-border bg-scrutiq-surface space-y-3 shadow-sm">
                    <FileText className="size-5 text-scrutiq-muted" />
                    <div>
                      <p className="text-[10px] font-black text-scrutiq-muted tracking-widest">
                        ORIGINAL RECORD
                      </p>
                      <p className="text-sm font-black text-scrutiq-dark">
                        Retain Primary
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => onResolve(candidate._id, "keep_original")}
                    className="w-full btn-secondary py-4 flex items-center justify-center gap-2 group"
                  >
                    <CheckCircle2 className="size-4 text-emerald-500 group-hover:scale-110 transition-transform" />
                    <span>Keep Legacy</span>
                  </button>
                </div>

                {/* Keep New Option */}
                <div className="space-y-4">
                  <div className="p-5 rounded-2xl border-scrutiq-blue/20 bg-scrutiq-blue/5 space-y-3 shadow-sm">
                    <RefreshCcw className="size-5 text-scrutiq-blue" />
                    <div>
                      <p className="text-[10px] font-black text-scrutiq-blue/60 tracking-widest">
                        INGESTED VERSION
                      </p>
                      <p className="text-sm font-black text-scrutiq-dark">
                        Overwrite Primary
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => onResolve(candidate._id, "keep_new")}
                    className="w-full bg-scrutiq-blue text-white py-4 rounded-xl text-xs font-black tracking-widest flex items-center justify-center gap-2 hover:bg-scrutiq-blue/90 transition-all shadow-lg shadow-scrutiq-blue/20"
                  >
                    <Trash2 className="size-4 opacity-70" />
                    <span>Replace with New</span>
                  </button>
                </div>
              </div>

              <p className="text-center text-[10px] font-bold text-scrutiq-muted tracking-wide max-w-sm mx-auto opacity-60">
                Discarding a profile is permanent. Historical screening data
                associated with the discarded profile will be archived.
              </p>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default DuplicateResolutionModal;
