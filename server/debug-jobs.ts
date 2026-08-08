import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import Job from "./src/models/Job.model";

dotenv.config();

const debugJobs = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || "");
    console.log("Connected to MongoDB");
    const jobs = await Job.find({});
    console.log(`Found ${jobs.length} jobs in total.`);
    jobs.forEach((j) => {
      console.log(`- ${j.title} (ID: ${j._id}, Owner: ${j.ownerId})`);
    });
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

debugJobs();
