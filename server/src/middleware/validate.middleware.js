/**
 * Middleware factory for Joi schema body validation.
 * Validates req.body against provided Joi schema.
 * Returns 400 Bad Request with formatted error details if validation fails.
 */
const validateBody = (schema) => {
  return (req, res, next) => {
    if (!schema) {
      return next();
    }

    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const errorDetails = error.details.map((detail) => ({
        field: detail.path.join('.'),
        message: detail.message,
      }));

      const primaryMessage = error.details[0]?.message || 'Invalid request payload';

      return res.status(400).json({
        success: false,
        message: primaryMessage,
        errors: errorDetails,
      });
    }

    // Replace req.body with sanitized/stripped value
    req.body = value;
    return next();
  };
};

module.exports = {
  validateBody,
};
