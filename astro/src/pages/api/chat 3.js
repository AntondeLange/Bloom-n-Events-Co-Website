import { getAllowedOrigins, getEnv } from './_utils/env.js';
import { handleCorsPreflight, withCors } from './_utils/cors.js';
import { checkRateLimit } from './_utils/rateLimit.js';

export const prerender = false;

const OPENAI_CONFIG = {
  MODEL: 'gpt-4o-mini',
  MAX_TOKENS: 360,
  TEMPERATURE: 0.45,
};

const CHAT_LIMITS = {
  MESSAGE_MAX_CHARS: 700,
  HISTORY_MAX_ITEMS: 24,
  HISTORY_ITEM_MAX_CHARS: 1000,
  HISTORY_TOTAL_MAX_CHARS: 7000,
  OPENAI_TIMEOUT_MS: 15000,
};

const ALLOWED_HISTORY_ROLES = new Set(['user', 'assistant']);
const FLOW_TYPES = new Set(['events', 'workshops', 'displays', 'browse']);

const FLOW_KEYWORDS = {
  events: [
    'event',
    'events',
    'conference',
    'launch',
    'networking',
    'corporate',
    'activation',
    'retreat',
    'gala',
  ],
  workshops: [
    'workshop',
    'workshops',
    'kids',
    'adult',
    'team building',
    'facilitator',
    'session',
    'school holiday',
  ],
  displays: [
    'display',
    'installation',
    'prop',
    'fitout',
    'styling',
    'set build',
    'custom build',
    'brand display',
    'signage',
  ],
  browse: ['case study', 'process', 'faq', 'portfolio', 'gallery', 'just browsing', 'explore'],
};

const LEAD_TRIGGER_KEYWORDS = [
  'quote',
  'pricing',
  'cost',
  'proposal',
  'book',
  'available',
  'availability',
  'next month',
  'this month',
  'consult',
  'consultation',
  'start project',
  'get in touch',
  'call me',
  'email me',
  'timeline',
];

const READY_NOW_KEYWORDS = [
  'book now',
  'ready to book',
  'ready now',
  'send proposal',
  'call me',
  'can we lock this in',
  "let's do it",
  'want to proceed',
];

const FLOW_LEAD_SEQUENCE = {
  events: ['name', 'email', 'phone', 'timeframe', 'location', 'scale', 'budgetConstraint', 'brief'],
  workshops: ['name', 'email', 'phone', 'timeframe', 'location', 'scale', 'budgetConstraint', 'brief'],
  displays: ['name', 'email', 'phone', 'timeframe', 'location', 'scale', 'budgetConstraint', 'brief'],
  browse: ['name', 'email', 'phone', 'brief'],
};

const LEAD_FIELD_PROMPTS = {
  name: "Great, what name should I put on your brief?",
  email: 'Best email for replies?',
  phone: 'Best phone number in case we need to confirm details quickly?',
  timeframe: 'When-ish is this happening? A date or rough window is perfect.',
  location: 'Where is the event or install location?',
  scale: 'What scale are we planning for (guest count, dimensions, or session size)?',
  budgetConstraint: 'Any budget comfort range I should note?',
  brief: 'What outcome do you want people to feel or do? One sentence is enough.',
};

