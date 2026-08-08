"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { motion, AnimatePresence } from "framer-motion";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCloudArrowUp,
  faFileCsv,
  faFilePdf,
  faFileExcel,
  faXmark,
  faCheckCircle,
} from "@fortawesome/free-solid-svg-icons";
import { toast } from "@/lib/toast";

export default function FileUploadZone() {
  const [files, setFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setFiles((prev) => [...prev, ...acceptedFiles]);
    toast.success(`${acceptedFiles.length} files added to queue.`);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "text/csv": [".csv"],
      "application/pdf": [".pdf"],
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [
        ".xlsx",
      ],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
        [".docx"],
      "application/msword": [".doc"],
    },
  });

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    if (files.length === 0) return;

    setIsUploading(true);
    // Simulate upload progress
    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsUploading(false);
          setFiles([]);
          setUploadProgress(0);
          toast.success("All candidates imported successfully!");
          return 100;
        }
        return prev + 10;
      });
    }, 200);
  };

  const getFileIcon = (fileName: string) => {
    if (fileName.endsWith(".csv")) return faFileCsv;
    if (fileName.endsWith(".pdf")) return faFilePdf;
    return faFileExcel;
  };

  return (
    <div className="space-y-6">
      <div
        {...getRootProps()}
        className={`relative glass-card border-2 border-dashed p-12 transition-all cursor-pointer text-center group ${
          isDragActive
            ? "border-brand-indigo bg-brand-indigo/5 scale-[0.99]"
            : "border-white/10 hover:border-brand-indigo/50 hover:bg-scrutiq-surface/[0.02]"
        }`}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-brand-indigo/10 text-brand-indigo flex items-center justify-center shadow-[0_0_20px_rgba(99,102,241,0.15)] group-hover:scale-110 transition-transform">
            <FontAwesomeIcon icon={faCloudArrowUp} size="2x" />
          </div>
          <div className="space-y-1">
            <h3 className="text-xl font-bold text-white">
              Drag and drop candidate files
            </h3>
            <p className="text-gray-400 text-sm">
              Support for{" "}
              <span className="text-white font-medium">
                CSV, Excel (XLSX), DOCX and PDF
              </span>{" "}
              resumes.
            </p>
          </div>
          <div className="flex items-center gap-3 mt-2">
            <div className="px-3 py-1 bg-scrutiq-surface/5 border border-white/10 rounded-lg flex items-center gap-2 text-xs text-gray-500">
              <FontAwesomeIcon icon={faFileCsv} className="text-emerald-400" />
              CSV
            </div>
            <div className="px-3 py-1 bg-scrutiq-surface/5 border border-white/10 rounded-lg flex items-center gap-2 text-xs text-gray-500">
              <FontAwesomeIcon icon={faFileExcel} className="text-blue-400" />
              XLSX
            </div>
            <div className="px-3 py-1 bg-scrutiq-surface/5 border border-white/10 rounded-lg flex items-center gap-2 text-xs text-gray-500">
              <FontAwesomeIcon icon={faFilePdf} className="text-rose-400" />
              PDF
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {files.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="glass-card p-6 space-y-4"
          >
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-white">
                Files to Import ({files.length})
              </h4>
              <button
                onClick={() => setFiles([])}
                className="text-xs text-rose-400 hover:underline font-bold"
              >
                Clear All
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {files.map((file, i) => (
                <motion.div
                  key={i}
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="p-3 bg-scrutiq-surface/5 border border-white/10 rounded-xl flex items-center justify-between group"
                >
                  <div className="flex items-center gap-3 overflow-hidden">
                    <FontAwesomeIcon
                      icon={getFileIcon(file.name)}
                      className={
                        file.name.endsWith(".pdf")
                          ? "text-rose-400"
                          : "text-emerald-400"
                      }
                    />
                    <div className="flex flex-col overflow-hidden">
                      <span className="text-xs font-bold text-white truncate">
                        {file.name}
                      </span>
                      <span className="text-[10px] text-gray-500">
                        {(file.size / 1024).toFixed(1)} KB
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => removeFile(i)}
                    className="p-1.5 hover:bg-rose-500/10 rounded-lg text-gray-500 hover:text-rose-400 transition-all opacity-0 group-hover:opacity-100"
                  >
                    <FontAwesomeIcon icon={faXmark} className="text-xs" />
                  </button>
                </motion.div>
              ))}
            </div>

            <div className="pt-4 border-t border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex-1 max-w-md">
                {isUploading && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-[10px] uppercase font-bold text-gray-500">
                      <span>Importing Candidates...</span>
                      <span>{uploadProgress}%</span>
                    </div>
                    <div className="h-1 bg-scrutiq-surface/5 rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-brand-indigo"
                        initial={{ width: 0 }}
                        animate={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
              <button
                onClick={handleUpload}
                disabled={isUploading}
                className={`px-8 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg ${
                  isUploading
                    ? "bg-scrutiq-surface/10 text-gray-500 cursor-not-allowed"
                    : "bg-brand-indigo hover:bg-brand-indigo/90 text-white shadow-brand-indigo/25"
                }`}
              >
                {isUploading ? (
                  <FontAwesomeIcon
                    icon={faCloudArrowUp}
                    className="animate-bounce"
                  />
                ) : (
                  <FontAwesomeIcon icon={faCheckCircle} />
                )}
                {isUploading ? "Processing..." : "Import Candidates"}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
