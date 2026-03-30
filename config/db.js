import mongoose from "mongoose";

let isConnected = false;

const ConnectDb = async () => {
  if (isConnected) {
    return;
  }

  try {
    const db = await mongoose.connect(process.env.MONGO_URI);

    isConnected = db.connections[0].readyState;
    console.log("DB connected");
  } catch (error) {
    console.log("DB Error:", error.message);
    throw error;
  }
};

export default ConnectDb;
