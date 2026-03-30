import express from "express";
import ConnectDb from "./config/db.js";
import authRouter from "./routes/auth.routes.js";
import userRouter from "./routes/user.routes.js";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();

// middleware
app.use(express.json());
app.use(
  cors({
    origin: "*",
    credentials: true,
  })
);
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