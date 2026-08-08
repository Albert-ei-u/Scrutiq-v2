import { Request, Response } from "express";
import jobsService from "../services/jobs.service";
import applicantsService from "../services/applicants.service";
import Screening from "../models/Screening.model";
import Job from "../models/Job.model";
import Applicant from "../models/Applicant.model";

class StatsController {
  /**
   * Technical System Stats Retrieval:
   * Returns real-time aggregates across jobs, applicants, and screenings.
   */
  async getSystemStats(req: Request, res: Response) {
    try {
      const ownerId = req.headers['x-owner-id'] as string | undefined;
      const range = (req.query.range as string) || "weekly"; // weekly, monthly, annual

      // Determine applicable jobs for the owner
      const userJobsQuery = ownerId ? { ownerId } : {};
      const totalJobs = await Job.countDocuments(userJobsQuery);
      const totalApplicants = await Applicant.countDocuments(userJobsQuery);
      
      // We must isolate screenings to only jobs owned by this recruiter
      const userJobs = await Job.find(userJobsQuery).select('id _id title department');
      const jobIds = userJobs.map(j => (j.id || j._id).toString());
      
      const screeningQuery = jobIds.length > 0 ? { jobId: { $in: jobIds } } : { _id: null };
      const totalScreenings = await Screening.countDocuments(screeningQuery);

      // 2. Job Distribution
      const jobDist = await Job.aggregate([
        { $match: userJobsQuery },
        { $group: { _id: "$department", count: { $sum: 1 } } }
      ]);

      // 3. Screening Accuracy
      const avgScore = await Screening.aggregate([
        { $match: screeningQuery },
        { $group: { _id: null, avg: { $avg: "$matchScore" } } }
      ]);

      // 4. Activity Over Time (Dynamic Range)
      const sinceDate = new Date();
      let format = "%Y-%m-%d";

      if (range === "weekly") {
        sinceDate.setDate(sinceDate.getDate() - 7);
      } else if (range === "monthly") {
        sinceDate.setDate(sinceDate.getDate() - 30);
      } else if (range === "annual") {
        sinceDate.setMonth(sinceDate.getMonth() - 12);
        format = "%Y-%m"; // Group by month for annual view
      }

      const activity = await Screening.aggregate([
        { $match: { ...screeningQuery, updatedAt: { $gte: sinceDate } } },
        {
          $group: {
            _id: { $dateToString: { format, date: "$updatedAt" } },
            count: { $sum: 1 },
            avgQuality: { $avg: "$matchScore" }
          }
        },
        { $sort: { _id: 1 } }
      ]);

      const stats = {
        assessments: totalScreenings,
        activeJobs: totalJobs,
        candidates: totalApplicants,
        matchSuccessRate: avgScore[0]?.avg || 0,
        jobDistribution: jobDist.map(d => ({ name: d._id || "Uncategorized", value: d.count })),
        detailedDistribution: userJobs.map((j: any) => ({
          title: j.title || "Untitled Position",
          department: j.department || "Uncategorized"
        })),
        performanceData: activity.map(a => ({ 
          name: a._id, 
          screenings: a.count, 
          quality: Math.round(a.avgQuality)
        })),
        range: range,
      };

      return res.status(200).json({ 
        status: "success", 
        data: stats,
        timestamp: new Date().toISOString()
      });
    } catch (error: any) {
      return res.status(500).json({ 
        status: "fault", 
        message: error.message 
      });
    }
  }
}

export default new StatsController();
