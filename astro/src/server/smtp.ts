import nodemailer from 'nodemailer';
import type { SMTPTransportOptions, SMTPSentMessageInfo } from 'nodemailer';
import type { SendMailOptions } from 'nodemailer';
import type { Enquiry } from '../lib/enquiry';

type EmailConfig = {
  host?: string; port?: string; user?: string; pass?: string; from?: string; to?: string;
};
type MailTransport = {
  sendMail: (mail: SendMailOptions) => Promise<SMTPSentMessageInfo>;
  close: () => void;
};
type TransportFactory = (options: SMTPTransportOptions) => MailTransport;

/** Keep the site's established address settings while allowing explicit overrides. */
export function smtpAddresses(env: {
  LEAD_FROM_EMAIL?: string; SMTP_FROM?: string; CONTACT_FROM_EMAIL?: string;
  LEAD_TO_EMAIL?: string; ENQUIRIES_EMAIL?: string; CONTACT_TO_EMAIL?: string;
}) {
  return {
    from: env.LEAD_FROM_EMAIL || env.SMTP_FROM || env.CONTACT_FROM_EMAIL,
    to: env.LEAD_TO_EMAIL || env.ENQUIRIES_EMAIL || env.CONTACT_TO_EMAIL,
  };
}

/** One SMTP transaction; never retry an uncertain acceptance and risk duplicates. */
export function smtpDelivery(config: EmailConfig, createTransport: TransportFactory = nodemailer.createTransport) {
  return async (data: Enquiry) => {
    const port = Number(config.port || '2525');
    if (!config.user || !config.pass || !config.from || !config.to ||
        !Number.isInteger(port) || port < 1 || port > 65535) return false;
    const transport = createTransport({
      host: config.host || 'mail-au.smtp2go.com', port,
      secure: [465, 8465, 443].includes(port), requireTLS: true,
      auth: { user: config.user, pass: config.pass },
      connectionTimeout: 10000, greetingTimeout: 10000, socketTimeout: 15000,
      tls: { minVersion: 'TLSv1.2' },
      disableFileAccess: true, disableUrlAccess: true,
      logger: false, debug: false,
    });
    try {
      const result = await transport.sendMail({
        from: config.from, to: config.to, replyTo: data.email,
        subject: `New website enquiry — ${data.source === 'chat' ? 'chat assistant' : 'contact form'}`,
        text: `Source: ${data.source}\nName: ${data.name}\nCompany: ${data.company || '—'}\nEmail: ${data.email}\nPhone: ${data.phone}\nProject type: ${data.projectType || '—'}\nEvent date / timeframe: ${data.timeframe || '—'}\nLocation: ${data.location || '—'}\nScale: ${data.scale || '—'}\nBudget: ${data.budgetConstraint || '—'}\n\nBrief:\n${data.brief}${data.transcriptExcerpt ? `\n\nConversation excerpt:\n${data.transcriptExcerpt}` : ''}`,
      });
      // A generated Message-ID alone does not prove SMTP acceptance.
      return result.accepted.some(address =>
        address.toLowerCase() === config.to!.toLowerCase()
      ) && result.rejected.length === 0 && /^250\b/.test(result.response);
    } finally { transport.close(); }
  };
}
