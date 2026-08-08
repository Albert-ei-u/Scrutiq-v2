import { Request, Response } from "express";
import mongoose from "mongoose";
import applicantsService from "../services/applicants.service";

import User from "../models/User.model";


class ApplicantsController {
  /**
   * Candidate Registry Retrieval:
   * Returns all profiles currently stored in the candidate registry.
   */
  async getAll(req: Request, res: Response) {
    try {
      const ownerId = req.headers["x-owner-id"] as string | undefined;
      const applicants = await applicantsService.getAllApplicants(ownerId);
      return res.status(200).json({ status: "success", data: applicants });
    } catch (error: any) {
      return res.status(500).json({ status: "fault", message: error.message });
    }
  }

  /**
   * Talent Profile Ingestion:
   * Handles administrative PDF/CSV uploads to the registry.
   */
  async upload(req: Request, res: Response) {
    try {
      const files = req.files as Express.Multer.File[];
      const urls = req.body.urls ? (Array.isArray(req.body.urls) ? req.body.urls : [req.body.urls]) : [];
      const ownerId = (req.headers["x-owner-id"] as string) || "global";
      const emails = req.body.emails;

      if ((!files || files.length === 0) && urls.length === 0) {
        return res.status(400).json({
          status: "fault",
          message: "No documents or links provided for ingestion.",
        });
      }

      console.log(`[TECHNICAL INGESTION] Multi-source ingestion started. Files: ${files?.length || 0}, Links: ${urls.length}`);

      // Execute both ingestion protocols in parallel for maximum performance
      const [fileResults, urlResults] = await Promise.all([
        files && files.length > 0 ? applicantsService.ingestFromFilesWithOwner(files, ownerId, emails) : Promise.resolve([]),
        urls.length > 0 ? applicantsService.ingestFromUrls(urls, ownerId) : Promise.resolve([])
      ]);

      const totalResults = [...fileResults, ...urlResults];
      const duplicateCount = totalResults.filter(r => r && r.isDuplicate).length;
      const newCount = totalResults.length - duplicateCount;

      return res.status(201).json({
        status: "success",
        message: `${newCount} new profiles ingested, ${duplicateCount} potential duplicates flagged.`,
        protocol: "HYBRID_INGESTION_v2",
        data: {
          total: totalResults.length,
          newCount,
          duplicateCount,
          results: totalResults
        },
      });
    } catch (error: any) {
      console.error("[INGESTION FAULT] System failure during hybrid ingestion:", error);
      return res.status(500).json({ status: "fault", message: error.message });
    }
  }

  /**
   * Candidate Profile Initialization:
   * Adds a new technical profile to the candidate registry.
   */
  async create(req: Request, res: Response) {
    try {
      const ownerId = (req.headers["x-owner-id"] as string) || "global";
      const applicant = await applicantsService.addApplicant(req.body, ownerId);
      return res.status(201).json({ status: "success", data: applicant });
    } catch (error: any) {
      return res.status(500).json({ status: "fault", message: error.message });
    }
  }

  /**
   * Profile Detail Retrieval:
   * Returns a specific candidate profile by ID.
   */
  async getById(req: Request, res: Response) {
    try {
      const applicant = await applicantsService.getApplicantById(req.params.id);
      if (!applicant)
        return res
          .status(404)
          .json({ status: "fault", message: "Candidate Profile Not Found." });
      return res.status(200).json({ status: "success", data: applicant });
    } catch (error: any) {
      return res.status(500).json({ status: "fault", message: error.message });
    }
  }
  async delete(req: Request, res: Response) {
    try {
      const applicant = await applicantsService.deleteApplicant(req.params.id);
      if (!applicant)
        return res
          .status(404)
          .json({ status: "fault", message: "Candidate Profile Not Found." });
      return res
        .status(200)
        .json({ status: "success", message: "Candidate Profile Deleted." });
    } catch (error: any) {
      return res.status(500).json({ status: "fault", message: error.message });
    }
  }

  async deleteBulk(req: Request, res: Response) {
    try {
      const { ids } = req.body;
      if (!ids || !Array.isArray(ids)) {
        return res.status(400).json({ status: "fault", message: "IDs array required for bulk delete." });
      }

      await applicantsService.deleteApplicantsBulk(ids);
      return res.status(200).json({ status: "success", message: `${ids.length} profiles removed.` });
    } catch (error: any) {
      return res.status(500).json({ status: "fault", message: error.message });
    }
  }

  async sendEmail(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { subject, message, recipientEmail } = req.body;
      const applicant = await applicantsService.getApplicantById(id);
      
      if (!applicant) {
        return res.status(404).json({ status: "fault", message: "Applicant not found." });
      }

      const emailService = (await import("../services/email.service")).default;
      const targetEmail = recipientEmail || applicant.email;

      // Extract recruiter context from headers
      const ownerId = req.headers["x-owner-id"] as string | undefined;
      let recruiterEmail = undefined;
      
      if (ownerId && ownerId !== "global") {
        // Robust lookup for both ObjectId and legacy ID field
        const query = mongoose.isValidObjectId(ownerId) 
          ? { _id: ownerId } 
          : { id: ownerId };
        
        const recruiter = await User.findOne(query).lean();
        if (recruiter) recruiterEmail = recruiter.email;
      }

      await emailService.sendCustomEmail(targetEmail, subject, message, recruiterEmail);


      return res.status(200).json({ status: "success", message: "Email dispatched successfully." });
    } catch (error: any) {
      return res.status(500).json({ status: "fault", message: error.message });
    }
  }
  async handleResolveDuplicate(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { action } = req.body; // "keep_original" or "keep_new"
      
      const result = await applicantsService.resolveDuplicate(id, action);
      return res.status(200).json({ 
        status: "success", 
        message: action === "keep_original" ? "Duplicate discarded." : "Profile updated with new version.",
        data: result 
      });
    } catch (error: any) {
      return res.status(500).json({ status: "fault", message: error.message });
    }
  }
}

export default new ApplicantsController();
