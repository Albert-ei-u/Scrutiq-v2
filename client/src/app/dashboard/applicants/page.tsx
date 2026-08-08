"use client";

import { useState, useEffect } from "react";
import {
  Users,
  Search,
  Filter,
  Mail,
  FileText,
  Plus,
  ShieldCheck,
  MapPin,
  Briefcase,
  RefreshCcw,
  Upload,
  Download,
  Activity,
  Trash2,
  AlertTriangle,
  Eye,
} from "lucide-react";
import ExcelJS from "exceljs";

import api from "@/lib/api";
import { useNotifications } from "@/context/NotificationContext";
import UploadDossierModal from "@/components/applicants/UploadDossierModal";
import ResumeDrawer from "@/components/applicants/ResumeDrawer";
import ContactModal from "@/components/applicants/ContactModal";
import DuplicateResolutionModal from "@/components/applicants/DuplicateResolutionModal";
import Link from "next/link";
import { motion } from "framer-motion";
import { useSearchParams } from "next/navigation";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

const ApplicantsPage = () => {
  const searchParams = useSearchParams();
  const initialSearch = searchParams.get("search") || "";

  const { notify } = useNotifications();
  const [candidates, setCandidates] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState(initialSearch);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState<any>(null);
  const [isResumeOpen, setIsResumeOpen] = useState(false);
  const [isContactOpen, setIsContactOpen] = useState(false);
  const [isDuplicateModalOpen, setIsDuplicateModalOpen] = useState(false);
  const [sortOrder, setSortOrder] = useState<"none" | "asc" | "desc">("none");
  const [filterScope, setFilterScope] = useState<"all" | "duplicates">("all");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);

  const handleResolveDuplicate = async (
    id: string,
    action: "keep_original" | "keep_new",
  ) => {
    try {
      await api.post(`/applicants/${id}/resolve-duplicate`, { action });
      notify("Duplicate conflict resolved.", "success");
      setIsDuplicateModalOpen(false);

      // Refresh the registry
      const response = await api.get("/applicants");
      const updatedCandidates = response.data.data;
      setCandidates(updatedCandidates);

      // If we were in duplicates view and no more duplicates exist, return to all view
      const remainingDuplicates = updatedCandidates.filter(
        (c: any) => c.isDuplicate,
      ).length;
      if (filterScope === "duplicates" && remainingDuplicates === 0) {
        setFilterScope("all");
      }
    } catch (error) {
      notify("Failed to resolve duplicate conflict.", "error");
    }
  };

  const fetchCandidates = async () => {
    setIsLoading(true);
    try {
      const response = await api.get("/applicants");
      setCandidates(response.data.data);
    } catch (error) {
      console.error("Candidate Registry Retrieval Fault:", error);
      notify("Failed to connect to the technical talent registry.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCandidates();
  }, []);

  useEffect(() => {
    const search = searchParams.get("search");
    if (search !== null) {
      setSearchTerm(search);
    }
  }, [searchParams]);

  const toggleSort = () => {
    setSortOrder((prev) =>
      prev === "none" ? "asc" : prev === "asc" ? "desc" : "none",
    );
  };

  const handleDeleteCandidate = async (id: string, name: string) => {
    if (
      window.confirm(
        `Are you sure you want to remove ${name} from the registry?`,
      )
    ) {
      try {
        await api.delete(`/applicants/${id}`);
        notify("Profile removed successfully.", "success");
        fetchCandidates();
      } catch (error) {
        notify("Failed to remove profile.", "error");
      }
    }
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredCandidates.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredCandidates.map((c) => c._id));
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
    );
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    if (
      !window.confirm(
        `Are you sure you want to remove ${selectedIds.length} profiles from the registry?`,
      )
    )
      return;

    setIsBulkDeleting(true);
    try {
      await api.delete("/applicants/bulk", { data: { ids: selectedIds } });
      notify(`${selectedIds.length} profiles removed successfully.`, "success");
      setSelectedIds([]);
      fetchCandidates();
    } catch (error) {
      notify("Failed to remove profiles.", "error");
    } finally {
      setIsBulkDeleting(false);
    }
  };

  const handleDownload = async () => {
    if (candidates.length === 0) return;

    notify("Generating professional talent ledger...", "info");

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Applicants");

    // Define columns
    worksheet.columns = [
      { header: "NAME", key: "name", width: 30 },
      { header: "EMAIL", key: "email", width: 35 },
      { header: "GENDER", key: "gender", width: 15 },
      { header: "EXPERIENCE", key: "experience", width: 50 },
      { header: "STATUS", key: "status", width: 20 },
    ];

    // Add rows
    candidates.forEach((app) => {
      worksheet.addRow({
        name: (app.name || "").toUpperCase(),
        email: app.email || "Not provided",
        gender: app.gender || "Not stated",
        experience: app.experience || "No details available",
        status: app.isScreened ? "SCANNED" : "UNSCANNED",
      });
    });

    // Styling: Column titles bold and underlined
    const headerRow = worksheet.getRow(1);
    headerRow.eachCell((cell) => {
      cell.font = {
        name: "Poppins",
        bold: true,
        underline: true,
        size: 11,
      };
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "F1F5F9" },
      };
      cell.alignment = { vertical: "middle", horizontal: "center" };
      cell.border = {
        top: { style: "thin" },
        left: { style: "thin" },
        bottom: { style: "thin" },
        right: { style: "thin" },
      };
    });

    // Styling: Whole table in Poppins font, grid separated by single border
    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber > 1) {
        row.eachCell((cell) => {
          cell.font = { name: "Poppins", size: 10 };
          cell.alignment = {
            vertical: "middle",
            horizontal: "left",
            wrapText: true,
          };
          cell.border = {
            top: { style: "thin" },
            left: { style: "thin" },
            bottom: { style: "thin" },
            right: { style: "thin" },
          };
        });
      }
    });

    // Styling: Whole table having a double border (Simplified by bordering the range)
    const lastRow = worksheet.lastRow?.number || 1;
    const lastCol = worksheet.lastColumn?.number || 5;

    for (let r = 1; r <= lastRow; r++) {
      const row = worksheet.getRow(r);
      // Left border of first column
      const firstCell = row.getCell(1);
      firstCell.border = { ...firstCell.border, left: { style: "double" } };
      // Right border of last column
      const lastCell = row.getCell(lastCol);
      lastCell.border = { ...lastCell.border, right: { style: "double" } };
    }

    const firstRow = worksheet.getRow(1);
    firstRow.eachCell((cell) => {
      cell.border = { ...cell.border, top: { style: "double" } };
    });

    const finalRow = worksheet.getRow(lastRow);
    finalRow.eachCell((cell) => {
      cell.border = { ...cell.border, bottom: { style: "double" } };
    });

    // Auto-adjust column widths to fit content
    worksheet.columns.forEach((column: any) => {
      let maxColumnLength = 0;
      column.eachCell({ includeEmpty: true }, (cell: any) => {
        const columnLength = cell.value ? cell.value.toString().length : 10;
        if (columnLength > maxColumnLength) {
          maxColumnLength = columnLength;
        }
      });
      column.width = Math.min(maxColumnLength + 5, 60); // Cap at 60 for readability
    });

    // Write to buffer and download

    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.href = url;
    link.download = `scrutiq_talent_ledger_${new Date().toISOString().split("T")[0]}.xlsx`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    notify("Talent ledger synchronized and exported.", "success");
  };

  const filteredCandidates = candidates
    .filter(
      (app) =>
        filterScope === "all" ||
        (filterScope === "duplicates" && app.isDuplicate),
    )
    .filter((app) => {
      const search = searchTerm.toLowerCase();
      const name = (app.name || "").toLowerCase();
      const email = (app.email || "").toLowerCase();
      const role = (app.role || "").toLowerCase();

      return (
        name.includes(search) || email.includes(search) || role.includes(search)
      );
    })
    .sort((a, b) => {
      if (sortOrder === "none") return 0;
      const nameA = (a.name || "").toLowerCase();
      const nameB = (b.name || "").toLowerCase();
      if (sortOrder === "asc") return nameA.localeCompare(nameB);
      return nameB.localeCompare(nameA);
    });

  if (isLoading) {
    return (
      <div className="py-24 flex flex-col items-center justify-center space-y-4 font-jakarta">
        <RefreshCcw className="size-10 text-scrutiq-blue animate-spin" />
        <p className="text-xs font-bold text-scrutiq-muted tracking-widest">
          Loading applicants...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 md:space-y-10 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between bg-scrutiq-surface p-4 sm:p-6 md:p-8 rounded-2xl border border-scrutiq-border shadow-sm gap-6">
        <div className="space-y-1">
          <h1 className="text-3xl font-black text-scrutiq-dark tracking-tighter">
            Applicants
          </h1>
          <p className="text-xs font-bold text-scrutiq-muted tracking-widest">
            Manage your candidates and resumes
          </p>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={handleDownload}
            className="btn-secondary flex items-center gap-2"
          >
            <Download className="size-4" />
            <span className="hidden sm:block">Download list</span>
          </button>
          <button
            onClick={() => setIsUploadModalOpen(true)}
            className="btn-primary flex items-center gap-2 px-6 shadow-lg shadow-scrutiq-blue/20 transition-all hover:-translate-y-0.5"
          >
            <Upload className="size-4" />
            <span>Upload resumes</span>
          </button>
        </div>
      </div>

      {candidates.filter((c) => c.isDuplicate).length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-amber-50 border border-amber-200 rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-4 shadow-sm"
        >
          <div className="flex items-center gap-4">
            <div className="size-10 rounded-full bg-amber-100 flex items-center justify-center text-amber-600">
              <AlertTriangle className="size-5" />
            </div>
            <div>
              <h3 className="text-sm font-black text-amber-900 tracking-tight">
                Registry Conflict Detected
              </h3>
              <p className="text-[10px] font-bold text-amber-700 uppercase tracking-widest mt-0.5">
                {candidates.filter((c) => c.isDuplicate).length} profiles
                require administrative resolution
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              if (filterScope === "all") {
                setFilterScope("duplicates");
                setSearchTerm("");
                notify(
                  "Showing only profiles requiring duplication resolution.",
                  "info",
                );
              } else {
                setFilterScope("all");
              }
            }}
            className="w-full md:w-auto px-6 py-2.5 bg-amber-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-amber-700 transition-all shadow-md shadow-amber-600/10"
          >
            {filterScope === "duplicates" ? "Clear Filter" : "Review Conflicts"}
          </button>
        </motion.div>
      )}

      <div className="admin-card p-6 bg-scrutiq-surface relative overflow-hidden group">
        <div className="relative z-10 space-y-2">
          <h2 className="text-xl font-black text-scrutiq-dark tracking-tight">
            Quick guide
          </h2>
          <p className="text-xs font-bold text-scrutiq-muted tracking-widest leading-relaxed max-w-2xl">
            This page lists all candidates you've uploaded. You can search by
            name, sort alphabetically, or view their resumes. Once screened, you
            can email them directly.
          </p>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 px-1">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
          <div className="relative group flex items-center bg-scrutiq-surface border border-scrutiq-border rounded-xl px-4 py-2 w-full sm:w-80 focus-within:border-scrutiq-blue focus-within:ring-4 focus-within:ring-scrutiq-blue/5 transition-all">
            <Search className="size-4 text-scrutiq-muted group-focus-within:text-scrutiq-blue" />
            <input
              type="text"
              placeholder="Search applicants..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-transparent border-none outline-none text-xs font-bold text-scrutiq-dark ml-2.5 w-full tracking-wider placeholder:text-scrutiq-muted/50"
            />
          </div>
          <button
            onClick={toggleSort}
            className={`p-2.5 border rounded-xl transition-all flex items-center gap-2 text-[10px] font-bold tracking-widest ${sortOrder !== "none" ? "bg-scrutiq-blue text-white border-scrutiq-blue" : "bg-scrutiq-surface border-scrutiq-border text-scrutiq-muted hover:bg-scrutiq-bg"}`}
          >
            <Filter className="size-4" />
            <span>
              Sort:{" "}
              {sortOrder === "none"
                ? "None"
                : sortOrder === "asc"
                  ? "A-Z"
                  : "Z-A"}
            </span>
          </button>

          {selectedIds.length > 0 && (
            <motion.button
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              onClick={handleBulkDelete}
              disabled={isBulkDeleting}
              className="flex items-center gap-2 px-6 py-2.5 bg-rose-500 hover:bg-rose-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg shadow-rose-500/20 disabled:opacity-50"
            >
              <Trash2 className="size-3.5" />
              {isBulkDeleting
                ? "Removing..."
                : `Delete ${selectedIds.length} Selected`}
            </motion.button>
          )}
        </div>
        <button
          onClick={fetchCandidates}
          className="p-3 text-scrutiq-muted hover:text-scrutiq-blue transition-colors rounded-xl border border-scrutiq-border"
        >
          <RefreshCcw className="size-4" />
        </button>
      </div>

      <div className="admin-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-scrutiq-bg text-[10px] font-bold text-scrutiq-muted tracking-widest border-b border-scrutiq-border/50">
                <th className="px-6 py-5 w-10">
                  <div className="flex items-center justify-center">
                    <input
                      type="checkbox"
                      checked={
                        selectedIds.length === filteredCandidates.length &&
                        filteredCandidates.length > 0
                      }
                      onChange={toggleSelectAll}
                      className="size-4 rounded border-scrutiq-border text-scrutiq-blue focus:ring-scrutiq-blue transition-all cursor-pointer"
                    />
                  </div>
                </th>
                <th className="px-6 py-5">Applicant</th>
                <th className="px-6 py-5">Gender</th>
                <th className="px-6 py-5">Experience</th>
                <th className="px-6 py-5">Status</th>
                <th className="px-6 py-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-scrutiq-border/30">
              {filteredCandidates.map((app) => (
                <tr
                  key={app._id}
                  className={`hover:bg-scrutiq-bg/30 transition-all group ${selectedIds.includes(app._id) ? "bg-scrutiq-blue/5" : ""}`}
                >
                  <td className="px-6 py-6">
                    <div className="flex items-center justify-center">
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(app._id)}
                        onChange={() => toggleSelect(app._id)}
                        className="size-4 rounded border-scrutiq-border text-scrutiq-blue focus:ring-scrutiq-blue transition-all cursor-pointer"
                      />
                    </div>
                  </td>
                  <td className="px-6 py-6 font-jakarta">
                    <div className="flex items-center gap-4">
                      <div className="size-11 rounded-xl bg-scrutiq-blue/5 border border-scrutiq-blue/10 flex items-center justify-center font-bold text-scrutiq-blue group-hover:bg-scrutiq-blue group-hover:text-white transition-all shadow-sm">
                        {app.name.charAt(0)}
                      </div>
                      <div className="space-y-0.5">
                        <p className="text-sm font-black text-scrutiq-dark tracking-tight">
                          {(app.name || "Anonymous")
                            .split(" ")
                            .map((w: string) =>
                              w.length > 0
                                ? w.charAt(0).toUpperCase() +
                                  w.slice(1).toLowerCase()
                                : "",
                            )
                            .join(" ")}
                        </p>
                        <p className="text-[10px] font-bold text-scrutiq-muted tracking-widest leading-none">
                          {app.email || "No email"}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-6 font-bold text-[10px] text-scrutiq-dark">
                    {app.gender || "Not stated"}
                  </td>
                  <td className="px-6 py-6">
                    <div className="flex items-center gap-2 text-scrutiq-muted font-bold text-[10px] uppercase tracking-widest">
                      <MapPin className="size-3.5" />
                      {app.experience}
                    </div>
                  </td>
                  <td className="px-6 py-6">
                    {app.isDuplicate ? (
                      <button
                        onClick={() => {
                          setSelectedCandidate(app);
                          setIsDuplicateModalOpen(true);
                        }}
                        className="px-2.5 py-1 rounded-lg text-[9px] font-bold tracking-wider bg-amber-50 text-amber-600 border border-amber-100 flex items-center gap-1.5 w-fit font-jakarta hover:bg-amber-100 transition-colors"
                      >
                        <AlertTriangle className="size-3" />
                        Duplicate
                      </button>
                    ) : app.isScreened ? (
                      <span className="px-2.5 py-1 rounded-lg text-[9px] font-bold tracking-wider bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center gap-1.5 w-fit font-jakarta">
                        <ShieldCheck className="size-3" />
                        Scanned
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 rounded-lg text-[9px] font-bold tracking-wider bg-rose-50 text-rose-600 border border-rose-100 flex items-center gap-1.5 w-fit font-jakarta">
                        <Activity className="size-3" />
                        Unscanned
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-6 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => {
                          setSelectedCandidate(app);
                          setIsContactOpen(true);
                        }}
                        disabled={!app.isScreened}
                        className={`p-2 rounded-xl border transition-all ${
                          app.isScreened
                            ? "text-scrutiq-muted hover:text-scrutiq-blue hover:bg-scrutiq-surface border-transparent hover:border-scrutiq-border"
                            : "text-scrutiq-muted/30 border-transparent cursor-not-allowed"
                        }`}
                        title={
                          app.isScreened
                            ? "Send email"
                            : "Screen this applicant first"
                        }
                      >
                        <Mail className="size-4" />
                      </button>
                      <button
                        onClick={() => {
                          setSelectedCandidate(app);
                          if (app.resumeUrl && !app.isAiGenerated) {
                            const rawApiUrl =
                              process.env.NEXT_PUBLIC_API_URL ||
                              "http://localhost:5000/api";
                            const baseUrl = rawApiUrl
                              .split("/api")[0]
                              .replace(/\/$/, "");
                            const url = app.resumeUrl;
                            if (url.startsWith("http")) {
                              window.open(url, "_blank");
                              return;
                            }
                            const sanitizedPath = url
                              .replace(/^(\/?uploads\/)/, "")
                              .replace(/^\//, "");
                            const cleanPath = `/uploads/${sanitizedPath}`;
                            window.open(`${baseUrl}${cleanPath}`, "_blank");
                          } else {
                            setIsResumeOpen(true);
                          }
                        }}
                        disabled={app.isAiGenerated}
                        className={`p-2 rounded-xl border transition-all ${app.isAiGenerated ? "text-scrutiq-muted/30 border-transparent cursor-not-allowed" : "text-scrutiq-muted hover:text-scrutiq-blue hover:bg-scrutiq-surface border-transparent hover:border-scrutiq-border"}`}
                        title={
                          app.isAiGenerated
                            ? "No Original Document (AI Generated)"
                            : "View Resume"
                        }
                      >
                        <Eye className="size-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteCandidate(app._id, app.name)}
                        className="p-2 text-scrutiq-muted hover:text-rose-500 hover:bg-rose-50 rounded-xl border border-transparent hover:border-rose-100 transition-all"
                        title="Delete Profile"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <UploadDossierModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onSuccess={fetchCandidates}
      />

      <ResumeDrawer
        candidate={selectedCandidate}
        isOpen={isResumeOpen}
        onClose={() => setIsResumeOpen(false)}
      />

      <ContactModal
        applicant={selectedCandidate}
        isOpen={isContactOpen}
        onClose={() => setIsContactOpen(false)}
      />

      <DuplicateResolutionModal
        candidate={selectedCandidate}
        isOpen={isDuplicateModalOpen}
        onClose={() => setIsDuplicateModalOpen(false)}
        onResolve={handleResolveDuplicate}
      />
    </div>
  );
};

export default ApplicantsPage;
