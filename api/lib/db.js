import mongoose from "mongoose";

export const connectDB = async () => {
  try {
    const connected = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB connected ${connected.connection.host}`);
  } catch (error) {
    console.log("could'nt connect do dataBase", error.message);
    process.exit(1);
  }
};
