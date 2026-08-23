/**
 * Zod schemas for board endpoints.
 */
const { z } = require('zod');

const createBoardSchema = z.object({
  title: z
    .string({ required_error: 'Board title is required' })
    .trim()
    .min(1, 'Title must be at least 1 character')
    .max(100, 'Title must be at most 100 characters'),
});

module.exports = { createBoardSchema };
