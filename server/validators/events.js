import { z } from "zod";

export const createEventSchema = z.object({
  body: z.object({
    title: z.string({
      required_error: "Title is required",
    }).min(3, "Title must be at least 3 characters long").trim(),
    description: z.string({
      required_error: "Description is required",
    }).min(10, "Description must be at least 10 characters long").trim(),
    date: z.string({
      required_error: "Date is required",
    }).refine((val) => !isNaN(Date.parse(val)), {
      message: "Invalid date format",
    }),
    location: z.string({
      required_error: "Location is required",
    }).min(3, "Location must be at least 3 characters long").trim(),
  }),
});
