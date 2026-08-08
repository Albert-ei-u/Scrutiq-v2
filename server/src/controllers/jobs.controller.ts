import { Request, Response } from "express";
import jobsService from "../services/jobs.service";

class JobsController {
  /**
   * Technical Requirement Registry Retrieval:
   * Returns all active job postings in the recruiter registry.
   */
  async getAll(req: Request, res: Response) {
    try {
      const ownerId = req.headers["x-owner-id"] as string | undefined;
      const jobs = await jobsService.getAllJobs(ownerId);
      return res.status(200).json({ status: "success", data: jobs });
    } catch (error: any) {
      return res.status(500).json({ status: "fault", message: error.message });
    }
  }

  /**
   * Job Requirement Initialization:
   * Adds a new technical requirement to the registry.
   */
  async create(req: Request, res: Response) {
    try {
      const ownerId = (req.headers["x-owner-id"] as string) || "global";
      const newJob = await jobsService.createJob({ ...req.body, ownerId });
      const auditService = (await import("../services/audit.service")).default;
      auditService.log("JOB_CREATE", "JOB", `New technical requirement initialized: ${newJob.title}`, ownerId);

      return res.status(201).json({
        status: "success",
        data: newJob,
      });
    } catch (error: any) {
      console.error("Job Creation Fault:", error);
      const isDuplicate = error.message?.includes("ALREADY_EXISTS");
      
      return res
        .status(isDuplicate ? 400 : 500)
        .json({ 
          status: "fault", 
          message: isDuplicate 
            ? error.message.replace("ALREADY_EXISTS: ", "") 
            : "Failed to create technical requirement registry entry." 
        });
    }
  }

  async updateJob(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const updatedJob = await jobsService.updateJob(id, req.body);

      if (!updatedJob) {
        return res
          .status(404)
          .json({ status: "fault", message: "Job Requirement not found." });
      }

      return res.status(200).json({
        status: "success",
        data: updatedJob,
      });
    } catch (error: any) {
      console.error("Job Update Fault:", error);
      const isDuplicate = error.message?.includes("ALREADY_EXISTS");

      return res
        .status(isDuplicate ? 400 : 500)
        .json({
          status: "fault",
          message: isDuplicate 
            ? error.message.replace("ALREADY_EXISTS: ", "") 
            : "Failed to update technical requirement.",
        });
    }
  }

  /**
   * Detail Matrix Retrieval:
   * Returns a specific job metric by ID.
   */
  async getById(req: Request, res: Response) {
    try {
      const job = await jobsService.getJobById(req.params.id);
      if (!job)
        return res
          .status(404)
          .json({ status: "fault", message: "Job Requirement Not Found." });
      return res.status(200).json({ status: "success", data: job });
    } catch (error: any) {
      return res.status(500).json({ status: "fault", message: error.message });
    }
  }

  async delete(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const deleted = await jobsService.deleteJob(id);
      if (!deleted)
        return res
          .status(404)
          .json({ status: "fault", message: "Job Requirement Not Found." });
      return res
        .status(200)
        .json({
          status: "success",
          message: "Job Requirement deleted successfully.",
        });
    } catch (error: any) {
      return res.status(500).json({ status: "fault", message: error.message });
    }
  }
}

export default new JobsController();
