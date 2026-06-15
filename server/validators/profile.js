import Joi from "joi";

export const updateProfileSchema = Joi.object({
  body: Joi.object({
    name: Joi.string().min(2).max(50).optional(),
    phone: Joi.string().allow("").optional(),
    age: Joi.number().min(16).max(100).allow(null).optional(),
    gender: Joi.string().allow("").optional(),
    city: Joi.string().allow("").optional(),
    state: Joi.string().allow("").optional(),
    college: Joi.string().allow("").optional(),
    course: Joi.string().allow("").optional(),
    year: Joi.string().allow("").optional(),
    bio: Joi.string().allow("").max(500).optional(),
    interests: Joi.array().items(Joi.string()).optional(),
    hobbies: Joi.array().items(Joi.string()).optional(),
    languages: Joi.array().items(Joi.string()).optional(),
    socialLinks: Joi.object({
      linkedin: Joi.string().allow("").uri().optional(),
      instagram: Joi.string().allow("").optional(),
      portfolio: Joi.string().allow("").uri().optional(),
    }).optional(),
  }),
});

export const updatePreferencesSchema = Joi.object({
  body: Joi.object({
    budgetRange: Joi.string().allow("").optional(),
    preferredLocation: Joi.string().allow("").optional(),
    moveInDate: Joi.string().allow("").optional(),
    smokingPreference: Joi.string().allow("").optional(),
    drinkingPreference: Joi.string().allow("").optional(),
    cleanlinessLevel: Joi.string().allow("").optional(),
    sleepSchedule: Joi.string().allow("").optional(),
    studyHabits: Joi.string().allow("").optional(),
    guestPolicy: Joi.string().allow("").optional(),
    petsPreference: Joi.string().allow("").optional(),
  }),
});

export const updatePrivacySchema = Joi.object({
  body: Joi.object({
    showPhone: Joi.boolean().optional(),
    showEmail: Joi.boolean().optional(),
    showSocials: Joi.boolean().optional(),
    publicProfileVisibility: Joi.boolean().optional(),
  }),
});
