const validate = (schema) => (req, res, next) => {
  const dataToValidate = {
    body: req.body,
    query: req.query,
    params: req.params,
  };

  const { error, value } = schema.validate(dataToValidate, {
    abortEarly: false,
    allowUnknown: true,
  });

  if (error) {
    const formattedErrors = error.details.map((detail) => {
      // Remove first element (e.g. 'body', 'params') and join remaining to get field name
      const fieldPath = detail.path.slice(1).join(".");
      return {
        field: fieldPath || detail.path.join("."),
        message: detail.message,
      };
    });

    return res.status(400).json({
      message: "Validation failed",
      errors: formattedErrors,
    });
  }

  // Assign validated values back
  if (value.body) req.body = value.body;
  if (value.query) req.query = value.query;
  if (value.params) req.params = value.params;

  next();
};

export default validate;
