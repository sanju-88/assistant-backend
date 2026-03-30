import express from "express";
import ConnectDb from "./config/db.js";
import authRouter from "./routes/auth.routes.js";
import userRouter from "./routes/user.routes.js";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();


const allowedOrigins = [
  "http://localhost:5173",
  "https://assistant-frontend-git-main-sanjus-projects-ac449c3d.vercel.app"
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("CORS not allowed"));
      }
    },
    credentials: true,
  })
);
// middleware
app.use(express.json());
app.use(cookieParser());

// routes
app.use("/api/auth", authRouter);
app.use("/api/user", userRouter);

// test route
app.get("/", (req, res) => {
  res.send("Server working ✅");
});

// ✅ call DB ONLY ONCE
await ConnectDb();

export default app;