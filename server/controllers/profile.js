import User from "../models/User.js";
import logger from "../utils/logger.js";

// Helper to calculate profile completion percentage
export const calculateCompletion = (user) => {
  let score = 0;

  // 1. Profile Picture = 10%
  if (user.profileImage && user.profileImage.trim() !== "") {
    score += 10;
  }

  // 2. Basic Information = 25%
  // Fields: Name, Age, Gender, College, Course, Academic Year, City, State
  const basicFields = [
    user.name,
    user.age,
    user.gender,
    user.profile?.college,
    user.profile?.course,
    user.profile?.year,
    user.city,
    user.state
  ];
  const filledBasic = basicFields.filter(field => field !== undefined && field !== null && field.toString().trim() !== "");
  const basicPercentage = Math.round((filledBasic.length / basicFields.length) * 25);
  score += basicPercentage;

  // 3. About Me = 15%
  // Bio + interests/hobbies/languages
  let aboutScore = 0;
  if (user.bio && user.bio.trim() !== "") {
    aboutScore += 5;
  }
  if (user.interests && user.interests.length > 0) {
    aboutScore += 5;
  }
  if ((user.hobbies && user.hobbies.length > 0) || (user.languages && user.languages.length > 0)) {
    aboutScore += 5;
  }
  score += aboutScore;

  // 4. Roommate Preferences = 30%
  // 10 preference fields
  const prefFields = [
    user.preferences?.budgetRange,
    user.preferences?.preferredLocation,
    user.preferences?.moveInDate,
    user.preferences?.smokingPreference,
    user.preferences?.drinkingPreference,
    user.preferences?.cleanlinessLevel,
    user.preferences?.sleepSchedule,
    user.preferences?.studyHabits,
    user.preferences?.guestPolicy,
    user.preferences?.petsPreference
  ];
  const filledPrefs = prefFields.filter(f => f !== undefined && f !== null && f.toString().trim() !== "");
  const prefsPercentage = Math.round((filledPrefs.length / prefFields.length) * 30);
  score += prefsPercentage;

  // 5. Social Links = 10%
  // At least one link
  if (
    (user.socialLinks?.linkedin && user.socialLinks.linkedin.trim() !== "") ||
    (user.socialLinks?.instagram && user.socialLinks.instagram.trim() !== "") ||
    (user.socialLinks?.portfolio && user.socialLinks.portfolio.trim() !== "")
  ) {
    score += 10;
  }

  // 6. Verification = 10%
  if (user.verificationStatus === "verified") {
    score += 10;
  }

  return Math.min(score, 100);
};

// Check and mark profileCompleted: true if key information is done
const checkProfileCompletion = async (user) => {
  const completion = calculateCompletion(user);
  
  // A profile is complete if it has: Basic Info (Name, College, Course, Year) & at least some preferences and about me details.
  // We can also just base it on a threshold like completion >= 60%
  const hasBasicInfo = user.profile?.college && user.profile?.course && user.profile?.year && user.name;
  
  const originalStatus = user.profileCompleted;
  user.profileCompleted = !!(completion >= 50 && hasBasicInfo);
  
  if (originalStatus !== user.profileCompleted) {
    await user.save();
    logger.info(`User ${user.email} profileCompleted status changed to: ${user.profileCompleted}`);
  }
  return user.profileCompleted;
};

