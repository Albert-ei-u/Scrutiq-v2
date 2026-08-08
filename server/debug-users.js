const mongoose = require("mongoose");
const dotenv = require("dotenv");

dotenv.config();

const UserSchema = new mongoose.Schema({
    email: String,
    isVerified: Boolean
});

const User = mongoose.model("User", UserSchema);

const run = async () => {
    try {
        const uri = process.env.MONGODB_URI;
        if (!uri) throw new Error("MONGODB_URI not found in .env");
        await mongoose.connect(uri);
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
