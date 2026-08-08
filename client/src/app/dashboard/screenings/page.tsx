"use client";

import ScreeningFlow from "@/components/screening/ScreeningFlow";

export default function ScreeningsPage() {
  return (
    <div className="space-y-12 pb-12">
      <header className="flex flex-col gap-2">
        <h1 className="text-4xl font-black text-brand-dark">
          Screening
        </h1>
        <p className="text-brand-muted text-sm max-w-2xl">
          Compare candidates against your job requirements. Select a role,
          pick the applicants you want to evaluate, and let the system
          score each one based on their resume.
        </p>
      </header>

      <ScreeningFlow />
    </div>
  );
}
