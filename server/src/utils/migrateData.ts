import fs from "fs";
import path from "path";
import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "../models/User.model";
import Job from "../models/Job.model";
import Applicant from "../models/Applicant.model";
import Screening from "../models/Screening.model";

dotenv.config();

const DATA_DIR = path.join(__dirname, "../data");

const migrate = async () => {
  try {
    console.log("Starting Data Migration...");
    await mongoose.connect(process.env.MONGODB_URI || "");
    console.log("Connected to MongoDB.");

    // Migrate Users
    const usersPath = path.join(DATA_DIR, "users.json");
    if (fs.existsSync(usersPath)) {
      const users = JSON.parse(fs.readFileSync(usersPath, "utf8"));
      for (const u of users) {
        await User.findOneAndUpdate({ email: u.email }, u, { upsert: true });
      }
      console.log(`Migrated ${users.length} users.`);
    }

    // Migrate Jobs
    const jobsPath = path.join(DATA_DIR, "jobs.json");
    if (fs.existsSync(jobsPath)) {
      const jobs = JSON.parse(fs.readFileSync(jobsPath, "utf8"));
      for (const j of jobs) {
        // Handle ownerId if missing
        if (!j.ownerId) j.ownerId = "USR-217"; // Default to Ishya for legacy data
        // Mongoose _id vs JOB-ID
        const { id, ...jobData } = j;
        await Job.findOneAndUpdate({ title: j.title, ownerId: j.ownerId }, jobData, { upsert: true });
      }
      console.log(`Migrated ${jobs.length} jobs.`);
    }

    // Migrate Applicants
    const appsPath = path.join(DATA_DIR, "applicants.json");
    if (fs.existsSync(appsPath)) {
      const applicants = JSON.parse(fs.readFileSync(appsPath, "utf8"));
      for (const a of applicants) {
        if (!a.ownerId) a.ownerId = "USR-217";
        const { id, ...appData } = a;
        await Applicant.findOneAndUpdate({ email: a.email, ownerId: a.ownerId }, appData, { upsert: true });
      }
      console.log(`Migrated ${applicants.length} applicants.`);
    }

    // Migrate Screenings
    const screeningsPath = path.join(DATA_DIR, "screenings.json");
    if (fs.existsSync(screeningsPath)) {
      const screenings = JSON.parse(fs.readFileSync(screeningsPath, "utf8"));
      for (const s of screenings) {
        await Screening.findOneAndUpdate({ jobId: s.jobId, candidateId: s.candidateId }, s, { upsert: true });
      }
      console.log(`Migrated ${screenings.length} screenings.`);
    }

    console.log("Migration Successful.");
    process.exit(0);
  } catch (error) {
    console.error("Migration Error:", error);
    process.exit(1);
  }
};

migrate();
