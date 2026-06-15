import Joi from "joi";

export const updateProfileSchema = Joi.object({
  body: Joi.object({
    name: Joi.string().min(2).optional(),
    phone: Joi.string().allow("").optional(),
    college: Joi.string().allow("").optional(),
    course: Joi.string().allow("").optional(),
    year: Joi.string().allow("").optional(),
    sleep_schedule: Joi.string()
      .valid("", "Early Bird", "Night Owl", "Flexible")
      .optional(),
    cleanliness: Joi.string()
      .valid("", "Very Clean", "Moderate", "Relaxed")
      .optional(),
    study_habits: Joi.string()
      .valid("", "Quiet", "Group Study", "Flexible")
      .optional(),
    smoking_drinking: Joi.string()
      .valid("", "Non-smoker/Non-drinker", "Social", "Regular")
      .optional(),
  }),
});
