"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, Users } from "lucide-react";

export default function JobApplicantsPage() {
  const params = useParams();
  const jobId = params.id as string;

  return (
    <div className="space-y-8 pb-12 animate-in fade-in duration-500">
      <Link
        href={`/dashboard/jobs/${jobId}`}
        className="inline-flex items-center gap-2 text-[10px] font-black uppercase text-scrutiq-muted hover:text-scrutiq-blue transition-colors"
      >
        <ChevronLeft className="size-4" /> Back to Job Details
      </Link>

      <div className="admin-card p-16 text-center space-y-4">
        <Users className="size-10 text-scrutiq-muted/30 mx-auto" />
        <h2 className="text-xl font-black text-scrutiq-dark uppercase tracking-tight">
          Applicants Management
        </h2>
        <p className="text-xs text-scrutiq-muted font-bold max-w-sm mx-auto">
          This module is currently being optimized. Please check back shortly for advanced applicant tracking features.
        </p>
      </div>
    </div>
  );
}
