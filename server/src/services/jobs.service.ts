import Job from "../models/Job.model";
import Screening from "../models/Screening.model";

class JobsService {
  /**
   * Job Registry Retrieval:
   * Returns all active job postings for a specific owner.
   */
  async getAllJobs(ownerId?: string) {
    if (!ownerId) return [];

    const jobs = await Job.find({ ownerId }).sort({ createdAt: -1 }).lean();

    // Add dynamic count from screenings
    const results = await Promise.all(
      jobs.map(async (job: any) => {
        const count = await Screening.countDocuments({
          jobId: job._id.toString(),
        });
        return { ...job, applicantsCount: count };
      }),
    );

    return results;
  }

  /**
   * Detail Matrix Retrieval:
   * Returns a specific job metric by ID.
   */
  async getJobById(id: string) {
    const job = await Job.findById(id).lean();
    if (!job) return null;

    const count = await Screening.countDocuments({ jobId: job._id.toString() });
    return { ...job, applicantsCount: count };
  }

  /**
   * Job Requirement Initialization:
   * Adds a new technical requirement to the database.
   */
  async createJob(jobData: any) {
    // Normalization logic to catch semantically identical titles (e.g., plurals)
    const normalizeTitle = (title: string) => {
      return title
        .toLowerCase()
        .trim()
        .replace(/\s+/g, ' ') // Collapse multiple spaces
        .replace(/s$/, '')    // Remove simple plural 's'
        .replace(/es$/, '');  // Remove 'es' plural
    };

    const targetNormalized = normalizeTitle(jobData.title);
    
    // Fetch user's existing jobs to compare
    const existingJobs = await Job.find({ ownerId: jobData.ownerId }).select('title');
    
    const semanticDuplicate = existingJobs.find(job => 
      normalizeTitle(job.title) === targetNormalized
    );

    if (semanticDuplicate) {
      throw new Error(`ALREADY_EXISTS: This job already exists in the app.`);
    }

    const newJob = new Job({
      ...jobData,
      applicantsCount: 0,
      status: "Active",
    });
    return await newJob.save();
  }

  /**
   * Update Judgement Criteria:
   * Modifies an existing technical requirement.
   */
  async updateJob(id: string, updatedData: any) {
    // Normalization logic
    const normalizeTitle = (title: string) => {
      return title
        .toLowerCase()
        .trim()
        .replace(/\s+/g, ' ')
        .replace(/s$/, '')
        .replace(/es$/, '');
    };

    if (updatedData.title) {
      const currentJob = await Job.findById(id);
      if (!currentJob) return null;

      const targetNormalized = normalizeTitle(updatedData.title);
      
      // Look for duplicates excluding the current job
      const existingJobs = await Job.find({ 
        ownerId: currentJob.ownerId, 
        _id: { $ne: id } 
      }).select('title');
      
      const semanticDuplicate = existingJobs.find(job => 
        normalizeTitle(job.title) === targetNormalized
      );

      if (semanticDuplicate) {
        throw new Error(`ALREADY_EXISTS: This job already exists in the app.`);
      }
    }

    return await Job.findByIdAndUpdate(id, updatedData, { new: true });
  }

  async deleteJob(id: string) {
    return await Job.findByIdAndDelete(id);
  }
}

export default new JobsService();
