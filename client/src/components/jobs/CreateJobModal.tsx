"use client";

import { useState, useEffect } from "react";
import {
  Plus,
  X,
  Briefcase,
  MapPin,
  AlignLeft,
  ShieldCheck,
  Mail,
  Globe,
} from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import api from "@/lib/api";
import { toast } from "@/lib/toast";
import { motion, AnimatePresence } from "framer-motion";
import { useDispatch } from "react-redux";
import { addJob } from "@/store/slices/jobsSlice";

const jobSchema = z.object({
  title: z.string().min(3, "Title too short"),
  department: z.string().min(2, "Department required"),
  location: z.string().min(2, "Geographic location required"),
  description: z.string().min(10, "Description required"),
});

type JobFormValues = z.infer<typeof jobSchema>;

interface CreateJobModalProps {
  isOpen: boolean;
  onClose: () => void;
  jobToEdit?: any;
}

const CreateJobModal = ({
  isOpen,
  onClose,
  jobToEdit,
}: CreateJobModalProps) => {
  const dispatch = useDispatch();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<JobFormValues>({
    resolver: zodResolver(jobSchema),
    defaultValues: jobToEdit
      ? {
          title: jobToEdit.title,
          department: jobToEdit.department,
          location: jobToEdit.location,
          description: jobToEdit.description,
        }
      : {
          title: "",
          department: "",
          location: "",
          description: "",
        },
  });

  // Re-sync form when jobToEdit changes
  useEffect(() => {
    if (jobToEdit) {
      reset({
        title: jobToEdit.title,
        department: jobToEdit.department,
        location: jobToEdit.location,
        description: jobToEdit.description,
      });
    } else {
      reset({
        title: "",
        department: "",
        location: "",
        description: "",
      });
    }
  }, [jobToEdit, reset]);

  const onSubmit = async (data: JobFormValues) => {
    setIsSubmitting(true);

    try {
      let response;
      if (jobToEdit) {
        response = await api.put(
          `/jobs/${jobToEdit._id || jobToEdit.id}`,
          data,
        );
      } else {
        response = await api.post(`/jobs`, data);
      }

      if (response.data.status === "success") {
        if (!jobToEdit) dispatch(addJob(response.data.data));
        toast.success(
          jobToEdit ? "Job updated successfully." : "Job successfully created.",
        );
        reset();
        onClose();
      }
    } catch (error: any) {
      console.error("Job Operation Fault:", error);
      toast.error(
        error.response?.data?.message ||
          `Failed to ${jobToEdit ? "update" : "create"} job.`,
      );
    } finally {
      setIsSubmitting(false);
    }
  };

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
            className="relative w-full max-w-2xl bg-scrutiq-surface rounded-3xl border border-scrutiq-border shadow-2xl overflow-hidden"
          >
            <div className="p-8 border-b border-scrutiq-border/50 flex items-start justify-between bg-scrutiq-bg/30">
              <div className="flex items-center gap-4">
                <div className="size-12 rounded-xl bg-scrutiq-blue flex items-center justify-center shadow-lg shadow-scrutiq-blue/20">
                  <Plus className="size-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-black text-scrutiq-dark uppercase tracking-tight">
                    {jobToEdit ? "Edit Job Requirement" : "Create New Job"}
                  </h2>
                  <p className="text-[10px] font-bold text-scrutiq-muted uppercase tracking-widest leading-none mt-1">
                    {jobToEdit
                      ? "Update technical criteria"
                      : "Post a new opening"}
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

            <form onSubmit={handleSubmit(onSubmit)} className="p-8 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-scrutiq-muted uppercase tracking-widest flex items-center gap-2">
                    <Briefcase className="size-3" /> Job Title
                  </label>
                  <input
                    {...register("title")}
                    className={`form-input ${errors.title ? "border-rose-500 ring-rose-500/10" : ""}`}
                    placeholder="e.g. Senior Backend Engineer"
                  />
                  {errors.title && (
                    <p className="text-[10px] font-bold text-rose-500 uppercase tracking-widest">
                      {errors.title.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-scrutiq-muted uppercase tracking-widest flex items-center gap-2">
                    <Globe className="size-3" /> Department
                  </label>
                  <input
                    {...register("department")}
                    className={`form-input ${errors.department ? "border-rose-500 ring-rose-500/10" : ""}`}
                    placeholder="e.g. Engineering"
                  />
                  {errors.department && (
                    <p className="text-[10px] font-bold text-rose-500 uppercase tracking-widest">
                      {errors.department.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-scrutiq-muted uppercase tracking-widest flex items-center gap-2">
                  <MapPin className="size-3" /> Technical Location
                </label>
                <input
                  {...register("location")}
                  className={`form-input ${errors.location ? "border-rose-500 ring-rose-500/10" : ""}`}
                  placeholder="e.g. Kigali, Rwanda (Remote)"
                />
                {errors.location && (
                  <p className="text-[10px] font-bold text-rose-500 uppercase tracking-widest">
                    {errors.location.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-scrutiq-muted uppercase tracking-widest flex items-center gap-2">
                  <AlignLeft className="size-3" /> Job Description
                </label>
                <textarea
                  {...register("description")}
                  rows={4}
                  className={`form-input resize-none h-32 ${errors.description ? "border-rose-500 ring-rose-500/10" : ""}`}
                  placeholder="Enter detailed job requirements and responsibilities..."
                />
                {errors.description && (
                  <p className="text-[10px] font-bold text-rose-500 uppercase tracking-widest">
                    {errors.description.message}
                  </p>
                )}
              </div>

              <div className="pt-6 border-t border-scrutiq-border/50 flex justify-end gap-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn-primary flex items-center gap-2 shadow-lg shadow-scrutiq-blue/20"
                >
                  <ShieldCheck className="size-4" />
                  <span>
                    {isSubmitting
                      ? jobToEdit
                        ? "Updating..."
                        : "Creating..."
                      : jobToEdit
                        ? "Update Job"
                        : "Create Job"}
                  </span>
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default CreateJobModal;
