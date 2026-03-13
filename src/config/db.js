import mongoose from "mongoose";
import { config } from "./env.js";

export async function connectDB() {
  try {
    await mongoose.connect(config.MONGO_URI);
    console.log("✅ MongoDB conectado:", mongoose.connection.name);
  } catch (error) {
    console.error("❌ Error conectando a MongoDB:", error.message);
    process.exit(1);
  }
}
