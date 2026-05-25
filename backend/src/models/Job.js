// src/models/Job.js
import mongoose from "mongoose";

const jobSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    requirements: [String],
    responsibilities: [String],
    salaryMin: Number,
    salaryMax: Number,
    experienceLevel: {
      type: String,
      enum: ["Intern", "Junior", "Mid", "Senior", "Lead"],
    },
    jobType: {
      type: String,
      enum: ["Full‑time", "Part‑time", "Contract", "Temporary", "Freelance"],
    },
    location: String,
    remote: { type: Boolean, default: false },
    tags: [String],
    company: { type: mongoose.Schema.Types.ObjectId, ref: "Company", required: true },
    recruiter: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    deadline: Date,
    isActive: { type: Boolean, default: true },
    applicationsCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

const Job = mongoose.model("Job", jobSchema);
export default Job;
