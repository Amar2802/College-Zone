import { z } from "zod";

export const updateProfileSchema = z.object({
  body: z.object({
    name: z.string().min(2, "Name must be at least 2 characters long").optional(),
    phone: z.string().optional(),
    college: z.string().optional(),
    course: z.string().optional(),
    year: z.string().optional(),
    sleep_schedule: z.enum(["", "Early Bird", "Night Owl", "Flexible"]).optional(),
    cleanliness: z.enum(["", "Very Clean", "Moderate", "Relaxed"]).optional(),
    study_habits: z.enum(["", "Quiet", "Group Study", "Flexible"]).optional(),
    smoking_drinking: z.enum(["", "Non-smoker/Non-drinker", "Social", "Regular"]).optional(),
  }),
});
