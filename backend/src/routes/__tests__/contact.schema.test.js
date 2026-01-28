import assert from 'node:assert/strict';
import { test } from 'node:test';
import { contactFormSchema } from '../../schemas/contact.schema.js';

test('contact form schema accepts a valid payload', () => {
  const result = contactFormSchema.safeParse({
    firstName: 'Taylor',
    lastName: 'Nguyen',
    company: 'Bloom Events',
    email: 'taylor@example.com',
    phone: '0412345678',
    message: 'Looking for event support for a corporate launch.',
    website: '',
  });

  assert.equal(result.success, true);
});

test('contact form schema rejects honeypot submissions', () => {
  const result = contactFormSchema.safeParse({
    firstName: 'Taylor',
    lastName: 'Nguyen',
    company: 'Bloom Events',
    email: 'taylor@example.com',
    phone: '0412345678',
    message: 'Looking for event support for a corporate launch.',
    website: 'spam',
  });

  assert.equal(result.success, false);
});

test('contact form schema enforces message length limits', () => {
  const tooShort = contactFormSchema.safeParse({
    firstName: 'Taylor',
    lastName: 'Nguyen',
    company: 'Bloom Events',
    email: 'taylor@example.com',
    phone: '0412345678',
    message: 'Short',
    website: '',
  });
  assert.equal(tooShort.success, false);

  const tooLong = contactFormSchema.safeParse({
    firstName: 'Taylor',
    lastName: 'Nguyen',
    company: 'Bloom Events',
    email: 'taylor@example.com',
    phone: '0412345678',
    message: 'A'.repeat(2001),
    website: '',
  });
  assert.equal(tooLong.success, false);
});
