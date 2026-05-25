// src/models/Company.js
import mongoose from "mongoose";

const companySchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    logo: String, // Cloudinary URL
    description: String,
    website: String,
    industry: String,
    size: String,
    headquarters: String,
    recruiter: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // the user who owns the company
  },
  { timestamps: true }
);

const Company = mongoose.model("Company", companySchema);
export default Company;
