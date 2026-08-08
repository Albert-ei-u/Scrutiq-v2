"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPlus,
  faSearch,
  faFilter,
  faBriefcase,
  faSync,
} from "@fortawesome/free-solid-svg-icons";
import JobCard from "@/components/jobs/JobCard";
import CreateJobModal from "@/components/jobs/CreateJobModal";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/store";
import { setJobs } from "@/store/slices/jobsSlice";
import api from "@/lib/api";
import { toast } from "@/lib/toast";

export default function JobsPage() {
  const dispatch = useDispatch();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingJob, setEditingJob] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const jobs = useSelector((state: RootState) => state.jobs.items);

  const fetchJobs = async () => {
    setIsLoading(true);
    try {
      const response = await api.get("/jobs");
      dispatch(setJobs(response.data.data));
    } catch (error) {
      console.error("Job Retrieval Fault:", error);
      toast.error("Failed to sync with technical requirement registry.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const handleEdit = (job: any) => {
    setEditingJob(job);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingJob(null);
  };

  const displayedJobs = jobs;

  return (
    <div className="space-y-8 pb-12">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-bold tracking-tight text-white">
            Job Listings
          </h1>
          <p className="text-gray-400">
            Manage your active job openings and screening processes.
          </p>
        </div>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => {
            setEditingJob(null);
            setIsModalOpen(true);
          }}
          className="bg-brand-indigo hover:bg-brand-indigo/90 text-white px-6 py-3 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-brand-indigo/25 transition-all w-full md:w-auto"
        >
          <FontAwesomeIcon icon={faPlus} />
          Create New Job
        </motion.button>
      </header>

      {/* Filters & Search */}
      <div className="flex flex-col md:flex-row items-center gap-4 bg-scrutiq-surface/5 p-4 rounded-2xl border border-white/10">
        <div className="relative flex-1 group w-full">
          <FontAwesomeIcon
            icon={faSearch}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-hover:text-brand-indigo transition-colors"
          />
          <input
            type="text"
            placeholder="Search by title, skills or status..."
            className="w-full bg-scrutiq-surface/5 border border-white/10 rounded-xl py-2.5 pl-12 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-brand-indigo/30 transition-all"
          />
        </div>
        <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-scrutiq-surface/5 border border-white/10 hover:bg-scrutiq-surface/10 transition-all text-sm font-medium w-full md:w-auto justify-center">
          <FontAwesomeIcon icon={faFilter} className="text-gray-400" />
          More Filters
        </button>
      </div>

      {/* Jobs Grid */}
      {isLoading ? (
        <div className="py-24 flex flex-col items-center justify-center space-y-4">
          <FontAwesomeIcon
            icon={faSync}
            className="text-brand-indigo text-4xl animate-spin"
          />
          <p className="text-xs font-black text-gray-500 uppercase tracking-widest">
            Synchronizing Registry...
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence mode="popLayout">
            {displayedJobs.map((job, index) => (
              <JobCard
                key={job.id}
                job={job}
                index={index}
                onRefresh={fetchJobs}
                onEdit={handleEdit}
              />
            ))}
          </AnimatePresence>
        </div>
      )}

      {displayedJobs.length === 0 && (
        <div className="glass-card p-12 flex flex-col items-center justify-center text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-scrutiq-surface/5 flex items-center justify-center text-gray-600">
            <FontAwesomeIcon icon={faBriefcase} size="2x" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">No jobs found</h3>
            <p className="text-gray-400 max-w-xs mx-auto">
              Get started by creating your first job listing to begin screening
              candidates.
            </p>
          </div>
          <button
            onClick={() => {
              setEditingJob(null);
              setIsModalOpen(true);
            }}
            className="text-brand-indigo font-bold hover:underline"
          >
            Create your first job
          </button>
        </div>
      )}

      {/* Create/Edit Job Modal */}
      <CreateJobModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        jobToEdit={editingJob}
      />
    </div>
  );
}
