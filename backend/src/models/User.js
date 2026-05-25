// src/models/User.js
import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true, select: false },
    role: {
      type: String,
      enum: ["seeker", "recruiter", "admin"],
      default: "seeker",
    },
    phone: String,
    profileImage: String, // Cloudinary URL
    resume: String, // Cloudinary URL
    bio: String,
    skills: [String],
    experience: [
      {
        title: String,
        company: String,
        from: Date,
        to: Date,
        description: String,
      },
    ],
    education: [
      {
        degree: String,
        institution: String,
        from: Date,
        to: Date,
        description: String,
      },
    ],
    savedJobs: [{ type: mongoose.Schema.Types.ObjectId, ref: "Job" }],
    // For password reset / email verification
    passwordResetToken: String,
    passwordResetExpires: Date,
    emailVerificationToken: String,
    isVerified: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// hash password before save
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.comparePassword = function (candidatePassword) => {
  return bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model("User", userSchema);
export default User;
