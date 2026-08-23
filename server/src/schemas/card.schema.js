/**
 * Zod schemas for card endpoints.
 */
const { z } = require('zod');

const createCardSchema = z.object({
  title: z
    .string({ required_error: 'Card title is required' })
    .trim()
    .min(1, 'Title must be at least 1 character')
    .max(200, 'Title must be at most 200 characters'),
  description: z
    .string()
    .max(2000, 'Description must be at most 2000 characters')
    .optional()
    .default(''),
});

const updateCardSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, 'Title must be at least 1 character')
    .max(200, 'Title must be at most 200 characters')
    .optional(),
  description: z
    .string()
    .max(2000, 'Description must be at most 2000 characters')
    .optional(),
});

const moveCardSchema = z.object({
  targetListId: z.string({ required_error: 'Target list ID is required' }),
  prevOrder: z.string().nullable(),
  nextOrder: z.string().nullable(),
});

module.exports = { createCardSchema, updateCardSchema, moveCardSchema };
