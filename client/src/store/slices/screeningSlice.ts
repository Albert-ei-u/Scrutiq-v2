"use client";

import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface ScreeningResult {
  candidateId: string;
  candidateName: string;
  matchScore: number;
  strengths: string[];
  weaknesses: string[];
  reasoning: string;
  finalRecommendation:
    | "Priority Alignment"
    | "Technical Fit"
    | "Potential Fit"
    | "No Alignment";
}

interface ScreeningState {
  isAnalyzing: boolean;
  currentJobId: string | null;
  selectedCandidates: string[];
  results: ScreeningResult[];
  statusMessage: string;
}

const initialState: ScreeningState = {
  isAnalyzing: false,
  currentJobId: null,
  selectedCandidates: [],
  results: [],
  statusMessage: "Ready for system verification",
};

const screeningSlice = createSlice({
  name: "screening",
  initialState,
  reducers: {
    startScreening: (
      state,
      action: PayloadAction<{ jobId: string; candidateIds: string[] }>,
    ) => {
      state.isAnalyzing = true;
      state.currentJobId = action.payload.jobId;
      state.selectedCandidates = action.payload.candidateIds;
      state.statusMessage = "Initializing alignment matrix...";
    },
    updateScreeningStatus: (state, action: PayloadAction<string>) => {
      state.statusMessage = action.payload;
    },
    completeScreening: (state, action: PayloadAction<ScreeningResult[]>) => {
      state.isAnalyzing = false;
      state.results = action.payload;
      state.statusMessage = `Processing finalized. ${action.payload.length} profiles verified.`;
    },
    resetScreening: (state) => {
      state.isAnalyzing = false;
      state.currentJobId = null;
      state.selectedCandidates = [];
      state.results = [];
      state.statusMessage = "Ready for system verification";
    },
  },
});

export const {
  startScreening,
  updateScreeningStatus,
  completeScreening,
  resetScreening,
} = screeningSlice.actions;
export default screeningSlice.reducer;
