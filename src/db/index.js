import mongoose from "mongoose";

async function connectDb() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connect to databse.");
  } catch (error) {
    console.error("Failed to connect to database: ", error);
    process.exit(1);
  }
}

export default connectDb;
