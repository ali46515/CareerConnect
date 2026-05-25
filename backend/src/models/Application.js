// src/models/Application.js
import mongoose from "mongoose";

const applicationSchema = new mongoose.Schema(
  {
    job: { type: mongoose.Schema.Types.ObjectId, ref: "Job", required: true },
    applicant: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    coverLetter: String,
    resume: String, // optional custom resume URL
    status: {
      type: String,
      enum: ["applied", "reviewed", "shortlisted", "rejected", "interview", "offered", "withdrawn"],
      default: "applied",
    },
    appliedAt: { type: Date, default: Date.now },
    notes: String,
  },
  { timestamps: true }
);

const Application = mongoose.model("Application", applicationSchema);
export default Application;
