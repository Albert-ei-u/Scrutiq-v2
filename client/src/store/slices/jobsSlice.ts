"use client";

import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface Job {
  id: string;
  title: string;
  department: string;
  location: string;
  description: string;
  skills: string[];
  experienceLevel: "Junior" | "Intermediate" | "Senior" | "Lead";
  education: string;
  status: "Active" | "Closed" | "Screening";
  createdAt: string;
  applicantsCount: number;
}

interface JobsState {
  items: Job[];
  loading: boolean;
  error: string | null;
}

const initialState: JobsState = {
  items: [],
  loading: false,
  error: null,
};

const jobsSlice = createSlice({
  name: "jobs",
  initialState,
  reducers: {
    setJobs: (state, action: PayloadAction<Job[]>) => {
      state.items = action.payload;
    },
    addJob: (state, action: PayloadAction<Job>) => {
      state.items.unshift(action.payload);
    },
    updateJobStatus: (state, action: PayloadAction<{ id: string; status: Job["status"] }>) => {
      const job = state.items.find((j) => j.id === action.payload.id);
      if (job) {
        job.status = action.payload.status;
      }
    },
  },
});

export const { setJobs, addJob, updateJobStatus } = jobsSlice.actions;
export default jobsSlice.reducer;
