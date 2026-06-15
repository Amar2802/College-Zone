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
    profileCompleted: {
      type: Boolean,
      default: false,
      index: true,
    },
    profileImage: {
      type: String,
      default: "",
    },
    coverImage: {
      type: String,
      default: "",
    },
    age: {
      type: Number,
      default: null,
    },
    gender: {
      type: String,
      default: "",
      trim: true,
    },
    city: {
      type: String,
      default: "",
      trim: true,
    },
    state: {
      type: String,
      default: "",
      trim: true,
    },
    bio: {
      type: String,
      default: "",
      trim: true,
    },
    interests: {
      type: [String],
      default: [],
    },
    hobbies: {
      type: [String],
      default: [],
    },
    languages: {
      type: [String],
      default: [],
    },
    verificationStatus: {
      type: String,
      default: "unverified",
      enum: ["unverified", "pending", "verified"],
      index: true,
    },
    profile: {
      college: { type: String, default: "", trim: true, index: true },
      course: { type: String, default: "", trim: true },
      year: { type: String, default: "", trim: true },
      // Keep these for backward compatibility
      sleep_schedule: { type: String, default: "" },
      cleanliness: { type: String, default: "" },
      study_habits: { type: String, default: "" },
      smoking_drinking: { type: String, default: "" },
    },
    preferences: {
      budgetRange: { type: String, default: "", trim: true },
      preferredLocation: { type: String, default: "", trim: true },
      moveInDate: { type: String, default: "", trim: true },
      smokingPreference: { type: String, default: "", trim: true },
      drinkingPreference: { type: String, default: "", trim: true },
      cleanlinessLevel: { type: String, default: "", trim: true },
      sleepSchedule: { type: String, default: "", trim: true },
      studyHabits: { type: String, default: "", trim: true },
      guestPolicy: { type: String, default: "", trim: true },
      petsPreference: { type: String, default: "", trim: true },
    },
    socialLinks: {
      linkedin: { type: String, default: "", trim: true },
      instagram: { type: String, default: "", trim: true },
      portfolio: { type: String, default: "", trim: true },
    },
    privacySettings: {
      showPhone: { type: Boolean, default: false },
      showEmail: { type: Boolean, default: false },
      showSocials: { type: Boolean, default: false },
      publicProfileVisibility: { type: Boolean, default: true },
    },
  },
  {
    timestamps: true,
  }
);

// Add text search index for user profile and name matching
userSchema.index({ name: "text", "profile.college": "text", "profile.course": "text", bio: "text" });

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
