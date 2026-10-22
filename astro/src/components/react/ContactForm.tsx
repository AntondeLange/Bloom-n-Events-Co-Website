import { CONTACT } from "../../lib/constants";
import { type SubmitEvent, useEffect, useRef, useState } from 'react';
import { MESSAGE_MIN, MESSAGE_MAX, validateEnquiry } from '../../lib/enquiry';

export default function ContactForm() {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [length, setLength] = useState(0);
  const submitting = useRef(false);
  const formRef = useRef<HTMLFormElement>(null);
  useEffect(() => { if (formRef.current) formRef.current.noValidate = true; }, []);
  const track = (name: string) => window.bloomTrack?.(name, { form_id: 'contact_form', lead_method: 'form' });
  async function onSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting.current) return;
    const form = event.currentTarget;
    const fields = Object.fromEntries(new FormData(form)) as Record<string, string>;
    const payload = { ...fields, name: `${fields.firstName.trim()} ${fields.lastName.trim()}`, brief: fields.message, companyWebsite: fields.website };
    const result = validateEnquiry(payload);
    const next = { ...result.errors };
    if (!fields.firstName.trim()) next.firstName = 'Please share your first name.';
    if (!fields.lastName.trim()) next.lastName = 'Please share your last name.';
    if (next.name) { next.firstName = next.name; delete next.name; }
    if (next.brief) { next.message = next.brief; delete next.brief; }
    setErrors(next);
    if (Object.keys(next).length) {
      const first = Array.from(form.elements).find(element => 'name' in element && Boolean(next[String(element.name)])) as HTMLElement | undefined;
      const details = first?.closest('details'); if (details) details.open = true;
      first?.focus();
      track('lead_form_validation_failed'); return;
    }
    submitting.current = true; setStatus('loading');
    try {
      const response = await fetch('/api/contact', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      const body = response.headers.get('content-type')?.includes('application/json') ? await response.json() : null;
      if (!response.ok || body?.ok !== true) throw new Error('Delivery failed');
      setStatus('success'); form.reset(); setLength(0); track('lead_form_submitted');
    } catch { setStatus('error'); track('lead_form_submit_failed'); }
    finally { submitting.current = false; }
  }
  const fields = [
    ['firstName','First Name','text','given-name',100,true],
    ['lastName','Last Name','text','family-name',100,true],
    ['phone','Phone Number','tel','tel',32,true],
    ['email','Email Address','email','email',254,true],
    ['company','Company','text','organization',200,false],
  ] as const;
  return <form ref={formRef} onSubmit={onSubmit} className="contact-form" id="contactForm" method="POST" action="/api/contact" aria-label="Contact form">
    <input type="hidden" name="source" value="contact-form" />
    <div role="status" aria-live="polite">
      {status === 'success' && <p className="alert alert-success">Thanks for reaching out. Your message has been sent to the team.</p>}
      {status === 'error' && <p className="alert alert-danger">We couldn't send your message. Your details are still here. Please try again, <a href={`mailto:${CONTACT.email}`}>email us</a> or call <a href="tel:1800826268">1800 826 268</a>.</p>}
    </div>
    {fields.map(([name,label,type,autoComplete,maxLength,required]) => <div className="mb-3" key={name}>
      <label htmlFor={name} className="form-label">{label}{required && <span> *</span>}</label>
      <input id={name} name={name} type={type} autoComplete={autoComplete} maxLength={maxLength} required={required} className="form-control" aria-invalid={Boolean(errors[name])} aria-describedby={errors[name] ? `err-${name}` : undefined} />
      {errors[name] && <p id={`err-${name}`} className="text-danger" role="alert">{errors[name]}</p>}
    </div>)}
    <details className="mb-3"><summary>Event details (optional)</summary>
      {([['timeframe','Event date / timeframe'],['location','Event location'],['budgetConstraint','Indicative budget']] as const).map(([name,label]) => <div className="mb-3" key={name}>
        <label htmlFor={name} className="form-label">{label}</label><input id={name} name={name} maxLength={200} className="form-control" aria-invalid={Boolean(errors[name])} aria-describedby={errors[name] ? `err-${name}` : undefined} />
        {errors[name] && <p id={`err-${name}`} role="alert">{errors[name]}</p>}
      </div>)}
    </details>
    <div className="mb-3">
      <label htmlFor="message" className="form-label">Message *</label>
      <textarea id="message" name="message" rows={6} className="form-control" placeholder="Tell us about your event or idea" minLength={MESSAGE_MIN} maxLength={MESSAGE_MAX} required aria-invalid={Boolean(errors.message)} aria-describedby={errors.message ? 'err-message messageCounter' : 'messageCounter'} onChange={e => setLength(e.target.value.length)} />
      <p id="messageCounter" className="small">{length}/{MESSAGE_MAX} characters</p>
      {errors.message && <p id="err-message" className="text-danger" role="alert">{errors.message}</p>}
    </div>
    <div className="visually-hidden" aria-hidden="true"><label htmlFor="website">Leave this empty</label><input type="text" id="website" name="website" tabIndex={-1} autoComplete="off" maxLength={200} /></div>
    <p className="small">We use these details to respond to your enquiry. <a href="/policies#privacy">How we handle your information</a>.</p>
    <button type="submit" className="btn btn-gold w-100" disabled={status === 'loading'}>{status === 'loading' ? 'Sending…' : 'Send Message'}</button>
  </form>;
}
