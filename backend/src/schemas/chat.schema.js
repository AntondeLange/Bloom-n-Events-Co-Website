import { z } from 'zod';

/**
 * Chat request validation schema
 */
export const chatRequestSchema = z.object({
  message: z.string()
    .min(1, 'Message cannot be empty')
    .max(500, 'Message too long (max 500 characters)')
    .trim(),
  conversationHistory: z.array(z.object({
    role: z.enum(['user', 'assistant']),
    content: z.string().max(1000, 'Message content too long')
  }))
    .max(20, 'Too many conversation history items')
    .optional()
    .default([])
});

/**
 * Validates chat request body
 * @param {any} data - Request body to validate
 * @returns {Object} - Validated and sanitized data
 * @throws {z.ZodError} - If validation fails
 */
export function validateChatRequest(data) {
  return chatRequestSchema.parse(data);
}

