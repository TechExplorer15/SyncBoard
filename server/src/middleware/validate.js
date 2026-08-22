/**
 * Zod validation middleware factory.
 * Wraps a Zod schema into Express middleware that validates req.body.
 * Returns 400 with detailed field errors on failure.
 */
const logger = require('../utils/logger');

/**
 * Creates an Express middleware that validates req.body against a Zod schema.
 * @param {import('zod').ZodSchema} schema - Zod schema to validate against
 * @returns {import('express').RequestHandler}
 */
function validate(schema) {
  return (req, res, next) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      const fieldErrors = result.error.issues.map((issue) => ({
        field: issue.path.join('.'),
        message: issue.message,
      }));

      logger.debug('Validation failed', { path: req.path, errors: fieldErrors });

      return res.status(400).json({
        error: 'Validation failed',
        code: 'VALIDATION_ERROR',
        details: fieldErrors,
      });
    }
    // Replace req.body with parsed (and transformed) data
    req.body = result.data;
    next();
  };
}

module.exports = validate;
