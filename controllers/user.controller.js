import User from "../models/user.model.js";
import uploadOnCloudinary from "../config/cloudinary.js";
import moment from "moment";
import geminiResponse from "../gemini.js";
import { json, response } from "express";

export const getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select("-password");

    if (!user) {
      return res.status(400).json({ message: "User not found!" });
    }

    return res.status(200).json(user);
  } catch (error) {
    console.error("Error fetching current user:", error);
    res.status(400).json({ message: "Internal server error" });
  }
};

export const updateAssistant = async (req, res) => {
  try {
    const { assistantName, imageUrl } = req.body;

    let assistantImage;

    // 🔥 CASE 1: FILE UPLOAD
    if (req.file) {
      console.log("📁 File received:", req.file.originalname);

      const cloudinaryResult = await uploadOnCloudinary(req.file.buffer);

      if (!cloudinaryResult || !cloudinaryResult.secure_url) {
        throw new Error("Cloudinary upload failed");
      }

      assistantImage = cloudinaryResult.secure_url;
    }

    // 🔥 CASE 2: PREDEFINED IMAGE
    else if (imageUrl) {
      assistantImage = imageUrl;
    }

    // 🔥 CASE 3: NOTHING SENT
    else {
      return res.status(400).json({
        message: "No image provided",
      });
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.userId,
      {
        assistantName,
        assistantImage,
      },
      { new: true } // 🔥 FIXED (important)
    ).select("-password");

    return res.status(200).json(updatedUser);

  } catch (error) {
    console.error("❌ UPDATE ASSISTANT ERROR:", error.message);

    return res.status(500).json({
      message: "Server error",
      error: error.message, // 🔥 show actual error
    });
  }
};

export const askToAssistant = async (req, res) => {
  try {
    const user = await User.findById(req.userId);

    if (!user) {
      return res.status(400).json({ response: "User not found" });
    }

    const { command } = req.body;

    if (!command || command.trim().length < 2) {
      return res.status(400).json({ message: "Valid command required" });
    }

    const userName = user.name;
    const assistantName = user.assistantName;

    // ✅ Ensure history is valid
    if (!Array.isArray(user.history)) {
      user.history = [];
    }

    // 🔥 LIMIT HISTORY (important for performance)
    if (user.history.length > 50) {
      user.history = user.history.slice(-50);
    }

    // ✅ Save user message
    user.history.push({
      user: command,
      ai: null,
    });

    console.log("🧠 Command:", command);

    // 🚫 SINGLE Gemini call
    const result = await geminiResponse(command, assistantName, userName);
    console.log("🤖 Gemini raw result:", result);

    let gemResult;

    try {
      if (!result || typeof result !== "string") {
        throw new Error("Invalid Gemini response");
      }

      const cleanResult = result
        .replace(/```json/g, "")
        .replace(/```/g, "")
        .trim();

      const jsonMatch = cleanResult.match(/\{[\s\S]*\}/)?.[0];

      if (!jsonMatch) {
        gemResult = {
          type: "general",
          userInput: command,
          response: cleanResult,
        };
      } else {
        gemResult = JSON.parse(jsonMatch);
      }
    } catch (err) {
      console.error("❌ Parse Error:", err);

      gemResult = {
        type: "general",
        userInput: command,
        response: "Sorry, something went wrong.",
      };
    }

    // ✅ SAFE FALLBACKS
    let type = gemResult?.type || "general";
    let userInput = gemResult?.userInput || command;
    let aiResponse =
      gemResult?.response || "Sorry, I couldn't generate a response";

    // 🔥 LOCAL COMMAND HANDLING (FAST + NO API)
    switch (type) {
      case "get_time":
        aiResponse = `The current time is ${moment().format("hh:mm A")}`;
        break;

      case "get_date":
        aiResponse = `Today's date is ${moment().format("MMMM Do YYYY")}`;
        break;

      case "get_day":
        aiResponse = `Today is ${moment().format("dddd")}`;
        break;

      case "get_month":
        aiResponse = `This month is ${moment().format("MMMM")}`;
        break;

      default:
        break;
    }

    // ✅ SAVE AI RESPONSE
    user.history[user.history.length - 1].ai = aiResponse;

    await user.save();

    return res.json({
      type,
      userInput,
      response: aiResponse,
    });

  } catch (error) {
    console.error("❌ FULL ERROR:", error.message);

    return res.status(500).json({
      type: "general",
      response: "Server error, please try again",
    });
  }
};