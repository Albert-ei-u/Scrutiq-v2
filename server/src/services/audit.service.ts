import AuditLog from "../models/AuditLog.model";

class AuditService {
  async log(action: string, category: "AUTH" | "JOB" | "CANDIDATE" | "SCREENING" | "SYSTEM", details: string, ownerId: string) {
    try {
      await AuditLog.create({
        action,
        category,
        details,
        ownerId: ownerId || "global"
      });
      console.log(`[AUDIT] ${action} logged for ${ownerId}`);
    } catch (error) {
      console.error("[AUDIT FAULT] Failed to save log:", error);
    }
  }

  async getLogs(ownerId?: string) {
     return AuditLog.find(ownerId ? { ownerId } : {}).sort({ createdAt: -1 }).limit(50);
  }
}

export default new AuditService();
