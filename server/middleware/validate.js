import { ZodError } from "zod";

const validate = (schema) => (req, res, next) => {
  try {
    schema.parse({
      body: req.body,
      query: req.query,
      params: req.params,
    });
    next();
  } catch (error) {
    if (error.issues) {
      const formattedErrors = error.issues.map((err) => ({
        field: err.path.slice(1).join("."), // e.g. "body.email" -> "email"
        message: err.message,
      }));
      return res.status(400).json({
        message: "Validation failed",
        errors: formattedErrors,
      });
    }
    next(error);
  }
};

export default validate;
