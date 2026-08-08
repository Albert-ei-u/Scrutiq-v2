import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

async function resetDB() {
  try {
    const uri = process.env.MONGODB_URI;
    if (!uri) throw new Error("MONGODB_URI missing.");
    
    await mongoose.connect(uri);
    console.log("Connected to MongoDB for system wipe...");
    
    const db = mongoose.connection.db;
    if (!db) throw new Error("Database connection not established.");
    const collections = await db.collections();
    for (const collection of collections) {
      await collection.deleteMany({});
      console.log(`- Wiped collection: ${collection.collectionName}`);
    }
    
    console.log("System Registry Wiped Successfully.");
    process.exit(0);
  } catch (error) {
    console.error("Wipe Failure:", error);
    process.exit(1);
  }
}

resetDB();
