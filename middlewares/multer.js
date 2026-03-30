import multer from "multer";


const storage = multer.memoryStorage(); // 🔥 MUST

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // optional (5MB)
});

export default upload;