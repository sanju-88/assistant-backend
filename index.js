import express from "express";
import ConnectDb from "./config/db.js";
import authRouter from "./routes/auth.routes.js";
import userRouter from "./routes/user.routes.js";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();

app.use(express.json());
app.use(
  cors({
    origin: "*",
    credentials: true,
  }),
);
app.use(cookieParser());
app.use(`/api/auth`, authRouter);
app.use(`/api/user`, userRouter);



// app.listen(port, () => {
//   ConnectDb();
//   console.log("server started");
// });

app.get("/", (req, res) => {
  res.send("API running 🚀");
});