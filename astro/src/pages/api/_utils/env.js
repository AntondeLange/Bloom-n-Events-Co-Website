const ENV = import.meta.env;
const PROCESS_ENV = (globalThis.process && globalThis.process.env) || {};
const SMTP2GO_FALLBACK_HOSTS = ['mail-au.smtp2go.com', 'mail.smtp2go.com'];
const SMTP2GO_FALLBACK_PORTS = [587, 2525, 8025, 465];

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

function parsePort(value) {
  const parsed = Number.parseInt(value || '', 10);
  if (Number.isFinite(parsed) && parsed > 0) {
    return parsed;
  }
  return undefined;
}

function uniqueTargets(targets) {
  const seen = new Set();
  const result = [];

  for (const target of targets) {
    const key = `${target.host}:${target.port}:${target.secure ? 'secure' : 'starttls'}`;
    if (seen.has(key)) continue;
    seen.add(key);
    result.push(target);
  }

  return result;
}

function buildSmtpTargets({ explicitHost, explicitPort, explicitSecureRaw }) {
  const explicitSecure =
    explicitSecureRaw !== undefined ? explicitSecureRaw.toLowerCase() === 'true' : undefined;

  const hosts = explicitHost ? [explicitHost] : SMTP2GO_FALLBACK_HOSTS;
  const ports = explicitPort ? [explicitPort] : SMTP2GO_FALLBACK_PORTS;
  const targets = [];

  for (const host of hosts) {
    for (const port of ports) {
      targets.push({
        host,
        port,
        secure: explicitSecure !== undefined ? explicitSecure : port === 465,
      });
    }
  }

  return uniqueTargets(targets);
}

export function getEnv() {
  const nodeEnv = readEnv('NODE_ENV') || 'production';
  const smtpUser = readEnv('SMTP_USER');
  const explicitSmtpHost = readEnv('SMTP_HOST');
  const explicitSmtpPort = parsePort(readEnv('SMTP_PORT'));
  const smtpSecureRaw = readEnv('SMTP_SECURE');
  const smtpTargets = buildSmtpTargets({
    explicitHost: explicitSmtpHost,
    explicitPort: explicitSmtpPort,
    explicitSecureRaw: smtpSecureRaw,
  });
  const primarySmtpTarget = smtpTargets[0];
  const smtpHost = primarySmtpTarget?.host || 'mail-au.smtp2go.com';
  const smtpPort = primarySmtpTarget?.port || 587;
  const smtpSecure = primarySmtpTarget?.secure || false;

  return {
    OPENAI_API_KEY: readEnv('OPENAI_API_KEY') || '',
    NODE_ENV: nodeEnv,
    FRONTEND_URL: readEnv('FRONTEND_URL'),
    ENQUIRIES_EMAIL:
      readEnv('ENQUIRIES_EMAIL') ||
      readEnv('CONTACT_TO_EMAIL') ||
      'enquiries@bloomneventsco.com.au',
    SMTP_HOST: smtpHost,
    SMTP_PORT: smtpPort,
    SMTP_USER: smtpUser,
    SMTP_PASS: readEnv('SMTP_PASS'),
    SMTP_SECURE: smtpSecure,
    SMTP_TARGETS: smtpTargets,
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
