import mongoose from "mongoose";

export async function connectDB(): Promise<typeof mongoose> {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    throw new Error("MONGODB_URI not found");
  }

  try {
    const connection = await mongoose.connect(uri);
    console.log("MongoDB connected successfully");
    console.log("Database:", connection.connection.name);
    return connection;
  } catch (error) {
    console.error("MongoDB connection failed:", error);
    throw error;
  }
}

process.on("SIGINT", async () => {
  await mongoose.connection.close();
  console.log("MongoDB connection closed");
  process.exit(0);
});
