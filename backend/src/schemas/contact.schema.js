import { z } from 'zod';

/**
 * Contact Form Validation Schema
 * Validates contact form submissions before processing
 */
export const contactFormSchema = z.object({
  firstName: z
    .string()
    .min(1, 'First name is required')
    .max(100, 'First name cannot exceed 100 characters')
    .trim(),
  lastName: z
    .string()
    .min(1, 'Last name is required')
    .max(100, 'Last name cannot exceed 100 characters')
    .trim(),
  company: z
    .string()
    .max(200, 'Company name cannot exceed 200 characters')
    .trim()
    .optional()
    .or(z.literal('')),
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please provide a valid email address')
    .max(255, 'Email cannot exceed 255 characters')
    .toLowerCase()
    .trim(),
  message: z
    .string()
    .min(1, 'Message is required')
    .max(200, 'Message cannot exceed 200 characters')
    .trim()
});

/**
 * Validate contact form data
 * @param {Object} data - The contact form data to validate
 * @returns {Object} - Validated and sanitized data
 * @throws {ZodError} - If validation fails
 */
export function validateContactForm(data) {
  return contactFormSchema.parse(data);
}

