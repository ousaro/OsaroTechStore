import mongoose from "mongoose";

export const connectMongo = async (mongoUri) => {
  await mongoose.connect(mongoUri);
  console.log("Connected to MongoDB");
};
