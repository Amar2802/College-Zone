import Joi from "joi";

export const createEventSchema = Joi.object({
  body: Joi.object({
    title: Joi.string()
      .min(3)
      .required()
      .trim()
      .messages({
        "string.empty": "Title is required",
        "string.min": "Title must be at least 3 characters long",
      }),
    description: Joi.string()
      .min(10)
      .required()
      .trim()
      .messages({
        "string.empty": "Description is required",
        "string.min": "Description must be at least 10 characters long",
      }),
    date: Joi.date()
      .required()
      .messages({
        "any.required": "Date is required",
        "date.base": "Invalid date format",
      }),
    location: Joi.string()
      .min(3)
      .required()
      .trim()
      .messages({
        "string.empty": "Location is required",
        "string.min": "Location must be at least 3 characters long",
      }),
  }),
});
