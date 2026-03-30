import jwt from "jsonwebtoken";
const isAuth = async (req, res, next) => {
  try {
    const token =
      req.cookies?.token || req.headers?.authorization?.split(" ")[1];

    if (!token) {
      console.log("No token, allowing for testing");
      return res.status(401).json({ message: "Token not found" });
    }

    const verifyToken = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = verifyToken.userId;
    next();
  } catch (error) {
    console.log("Auth middleware error:", error);
    return res.status(500).json({ message: "Invalid token" });
  }
};

export default isAuth;
