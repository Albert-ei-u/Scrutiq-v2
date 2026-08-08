"use client";

import { useState } from "react";
import {
  Plus,
  X,
  Upload,
  FileText,
  CheckCircle2,
  RefreshCcw,
  ShieldCheck,
  AlertCircle,
  Mail,
} from "lucide-react";
import api from "@/lib/api";
import { toast } from "@/lib/toast";
import { motion, AnimatePresence } from "framer-motion";
import { useDropzone } from "react-dropzone";
import { useCallback } from "react";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

interface UploadDossierModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const UploadDossierModal = ({
  isOpen,
  onClose,
  onSuccess,
}: UploadDossierModalProps) => {
  const [files, setFiles] = useState<File[]>([]);
  const [urls, setUrls] = useState<string[]>([]);
  const [currentUrl, setCurrentUrl] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const allowedTypes = [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/msword",
      "text/csv",
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    ];
    const newFiles = acceptedFiles.filter(
      (f) =>
        allowedTypes.includes(f.type) ||
        f.name.endsWith(".csv") ||
        f.name.endsWith(".xlsx"),
    );
    if (newFiles.length < acceptedFiles.length) {
      toast.warning(
        "Some files were rejected. Please only upload PDF, DOCX or CSV/Excel resumes.",
      );
    }
    setFiles((prev) => [...prev, ...newFiles]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
        [".docx"],
      "application/msword": [".doc"],
      "text/csv": [".csv"],
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [
        ".xlsx",
      ],
    },
  });

  const addUrl = () => {
    if (!currentUrl.trim()) return;
    if (!currentUrl.startsWith("http")) {
      toast.error(
        "Please provide a valid URL starting with http:// or https://",
      );
      return;
    }
    setUrls((prev) => [...prev, currentUrl.trim()]);
    setCurrentUrl("");
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const removeUrl = (index: number) => {
    setUrls((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    if (files.length === 0 && urls.length === 0) return;

    setIsUploading(true);
    setUploadProgress(10);

    const formData = new FormData();
    files.forEach((file) => {
      formData.append("dossiers", file);
    });

    // Append URLs to the formData
    urls.forEach((url) => {
      formData.append("urls", url);
    });

    try {
      setUploadProgress(40);
      const response = await api.post("/applicants/upload", formData);

      if (response.data.status === "success") {
        setUploadProgress(100);
        const { newCount, duplicateCount, total } = response.data.data;

        if (total === 0) {
          toast.info(
            "Ingestion completed, but no technical data could be extracted from these sources.",
          );
        } else if (duplicateCount > 0) {
          const mainMsg = `Duplicate alert: ${duplicateCount} profile resume${duplicateCount > 1 ? "s were" : " was"} uploaded but with confliction with an existing one.`;
          const secondaryMsg =
            newCount > 0
              ? ` Additionally, ${newCount} new profiles were successfully added.`
              : "";
          toast.warning(mainMsg + secondaryMsg, { duration: 8000 });
        } else {
          toast.success(
            `Success! ${newCount} technical profiles have been successfully ingested.`,
          );
        }

        onSuccess();
        setTimeout(onClose, 800);
      }
    } catch (error: any) {
      console.error("Ingestion Error:", error);
      toast.error(
        error.response?.data?.message ||
          "Something went wrong during ingestion. Please try again.",
      );
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const [activeAccordion, setActiveAccordion] = useState<
    "files" | "links" | null
  >(null);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-scrutiq-dark/30 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-xl bg-scrutiq-surface rounded-3xl border border-scrutiq-border shadow-2xl overflow-hidden"
          >
            <div className="p-8 border-b border-scrutiq-border/50 flex items-start justify-between bg-scrutiq-bg/30">
              <div className="flex items-center gap-4">
                <div className="size-12 rounded-xl bg-scrutiq-blue flex items-center justify-center shadow-lg shadow-scrutiq-blue/20">
                  <Upload className="size-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-black text-scrutiq-dark uppercase tracking-tight">
                    Upload New Resumes
                  </h2>
                  <p className="text-[10px] font-bold text-scrutiq-muted uppercase tracking-widest leading-none mt-1">
                    Select your preferred ingestion method
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 text-scrutiq-muted hover:text-scrutiq-blue hover:bg-scrutiq-surface rounded-xl border border-transparent hover:border-scrutiq-border transition-all"
              >
                <X className="size-5" />
              </button>
            </div>

            <div className="p-8 space-y-4 max-h-[70vh] overflow-y-auto custom-scrollbar">
              {/* Option 1: File Section */}
              <div
                className={`overflow-hidden rounded-2xl border transition-all duration-300 ${activeAccordion === "files" ? "border-scrutiq-blue border-opacity-30 bg-scrutiq-surface" : "border-scrutiq-border hover:border-scrutiq-border/80 bg-scrutiq-bg/30"}`}
              >
                <button
                  onClick={() =>
                    setActiveAccordion(
                      activeAccordion === "files" ? null : "files",
                    )
                  }
                  className="w-full px-6 py-4 flex items-center justify-between text-left group"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`p-2 rounded-lg transition-all ${activeAccordion === "files" ? "bg-scrutiq-blue text-white" : "bg-scrutiq-blue/10 text-scrutiq-blue"}`}
                    >
                      <FileText className="size-4" />
                    </div>
                    <div>
                      <span className="text-[10px] font-black text-scrutiq-muted uppercase tracking-widest block leading-none mb-1">
                        Option 1
                      </span>
                      <p className="text-xs font-black text-scrutiq-dark uppercase tracking-tight">
                        Upload Documents
                      </p>
                    </div>
                  </div>
                  <Plus
                    className={`size-4 text-scrutiq-muted transition-transform duration-300 ${activeAccordion === "files" ? "rotate-45 text-scrutiq-blue" : ""}`}
                  />
                </button>

                <AnimatePresence>
                  {activeAccordion === "files" && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                    >
                      <div className="px-6 pb-6 pt-2 space-y-4">
                        <div
                          {...getRootProps()}
                          className={`border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center transition-all ${
                            isUploading
                              ? "border-scrutiq-border bg-scrutiq-bg/10"
                              : isDragActive
                                ? "border-scrutiq-blue bg-scrutiq-blue/10"
                                : "border-scrutiq-border/50 hover:border-scrutiq-blue hover:bg-scrutiq-blue/5 cursor-pointer"
                          }`}
                        >
                          <input {...getInputProps()} id="fileInput" />
                          <Upload
                            className={`size-10 mb-3 transition-colors ${isDragActive ? "text-scrutiq-blue" : "text-scrutiq-muted"}`}
                          />
                          <div className="text-center">
                            <p className="text-[10px] font-black text-scrutiq-dark uppercase tracking-widest">
                              {isDragActive
                                ? "Drop files here"
                                : "Select or Drag Files"}
                            </p>
                            <p className="text-[9px] font-bold text-scrutiq-muted uppercase tracking-widest mt-1">
                              PDF, DOCX or CSV/Excel max 10MB
                            </p>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Option 2: Link Section */}
              <div
                className={`overflow-hidden rounded-2xl border transition-all duration-300 ${activeAccordion === "links" ? "border-scrutiq-blue border-opacity-30 bg-scrutiq-surface" : "border-scrutiq-border hover:border-scrutiq-border/80 bg-scrutiq-bg/30"}`}
              >
                <button
                  onClick={() =>
                    setActiveAccordion(
                      activeAccordion === "links" ? null : "links",
                    )
                  }
                  className="w-full px-6 py-4 flex items-center justify-between text-left group"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`p-2 rounded-lg transition-all ${activeAccordion === "links" ? "bg-scrutiq-blue text-white" : "bg-scrutiq-blue/10 text-scrutiq-blue"}`}
                    >
                      <Plus className="size-4" />
                    </div>
                    <div>
                      <span className="text-[10px] font-black text-scrutiq-muted uppercase tracking-widest block leading-none mb-1">
                        Option 2
                      </span>
                      <p className="text-xs font-black text-scrutiq-dark uppercase tracking-tight">
                        Add Document Links
                      </p>
                    </div>
                  </div>
                  <Plus
                    className={`size-4 text-scrutiq-muted transition-transform duration-300 ${activeAccordion === "links" ? "rotate-45 text-scrutiq-blue" : ""}`}
                  />
                </button>

                <AnimatePresence>
                  {activeAccordion === "links" && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                    >
                      <div className="px-6 pb-6 pt-2 space-y-4">
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={currentUrl}
                            onChange={(e) => setCurrentUrl(e.target.value)}
                            placeholder="Paste Google Sheets, CSV link, or PDF URL..."
                            className="flex-1 bg-scrutiq-bg border border-scrutiq-border rounded-xl px-4 py-2.5 text-[11px] font-bold outline-none focus:border-scrutiq-blue placeholder:text-scrutiq-muted/50"
                            onKeyDown={(e) => e.key === "Enter" && addUrl()}
                          />
                          <button
                            onClick={addUrl}
                            className="px-4 bg-scrutiq-blue text-white rounded-xl hover:bg-scrutiq-blue/90 shadow-md shadow-scrutiq-blue/20 transition-all font-black text-[10px] uppercase"
                          >
                            Add
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Staging Area for Added Assets (Visible regardless of accordion state) */}
              {(files.length > 0 || urls.length > 0) && (
                <div className="space-y-4 pt-4 border-t border-scrutiq-border/50 animate-in fade-in slide-in-from-top-2 duration-500">
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-black text-scrutiq-muted uppercase tracking-widest">
                      Staged for ingestion
                    </span>
                    <span className="text-[9px] font-black text-scrutiq-blue uppercase tracking-widest bg-scrutiq-blue/5 px-2 py-0.5 rounded-full">
                      {files.length + urls.length} Items
                    </span>
                  </div>

                  <div className="space-y-2 max-h-[160px] overflow-y-auto pr-2 custom-scrollbar">
                    {files.map((file, i) => (
                      <div
                        key={`file-${i}`}
                        className="flex items-center justify-between p-2.5 bg-scrutiq-surface border border-scrutiq-border rounded-xl shadow-sm group"
                      >
                        <div className="flex items-center gap-3">
                          <div className="p-1.5 rounded-lg bg-scrutiq-bg text-scrutiq-blue">
                            <FileText className="size-3" />
                          </div>
                          <span className="text-[10px] font-bold text-scrutiq-dark truncate max-w-[200px]">
                            {file.name}
                          </span>
                        </div>
                        <button
                          onClick={() => removeFile(i)}
                          className="p-1 text-scrutiq-muted hover:text-rose-500 transition-colors"
                        >
                          <X className="size-3" />
                        </button>
                      </div>
                    ))}
                    {urls.map((url, i) => (
                      <div
                        key={`url-${i}`}
                        className="flex items-center justify-between p-2.5 bg-emerald-50/20 border border-emerald-100 rounded-xl group shadow-sm"
                      >
                        <div className="flex items-center gap-3">
                          <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-500">
                            <Plus className="size-3" />
                          </div>
                          <span className="text-[10px] font-bold text-emerald-700 truncate max-w-[200px]">
                            {url}
                          </span>
                        </div>
                        <button
                          onClick={() => removeUrl(i)}
                          className="p-1 text-scrutiq-muted hover:text-rose-500 transition-colors"
                        >
                          <X className="size-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {isUploading && (
                <div className="space-y-2 pt-4">
                  <div className="flex justify-between text-[10px] font-black text-scrutiq-blue uppercase tracking-widest">
                    <span>Processing Ingestion Pipeline...</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <div className="h-1.5 bg-scrutiq-bg border border-scrutiq-border rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${uploadProgress}%` }}
                      className="h-full bg-scrutiq-blue rounded-full"
                    />
                  </div>
                </div>
              )}

              <div className="pt-6 border-t border-scrutiq-border/50 flex justify-end gap-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="btn-secondary"
                  disabled={isUploading}
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpload}
                  disabled={
                    isUploading || (files.length === 0 && urls.length === 0)
                  }
                  className="btn-primary flex items-center gap-2 shadow-lg shadow-scrutiq-blue/20 disabled:opacity-50"
                >
                  {isUploading ? (
                    <RefreshCcw className="size-4 animate-spin" />
                  ) : (
                    <ShieldCheck className="size-4" />
                  )}
                  <span>
                    {isUploading
                      ? "Ingesting..."
                      : `Ingest ${files.length + urls.length} Profiles`}
                  </span>
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default UploadDossierModal;
