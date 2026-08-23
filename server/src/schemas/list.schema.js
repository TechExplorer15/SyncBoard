/**
 * Zod schemas for list endpoints.
 */
const { z } = require('zod');

const createListSchema = z.object({
  title: z
    .string({ required_error: 'List title is required' })
    .trim()
    .min(1, 'Title must be at least 1 character')
    .max(100, 'Title must be at most 100 characters'),
});

module.exports = { createListSchema };