// @desc    Get user profile with completion percentage
// @route   GET /api/profile
// @access  Private
export const getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    if (!user) {
      res.status(404);
      throw new Error("User not found");
    }

    const completionPercentage = calculateCompletion(user);
    res.json({
      user,
      completionPercentage,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update basic profile details
// @route   PUT /api/profile
// @access  Private
export const updateProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      res.status(404);
      throw new Error("User not found");
    }

    // Update fields
    if (req.body.name) user.name = req.body.name;
    if (req.body.phone !== undefined) user.phone = req.body.phone;
    if (req.body.age !== undefined) user.age = req.body.age;
    if (req.body.gender !== undefined) user.gender = req.body.gender;
    if (req.body.city !== undefined) user.city = req.body.city;
    if (req.body.state !== undefined) user.state = req.body.state;
    if (req.body.bio !== undefined) user.bio = req.body.bio;
    if (req.body.interests !== undefined) user.interests = req.body.interests;
    if (req.body.hobbies !== undefined) user.hobbies = req.body.hobbies;
    if (req.body.languages !== undefined) user.languages = req.body.languages;

    // Update college details
    if (req.body.college !== undefined) user.profile.college = req.body.college;
    if (req.body.course !== undefined) user.profile.course = req.body.course;
    if (req.body.year !== undefined) user.profile.year = req.body.year;

    // Update social links
    if (req.body.socialLinks) {
      user.socialLinks.linkedin = req.body.socialLinks.linkedin !== undefined ? req.body.socialLinks.linkedin : user.socialLinks.linkedin;
      user.socialLinks.instagram = req.body.socialLinks.instagram !== undefined ? req.body.socialLinks.instagram : user.socialLinks.instagram;
      user.socialLinks.portfolio = req.body.socialLinks.portfolio !== undefined ? req.body.socialLinks.portfolio : user.socialLinks.portfolio;
    }

    await user.save();
    await checkProfileCompletion(user);

    const completionPercentage = calculateCompletion(user);
    res.json({
      user,
      completionPercentage,
      message: "Profile updated successfully",
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update roommate preferences
// @route   PUT /api/profile/preferences
// @access  Private
export const updatePreferences = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      res.status(404);
      throw new Error("User not found");
    }

    // Update preferences fields
    const prefs = req.body;
    if (prefs.budgetRange !== undefined) user.preferences.budgetRange = prefs.budgetRange;
    if (prefs.preferredLocation !== undefined) user.preferences.preferredLocation = prefs.preferredLocation;
    if (prefs.moveInDate !== undefined) user.preferences.moveInDate = prefs.moveInDate;
    if (prefs.smokingPreference !== undefined) user.preferences.smokingPreference = prefs.smokingPreference;
    if (prefs.drinkingPreference !== undefined) user.preferences.drinkingPreference = prefs.drinkingPreference;
    if (prefs.cleanlinessLevel !== undefined) user.preferences.cleanlinessLevel = prefs.cleanlinessLevel;
    if (prefs.sleepSchedule !== undefined) user.preferences.sleepSchedule = prefs.sleepSchedule;
    if (prefs.studyHabits !== undefined) user.preferences.studyHabits = prefs.studyHabits;
    if (prefs.guestPolicy !== undefined) user.preferences.guestPolicy = prefs.guestPolicy;
    if (prefs.petsPreference !== undefined) user.preferences.petsPreference = prefs.petsPreference;

    // Sync sleep schedule, cleanliness, study habits, smoking/drinking back to the legacy user.profile fields for compatibility
    if (prefs.sleepSchedule !== undefined) user.profile.sleep_schedule = prefs.sleepSchedule;
    if (prefs.cleanlinessLevel !== undefined) user.profile.cleanliness = prefs.cleanlinessLevel;
    if (prefs.studyHabits !== undefined) user.profile.study_habits = prefs.studyHabits;
    if (prefs.smokingPreference !== undefined || prefs.drinkingPreference !== undefined) {
      const smoking = prefs.smokingPreference || "Neither";
      const drinking = prefs.drinkingPreference || "Neither";
      user.profile.smoking_drinking = `${smoking}/${drinking}`;
    }

    await user.save();
    await checkProfileCompletion(user);

    const completionPercentage = calculateCompletion(user);
    res.json({
      user,
      completionPercentage,
      message: "Roommate preferences updated successfully",
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update privacy settings
// @route   PUT /api/profile/privacy
// @access  Private
export const updatePrivacy = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      res.status(404);
      throw new Error("User not found");
    }

    const privacy = req.body;
    if (privacy.showPhone !== undefined) user.privacySettings.showPhone = privacy.showPhone;
    if (privacy.showEmail !== undefined) user.privacySettings.showEmail = privacy.showEmail;
    if (privacy.showSocials !== undefined) user.privacySettings.showSocials = privacy.showSocials;
    if (privacy.publicProfileVisibility !== undefined) user.privacySettings.publicProfileVisibility = privacy.publicProfileVisibility;

    await user.save();

    res.json({
      user,
      message: "Privacy settings updated successfully",
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Upload profile or cover image (supporting mock generation)
// @route   POST /api/profile/image
// @access  Private
export const uploadImage = async (req, res, next) => {
  try {
    const { type, imageUrl } = req.body;
    if (!type || !["profile", "cover"].includes(type)) {
      res.status(400);
      throw new Error("Invalid image type. Must be 'profile' or 'cover'");
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      res.status(404);
      throw new Error("User not found");
    }

    let finalImageUrl = imageUrl;
    
    // If no imageUrl is sent, we mock the upload with high quality unsplash links
    if (!finalImageUrl) {
      if (type === "profile") {
        const avatars = [
          "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80",
          "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=400&q=80",
          "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80",
          "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80"
        ];
        finalImageUrl = avatars[Math.floor(Math.random() * avatars.length)];
      } else {
        const covers = [
          "https://images.unsplash.com/photo-1507842217343-583bb7270b66?auto=format&fit=crop&w=1200&q=80",
          "https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?auto=format&fit=crop&w=1200&q=80",
          "https://images.unsplash.com/photo-1527891751199-7225231a68dd?auto=format&fit=crop&w=1200&q=80"
        ];
        finalImageUrl = covers[Math.floor(Math.random() * covers.length)];
      }
    }

    if (type === "profile") {
      user.profileImage = finalImageUrl;
    } else {
      user.coverImage = finalImageUrl;
    }

    await user.save();
    await checkProfileCompletion(user);

    const completionPercentage = calculateCompletion(user);
    res.json({
      user,
      completionPercentage,
      message: `${type === "profile" ? "Profile" : "Cover"} image uploaded successfully`,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete user account
// @route   DELETE /api/profile
// @access  Private
export const deleteAccount = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      res.status(404);
      throw new Error("User not found");
    }

    await User.findByIdAndDelete(req.user._id);
    logger.info(`User account deleted: ${user.email}`);

    res.json({
      message: "Account deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};
