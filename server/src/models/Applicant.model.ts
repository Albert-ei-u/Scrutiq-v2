import mongoose, { Schema, Document } from "mongoose";

export interface IApplicant extends Document {
  id: string; // Legacy ID support
  name: string;
  role: string;
  location: string;
  experience: string;
  email: string;
  gender: "M" | "F" | "Not stated";
  technicalProfile: string;

  resumeText?: string;
  resumeUrl?: string;
  profileStatus: "Verified" | "Pending" | "Archived" | "Duplicate";
  isDuplicate: boolean;
  isAiGenerated: boolean;
  originalCandidateId?: string;
  similarityScore?: number;
  ownerId: string;
  
  // Talent Profile Specification Fields (Section 3)
  firstName?: string;
  lastName?: string;
  headline?: string;
  bio?: string;
  skills?: {
    name: string;
    level: "Beginner" | "Intermediate" | "Advanced" | "Expert";
    yearsOfExperience: number;
  }[];
  languages?: {
    name: string;
    proficiency: "Basic" | "Conversational" | "Fluent" | "Native";
  }[];
  workExperience?: {
    company: string;
    role: string;
    startDate: string; // YYYY-MM
    endDate: string; // YYYY-MM | Present
    description: string;
    technologies: string[];
    isCurrent: boolean;
  }[];
  education?: {
    institution: string;
    degree: string;
    fieldOfStudy: string;
    startYear: number;
    endYear: number;
  }[];
  certifications?: {
    name: string;
    issuer: string;
    issueDate: string; // YYYY-MM
  }[];
  projects?: {
    name: string;
    description: string;
    technologies: string[];
    role: string;
    link: string;
    startDate: string; // YYYY-MM
    endDate: string; // YYYY-MM
  }[];
  availability?: {
    status: "Available" | "Open to Opportunities" | "Not Available";
    type: "Full-time" | "Part-time" | "Contract";
    startDate?: string; // YYYY-MM-DD
  };
  socialLinks?: {
    linkedin?: string;
    github?: string;
    portfolio?: string;
    [key: string]: string | undefined;
  };

  createdAt: Date;
  updatedAt: Date;
}

const ApplicantSchema: Schema = new Schema(
  {
    id: { type: String },
    name: { type: String, required: true },
    role: { type: String, required: true },
    location: { type: String, required: true },
    experience: { type: String, required: true },
    email: { type: String, required: true },
    gender: { type: String, enum: ["M", "F", "Not stated"], default: "Not stated" },
    technicalProfile: { type: String, required: true },

    resumeText: { type: String },
    resumeUrl: { type: String },
    profileStatus: { type: String, enum: ["Verified", "Pending", "Archived", "Duplicate"], default: "Pending" },
    isDuplicate: { type: Boolean, default: false },
    isAiGenerated: { type: Boolean, default: false },
    originalCandidateId: { type: Schema.Types.ObjectId, ref: "Applicant" },
    similarityScore: { type: Number, default: 0 },
    ownerId: { type: String, required: true },

    // Talent Profile Specification Fields
    firstName: { type: String },
    lastName: { type: String },
    headline: { type: String },
    bio: { type: String },
    skills: [
      {
        name: String,
        level: { type: String, enum: ["Beginner", "Intermediate", "Advanced", "Expert"] },
        yearsOfExperience: Number,
      },
    ],
    languages: [
      {
        name: String,
        proficiency: { type: String, enum: ["Basic", "Conversational", "Fluent", "Native"] },
      },
    ],
    workExperience: [
      {
        company: String,
        role: String,
        startDate: String,
        endDate: String,
        description: String,
        technologies: [String],
        isCurrent: Boolean,
      },
    ],
    education: [
      {
        institution: String,
        degree: String,
        fieldOfStudy: String,
        startYear: Number,
        endYear: Number,
      },
    ],
    certifications: [
      {
        name: String,
        issuer: String,
        issueDate: String,
      },
    ],
    projects: [
      {
        name: String,
        description: String,
        technologies: [String],
        role: String,
        link: String,
        startDate: String,
        endDate: String,
      },
    ],
    availability: {
      status: { type: String, enum: ["Available", "Open to Opportunities", "Not Available"] },
      type: { type: String, enum: ["Full-time", "Part-time", "Contract"] },
      startDate: String,
    },
    socialLinks: {
      linkedin: String,
      github: String,
      portfolio: String,
    },
  },
  { timestamps: true }
);

export default mongoose.model<IApplicant>("Applicant", ApplicantSchema);
