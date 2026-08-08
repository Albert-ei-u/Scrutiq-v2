import mongoose, { Schema, Document } from "mongoose";

export interface IScreening extends Document {
  jobId: string;
  candidateId: string;
  candidateName?: string;
  candidateEmail?: string;
  candidateGender?: "M" | "F" | "Not stated";
  matchScore: number;

  strengths: string[];
  weaknesses: string[];
  finalRecommendation: "Priority Alignment" | "Technical Fit" | "Potential Fit" | "No Alignment";
  reasoning: string;
  createdAt: Date;
  updatedAt: Date;
}

const ScreeningSchema: Schema = new Schema(
  {
    jobId: { type: String, required: true },
    candidateId: { type: String, required: true },
    candidateName: { type: String },
    candidateEmail: { type: String },
    candidateGender: { type: String, enum: ["M", "F", "Not stated"], default: "Not stated" },
    matchScore: { type: Number, required: true },

    strengths: [{ type: String }],
    weaknesses: [{ type: String }],
    finalRecommendation: { 
      type: String, 
      enum: ["Priority Alignment", "Technical Fit", "Potential Fit", "No Alignment"],
      required: true 
    },
    reasoning: { type: String, required: true },
  },
  { timestamps: true }
);

export default mongoose.model<IScreening>("Screening", ScreeningSchema);
