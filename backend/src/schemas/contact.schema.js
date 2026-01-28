import { z } from 'zod';

// Form validation schema
export const contactFormSchema = z.object({
  firstName: z.string().min(1).max(100),
  lastName: z.string().min(1).max(100),
  company: z.string().max(200).optional(),
  email: z.string().email().max(255),
  phone: z.string().max(20).optional(),
  message: z.string().min(10).max(2000),
  website: z.string().max(0).optional(), // Honeypot field - should be empty
});
