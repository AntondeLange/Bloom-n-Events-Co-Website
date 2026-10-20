import { REQUEST_MAX_BYTES, validateEnquiry } from '../lib/enquiry';
import type { Enquiry } from '../lib/enquiry';

type Dependencies = {
  limit: (ip: string) => Promise<boolean>;
  deliver: (data: Enquiry) => Promise<boolean>;
};
const json = (payload: unknown, status = 200) => new Response(JSON.stringify(payload), {
  status, headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', ...(status === 429 ? { 'Retry-After': '60' } : {}) },
});
export class RequestError extends Error {
  constructor(public status: number) { super('Invalid request'); }
}
/** Bound the actual stream, including chunked bodies without Content-Length. */
export async function readBody(request: Request, max = REQUEST_MAX_BYTES) {
  const length = request.headers.get('content-length');
  if (length && (!/^\d+$/.test(length) || Number(length) > max)) throw new RequestError(413);
  const reader = request.body?.getReader();
  if (!reader) throw new RequestError(400);
  const chunks: Uint8Array[] = []; let size = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > max) { await reader.cancel(); throw new RequestError(413); }
      chunks.push(value);
    }
  } finally { reader.releaseLock(); }
  const bytes = new Uint8Array(size); let offset = 0;
  for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.length; }
  return new TextDecoder('utf-8', { fatal: true }).decode(bytes);
}
const escapeHtml = (value: string) => value.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);

/** Native form failures return an escaped editable form; no personal data in URLs/storage. */
function htmlFailure(body: Record<string, unknown>, status: number) {
  const fields = ['firstName','lastName','email','phone','company','timeframe','location','budgetConstraint','message'];
  const labels = ['First name','Last name','Email','Phone','Company','Event date / timeframe','Location','Budget (optional)','Message'];
  const controls = fields.map((field, i) => {
    const value = typeof body[field] === 'string' ? escapeHtml((body[field] as string).slice(0, field === 'message' ? 5000 : 254)) : '';
    return `<label>${labels[i]}${field === 'message' ? `<textarea name="${field}" maxlength="5000" rows="8">${value}</textarea>` : `<input name="${field}" value="${value}" maxlength="254">`}</label>`;
  }).join('');
  return new Response(`<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="robots" content="noindex"><title>Review your enquiry | Bloom'n Events Co</title><style>body{font:16px system-ui;background:#fff9ed;color:#222;max-width:40rem;margin:2rem auto;padding:1rem}label{display:block;margin:1rem 0}input,textarea,button{display:block;box-sizing:border-box;width:100%;font:inherit;padding:.75rem}a{color:#624b0b}</style><h1>Your enquiry has not been sent</h1><p>Please check your details and try again. If delivery is unavailable, <a href="mailto:enquiries@bloomneventsco.com.au">email us</a> or call <a href="tel:1800826268">1800 826 268</a>. Your details remain below.</p><form method="post" action="/api/contact"><input type="hidden" name="source" value="contact-form">${controls}<div hidden><input name="website" tabindex="-1" autocomplete="off"></div><p><a href="/policies">How we handle your information</a></p><button>Try sending again</button></form></html>`, { status, headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store', 'Referrer-Policy': 'no-referrer' } });
}
export function createEnquiryHandler(deps: Dependencies) {
  return async (request: Request, ip: string, nativeContact = false): Promise<Response> => {
    const type = (request.headers.get('content-type') || '').split(';')[0].trim();
    const native = nativeContact && type === 'application/x-www-form-urlencoded';
    let body: Record<string, unknown> = {};
    const fail = (status: number, errors?: Record<string, string>) => native ? htmlFailure(body, status) : json({ ok: false, errors }, status);
    const origin = request.headers.get('origin');
    if (origin && origin !== new URL(request.url).origin) return fail(403);
    try {
      const raw = await readBody(request);
      const parsed: unknown = type === 'application/json' ? JSON.parse(raw) : native ? Object.fromEntries(new URLSearchParams(raw)) : null;
      if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return fail(type === 'application/json' || native ? 400 : 415);
      body = parsed as Record<string, unknown>;
      if (nativeContact) {
        body = { ...body, name: typeof body.firstName === 'string' && typeof body.lastName === 'string' ? `${body.firstName.trim()} ${body.lastName.trim()}` : body.name, brief: body.message ?? body.brief, companyWebsite: body.website ?? body.companyWebsite };
      }
      try { if (!await deps.limit(ip)) return fail(429); }
      catch { return fail(503); }
      const { data, errors } = validateEnquiry(body);
      if (!data) return fail(400, errors);
      if (!data.companyWebsite) {
        try { if (!await deps.deliver(data)) return fail(502); }
        catch { return fail(502); }
      }
      if (native) return new Response(null, { status: 303, headers: { Location: '/contact-success', 'Cache-Control': 'no-store' } });
      return json({ ok: true });
    } catch (error) { return fail(error instanceof RequestError ? error.status : 400); }
  };
}

type EmailConfig = { token?: string; from?: string; to?: string };
export function postmarkDelivery(config: EmailConfig, fetcher: typeof fetch = fetch) {
  return async (data: Enquiry) => {
    if (!config.token || !config.from || !config.to) return false;
    const response = await fetcher('https://api.postmarkapp.com/email', {
      method: 'POST', signal: AbortSignal.timeout(12000),
      headers: { Accept: 'application/json', 'Content-Type': 'application/json', 'X-Postmark-Server-Token': config.token },
      body: JSON.stringify({ From: config.from, To: config.to, ReplyTo: data.email,
        Subject: `New website enquiry — ${data.source === 'chat' ? 'chat assistant' : 'contact form'}`,
        TextBody: `Source: ${data.source}\nName: ${data.name}\nCompany: ${data.company || '—'}\nEmail: ${data.email}\nPhone: ${data.phone}\nProject type: ${data.projectType || '—'}\nEvent date / timeframe: ${data.timeframe || '—'}\nLocation: ${data.location || '—'}\nScale: ${data.scale || '—'}\nBudget: ${data.budgetConstraint || '—'}\n\nBrief:\n${data.brief}${data.transcriptExcerpt ? `\n\nConversation excerpt:\n${data.transcriptExcerpt}` : ''}`,
        MessageStream: 'outbound' }),
    });
    if (!response.ok || !response.headers.get('content-type')?.includes('application/json')) return false;
    const result = await response.json();
    return result?.ErrorCode === 0 && typeof result.MessageID === 'string' && result.MessageID.length > 0;
  };
}
