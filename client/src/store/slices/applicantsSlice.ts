"use client";

import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface Applicant {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: string;
  matchScore: number;
  source: "Umurava" | "External";
  status: "Pending" | "Screened" | "Shortlisted" | "Rejected";
  appliedAt: string;
  isAiGenerated?: boolean;
}

interface ApplicantsState {
  items: Applicant[];
  loading: boolean;
  error: string | null;
}

const initialState: ApplicantsState = {
  items: [],
  loading: false,
  error: null,
};

const applicantsSlice = createSlice({
  name: "applicants",
  initialState,
  reducers: {
    setApplicants: (state, action: PayloadAction<Applicant[]>) => {
      state.items = action.payload;
    },
    addApplicant: (state, action: PayloadAction<Applicant>) => {
      state.items.unshift(action.payload);
    },
    updateApplicantScore: (state, action: PayloadAction<{ id: string; score: number }>) => {
      const applicant = state.items.find((a) => a.id === action.payload.id);
      if (applicant) {
        applicant.matchScore = action.payload.score;
        applicant.status = action.payload.score > 70 ? "Shortlisted" : "Screened";
      }
    },
    removeApplicants: (state, action: PayloadAction<string[]>) => {
      state.items = state.items.filter((item) => !action.payload.includes(item.id));
    },
  },
});

export const { setApplicants, addApplicant, updateApplicantScore, removeApplicants } = applicantsSlice.actions;
export default applicantsSlice.reducer;
