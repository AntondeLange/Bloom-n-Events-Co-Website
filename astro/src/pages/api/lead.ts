import type { APIRoute } from "astro";
import { Redis } from "@upstash/redis";
import { Ratelimit } from "@upstash/ratelimit";

export const prerender = false;

type LeadPayload = {
  name: string;
  email: string;
  phone: string;
  projectType?: string;
  timeframe?: string;
  location?: string;
  scale?: string;
  brief?: string;
  budgetConstraint?: string;
  transcriptExcerpt?: string;
  companyWebsite?: string; // honeypot
};

const redis = new Redis({
  url: import.meta.env.UPSTASH_REDIS_REST_URL,
  token: import.meta.env.UPSTASH_REDIS_REST_TOKEN,
});

const ratelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(5, "1 m"),
});

function isEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function normalizePhone(value: string) {
  return value.trim().replace(/[^\d+]/g, "");
}

export const POST: APIRoute = async ({ request, clientAddress }) => {
  try {
    const ip = clientAddress ?? "anonymous";
    const { success } = await ratelimit.limit(ip);

    if (!success) {
      return new Response(JSON.stringify({ ok: false }), { status: 429 });
    }

    const data = (await request.json()) as Partial<LeadPayload>;

    // Honeypot check
    if (data.companyWebsite && data.companyWebsite.trim().length > 0) {
      return new Response(JSON.stringify({ ok: true }));
    }

    const name = (data.name ?? "").trim();
    const email = (data.email ?? "").trim();
    const phone = normalizePhone(data.phone ?? "");
    const brief = (data.brief ?? "").trim();

    if (!name || name.length < 2) {
      return new Response(JSON.stringify({ ok: false, error: "NAME_REQUIRED" }), { status: 400 });
    }

    if (!email || !isEmail(email)) {
      return new Response(JSON.stringify({ ok: false, error: "EMAIL_REQUIRED" }), { status: 400 });
    }

    if (!phone || phone.length < 8) {
      return new Response(JSON.stringify({ ok: false, error: "PHONE_REQUIRED" }), { status: 400 });
    }

    if (!brief || brief.length < 10) {
      return new Response(JSON.stringify({ ok: false, error: "BRIEF_REQUIRED" }), { status: 400 });
    }

    const subject = "New website enquiry — AI assistant";

    const body = `
Name: ${name}
Email: ${email}
Phone: ${phone}

Project type: ${data.projectType ?? "unknown"}
Event date / timeframe: ${data.timeframe ?? "unknown"}
Location: ${data.location ?? "unknown"}
Scale: ${data.scale ?? "unknown"}

Budget constraint (if provided): ${data.budgetConstraint ?? "—"}

Brief:
${brief}

${data.transcriptExcerpt ? `Conversation excerpt:\n${data.transcriptExcerpt}` : ""}
`;

    const response = await fetch("https://api.postmarkapp.com/email", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        "X-Postmark-Server-Token": import.meta.env.POSTMARK_SERVER_TOKEN,
      },
      body: JSON.stringify({
        From: import.meta.env.LEAD_FROM_EMAIL,
        To: import.meta.env.LEAD_TO_EMAIL,
        Subject: subject,
        TextBody: body,
        MessageStream: "outbound",
      }),
    });

    if (!response.ok) {
      return new Response(JSON.stringify({ ok: false }), { status: 502 });
    }

    return new Response(JSON.stringify({ ok: true }));
  } catch {
    return new Response(JSON.stringify({ ok: false }), { status: 400 });
  }
};