const KNOWLEDGE_BASE = [
  {
    id: 'core-positioning',
    flow: 'browse',
    title: 'Capabilities',
    url: '/capabilities',
    text: "Bloom'n Events Co positions as one accountable in-house team across strategy, design, engineering, fabrication, delivery, and on-site execution.",
    tags: ['in-house', 'one team', 'accountable', 'engineering', 'fabrication', 'delivery'],
  },
  {
    id: 'contact',
    flow: 'browse',
    title: 'Contact',
    url: '/contact',
    text: "Primary conversion paths are contact/consult. Phone is 1800 826 268 and email is enquiries@bloomneventsco.com.au.",
    tags: ['contact', 'phone', 'email', 'consult', 'start project', 'get in touch'],
  },
  {
    id: 'service-area',
    flow: 'browse',
    title: 'Service Area',
    url: '/about',
    text: "Bloom'n Events Co is based in Brookton, WA and delivers across Perth and Western Australia, including metro and selected regional work.",
    tags: ['brookton', 'perth', 'western australia', 'wa', 'service area'],
  },
  {
    id: 'events',
    flow: 'events',
    title: 'Corporate Events',
    url: '/events',
    text: 'Events offering includes networking events, conferences, product launches, and custom corporate experiences with full-service planning and technical execution.',
    tags: ['corporate events', 'conference', 'launch', 'networking', 'activation'],
  },
  {
    id: 'workshops',
    flow: 'workshops',
    title: 'Workshops',
    url: '/workshops',
    text: 'Workshops are designed and delivered in-house for kids, adults, teams, and community programs; materials and facilitation are provided.',
    tags: ['workshops', 'kids', 'adults', 'team building', 'school holidays'],
  },
  {
    id: 'displays',
    flow: 'displays',
    title: 'Displays',
    url: '/displays',
    text: 'Displays and installations are custom built for brand and venue context, including seasonal activations and permanent or temporary pieces.',
    tags: ['display', 'installation', 'custom build', 'indoor', 'outdoor', 'branding'],
  },
  {
    id: 'process',
    flow: 'browse',
    title: 'How It Works',
    url: '/events',
    text: 'Process centers on consultation, design/planning, execution, and pack-down with one coordinated team for fewer hand-offs.',
    tags: ['process', 'consultation', 'planning', 'execution', 'pack-down'],
  },
  {
    id: 'pricing',
    flow: 'browse',
    title: 'Pricing Guidance',
    url: '/contact',
    text: 'Pricing is scope-dependent and should be handled via tailored quote or consult after gathering date, location, scale, and requirements.',
    tags: ['pricing', 'quote', 'budget', 'scope'],
  },
  {
    id: 'proof',
    flow: 'browse',
    title: 'Proof and Case Studies',
    url: '/gallery',
    text: 'Past client examples and proof include work for Hawaiian and Centuria, with case studies and visual galleries available on site.',
    tags: ['case studies', 'gallery', 'hawaiian', 'centuria', 'proof'],
  },
];

function json(payload, status = 200, extraHeaders) {
  const headers = new Headers({
    'content-type': 'application/json; charset=utf-8',
  });

  if (extraHeaders) {
    for (const [key, value] of Object.entries(extraHeaders)) {
      headers.set(key, String(value));
    }
  }

  return new Response(JSON.stringify(payload), {
    status,
    headers,
  });
}

function normalizeText(value) {
  return typeof value === 'string' ? value.trim() : '';
}

