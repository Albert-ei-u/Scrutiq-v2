import mongoose, { Schema, Document } from "mongoose";

export interface IAuditLog extends Document {
  action: string;
  category: "AUTH" | "JOB" | "CANDIDATE" | "SCREENING" | "SYSTEM";
  details: string;
  ownerId: string;
  createdAt: Date;
}

const AuditLogSchema: Schema = new Schema({
  action: { type: String, required: true },
  category: { type: String, required: true, enum: ["AUTH", "JOB", "CANDIDATE", "SCREENING", "SYSTEM"] },
  details: { type: String, required: true },
  ownerId: { type: String, required: true },
}, { 
  timestamps: { createdAt: true, updatedAt: false } 
});

export default mongoose.model<IAuditLog>("AuditLog", AuditLogSchema);
