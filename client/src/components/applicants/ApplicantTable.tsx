"use client";

import { motion } from "framer-motion";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEllipsisVertical,
  faCircle,
  faEye,
  faUserSlash,
  faUsers,
} from "@fortawesome/free-solid-svg-icons";
import { Applicant } from "@/store/slices/applicantsSlice";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/store";
import { useState } from "react";
import { removeApplicants } from "@/store/slices/applicantsSlice";
import api from "@/lib/api";
import { toast } from "@/lib/toast";
import {
  faTrash,
  faCheckSquare,
  faSquare,
} from "@fortawesome/free-solid-svg-icons";

interface ApplicantTableProps {
  source: "Umurava" | "External";
}

export default function ApplicantTable({ source }: ApplicantTableProps) {
  const applicants = useSelector((state: RootState) => state.applicants.items);

  const mockApplicants: Applicant[] = [
    {
      id: "1",
      name: "Alice Johnson",
      email: "alice@example.com",
      role: "React Developer",
      matchScore: 85,
      source: "Umurava",
      status: "Shortlisted",
      appliedAt: "2024-03-21",
    },
    {
      id: "2",
      name: "Bob Smith",
      email: "bob@example.com",
      role: "React Developer",
      matchScore: 62,
      source: "Umurava",
      status: "Screened",
      appliedAt: "2024-03-20",
    },
    {
      id: "3",
      name: "Charlie Brown",
      email: "charlie@example.com",
      role: "React Developer",
      matchScore: 45,
      source: "External",
      status: "Pending",
      appliedAt: "2024-03-19",
    },
  ];

  const filteredApplicants = (applicants.length > 0 ? applicants : mockApplicants).filter(
    (a) => a.source === source
  );

  const dispatch = useDispatch();
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isDeleting, setIsDeleting] = useState(false);

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredApplicants.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredApplicants.map((a) => a.id));
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    if (!confirm(`Are you sure you want to delete ${selectedIds.length} candidates?`)) return;

    setIsDeleting(true);
    try {
      const response = await api.delete("/applicants/bulk", { data: { ids: selectedIds } });
      if (response.data.status === "success") {
        dispatch(removeApplicants(selectedIds));
        setSelectedIds([]);
        toast.success(`${selectedIds.length} candidates removed successfully.`);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to delete candidates.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-4">
      {selectedIds.length > 0 && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between p-4 bg-brand-indigo/10 border border-brand-indigo/20 rounded-2xl"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-brand-indigo text-white flex items-center justify-center font-bold text-sm">
              {selectedIds.length}
            </div>
            <span className="text-sm font-bold text-white uppercase tracking-wider">Candidates Selected</span>
          </div>
          <button 
            onClick={handleBulkDelete}
            disabled={isDeleting}
            className="px-6 py-2 bg-rose-500 hover:bg-rose-600 text-white rounded-xl font-bold text-xs uppercase tracking-widest transition-all shadow-lg shadow-rose-500/20 flex items-center gap-2 disabled:opacity-50"
          >
            <FontAwesomeIcon icon={faTrash} />
            {isDeleting ? "Removing..." : "Delete Selected"}
          </button>
        </motion.div>
      )}
      <div className="glass-card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-white/5 bg-scrutiq-surface/5">
              <th className="px-6 py-4 w-10">
                <button 
                  onClick={toggleSelectAll}
                  className="text-gray-500 hover:text-brand-indigo transition-colors"
                >
                  <FontAwesomeIcon 
                    icon={selectedIds.length === filteredApplicants.length && filteredApplicants.length > 0 ? faCheckSquare : faSquare} 
                    className={selectedIds.length === filteredApplicants.length && filteredApplicants.length > 0 ? "text-brand-indigo" : ""}
                  />
                </button>
              </th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-widest">Candidate</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-widest">Role</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-widest">Match Score</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-widest">Status</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-widest text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {filteredApplicants.map((applicant, index) => (
              <motion.tr
                key={applicant.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`group hover:bg-scrutiq-surface/[0.02] transition-all ${selectedIds.includes(applicant.id) ? 'bg-brand-indigo/5' : ''}`}
              >
                <td className="px-6 py-4">
                  <button 
                    onClick={() => toggleSelect(applicant.id)}
                    className="text-gray-500 hover:text-brand-indigo transition-colors"
                  >
                    <FontAwesomeIcon 
                      icon={selectedIds.includes(applicant.id) ? faCheckSquare : faSquare} 
                      className={selectedIds.includes(applicant.id) ? "text-brand-indigo" : ""}
                    />
                  </button>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-indigo/40 to-purple-500/40 border border-white/10 flex items-center justify-center font-bold text-white shadow-sm ring-1 ring-white/10 group-hover:ring-brand-indigo/50 transition-all">
                      {applicant.name.split(" ").map((n) => n[0]).join("")}
                    </div>
                    <div className="flex flex-col">
                      <span className="font-bold text-white text-sm group-hover:text-brand-indigo transition-colors">{applicant.name}</span>
                      <span className="text-[11px] text-gray-500">{applicant.email}</span>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="text-sm text-gray-300 font-medium">{applicant.role}</span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3 w-48">
                    <div className="flex-1 h-1.5 bg-scrutiq-surface/5 rounded-full overflow-hidden border border-white/5">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${applicant.matchScore}%` }}
                        transition={{ duration: 1, delay: 0.5 + index * 0.1 }}
                        className={`h-full rounded-full shadow-[0_0_8px_rgba(var(--color-glow))] ${
                          applicant.matchScore > 70 ? "bg-brand-emerald shadow-brand-emerald/50" : 
                          applicant.matchScore > 40 ? "bg-amber-400 shadow-amber-400/50" : "bg-rose-500 shadow-rose-500/50"
                        }`}
                      />
                    </div>
                    <span className={`text-xs font-bold ${
                      applicant.matchScore > 70 ? "text-brand-emerald" : 
                      applicant.matchScore > 40 ? "text-amber-400" : "text-rose-500"
                    }`}>
                      {applicant.matchScore}%
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className={`text-[10px] uppercase tracking-tighter font-bold px-2 py-0.5 rounded-full border flex items-center gap-1.5 w-fit ${
                    applicant.status === "Shortlisted" ? "text-brand-emerald bg-brand-emerald/10 border-brand-emerald/20" :
                    applicant.status === "Screened" ? "text-brand-indigo bg-brand-indigo/10 border-brand-indigo/20" :
                    "text-gray-400 bg-scrutiq-surface/5 border-white/10"
                  }`}>
                    <FontAwesomeIcon icon={faCircle} className="text-[6px]" />
                    {applicant.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button 
                      className={`p-2 rounded-lg transition-all ${applicant.isAiGenerated ? 'text-gray-700 cursor-not-allowed' : 'hover:bg-scrutiq-surface/5 text-gray-500 hover:text-white'}`} 
                      title={applicant.isAiGenerated ? "No Original Document (AI Generated Profile)" : "View Profile"}
                      disabled={applicant.isAiGenerated}
                    >
                      <FontAwesomeIcon icon={faEye} />
                    </button>
                    <button className="p-2 hover:bg-rose-500/10 rounded-lg text-gray-500 hover:text-rose-400 transition-all" title="Reject Candidate">
                      <FontAwesomeIcon icon={faUserSlash} />
                    </button>
                    <button className="p-2 hover:bg-scrutiq-surface/5 rounded-lg text-gray-500 hover:text-white transition-all">
                      <FontAwesomeIcon icon={faEllipsisVertical} />
                    </button>
                  </div>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {filteredApplicants.length === 0 && (
        <div className="p-12 flex flex-col items-center justify-center text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-scrutiq-surface/5 flex items-center justify-center text-gray-600">
            <FontAwesomeIcon icon={faUsers} size="2x" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">No candidates found</h3>
            <p className="text-gray-400 max-w-xs mx-auto">
              Start by importing candidates or promoting your job listing to the Umurava network.
            </p>
          </div>
        </div>
      )}

      <div className="p-4 border-t border-white/5 flex items-center justify-between text-xs text-gray-500">
        <span>Showing {filteredApplicants.length} of {filteredApplicants.length} results</span>
        <div className="flex items-center gap-2">
          <button className="px-3 py-1.5 bg-scrutiq-surface/5 rounded-lg hover:bg-scrutiq-surface/10 transition-all font-bold">Previous</button>
          <button className="px-3 py-1.5 bg-brand-indigo text-white rounded-lg shadow-lg shadow-brand-indigo/20 font-bold">Next</button>
        </div>
      </div>
    </div>
  </div>
  );
}
