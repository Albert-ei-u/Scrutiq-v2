import mongoose, { Schema, Document } from "mongoose";

export interface IUser extends Document {
  id: string; // Internal legacy support
  fullName: string;
  email: string;
  passwordHash: string;
  companyName: string;
  isVerified: boolean;
  verificationCode?: string;
  resetCode?: string;
  resetCodeExpires?: Date;
  role: "admin" | "recruiter";
  profilePic?: string;
  notifications?: {
    candidateAlerts: boolean;
    screeningCompletions: boolean;
  };
}

const UserSchema: Schema = new Schema(
  {
    id: { type: String },
    fullName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    passwordHash: { type: String, required: true },
    companyName: { type: String, required: true },
    isVerified: { type: Boolean, default: false },
    verificationCode: { type: String },
    resetCode: { type: String },
    resetCodeExpires: { type: Date },
    role: { type: String, enum: ["admin", "recruiter"], default: "recruiter" },
    profilePic: { type: String },
    notifications: {
      candidateAlerts: { type: Boolean, default: true },
      screeningCompletions: { type: Boolean, default: true },
    },
  },
  { timestamps: true },
);

export default mongoose.model<IUser>("User", UserSchema);
