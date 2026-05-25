// src/routes/messages.js
import express from "express";
import { protect } from "../middleware/auth.js";
import Message from "../models/Message.js";
import { io } from "../server.js";

const router = express.Router();

// Get all messages for a conversation between two users (or a job‑based chat)
router.get("/conversation/:conversationId", protect, async (req, res, next) => {
  try {
    const { conversationId } = req.params;
    const messages = await Message.find({ conversationId })
      .populate("sender", "fullName profileImage")
      .populate("receiver", "fullName profileImage")
      .sort({ createdAt: 1 }); // chronological
    res.json(messages);
  } catch (err) {
    next(err);
  }
});

// Send a new message (stores in DB and emits via socket.io)
router.post("/", protect, async (req, res, next) => {
  try {
    const { conversationId, receiverId, content } = req.body;
    if (!conversationId || !receiverId || !content) {
      return res.status(400).json({ message: "Missing fields" });
    }
    const message = new Message({
      conversationId,
      sender: req.user.id,
      receiver: receiverId,
      content,
    });
    await message.save();

    // Emit to both participants (rooms are named by conversationId)
    const payload = {
      _id: message._id,
      conversationId,
      sender: req.user.id,
      receiver: receiverId,
      content,
      createdAt: message.createdAt,
    };
    io.to(conversationId).emit("newMessage", payload);
    // Also ensure each participant joins the room (in case they aren't already)
    io.sockets.sockets.forEach((s) => {
      if (s.id === req.user.id) s.join(conversationId);
    });
    res.status(201).json(payload);
  } catch (err) {
    next(err);
  }
});

export default router;
