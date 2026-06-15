import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, "Please enter a valid email address"],
      index: true,
    },
    password: {
      type: String,
      // Optional for Google OAuth users, but let's validate it when present
      minlength: [6, "Password must be at least 6 characters long"],
    },
    googleId: {
      type: String,
      unique: true,
      sparse: true,
      index: true,
    },
    phone: {
      type: String,
      default: "",
      trim: true,
    },
    profile: {
      college: { type: String, default: "", trim: true },
      course: { type: String, default: "", trim: true },
      year: { type: String, default: "", trim: true },
      sleep_schedule: { 
        type: String, 
        default: "", 
        enum: ["", "Early Bird", "Night Owl", "Flexible"] 
      },
      cleanliness: { 
        type: String, 
        default: "", 
        enum: ["", "Very Clean", "Moderate", "Relaxed"] 
      },
      study_habits: { 
        type: String, 
        default: "", 
        enum: ["", "Quiet", "Group Study", "Flexible"] 
      },
      smoking_drinking: { 
        type: String, 
        default: "", 
        enum: ["", "Non-smoker/Non-drinker", "Social", "Regular"] 
      },
    },
  },
  {
    timestamps: true,
  }
);

// Add text search index for user profile and name matching
userSchema.index({ name: "text", "profile.college": "text", "profile.course": "text" });

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

userSchema.methods.matchPassword = async function (enteredPassword) {
  if (!this.password) return false;
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model("User", userSchema);

export default User;
