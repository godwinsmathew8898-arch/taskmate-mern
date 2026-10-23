import mongoose from "mongoose";

const connectDB = async () => {
  try {
    console.log("MongoDB is connecting");

    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB is connected");
  } catch (error) {
    console.error("MongoDB Connection Failed!", error.message);
    process.exit(1);
  }
};

export default connectDB;