function tokenize(text) {
  return (text.toLowerCase().match(/[a-z0-9']+/g) || []).filter((token) => token.length > 2);
}

function countKeywordHits(text, keywords) {
  if (!text) return 0;
  const haystack = text.toLowerCase();
  return keywords.reduce((hits, keyword) => {
    return haystack.includes(keyword) ? hits + 1 : hits;
  }, 0);
}

function detectFlow(message, history, requestedFlow) {
  if (FLOW_TYPES.has(requestedFlow)) {
    return requestedFlow;
  }

  const joinedHistory = (history || []).map((item) => item.content).join(' ');
  const text = `${message} ${joinedHistory}`.toLowerCase();

  const scores = {
    events: countKeywordHits(text, FLOW_KEYWORDS.events),
    workshops: countKeywordHits(text, FLOW_KEYWORDS.workshops),
    displays: countKeywordHits(text, FLOW_KEYWORDS.displays),
    browse: countKeywordHits(text, FLOW_KEYWORDS.browse),
  };

  const best = Object.entries(scores).sort((a, b) => b[1] - a[1])[0];
  if (!best || best[1] <= 0) return 'browse';
  return best[0];
}

function detectLeadSignals(message, history) {
  const joinedHistory = (history || []).map((item) => item.content).join(' ');
  const text = `${message} ${joinedHistory}`.toLowerCase();
  const triggerHits = countKeywordHits(text, LEAD_TRIGGER_KEYWORDS);
  const readyHits = countKeywordHits(text, READY_NOW_KEYWORDS);

  return {
    triggered: triggerHits > 0,
    readyNow: readyHits > 0,
    triggerHits,
  };
}

function sanitizeLeadDraft(raw) {
  if (!raw || typeof raw !== 'object') return {};

  const keys = [
    'name',
    'email',
    'phone',
    'projectType',
    'timeframe',
    'location',
    'scale',
    'brief',
    'budgetConstraint',
  ];

  const draft = {};
  for (const key of keys) {
    const value = normalizeText(raw[key]);
    if (value) {
      draft[key] = value;
    }
  }

  return draft;
}

function getMissingLeadFields(flow, leadDraft) {
  const sequence = FLOW_LEAD_SEQUENCE[flow] || FLOW_LEAD_SEQUENCE.browse;
  return sequence.filter((field) => !normalizeText(leadDraft[field]));
}

function scoreKnowledgeEntry(entry, tokens, flow) {
  let score = entry.flow === flow ? 4 : 0;
  if (entry.flow === 'browse') score += 1;

  const blob = `${entry.text} ${(entry.tags || []).join(' ')}`.toLowerCase();
  for (const token of tokens) {
    if (blob.includes(token)) score += 2;
  }

  return score;
}

function getRelevantKnowledge(query, flow) {
  const tokens = tokenize(query);
  const ranked = KNOWLEDGE_BASE.map((entry) => ({
    ...entry,
    score: scoreKnowledgeEntry(entry, tokens, flow),
  }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 4);

  const nonZero = ranked.filter((entry) => entry.score > 0);
  return nonZero.length > 0 ? nonZero : KNOWLEDGE_BASE.slice(0, 3);
}

function getSuggestedReplies(flow, leadMode) {
  if (leadMode) {
    return ['Share details', 'Call 1800 826 268', 'Email enquiries@bloomneventsco.com.au'];
  }

  if (flow === 'events') {
    return ['Get event quote', 'See case studies', 'Talk process'];
  }
  if (flow === 'workshops') {
    return ['Plan a workshop', 'Audience fit', 'Date availability'];
  }
  if (flow === 'displays') {
    return ['Discuss installation', 'Hire vs buy', 'Branding options'];
  }

  return ['Show me case studies', 'What is your process?', 'Start my project'];
}

function buildSystemPrompt({ flow, leadMode, readyNow, nextLeadQuestion, snippets }) {
  const flowLabelMap = {
    events: 'Events',
    workshops: 'Workshops',
    displays: 'Displays',
    browse: 'General browsing',
  };

  const snippetText = snippets
    .map((item) => `- ${item.title} (${item.url}): ${item.text}`)
    .join('\n');

  const leadModeGuidance = leadMode
    ? `Lead mode is ON. Ask for one missing field at a time and keep momentum toward a consult.
Next preferred lead question: ${nextLeadQuestion || 'Ask the single most useful missing qualification question.'}`
    : 'Lead mode is OFF unless the user clearly asks about quote, booking, availability, proposal, pricing, or next steps.';

  const readyNowGuidance = readyNow
    ? 'User appears ready now. Stop broad chat and collect details quickly.'
    : 'User may still be exploring. Answer first, then offer one clear next step.';

  return `You are Bloom, the website concierge for Bloom'n Events Co.

Voice and style:
- Warm, confident, useful, concise.
- Light dry humour is acceptable; never sarcastic at the user.
- Keep responses under 160 words unless user asks for depth.

Business guardrails:
- Never invent capabilities, pricing, availability, legal terms, or policy promises.
- Pricing is scope-based. If asked pricing, explain quote depends on date, location, scale, and requirements.
- If unsure, ask 1-2 crisp questions, then offer next action.
- Primary conversion routes: /contact, phone 1800 826 268, email enquiries@bloomneventsco.com.au.

Conversation objective:
- Answer quickly, qualify politely, route to consult with minimal friction.
- Current funnel: ${flowLabelMap[flow] || 'General'}.
- ${leadModeGuidance}
- ${readyNowGuidance}

Grounding snippets (use these facts first):
${snippetText}

When mentioning pages, use these exact routes where relevant: /events, /workshops, /displays, /capabilities, /gallery, /team, /about, /contact.`;
}

function buildFallbackReply({ flow, leadMode, nextLeadQuestion }) {
  const flowCopy = {
    events:
      "Love this. We can help shape a corporate event from concept to pack-down with one accountable team.",
    workshops:
      "Great brief. We run in-house workshops for kids, adults, teams, and communities with materials and facilitation included.",
    displays:
      "Perfect. We design and deliver custom displays and installations tailored to brand, space, and timing.",
    browse:
      "Happy to help. I can point you to case studies, process, service fit, and next steps quickly.",
  };

  if (leadMode && nextLeadQuestion) {
    return `${flowCopy[flow] || flowCopy.browse} ${nextLeadQuestion}`;
  }

  return `${flowCopy[flow] || flowCopy.browse} If you want, we can jump straight to a consult via /contact, 1800 826 268, or enquiries@bloomneventsco.com.au.`;
}

function validateChatRequest(body) {
  if (!body || typeof body !== 'object') {
    throw new Error('Invalid request body');
  }

  const message = normalizeText(body.message);
  if (!message) {
    throw new Error('Message is required and cannot be empty');
  }
  if (message.length > CHAT_LIMITS.MESSAGE_MAX_CHARS) {
    throw new Error(`Message too long (max ${CHAT_LIMITS.MESSAGE_MAX_CHARS} characters)`);
  }

  const flow = normalizeText(body.flow).toLowerCase();
  if (flow && !FLOW_TYPES.has(flow)) {
    throw new Error('flow must be events, workshops, displays, or browse');
  }

  const leadMode = body.leadMode === true;
  const leadDraft = sanitizeLeadDraft(body.leadDraft);

  const conversationHistory = body.conversationHistory;
  if (conversationHistory && !Array.isArray(conversationHistory)) {
    throw new Error('conversationHistory must be an array');
  }

  if (conversationHistory && conversationHistory.length > CHAT_LIMITS.HISTORY_MAX_ITEMS) {
    throw new Error(
      `Too many conversation history items (max ${CHAT_LIMITS.HISTORY_MAX_ITEMS})`,
    );
  }

  let totalHistoryChars = 0;
  const sanitizedHistory = [];

  for (const item of conversationHistory || []) {
    if (!item || typeof item !== 'object') {
      throw new Error('conversationHistory items must be objects');
    }

    const role = normalizeText(item.role);
    const content = normalizeText(item.content);

    if (!ALLOWED_HISTORY_ROLES.has(role)) {
      throw new Error('conversationHistory role must be user or assistant');
    }
    if (!content) {
      throw new Error('conversationHistory content cannot be empty');
    }
    if (content.length > CHAT_LIMITS.HISTORY_ITEM_MAX_CHARS) {
      throw new Error(
        `conversationHistory content too long (max ${CHAT_LIMITS.HISTORY_ITEM_MAX_CHARS} characters per item)`,
      );
    }

    totalHistoryChars += content.length;
    if (totalHistoryChars > CHAT_LIMITS.HISTORY_TOTAL_MAX_CHARS) {
      throw new Error(
        `conversationHistory too long (max ${CHAT_LIMITS.HISTORY_TOTAL_MAX_CHARS} characters total)`,
      );
    }

    sanitizedHistory.push({ role, content });
  }

  return {
    message,
    flow: flow || undefined,
    leadMode,
    leadDraft,
    conversationHistory: sanitizedHistory,
  };
}

export const OPTIONS = async ({ request }) => handleCorsPreflight(request);

export const POST = async ({ request }) => {
  const env = getEnv();

  if (env.NODE_ENV === 'production') {
    const allowedOrigins = getAllowedOrigins();
    if (allowedOrigins !== '*') {
      const origin = request.headers.get('origin');
      if (!origin || !allowedOrigins.includes(origin)) {
        return withCors(
          json(
            {
              error: 'Forbidden',
              message: 'Origin not allowed.',
            },
            403,
          ),
          request,
        );
      }
    }
  }

  const rateLimit = checkRateLimit(request, 'chat', 15 * 60 * 1000, 25);
  if (!rateLimit.allowed) {
    return withCors(
      json(
        {
          error: 'Too many requests',
          message: 'Rate limit exceeded. Please try again later.',
          retryAfter: Math.ceil((rateLimit.resetTime - Date.now()) / 1000),
        },
        429,
        {
          'Retry-After': Math.ceil((rateLimit.resetTime - Date.now()) / 1000),
        },
      ),
      request,
    );
  }

  let validated;
  try {
    const body = await request.json();
    validated = validateChatRequest(body);
  } catch (error) {
    return withCors(
      json(
        {
          error: 'Validation failed',
          message: error instanceof Error ? error.message : 'Invalid request payload',
        },
        400,
      ),
      request,
    );
  }

  const detectedFlow = detectFlow(validated.message, validated.conversationHistory, validated.flow);
  const leadSignals = detectLeadSignals(validated.message, validated.conversationHistory);
  const leadMode = Boolean(validated.leadMode || leadSignals.triggered);
  const mergedLeadDraft = {
    ...validated.leadDraft,
    projectType: validated.leadDraft.projectType || detectedFlow,
  };
  const missingLeadFields = leadMode ? getMissingLeadFields(detectedFlow, mergedLeadDraft) : [];
  const nextLeadField = leadMode ? missingLeadFields[0] || null : null;
  const nextLeadQuestion = nextLeadField ? LEAD_FIELD_PROMPTS[nextLeadField] : null;
  const conversationText = validated.conversationHistory.map((item) => item.content).join(' ');
  const snippets = getRelevantKnowledge(`${validated.message} ${conversationText}`, detectedFlow);
  const suggestedReplies = getSuggestedReplies(detectedFlow, leadMode);

  if (!env.OPENAI_API_KEY) {
    return withCors(
      json(
        {
          reply: buildFallbackReply({
            flow: detectedFlow,
            leadMode,
            nextLeadQuestion,
          }),
          model: 'rule-based-fallback',
          intent: detectedFlow,
          leadMode,
          readyNow: leadSignals.readyNow,
          nextLeadField,
          nextLeadQuestion,
          suggestedReplies,
          grounding: snippets.map(({ title, url }) => ({ title, url })),
        },
        200,
        {
          'X-RateLimit-Remaining': rateLimit.remaining,
        },
      ),
      request,
    );
  }

  const messages = [
    {
      role: 'system',
      content: buildSystemPrompt({
        flow: detectedFlow,
        leadMode,
        readyNow: leadSignals.readyNow,
        nextLeadQuestion,
        snippets,
      }),
    },
    ...validated.conversationHistory,
    { role: 'user', content: validated.message },
  ];

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), CHAT_LIMITS.OPENAI_TIMEOUT_MS);

    const openAiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: env.OPENAI_CHAT_MODEL || OPENAI_CONFIG.MODEL,
        messages,
        max_tokens: OPENAI_CONFIG.MAX_TOKENS,
        temperature: OPENAI_CONFIG.TEMPERATURE,
      }),
      signal: controller.signal,
    }).finally(() => clearTimeout(timeoutId));

    if (!openAiResponse.ok) {
      const details = await openAiResponse.text().catch(() => '');
      console.error('OpenAI API error', {
        status: openAiResponse.status,
        details,
      });
      return withCors(
        json(
          {
            error: 'External service error',
            message: 'The AI service is temporarily unavailable. Please try again later.',
          },
          502,
        ),
        request,
      );
    }

    const completion = await openAiResponse.json();
    const reply = normalizeText(completion?.choices?.[0]?.message?.content);
    const responseReply =
      reply ||
      buildFallbackReply({
        flow: detectedFlow,
        leadMode,
        nextLeadQuestion,
      });

    return withCors(
      json(
        {
          reply: responseReply,
          model: env.OPENAI_CHAT_MODEL || OPENAI_CONFIG.MODEL,
          intent: detectedFlow,
          leadMode,
          readyNow: leadSignals.readyNow,
          nextLeadField,
          nextLeadQuestion,
          suggestedReplies,
          grounding: snippets.map(({ title, url }) => ({ title, url })),
        },
        200,
        {
          'X-RateLimit-Remaining': rateLimit.remaining,
        },
      ),
      request,
    );
  } catch (err) {
    if (err?.name === 'AbortError') {
      return withCors(
        json(
          {
            error: 'External service timeout',
            message: 'The AI service took too long to respond. Please try again.',
          },
          504,
        ),
        request,
      );
    }

    console.error('Chat error:', err);
    return withCors(
      json(
        {
          error: 'Internal server error',
          message: 'Sorry, I encountered an error. Please try again or contact us directly.',
        },
        500,
      ),
      request,
    );
  }
};
