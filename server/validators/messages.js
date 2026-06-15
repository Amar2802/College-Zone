import Joi from "joi";

export const sendMessageSchema = Joi.object({
  body: Joi.object({
    receiverId: Joi.string()
      .min(1)
      .required()
      .messages({
        "string.empty": "Receiver ID is required",
      }),
    content: Joi.string().allow("").optional().default(""),
    imageUrl: Joi.string().uri().allow("").optional(),
  }),
});
