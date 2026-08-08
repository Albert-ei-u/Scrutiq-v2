import { Request, Response } from "express";
import screeningService from "../services/screening.service";

class ScreeningController {
  /**
   * Technical Screening Execution Protocol:
   * Handles the request to execute candidate ranking against a job requirement.
   */
  async execute(req: Request, res: Response) {
    try {
      const { jobId, candidateIds } = req.body;

      if (!jobId || !candidateIds || !Array.isArray(candidateIds)) {
        return res.status(400).json({
          status: "fault",
          message:
            "A Job and at least one Candidate are required for the screening protocol.",
        });
      }

      console.log(
        `[SYSTEM] Starting AI Alignment Protocol: Job ${jobId} | Candidates: ${candidateIds.length}`,
      );
      const ownerId = (req.headers["x-owner-id"] as string) || "global";
      const results = await screeningService.executeScreening(
        jobId,
        candidateIds,
        ownerId,
      );

      return res.status(200).json({
        status: "success",
        data: results,
        timestamp: new Date().toISOString(),
      });
    } catch (error: any) {
      console.error(
        "[SYSTEM FAULT] AI Screening Extraction Failed:",
        error.message,
      );

      // Return the specific reason for failure (API key, parsing, etc.)
      return res.status(500).json({
        status: "fault",
        message:
          error.message ||
          "The AI screening protocol failed to complete. Please check system logs.",
      });
    }
  }

  async getJobRankings(req: Request, res: Response) {
    try {
      const { jobId } = req.params;
      if (!jobId) {
        return res
          .status(400)
          .json({ status: "fault", message: "Job ID required." });
      }

      const rankings = await screeningService.getRankingsByJob(jobId);
      return res.status(200).json({
        status: "success",
        data: rankings,
      });
    } catch (error: any) {
      console.error("[SYSTEM FAULT] Rankings Fetch Failed:", error.message);
      return res
        .status(500)
        .json({ status: "fault", message: "Failed to fetch rankings." });
    }
  }
  async delete(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const result = await screeningService.deleteScreening(id);
      if (!result)
        return res
          .status(404)
          .json({ status: "fault", message: "Screening Result Not Found." });
      return res
        .status(200)
        .json({ status: "success", message: "Screening Result Removed." });
    } catch (error: any) {
      console.error("[SYSTEM FAULT] Screening Delete Failed:", error.message);
      return res
        .status(500)
        .json({
          status: "fault",
          message: "Failed to delete screening result.",
        });
    }
  }
}

export default new ScreeningController();
