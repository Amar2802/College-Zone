import { z } from "zod";

export const sendMessageSchema = z.object({
  body: z.object({
    receiverId: z.string({
      required_error: "Receiver ID is required",
    }).min(1, "Receiver ID cannot be empty"),
    content: z.string().optional().default(""),
    imageUrl: z.string().url("Invalid image URL format").optional().or(z.literal("")),
  }),
});
