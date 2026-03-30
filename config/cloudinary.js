import { v2 as cloudinary } from "cloudinary";
import streamifier from "streamifier";

// 🔥 CONFIG (MOST IMPORTANT)
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// 🔥 UPLOAD FUNCTION
const uploadOnCloudinary = (buffer) => {
  return new Promise((resolve, reject) => {
    if (!buffer) {
      return reject(new Error("No buffer provided"));
    }

    const stream = cloudinary.uploader.upload_stream(
      {
        folder: "assistant",
      },
      (error, result) => {
        if (error) {
          console.error("❌ Cloudinary error:", error);
          return reject(error);
        }

        console.log("✅ Uploaded to Cloudinary:", result.secure_url);
        resolve(result);
      }
    );

    streamifier.createReadStream(buffer).pipe(stream);
  });
};

export default uploadOnCloudinary;