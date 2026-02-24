const ENV = import.meta.env;
const PROCESS_ENV = (globalThis.process && globalThis.process.env) || {};

function readEnv(name) {
  const fromAstro = ENV?.[name];
  if (typeof fromAstro === 'string' && fromAstro.trim() !== '') {
    return fromAstro.trim();
  }

  const fromProcess = PROCESS_ENV?.[name];
  if (typeof fromProcess === 'string' && fromProcess.trim() !== '') {
    return fromProcess.trim();
  }

  return undefined;
}

function parsePort(value, fallback) {
  const parsed = Number.parseInt(value || '', 10);
  if (Number.isFinite(parsed) && parsed > 0) {
    return parsed;
  }
  return fallback;
}

export function getEnv() {
  const nodeEnv = readEnv('NODE_ENV') || 'production';
  const smtpUser = readEnv('SMTP_USER');
  const smtpPort = parsePort(readEnv('SMTP_PORT'), 587);
  const smtpSecureRaw = readEnv('SMTP_SECURE');
  const smtpSecure =
    smtpSecureRaw !== undefined ? smtpSecureRaw.toLowerCase() === 'true' : smtpPort === 465;

  return {
    OPENAI_API_KEY: readEnv('OPENAI_API_KEY') || '',
    NODE_ENV: nodeEnv,
    FRONTEND_URL: readEnv('FRONTEND_URL'),
    ENQUIRIES_EMAIL:
      readEnv('ENQUIRIES_EMAIL') ||
      readEnv('CONTACT_TO_EMAIL') ||
      'enquiries@bloomneventsco.com.au',
    SMTP_HOST: readEnv('SMTP_HOST') || 'smtp.gmail.com',
    SMTP_PORT: smtpPort,
    SMTP_USER: smtpUser,
    SMTP_PASS: readEnv('SMTP_PASS'),
    SMTP_SECURE: smtpSecure,
    SMTP_FROM:
      readEnv('SMTP_FROM') ||
      readEnv('CONTACT_FROM_EMAIL') ||
      `"Bloom'n Events Co Website" <${smtpUser || 'noreply@bloomneventsco.com.au'}>`,
    CONTACT_BACKLOG_DIR: readEnv('CONTACT_BACKLOG_DIR') || '/tmp',
  };
}

export function getAllowedOrigins() {
  const env = getEnv();

  if (env.NODE_ENV !== 'production') {
    return '*';
  }

  return [
    'https://www.bloomneventsco.com.au',
    'https://bloomneventsco.com.au',
    env.FRONTEND_URL,
  ].filter(Boolean);
}
