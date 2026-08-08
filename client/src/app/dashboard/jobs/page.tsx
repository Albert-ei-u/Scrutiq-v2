"use client";

import { useState, useEffect } from "react";
import api from "@/lib/api";
import JobCard from "@/components/jobs/JobCard";
import CreateJobModal from "@/components/jobs/CreateJobModal";
import {
  Plus,
  Search,
  Filter,
  Briefcase,
  LayoutGrid,
  List,
  RefreshCcw,
} from "lucide-react";
import { toast } from "@/lib/toast";

const JobsPage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingJob, setEditingJob] = useState<any>(null);
  const [jobs, setJobs] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [sortOrder, setSortOrder] = useState<"none" | "asc" | "desc">("none");
  const [isLoading, setIsLoading] = useState(true);

  const fetchJobs = async () => {
    try {
      const response = await api.get("/jobs");
      setJobs(response.data.data);
    } catch (error) {
      console.error("Jobs Retrieval Fault:", error);
      toast.error("Failed to connect to the database.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const filteredJobs = jobs
    .filter((job) => {
      return (
        job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.department.toLowerCase().includes(searchTerm.toLowerCase())
      );
    })
    .sort((a, b) => {
      if (sortOrder === "none") return 0;
      if (sortOrder === "asc") return a.title.localeCompare(b.title);
      return b.title.localeCompare(a.title);
    });

  if (isLoading) {
    return (
      <div className="py-24 flex flex-col items-center justify-center space-y-4">
        <RefreshCcw className="size-10 text-scrutiq-blue animate-spin" />
        <p className="text-xs font-bold text-scrutiq-muted tracking-widest">
          Loading jobs...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 md:space-y-10 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between bg-scrutiq-surface p-4 sm:p-6 md:p-8 rounded-2xl border border-scrutiq-border shadow-sm gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-black text-scrutiq-dark tracking-tighter">
            Jobs
          </h1>
          <p className="text-xs font-bold text-scrutiq-muted tracking-widest">
            Manage your active job postings
          </p>
        </div>
        <button
          onClick={() => {
            setEditingJob(null);
            setIsModalOpen(true);
          }}
          className="btn-primary flex items-center gap-2 px-6 shadow-lg shadow-scrutiq-blue/20 transition-all hover:-translate-y-0.5"
        >
          <Plus className="size-4" />
          <span>New Job</span>
        </button>
      </div>

      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 px-1">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
          <div className="relative group flex items-center bg-scrutiq-surface border border-scrutiq-border rounded-xl px-4 py-2.5 w-full sm:w-80 focus-within:border-scrutiq-blue focus-within:ring-4 focus-within:ring-scrutiq-blue/5 transition-all">
            <Search className="size-4 text-scrutiq-muted group-focus-within:text-scrutiq-blue" />
            <input
              type="text"
              placeholder="Search jobs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-transparent border-none outline-none text-xs font-bold text-scrutiq-dark ml-2.5 w-full tracking-wider placeholder:text-scrutiq-muted/50"
            />
          </div>
          <button
            onClick={() =>
              setSortOrder(
                sortOrder === "none"
                  ? "asc"
                  : sortOrder === "asc"
                    ? "desc"
                    : "none",
              )
            }
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
        </div>

        <div className="flex items-center gap-2 p-1 bg-scrutiq-bg border border-scrutiq-border rounded-xl">
          <button
            onClick={() => setViewMode("grid")}
            className={`p-2 rounded-lg transition-all ${viewMode === "grid" ? "bg-scrutiq-surface text-scrutiq-blue shadow-sm border border-scrutiq-border/50" : "text-scrutiq-muted hover:text-scrutiq-dark"}`}
          >
            <LayoutGrid className="size-4" />
          </button>
          <button
            onClick={() => setViewMode("list")}
            className={`p-2 rounded-lg transition-all ${viewMode === "list" ? "bg-scrutiq-surface text-scrutiq-blue shadow-sm border border-scrutiq-border/50" : "text-scrutiq-muted hover:text-scrutiq-dark"}`}
          >
            <List className="size-4" />
          </button>
        </div>
      </div>

      <div
        className={
          viewMode === "grid"
            ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pb-10"
            : "flex flex-col gap-4 pb-10"
        }
      >
        {filteredJobs.map((job, index) => (
          <JobCard
            key={job._id}
            job={job}
            index={index}
            viewMode={viewMode}
            onRefresh={fetchJobs}
            onEdit={(j) => {
              setEditingJob(j);
              setIsModalOpen(true);
            }}
          />
        ))}
        <button
          onClick={() => {
            setEditingJob(null);
            setIsModalOpen(true);
          }}
          className="border-2 border-dashed border-scrutiq-border rounded-2xl p-8 flex flex-col items-center justify-center gap-4 hover:border-scrutiq-blue hover:bg-scrutiq-surface transition-all group min-h-[300px]"
        >
          <div className="size-12 rounded-xl bg-scrutiq-bg flex items-center justify-center group-hover:bg-scrutiq-blue transition-all">
            <Plus className="size-6 text-scrutiq-border group-hover:text-white transition-all" />
          </div>
          <div className="text-center">
            <p className="text-xs font-bold text-scrutiq-dark tracking-widest">
              Create new job
            </p>
            <p className="text-[10px] font-bold text-scrutiq-muted tracking-widest mt-1">
              Post a new opening
            </p>
          </div>
        </button>
      </div>

      <CreateJobModal
        isOpen={isModalOpen}
        jobToEdit={editingJob}
        onClose={() => {
          setIsModalOpen(false);
          setEditingJob(null);
          fetchJobs();
        }}
      />
    </div>
  );
};

export default JobsPage;
