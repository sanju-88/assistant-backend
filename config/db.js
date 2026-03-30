import mongoose from "mongoose";

let isConnected = false;

const ConnectDb = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    isConnected = true;
    console.log("Db connected");
  } catch (error) {
    console.log(error);
  }
};

export default ConnectDb;
