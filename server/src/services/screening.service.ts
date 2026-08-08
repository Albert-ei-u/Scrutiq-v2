import mongoose from "mongoose";
import Screening from "../models/Screening.model";
import Applicant from "../models/Applicant.model";
import geminiService from "./gemini.service";

import jobsService from "./jobs.service";
import applicantsService from "./applicants.service";

class ScreeningService {
  async getRankingsByJob(jobId: string) {
    const rankings = await Screening.find({ jobId })
      .sort({ matchScore: -1 })
      .lean();

    // Enrich with applicant data (email, real name if missing)
    const enriched = await Promise.all(
      rankings.map(async (rank: any) => {
        // Improved lookup: Check both _id and legacy id field
        const query: any = {};
        if (mongoose.isValidObjectId(rank.candidateId)) {
          query._id = rank.candidateId;
        } else {
          query.$or = [{ id: rank.candidateId }, { email: rank.candidateEmail }];
        }

        const applicant = (await Applicant.findOne(query).lean()) as any;
        return {
          ...rank,
          id: rank.candidateId, // Surface for frontend lookup
          candidateName:
            applicant?.name || rank.candidateName || "Technical Candidate",
          candidateEmail: applicant?.email || "No email available",
          candidateGender: applicant?.gender || rank.candidateGender || "Not stated",
          candidateExperience: applicant?.experience || "No experience provided",
          candidateResume: applicant?.resumeUrl || null,

          resumeText: applicant?.resumeText || null,
          isDuplicate: applicant?.isDuplicate || false,
        };
      }),
    );

    return enriched;
  }

  /**
   * Technical Screening Protocol:
   * Orchestrates the candidate ranking process using the Gemini AI service.
   */
  async executeScreening(
    jobId: string,
    candidateIds: string[],
    ownerId: string,
  ) {
    // 1. Requirement Matrix Retrieval
    const job = await jobsService.getJobById(jobId);
    if (!job) throw new Error("Job Requirement Registry Fault: Job not found.");
    if (job.status === "Archived") {
      throw new Error("Job Requirement Registry Fault: Cannot perform screening against an archived job.");
    }

    // 2. Candidate Registry Retrieval
    // We need to get ONLY applicants for this owner to ensure isolation
    const allApplicants = await applicantsService.getAllApplicants(ownerId);
    const targetCandidates = allApplicants.filter((app) =>
      candidateIds.includes(app._id?.toString() || app.id),
    );

    if (targetCandidates.length === 0) {
      throw new Error(
        `Candidate Registry Fault: No eligible profiles for screening.`,
      );
    }

    // 3. AI Execution Protocol
    console.log(
      `Executing AI Alignment Protocol for Job ${jobId} against ${targetCandidates.length} candidates...`,
    );
    const results = await geminiService.screenCandidates(job, targetCandidates);

    // 4. Result Finalization & Persistence
    const savedResults = [];
    for (const result of results) {
      const candidateId = result.candidateId;

      // Update the Applicant record with AI-extracted data for better registry quality
      if (
        result.candidateEmail ||
        result.candidateName ||
        result.microSummary
      ) {
        await mongoose.model("Applicant").findByIdAndUpdate(candidateId, {
          name: result.candidateName,
          email: result.candidateEmail,
          gender: result.candidateGender || "Not stated",
          experience: result.microSummary,
        });
      }

      // Upsert the results based on jobId and candidateId
      const screeningResult = await Screening.findOneAndUpdate(
        { jobId, candidateId },
        {
          ...result,
          jobId,
          candidateName: result.candidateName || "Unknown Candidate",
        },
        { upsert: true, new: true },
      );
      savedResults.push(screeningResult);
    }

    // 5. Enrichment Protocol for Frontend Delivery
    const enrichedResults = await Promise.all(
      savedResults.map(async (res: any) => {
        const applicant = await Applicant.findById(res.candidateId).lean() as any;
        return {
          ...res.toObject(),
          candidateGender: applicant?.gender || res.candidateGender || "Not stated",
          candidateExperience: applicant?.experience || "No experience provided",
          candidateResume: applicant?.resumeUrl || null,

        };
      })
    );

    return enrichedResults;
  }

  async deleteScreening(id: string) {
    return await Screening.findByIdAndDelete(id);
  }
}

export default new ScreeningService();
