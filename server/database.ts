import mongoose from "mongoose";
import { MONGO_URI } from "./config";

export const connectDB = async (): Promise<void> => {
    try {
      await mongoose.connect(MONGO_URI);
      console.log("✅ Connected to MongoDB");
      console.log("✅ Ready for queries");
    } catch (error) {
      console.error("❌ MongoDB Connection Error:", error);
      process.exit(1);
    }
  };