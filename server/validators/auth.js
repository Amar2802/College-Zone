import { z } from "zod";

export const signupSchema = z.object({
  body: z.object({
    name: z.string({
      required_error: "Name is required",
    }).min(2, "Name must be at least 2 characters long").trim(),
    email: z.string({
      required_error: "Email is required",
    }).email("Invalid email format").trim().toLowerCase(),
    password: z.string({
      required_error: "Password is required",
    }).min(6, "Password must be at least 6 characters long"),
    phone: z.string().optional().default(""),
  }),
});

export const loginSchema = z.object({
  body: z.object({
    email: z.string({
      required_error: "Email is required",
    }).email("Invalid email format").trim().toLowerCase(),
    password: z.string({
      required_error: "Password is required",
    }),
  }),
});
