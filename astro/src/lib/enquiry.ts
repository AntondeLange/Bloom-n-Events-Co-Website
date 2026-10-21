/** Shared bounds for the contact form, chat brief, and server. */
export const MESSAGE_MIN = 10;
export const MESSAGE_MAX = 5000;
export const REQUEST_MAX_BYTES = 32768;
export const ENQUIRY_LIMITS = {
  name: 201, email: 254, phone: 32, company: 200, projectType: 100,
  timeframe: 200, location: 200, scale: 200, budgetConstraint: 200,
  brief: MESSAGE_MAX, transcriptExcerpt: 16000, companyWebsite: 200,
} as const;
export type EnquirySource = 'contact-form' | 'chat';
export type Enquiry = Record<keyof typeof ENQUIRY_LIMITS, string> & { source: EnquirySource };
export const validEmail = (value: string) => /^[^\s@<>(),;:"\\]+@[^\s@<>(),;:"\\]+\.[^\s@<>(),;:"\\]+$/.test(value);
export const validPhone = (value: string) => /^[+\d\s().-]+$/.test(value) && value.replace(/\D/g, '').length >= 8 && value.replace(/\D/g, '').length <= 15;

export function validateEnquiry(input: unknown): { data?: Enquiry; errors: Record<string, string> } {
  const errors: Record<string, string> = {};
  if (!input || typeof input !== 'object' || Array.isArray(input)) return { errors: { form: 'Invalid enquiry.' } };
  const body = input as Record<string, unknown>;
  const data = {} as Enquiry;
  for (const [key, max] of Object.entries(ENQUIRY_LIMITS)) {
    const value = body[key];
    if (value !== undefined && typeof value !== 'string') { errors[key] = 'Please enter text.'; continue; }
    const text = (value as string | undefined) ?? '';
    if (text.length > max) errors[key] = `Please use no more than ${max} characters.`;
    // eslint-disable-next-line no-control-regex -- Deliberately reject control bytes in untrusted enquiry text.
    if (/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/.test(text) || (key !== 'brief' && key !== 'transcriptExcerpt' && /[\r\n]/.test(text))) errors[key] = 'Please remove unsupported characters.';
    data[key as keyof typeof ENQUIRY_LIMITS] = text.trim();
  }
  if (body.source !== 'contact-form' && body.source !== 'chat') errors.source = 'Please select a valid enquiry source.';
  else data.source = body.source;
  if ((data.name || '').length < 2) errors.name = 'Please share your name.';
  if (!validEmail(data.email || '')) errors.email = 'Please enter a valid email address.';
  if (!validPhone(data.phone || '')) errors.phone = 'Please enter a valid phone number (8–15 digits).';
  if ((data.brief || '').length < MESSAGE_MIN) errors.brief = `Please add at least ${MESSAGE_MIN} characters.`;
  return { data: Object.keys(errors).length ? undefined : data, errors };
}
