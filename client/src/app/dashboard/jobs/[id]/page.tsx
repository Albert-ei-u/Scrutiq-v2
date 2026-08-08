"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft,
  Edit3,
  Save,
  ShieldCheck,
  User,
  Trash2,
  Mail,
  FileText,
  Eye,
  AlertTriangle,
  Search,
  Filter,
  Download,
} from "lucide-react";
import ExcelJS from "exceljs";

import api from "@/lib/api";
import { useNotifications } from "@/context/NotificationContext";
import Link from "next/link";
import ResumeDrawer from "@/components/applicants/ResumeDrawer";
import ContactModal from "@/components/applicants/ContactModal";
import DuplicateResolutionModal from "@/components/applicants/DuplicateResolutionModal";
import CandidateDetailModal from "@/components/screening/CandidateDetailModal";
import { ExternalLink } from "lucide-react";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export default function JobDetailPage() {
  const { notify } = useNotifications();
  const params = useParams();
  const router = useRouter();
  const jobId = params.id as string;

  const [job, setJob] = useState<any>(null);
  const [rankings, setRankings] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"overview" | "rankings">(
    "overview",
  );
  const [allApplicants, setAllApplicants] = useState<any[]>([]);
  
  const [searchTerm, setSearchTerm] = useState("");
  const [filterScope, setFilterScope] = useState<"all" | "duplicates">("all");
  const [rankingLimit, setRankingLimit] = useState<number | "all">("all");
  const [customLimitInput, setCustomLimitInput] = useState<string>("");

  useEffect(() => {
    if (customLimitInput === "") return;
    const timer = setTimeout(() => {
      const num = parseInt(customLimitInput);
      if (!isNaN(num) && num > 0 && num <= 1000) {
        setRankingLimit(num);
      }
    }, 1500); // 1.5s debounce for optimal typing balance
    return () => clearTimeout(timer);
  }, [customLimitInput]);

  // Edit mode state
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({ title: "", description: "" });
  const [selectedCandidate, setSelectedCandidate] = useState<any>(null);
  const [isResumeOpen, setIsResumeOpen] = useState(false);
  const [isContactOpen, setIsContactOpen] = useState(false);
  const [isDuplicateModalOpen, setIsDuplicateModalOpen] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedResult, setSelectedResult] = useState<any>(null);

  const handleResolveDuplicate = async (candidateId: string, action: "keep_original" | "keep_new") => {
    try {
      // The candidateId parameter from DuplicateResolutionModal is actually target applicant ID 
      const realId = selectedCandidate?._id || selectedCandidate?.id || candidateId;
      await api.post(`/applicants/${realId}/resolve-duplicate`, { action });
      notify("Duplicate conflict resolved.", "success");
      setIsDuplicateModalOpen(false);
      const rankingsRes = await api.get(`/screening/job/${jobId}`);
      setRankings((rankingsRes.data.data || []).sort((a: any, b: any) => b.matchScore - a.matchScore));
    } catch (error) {
      notify("Failed to resolve duplicate conflict.", "error");
    }
  };

  useEffect(() => {
    if (!jobId) return;

    const fetchData = async () => {
      try {
        setIsLoading(true);
        const [jobRes, rankRes, appRes] = await Promise.all([
          api.get(`/jobs/${jobId}`),
          api.get(`/screening/job/${jobId}`),
          api.get("/applicants"),
        ]);
        setJob(jobRes.data.data);
        setEditData({
          title: jobRes.data.data.title,
          description: jobRes.data.data.description,
        });

        const sortedRanks = (rankRes.data.data || []).sort(
          (a: any, b: any) => b.matchScore - a.matchScore,
        );
        setRankings(sortedRanks);
        setAllApplicants(appRes.data.data || []);
      } catch (error) {
        console.error("Job Data Fetch Fault:", error);
        notify("Failed to load job details.", "error");
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [jobId]);

  const handleSaveCriteria = async () => {
    try {
      const res = await api.put(`/jobs/${jobId}`, editData);
      setJob(res.data.data);
      setIsEditing(false);
      notify("Judgement criteria updated successfully!", "success");
    } catch (error) {
      notify("Failed to update criteria.", "error");
    }
  };

  const handleDeleteRanking = async (
    screeningId: string,
    candidateName: string,
  ) => {
    if (
      window.confirm(
        `Are you sure you want to remove the screening results for ${candidateName}?`,
      )
    ) {
      try {
        await api.delete(`/screening/${screeningId}`);
        notify("Screening result removed.", "success");
        // Refresh rankings
        const rankingsRes = await api.get(`/screening/job/${jobId}`);
        setRankings(rankingsRes.data.data);
      } catch (error) {
        notify("Failed to delete screening result.", "error");
      }
    }
  };
  const handleDownload = async () => {
    if (filteredRankings.length === 0) return;

    notify("Generating professional ranking report...", "info");

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Job Rankings");

    // Define columns based on user request
    worksheet.columns = [
      { header: "RANK", key: "rank", width: 10 },
      { header: "NAME", key: "name", width: 30 },
      { header: "EMAIL", key: "email", width: 35 },
      { header: "GENDER", key: "gender", width: 15 },
      { header: "EXPERIENCE", key: "experience", width: 40 },
      { header: "SCORE", key: "score", width: 15 },
      { header: "PRIORITY ALIGNMENT", key: "alignment", width: 25 },
      { header: "EVALUATION DATE", key: "date", width: 20 },
    ];

    // Add rows from filteredRankings (it respects search/filter)
    filteredRankings.forEach((rank, idx) => {
      // Precise Lookup in Applicant Registry (Sync with Applicants Tab)
      const registryEntry = allApplicants.find(app => (app._id || app.id) === rank.candidateId);
      
      worksheet.addRow({
        rank: `#${idx + 1}`,
        name: (rank.candidateName || "").toUpperCase(),
        email: rank.candidateEmail || "Not provided",
        gender: registryEntry?.gender || rank.candidateGender || "Not stated",
        experience: registryEntry?.experience || rank.candidateExperience || "No details available",
        score: `${rank.matchScore}%`,
        alignment: (rank.finalRecommendation || "FIT").toUpperCase(),
        date: rank.createdAt || rank.timestamp
          ? new Date(rank.createdAt || rank.timestamp).toLocaleDateString()
          : "---",
      });
    });


    // Styling: Column titles bold and underlined
    const headerRow = worksheet.getRow(1);
    headerRow.eachCell((cell) => {
      cell.font = { name: "Poppins", bold: true, underline: true, size: 11 };
      cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "F1F5F9" } };
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
          cell.alignment = { vertical: "middle", horizontal: "left", wrapText: true };
          cell.border = {
            top: { style: "thin" },
            left: { style: "thin" },
            bottom: { style: "thin" },
            right: { style: "thin" },
          };
        });
      }
    });

    // Styling: Double border for outer boundary
    const lastRow = worksheet.lastRow?.number || 1;
    const lastCol = worksheet.lastColumn?.number || 8;

    for (let r = 1; r <= lastRow; r++) {
      const row = worksheet.getRow(r);
      const firstCell = row.getCell(1);
      firstCell.border = { ...firstCell.border, left: { style: "double" } };
      const lastCell = row.getCell(lastCol);
      lastCell.border = { ...lastCell.border, right: { style: "double" } };
    }
    worksheet.getRow(1).eachCell((cell) => {
      cell.border = { ...cell.border, top: { style: "double" } };
    });
    worksheet.getRow(lastRow).eachCell((cell) => {
      cell.border = { ...cell.border, bottom: { style: "double" } };
    });

    // Auto-adjust widths
    worksheet.columns.forEach((column: any) => {
      let maxLen = 0;
      column.eachCell({ includeEmpty: true }, (cell: any) => {
        const len = cell.value ? cell.value.toString().length : 10;
        if (len > maxLen) maxLen = len;
      });
      column.width = Math.min(maxLen + 5, 60);
    });

    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `ranking_report_${job.title.toLowerCase().replace(/\s+/g, "_")}_${new Date().toISOString().split("T")[0]}.xlsx`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    notify("Ranking report exported successfully.", "success");
  };

  // Dynamic Conflict Detection: Cross-check the pool for identical names or emails

  const processedRankings = rankings.map((rank) => {
    const isLocalConflict = rankings.some(
      (other) =>
        other._id !== rank._id &&
        ((other.candidateName &&
          rank.candidateName &&
          other.candidateName.toLowerCase().trim() ===
            rank.candidateName.toLowerCase().trim()) ||
          (other.candidateEmail &&
            rank.candidateEmail &&
            other.candidateEmail !== "No email available" &&
            rank.candidateEmail !== "No email available" &&
            other.candidateEmail.toLowerCase().trim() ===
              rank.candidateEmail.toLowerCase().trim()))
    );

    return {
      ...rank,
      isDuplicate: rank.isDuplicate || isLocalConflict,
    };
  });

  const filteredRankings = processedRankings
    .filter((rank) => filterScope === "all" || (filterScope === "duplicates" && rank.isDuplicate))
    .filter((rank) => (rank.candidateName || "").toLowerCase().includes(searchTerm.toLowerCase()))
    .slice(0, rankingLimit === "all" ? processedRankings.length : rankingLimit);

  if (isLoading) {
    return (
      <div className="py-20 text-center text-xs font-black uppercase text-scrutiq-muted">
        Loading Engine...
      </div>
    );
  }

  if (!job) {
    return (
      <div className="admin-card p-20 text-center space-y-6">
        <h2 className="text-xl font-black text-rose-500 uppercase">
          Job Not Found
        </h2>
        <button
          onClick={() => router.back()}
          className="text-scrutiq-blue font-black uppercase text-xs hover:underline"
        >
          Return to Jobs
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12 animate-in fade-in duration-500">
      <Link
        href="/dashboard/jobs"
        className="inline-flex items-center gap-2 text-[10px] font-black uppercase text-scrutiq-muted hover:text-scrutiq-blue transition-colors"
      >
        <ChevronLeft className="size-4" /> Back to Jobs
      </Link>

      {/* Header */}
      <div className="admin-card p-8 flex flex-col md:flex-row md:items-start justify-between gap-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-32 bg-scrutiq-blue/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />
        <div className="space-y-2 z-10 w-full">
          <div className="flex items-center gap-3">
            <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold border bg-emerald-50 text-emerald-600 border-emerald-100">
              {job.status}
            </span>
            <span className="text-[10px] font-bold text-scrutiq-muted tracking-widest leading-none">
              {job.department} • {job.location}
            </span>
          </div>
          {isEditing ? (
            <input
              value={editData.title}
              onChange={(e) =>
                setEditData({ ...editData, title: e.target.value })
              }
              className="text-3xl font-black text-scrutiq-dark bg-scrutiq-surface border-2 border-scrutiq-blue/30 rounded-xl px-4 py-2 w-full outline-none focus:border-scrutiq-blue"
            />
          ) : (
            <h1 className="text-4xl font-black text-scrutiq-dark tracking-tight">
              {job.title}
            </h1>
          )}
        </div>
        <div className="z-10 flex-shrink-0">
          {isEditing ? (
            <button
              onClick={handleSaveCriteria}
              className="btn-primary flex items-center gap-2"
            >
              <Save className="size-4" /> Save Criteria
            </button>
          ) : (
            <button
              onClick={() => setIsEditing(true)}
              className="btn-secondary flex items-center gap-2 border-scrutiq-blue/20 text-scrutiq-blue hover:bg-scrutiq-blue hover:text-white"
            >
              <Edit3 className="size-4" /> Change Criteria
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-scrutiq-border/50">
        <button
          onClick={() => setActiveTab("overview")}
          className={`px-8 py-4 text-xs font-bold tracking-widest transition-all border-b-2 ${activeTab === "overview" ? "border-scrutiq-blue text-scrutiq-blue" : "border-transparent text-scrutiq-muted hover:text-scrutiq-dark"}`}
        >
          Judgement criteria & info
        </button>
        <button
          onClick={() => setActiveTab("rankings")}
          className={`px-8 py-4 text-xs font-bold tracking-widest transition-all border-b-2 ${activeTab === "rankings" ? "border-scrutiq-blue text-scrutiq-blue" : "border-transparent text-scrutiq-muted hover:text-scrutiq-dark"}`}
        >
          Applicants & Rankings
        </button>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === "overview" && (
          <motion.div
            key="overview"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-8"
          >
            <div className="lg:col-span-2 admin-card p-10 space-y-4">
              <h2 className="text-xs font-bold text-scrutiq-dark tracking-widest border-b border-scrutiq-border/50 pb-2">
                Technical description
              </h2>
              {isEditing ? (
                <textarea
                  value={editData.description}
                  onChange={(e) =>
                    setEditData({ ...editData, description: e.target.value })
                  }
                  className="w-full h-80 bg-scrutiq-surface border-2 border-scrutiq-blue/30 rounded-xl p-4 text-sm font-medium text-scrutiq-dark outline-none focus:border-scrutiq-blue resize-none"
                />
              ) : (
                <p className="text-sm text-scrutiq-muted leading-relaxed font-medium whitespace-pre-wrap">
                  {job.description}
                </p>
              )}
            </div>

            <div className="space-y-6">
              <div className="admin-card p-10 bg-scrutiq-blue/5 border-scrutiq-blue/20 text-center hover-lift">
                <h3 className="text-[10px] font-bold text-scrutiq-blue tracking-widest mb-2">
                  Total scanned profiles
                </h3>
                <span className="text-6xl font-black text-scrutiq-dark tracking-tighter leading-none">
                  {rankings.length}
                </span>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === "rankings" && (
          <motion.div
            key="rankings"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            {rankings.length === 0 ? (
              <div className="admin-card p-24 text-center space-y-6">
                <div className="size-20 rounded-3xl bg-scrutiq-bg flex items-center justify-center mx-auto border border-scrutiq-border">
                  <User className="size-10 text-scrutiq-muted" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-lg font-black text-scrutiq-dark tracking-tight">
                    No applicants ai screened yet
                  </h3>
                  <p className="text-xs text-scrutiq-muted font-bold max-w-sm mx-auto leading-relaxed">
                    Upload resumes on the applicants page and run a screening
                    to see rankings here.
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-1">
                  <div className="flex items-center gap-4">
                    <div className="relative group flex items-center bg-scrutiq-surface border border-scrutiq-border rounded-xl px-4 py-2 w-80 focus-within:border-scrutiq-blue focus-within:ring-4 focus-within:ring-scrutiq-blue/5 transition-all">
                      <Search className="size-4 text-scrutiq-muted group-focus-within:text-scrutiq-blue" />
                      <input
                        type="text"
                        placeholder="Search screened candidates..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="bg-transparent border-none outline-none text-xs font-bold text-scrutiq-dark ml-2.5 w-full tracking-wider placeholder:text-scrutiq-muted/50"
                      />
                    </div>
                    <button
                      onClick={() => {
                        setFilterScope(filterScope === "all" ? "duplicates" : "all");
                        if (filterScope === "all") notify("Showing only conflicts in this job.", "info");
                      }}
                      className={`p-2.5 border rounded-xl transition-all flex items-center gap-2 text-[10px] font-bold tracking-widest ${filterScope === "duplicates" ? "bg-amber-500 text-white border-amber-500" : "bg-scrutiq-surface border-scrutiq-border text-scrutiq-muted hover:bg-scrutiq-bg"}`}
                    >
                      <Filter className="size-4" />
                      <span>{filterScope === "duplicates" ? "Clear Filter" : "Duplicates"}</span>
                    </button>

                    <div className="flex items-center gap-2 bg-scrutiq-surface border border-scrutiq-border rounded-xl px-3 py-1.5 focus-within:border-scrutiq-blue transition-all">
                      <span className="text-[10px] font-black uppercase text-scrutiq-muted tracking-widest">Show Top:</span>
                      <select 
                        value={typeof rankingLimit === "number" && ![5, 10, 15, 25, 50].includes(rankingLimit) ? "custom" : rankingLimit}
                        onChange={(e) => {
                          const val = e.target.value;
                          if (val === "all") {
                            setRankingLimit("all");
                            setCustomLimitInput("");
                          }
                          else if (val === "custom") {
                            setRankingLimit(20); // Initial custom tier
                            setCustomLimitInput("20");
                          }
                          else {
                            const num = parseInt(val);
                            setRankingLimit(num);
                            setCustomLimitInput(val);
                          }
                        }}
                        className="bg-transparent border-none outline-none text-[10px] font-bold text-scrutiq-dark tracking-widest cursor-pointer"
                      >
                        <option value="all">Global (All)</option>
                        <option value="5">Top 5</option>
                        <option value="10">Top 10</option>
                        <option value="15">Top 15</option>
                        <option value="25">Top 25</option>
                        <option value="50">Top 50</option>
                        <option value="custom">Custom Range...</option>
                      </select>
                      
                      {typeof rankingLimit === "number" && ![5, 10, 15, 25, 50].includes(rankingLimit) && (
                        <div className="flex items-center border-l border-scrutiq-border/50 pl-2 ml-1">
                          <input 
                            type="text"
                            inputMode="numeric"
                            value={customLimitInput}
                            onChange={(e) => {
                              const val = e.target.value;
                              if (val === "" || /^(?:[1-9][0-9]{0,2}|1000)$/.test(val)) {
                                setCustomLimitInput(val);
                                if (val === "") setRankingLimit(0);
                              }
                            }}
                            placeholder="1-1000"
                            className="w-14 bg-transparent border-none outline-none text-[10px] font-black text-scrutiq-blue text-center placeholder:text-scrutiq-blue/30"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={handleDownload}
                    className="btn-secondary flex items-center gap-2"
                  >
                    <Download className="size-4" />
                    <span>Download Report</span>
                  </button>
                </div>

                <h3 className="text-xs font-bold text-scrutiq-dark tracking-widest mb-4 border-b border-scrutiq-border/50 pb-2">
                  Ranked best-to-worst
                </h3>
                
                {filteredRankings.length === 0 ? (
                  <div className="admin-card p-12 text-center bg-scrutiq-bg/50 border-dashed">
                    <ShieldCheck className="size-8 text-emerald-500 mx-auto mb-3" />
                    <h4 className="text-sm font-black text-scrutiq-dark uppercase tracking-tight">
                      {rankingLimit === 0 ? "Specify a Range" : "All Clear"}
                    </h4>
                    <p className="text-xs text-scrutiq-muted mt-1 font-medium">
                      {rankingLimit === 0 
                        ? "Please enter a number between 1 and 1000 to see top candidates."
                        : filterScope === "duplicates" 
                          ? "No duplicate conflicts found in this screening pool." 
                          : "No applicants match your search."}
                    </p>
                  </div>
                ) : (
                  <div className="admin-card overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left">
                        <thead>
                          <tr className="bg-scrutiq-bg text-[10px] font-black text-scrutiq-muted uppercase tracking-widest border-b border-scrutiq-border/50">
                            <th className="px-6 py-5">Rank</th>
                            <th className="px-6 py-5">Candidate</th>
                            <th className="px-6 py-5">Gender</th>
                            <th className="px-6 py-5">Score</th>
                            <th className="px-6 py-5">Evaluated</th>
                            <th className="px-6 py-5 text-center">Details</th>
                            <th className="px-6 py-5 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-scrutiq-border/30">
                          {filteredRankings.map((rank, idx) => (
                            <motion.tr
                              key={rank._id}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: idx * 0.05 }}
                              className="hover:bg-scrutiq-bg/30 transition-all group"
                            >
                              <td className="px-6 py-6">
                                  <span className={`size-8 rounded-lg flex items-center justify-center font-bold text-xs ${idx === 0 ? "bg-scrutiq-blue text-white shadow-lg shadow-scrutiq-blue/20" : "bg-scrutiq-surface text-scrutiq-muted border border-scrutiq-border"}`}>
                                  #{idx + 1}
                                </span>
                              </td>
                              <td className="px-6 py-6 font-jakarta">
                                <div className="flex items-center gap-3">
                                  <div>
                                    <p className="text-sm font-black text-scrutiq-dark uppercase tracking-tighter leading-none">
                                      {rank.candidateName || "Technical Candidate"}
                                    </p>
                                    <p className="text-[10px] font-bold text-scrutiq-muted uppercase tracking-widest mt-1">
                                      {rank.candidateEmail}
                                    </p>
                                  </div>
                                  {rank.isDuplicate && (
                                    <button 
                                      onClick={() => {
                                        setSelectedCandidate({
                                          ...rank,
                                          name: rank.candidateName,
                                          email: rank.candidateEmail,
                                          _id: rank.candidateId,
                                        });
                                        setIsDuplicateModalOpen(true);
                                      }}
                                      className="px-1.5 py-0.5 rounded-lg text-[7px] font-black uppercase bg-amber-500/10 text-amber-500 border border-amber-500/20 flex items-center gap-1 leading-none hover:bg-amber-500/20 transition-colors"
                                    >
                                      <AlertTriangle className="size-2" />
                                      DUPE
                                    </button>
                                  )}
                                </div>
                              </td>
                              <td className="px-6 py-6 font-bold text-[10px] text-scrutiq-dark">
                                {rank.candidateGender || "Not stated"}
                              </td>
                              <td className="px-6 py-6">

                                <div className="flex items-center gap-2">
                                  <span className={`text-sm font-black ${rank.matchScore > 80 ? "text-emerald-500" : rank.matchScore > 60 ? "text-amber-500" : "text-rose-500"}`}>
                                    {rank.matchScore}%
                                  </span>
                                  <span className="px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider bg-scrutiq-bg border border-scrutiq-border text-scrutiq-muted">
                                    {rank.finalRecommendation || "Fit"}
                                  </span>
                                </div>
                              </td>
                              <td className="px-6 py-6">
                                <p className="text-[10px] font-bold text-scrutiq-muted uppercase tracking-widest">
                                  {rank.createdAt || rank.timestamp
                                    ? new Date(rank.createdAt || rank.timestamp).toLocaleDateString()
                                    : "---"}
                                </p>
                              </td>
                              <td className="px-6 py-6 text-center">
                                <button
                                  onClick={() => {
                                    setSelectedResult(rank);
                                    setShowDetailModal(true);
                                  }}
                                  className="p-2 text-scrutiq-muted hover:text-scrutiq-blue hover:bg-scrutiq-surface rounded-xl border border-transparent hover:border-scrutiq-border transition-all"
                                  title="Expand AI Synthesis"
                                >
                                  <ExternalLink className="size-4" />
                                </button>
                              </td>
                              <td className="px-6 py-6 text-right">
                                <div className="flex items-center justify-end gap-1.5">
                                  <button
                                    onClick={() => {
                                      const cand = {
                                        name: rank.candidateName,
                                        email: rank.candidateEmail,
                                        role: job.title,
                                        resumeText: rank.resumeText || rank.microSummary,
                                        resumeUrl: rank.candidateResume,
                                        id: rank.candidateId,
                                      };
                                      setSelectedCandidate(cand);
                                      
                                      if (cand.resumeUrl) {
                                        const rawApiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
                                        const baseUrl = rawApiUrl.split('/api')[0].replace(/\/$/, "");
                                        const url = cand.resumeUrl;
                                        if (url.startsWith("http")) {
                                          window.open(url, '_blank');
                                        } else {
                                          const sanitizedPath = url.replace(/^(\/?uploads\/)/, "").replace(/^\//, "");
                                          const cleanPath = `/uploads/${sanitizedPath}`;
                                          window.open(`${baseUrl}${cleanPath}`, '_blank');
                                        }
                                      } else {
                                        setIsResumeOpen(true);
                                      }
                                    }}
                                    className="p-1.5 text-scrutiq-muted hover:text-scrutiq-blue hover:bg-scrutiq-blue/5 rounded-lg transition-all border border-transparent hover:border-scrutiq-blue/10"
                                    title="View Original CV"
                                  >
                                    <Eye className="size-3.5" />
                                  </button>
                                  <button
                                    onClick={() => {
                                      setSelectedCandidate({
                                        name: rank.candidateName,
                                        email: rank.candidateEmail,
                                        role: job.title,
                                        resuméText: rank.candidateResume || rank.microSummary,
                                        id: rank.candidateId,
                                        _id: rank.candidateId,
                                        screening: rank
                                      });
                                      setIsContactOpen(true);
                                    }}
                                    className="p-1.5 text-scrutiq-muted hover:text-scrutiq-blue hover:bg-scrutiq-blue/5 rounded-lg transition-all border border-transparent hover:border-scrutiq-blue/10"
                                    title="Send Email"
                                  >
                                    <Mail className="size-3.5" />
                                  </button>
                                  <button
                                    onClick={() =>
                                      handleDeleteRanking(
                                        rank._id,
                                        rank.candidateName,
                                      )
                                    }
                                    className="p-1.5 text-scrutiq-muted hover:text-rose-500 hover:bg-rose-500/10 rounded-lg transition-all border border-transparent hover:border-rose-500/20"
                                    title="Delete Result"
                                  >
                                    <Trash2 className="size-3.5" />
                                  </button>
                                </div>
                              </td>
                            </motion.tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
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
      <CandidateDetailModal
        isOpen={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        result={selectedResult}
      />
    </div>
  );
}
