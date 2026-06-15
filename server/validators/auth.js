import Joi from "joi";

export const signupSchema = Joi.object({
  body: Joi.object({
    name: Joi.string()
      .min(2)
      .max(50)
      .required()
      .trim()
      .messages({
        "string.empty": "Name is required",
        "string.min": "Name must be at least 2 characters long",
      }),
    email: Joi.string()
      .email()
      .required()
      .trim()
      .lowercase()
      .messages({
        "string.empty": "Email is required",
        "string.email": "Invalid email format",
      }),
    password: Joi.string()
      .min(6)
      .required()
      .messages({
        "string.empty": "Password is required",
        "string.min": "Password must be at least 6 characters long",
      }),
    phone: Joi.string().allow("").optional().default(""),
  }),
});

export const loginSchema = Joi.object({
  body: Joi.object({
    email: Joi.string()
      .email()
      .required()
      .trim()
      .lowercase()
      .messages({
        "string.empty": "Email is required",
        "string.email": "Invalid email format",
      }),
    password: Joi.string()
      .required()
      .messages({
        "string.empty": "Password is required",
      }),
  }),
});
