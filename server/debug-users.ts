import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "./src/models/User.model";

dotenv.config();

const run = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || "mongodb://localhost:27017/umurava");
        const users = await User.find({});
        console.log("Found users:");
        users.forEach(u => {
            console.log(`- Email: "${u.email}", Verified: ${u.isVerified}`);
        });
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

run();
