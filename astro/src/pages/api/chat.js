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

const SALES_STAGES = {
  LEAD_INTAKE_QUALIFY: 'lead_intake_qualify',
  DEEP_DISCOVERY: 'deep_discovery',
  PROPOSAL_LIVE_PRESENTATION: 'proposal_live_presentation',
  COMMERCIAL_NEGOTIATION: 'commercial_negotiation',
  DECISION_CONTRACT: 'decision_contract',
  HANDOFF_DELIVERY: 'handoff_delivery',
};

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

const BROWSING_SIGNAL_KEYWORDS = [
  'just browsing',
  'just looking',
  'looking around',
  'browsing',
  'exploring',
  'ideas',
  'inspiration',
  'not sure yet',
  'checking options',
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

const OUT_OF_SCOPE_KEYWORDS = [
  'wedding',
  'funeral',
  'divorce party',
  'pet party',
  'private birthday at home',
  'nightclub promoter',
];

const AUTHORITY_POSITIVE_KEYWORDS = [
  'i decide',
  'decision maker',
  'i approve',
  'sign off',
  'owner',
  'director',
  'head of',
  'marketing manager',
  'event manager',
  'procurement',
];

const AUTHORITY_NEGATIVE_KEYWORDS = [
  'need approval',
  'need to ask',
  'run this by',
  'my boss',
  'not the decision maker',
  'waiting on approval',
];

const COMPLEXITY_KEYWORDS = [
  'engineering',
  'fabrication',
  'custom build',
  'structural',
  'permit',
  'compliance',
  'safety plan',
  'risk assessment',
  'bump in',
  'pack down',
  'multi-site',
  'subcontractor',
  'catering',
  'band',
  'a/v',
  'audio visual',
  'signage',
  'activation',
];

const BUDGET_LOW_SIGNAL_KEYWORDS = ['cheap', 'cheapest', 'low cost', 'minimal budget', 'tight budget'];
const TIMING_URGENT_KEYWORDS = ['asap', 'tomorrow', 'next week', 'this weekend', 'urgent'];
const VAGUE_OUTCOME_WORDS = [
  'happy',
  'fun',
  'good',
  'great',
  'nice',
  'memorable',
  'successful',
  'engaged',
  'excited',
  'inspired',
  'positive',
  'wow',
];

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
    text: "Primary conversion paths are contact or consult. Phone is 1800 826 268 and email is enquiries@bloomneventsco.com.au.",
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
    text: 'Process centers on consultation, design and planning, execution, and pack-down with one coordinated team for fewer hand-offs.',
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

const OBJECTION_HANDLERS = [
  {
    type: 'too_expensive',
    triggers: ['too expensive', 'expensive', 'over budget', 'cost too much', 'price is high'],
    guidance:
      'Acknowledge budget concern, reframe to outcomes and risk reduction, then offer right-sized scope options.',
  },
  {
    type: 'basic_only',
    triggers: ['just basic', 'basic production', 'simple setup', 'just need equipment'],
    guidance:
      'Clarify desired result first, then right-size scope while preserving quality and reliability.',
  },
  {
    type: 'internal_team',
    triggers: ['we have an internal team', 'internal team', 'in-house team'],
    guidance:
      'Position Bloom as an amplification partner that reduces execution risk and delivery burden.',
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

function truncateWords(text, maxChars = 24) {
  const value = normalizeText(text);
  if (value.length <= maxChars) return value;
  return `${value.slice(0, maxChars).trim()}...`;
}

function isVagueOutcomeAnswer(value) {
  const text = normalizeText(value).toLowerCase();
  if (!text) return true;

  const tokens = tokenize(text);
  if (tokens.length <= 1) return true;
  if (tokens.length <= 3 && tokens.every((token) => VAGUE_OUTCOME_WORDS.includes(token))) return true;

  const hasConcreteGoalSignal = containsAny(text, [
    'lead',
    'leads',
    'sales',
    'sign-up',
    'signup',
    'register',
    'attendance',
    'attendees',
    'network',
    'networking',
    'launch',
    'awareness',
    'engagement',
    'team',
    'culture',
    'retention',
    'feedback',
    'nps',
    'fundraising',
    'donation',
  ]);

  return !hasConcreteGoalSignal && tokens.length < 6;
}

function containsAny(text, keywords) {
  if (!text) return false;
  const haystack = text.toLowerCase();
  return keywords.some((keyword) => haystack.includes(keyword));
}

function countKeywordHits(text, keywords) {
  if (!text) return 0;
  const haystack = text.toLowerCase();
  return keywords.reduce((hits, keyword) => {
    return haystack.includes(keyword) ? hits + 1 : hits;
  }, 0);
}

function buildLeadDraftText(leadDraft) {
  if (!leadDraft || typeof leadDraft !== 'object') return '';
  return [
    leadDraft.name,
    leadDraft.email,
    leadDraft.phone,
    leadDraft.projectType,
    leadDraft.timeframe,
    leadDraft.location,
    leadDraft.scale,
    leadDraft.brief,
    leadDraft.budgetConstraint,
  ]
    .map((value) => normalizeText(value))
    .filter(Boolean)
    .join(' ');
}

function inferDiscoveryContext(flow, conversationText, leadDraft) {
  const text = `${conversationText} ${buildLeadDraftText(leadDraft)}`.toLowerCase();
  const hasYear = /\b20\d{2}\b/.test(text);
  const hasMonth = /\b(jan|january|feb|february|mar|march|apr|april|may|jun|june|jul|july|aug|august|sep|sept|september|oct|october|nov|november|dec|december)\b/.test(
    text,
  );
  const hasDateToken = /\b\d{1,2}[\/-]\d{1,2}([\/-]\d{2,4})?\b/.test(text);
  const hasTimeWindowKeyword = containsAny(text, [
    'next month',
    'this month',
    'next year',
    'this year',
    'q1',
    'q2',
    'q3',
    'q4',
    'week',
    'weeks',
    'timeframe',
    'timeline',
    'date window',
    'by ',
  ]);
  const timeframeKnown = Boolean(normalizeText(leadDraft?.timeframe)) || hasYear || hasMonth || hasDateToken || hasTimeWindowKeyword;

  const hasLocationKeyword = containsAny(text, [
    ' in ',
    ' at ',
    'office',
    'venue',
    'perth',
    'wa',
    'brookton',
    'fremantle',
    'online',
    'on-site',
    'onsite',
    'city',
    'suburb',
  ]);
  const locationKnown = Boolean(normalizeText(leadDraft?.location)) || hasLocationKeyword;

  const hasScaleKeyword = containsAny(text, [
    'guest',
    'guests',
    'people',
    'pax',
    'attendee',
    'attendees',
    'headcount',
    'size',
    'scale',
    'sqm',
    'm2',
    'metre',
    'meter',
    'dimensions',
    'session',
    'sessions',
    'team of',
  ]);
  const scaleKnown = Boolean(normalizeText(leadDraft?.scale)) || hasScaleKeyword;

  const outcomeKnown = normalizeText(leadDraft?.brief).length >= 10;
  const formatKnown = flow !== 'events' || containsAny(text, FLOW_KEYWORDS.events.concat(['celebration', 'awards', 'expo', 'summit']));
  const audienceKnown =
    flow !== 'workshops' ||
    containsAny(text, ['kids', 'children', 'adults', 'team', 'staff', 'school', 'community', 'corporate']);
  const durationKnown =
    flow !== 'workshops' || containsAny(text, ['hour', 'hours', 'half day', 'full day', 'session', 'sessions', 'duration']);
  const environmentKnown =
    flow !== 'displays' || containsAny(text, ['indoor', 'outdoor', 'inside', 'outside']);
  const hireModeKnown =
    flow !== 'displays' || containsAny(text, ['hire', 'rent', 'buy', 'purchase', 'keep', 'custom build', 'custom']);

  return {
    timeframeKnown,
    locationKnown,
    scaleKnown,
    outcomeKnown,
    formatKnown,
    audienceKnown,
    durationKnown,
    environmentKnown,
    hireModeKnown,
  };
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

function detectObjection(conversationText) {
  const text = conversationText.toLowerCase();
  for (const pattern of OBJECTION_HANDLERS) {
    if (pattern.triggers.some((trigger) => text.includes(trigger))) {
      return {
        type: pattern.type,
        guidance: pattern.guidance,
      };
    }
  }
  return null;
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

function parseLargestNumber(text) {
  const matches = (text || '').match(/\d+/g);
  if (!matches || matches.length === 0) return null;
  return Math.max(...matches.map((value) => Number(value)));
}

function scoreBudget(conversationText, leadDraft) {
  const budget = normalizeText(leadDraft.budgetConstraint);
  const text = `${conversationText} ${budget}`.toLowerCase();

  if (!budget && !containsAny(text, ['budget', '$', 'aud', 'k'])) return 0;
  if (containsAny(text, BUDGET_LOW_SIGNAL_KEYWORDS)) return 1;
  if (budget && containsAny(text, ['range', '$', 'aud', 'k', 'around', 'approx'])) return 3;
  if (budget) return 2;
  return 1;
}

function scoreTiming(conversationText, leadDraft) {
  const timeframe = normalizeText(leadDraft.timeframe);
  const text = `${conversationText} ${timeframe}`.toLowerCase();

  if (!timeframe && !containsAny(text, ['date', 'timeline', 'timeframe', 'month', 'week', 'quarter'])) {
    return 0;
  }
  if (containsAny(text, TIMING_URGENT_KEYWORDS)) return 1;
  if (timeframe && containsAny(text, ['month', 'week', 'quarter', 'window', 'date'])) return 3;
  if (timeframe) return 2;
  return 1;
}

function scoreAuthority(conversationText) {
  const text = conversationText.toLowerCase();
  const hasPositive = containsAny(text, AUTHORITY_POSITIVE_KEYWORDS);
  const hasNegative = containsAny(text, AUTHORITY_NEGATIVE_KEYWORDS);

  if (hasPositive && !hasNegative) return 3;
  if (hasPositive && hasNegative) return 2;
  if (hasNegative) return 1;
  return 0;
}

function scoreScopeClarity(leadDraft) {
  const keys = ['projectType', 'timeframe', 'location', 'scale', 'brief'];
  const presentCount = keys.filter((key) => normalizeText(leadDraft[key]).length > 0).length;

  if (presentCount >= 5) return 3;
  if (presentCount >= 3) return 2;
  if (presentCount >= 1) return 1;
  return 0;
}

function scoreComplexityLoad(conversationText, leadDraft) {
  const text = `${conversationText} ${normalizeText(leadDraft.scale)}`.toLowerCase();
  const complexityHits = countKeywordHits(text, COMPLEXITY_KEYWORDS);
  const largestNumber = parseLargestNumber(text);

  if (complexityHits === 0 && largestNumber == null) return 0;
  if (complexityHits >= 3 || (largestNumber != null && largestNumber >= 300)) return 3;
  if (complexityHits >= 1 || (largestNumber != null && largestNumber >= 120)) return 2;
  return 1;
}

function scoreCapabilityFit(flow, conversationText) {
  const text = conversationText.toLowerCase();
  if (containsAny(text, OUT_OF_SCOPE_KEYWORDS)) return 0;
  if (flow === 'events' || flow === 'workshops' || flow === 'displays') return 3;
  if (containsAny(text, FLOW_KEYWORDS.events.concat(FLOW_KEYWORDS.workshops, FLOW_KEYWORDS.displays))) {
    return 2;
  }
  return 1;
}

function classifyQualificationBand(totalScore) {
  if (totalScore >= 16) return 'priority_closed_loop';
  if (totalScore >= 12) return 'qualified_with_conditions';
  return 'nurture_or_disqualify';
}

function collectRedFlags({
  leadSignals,
  leadDraft,
  authorityScore,
  budgetScore,
  complexityScore,
  timingScore,
}) {
  const redFlags = [];

  if (leadSignals.triggered && authorityScore <= 1) {
    redFlags.push('Decision authority is unclear.');
  }
  if (timingScore === 1 && complexityScore >= 2) {
    redFlags.push('Timeline may be unrealistic for complexity.');
  }
  if (budgetScore <= 1 && complexityScore >= 2) {
    redFlags.push('Budget and operational complexity may be mismatched.');
  }
  if (normalizeText(leadDraft.brief).length > 0 && normalizeText(leadDraft.brief).length < 20) {
    redFlags.push('Success criteria are still ambiguous.');
  }
  if (containsAny(JSON.stringify(leadDraft).toLowerCase(), OUT_OF_SCOPE_KEYWORDS)) {
    redFlags.push('Project type may be outside Bloom capability scope.');
  }

  return redFlags;
}

function calculateQualification({ flow, conversationText, leadDraft, leadSignals }) {
  const budget = scoreBudget(conversationText, leadDraft);
  const timing = scoreTiming(conversationText, leadDraft);
  const authority = scoreAuthority(conversationText);
  const scopeClarity = scoreScopeClarity(leadDraft);
  const complexityLoad = scoreComplexityLoad(conversationText, leadDraft);
  const capabilityFit = scoreCapabilityFit(flow, conversationText);

  const totalScore = budget + timing + authority + scopeClarity + complexityLoad + capabilityFit;
  const band = classifyQualificationBand(totalScore);
  const redFlags = collectRedFlags({
    leadSignals,
    leadDraft,
    authorityScore: authority,
    budgetScore: budget,
    complexityScore: complexityLoad,
    timingScore: timing,
  });

  return {
    totalScore,
    maxScore: 18,
    band,
    components: {
      budget,
      timing,
      authority,
      scopeClarity,
      complexityLoad,
      capabilityFit,
    },
    redFlags,
  };
}

function detectSalesStage({ leadMode, leadSignals, readyNow, missingLeadFields, qualificationBand }) {
  if (!leadMode && !leadSignals.triggered) return SALES_STAGES.LEAD_INTAKE_QUALIFY;
  if (leadMode && missingLeadFields.length >= 3) return SALES_STAGES.LEAD_INTAKE_QUALIFY;
  if (leadMode && missingLeadFields.length > 0) return SALES_STAGES.DEEP_DISCOVERY;
  if (readyNow && missingLeadFields.length === 0) return SALES_STAGES.DECISION_CONTRACT;
  if (qualificationBand === 'priority_closed_loop') return SALES_STAGES.COMMERCIAL_NEGOTIATION;
  if (qualificationBand === 'qualified_with_conditions') {
    return SALES_STAGES.PROPOSAL_LIVE_PRESENTATION;
  }
  return SALES_STAGES.LEAD_INTAKE_QUALIFY;
}

function buildMutualActionPlan({ stage, flow }) {
  if (
    stage !== SALES_STAGES.PROPOSAL_LIVE_PRESENTATION &&
    stage !== SALES_STAGES.COMMERCIAL_NEGOTIATION &&
    stage !== SALES_STAGES.DECISION_CONTRACT
  ) {
    return [];
  }

  const routeByFlow = {
    events: '/events',
    workshops: '/workshops',
    displays: '/displays',
    browse: '/capabilities',
  };

  return [
    {
      owner: 'Bloom',
      task: 'Present scoped concept and commercial options live with key stakeholders.',
      targetDate: 'TBD',
    },
    {
      owner: 'Client',
      task: 'Confirm decision participants, budget comfort, and timeline constraints.',
      targetDate: 'TBD',
    },
    {
      owner: 'Bloom',
      task: `Issue formal proposal and next-step actions referencing ${routeByFlow[flow] || '/contact'}.`,
      targetDate: 'TBD',
    },
  ];
}

function buildStageActions({ stage, leadMode, nextLeadQuestion, flow }) {
  if (stage === SALES_STAGES.LEAD_INTAKE_QUALIFY) {
    return [
      'Confirm fit, timing, and decision pathway before detailed pricing.',
      nextLeadQuestion || 'Ask one concise qualification question next.',
      'Offer quick route to /contact, 1800 826 268, or enquiries@bloomneventsco.com.au.',
    ];
  }

  if (stage === SALES_STAGES.DEEP_DISCOVERY) {
    return [
      nextLeadQuestion || 'Clarify desired outcomes, stakeholders, and success criteria.',
      'Capture operational risks and compliance needs early.',
      'Move toward a live proposal conversation once essentials are complete.',
    ];
  }

  if (stage === SALES_STAGES.PROPOSAL_LIVE_PRESENTATION) {
    return [
      'Present proposal live instead of email-only delivery.',
      'Align stakeholders on scope, assumptions, and execution risks.',
      'Set a mutual action plan with named owners and dates.',
    ];
  }

  if (stage === SALES_STAGES.COMMERCIAL_NEGOTIATION) {
    return [
      'Negotiate scope and commercial terms while protecting outcomes.',
      'Address objection context with value and risk framing.',
      'Confirm decision date and contract path.',
    ];
  }

  if (stage === SALES_STAGES.DECISION_CONTRACT) {
    return [
      'Capture final approvals and execute contract.',
      'Confirm internal handoff package: scope, risks, compliance, timeline.',
      `Route directly to final touchpoint via /contact for ${flow} delivery planning.`,
    ];
  }

  return [
    leadMode
      ? 'Continue qualification and route to consult quickly.'
      : 'Answer clearly, then steer to next conversion action.',
  ];
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

function getSuggestedReplies(flow, leadMode, salesStage) {
  if (salesStage === SALES_STAGES.DECISION_CONTRACT) {
    return ['Send Project Brief', 'Call 1800 826 268', 'Email enquiries@bloomneventsco.com.au'];
  }
  if (leadMode) {
    return ['Share details', 'Call 1800 826 268', 'Email enquiries@bloomneventsco.com.au'];
  }

  if (flow === 'events') {
    return ['Get event quote', 'See case studies', 'View /events'];
  }
  if (flow === 'workshops') {
    return ['Plan a workshop', 'Audience fit', 'View /workshops'];
  }
  if (flow === 'displays') {
    return ['Discuss installation', 'Hire vs buy', 'View /displays'];
  }

  return ['Show me case studies', 'What is your process?', 'View /workshops'];
}

function buildSystemPrompt({
  flow,
  leadMode,
  readyNow,
  nextLeadQuestion,
  snippets,
  salesStage,
  objection,
  qualification,
}) {
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
    ? `Lead mode is ON. Ask for one missing field at a time and keep momentum toward consult.
Next preferred lead question: ${nextLeadQuestion || 'Ask the single most useful missing qualification question.'}`
    : 'Lead mode is OFF unless user signals quote, booking, availability, proposal, pricing, or immediate next steps.';

  const objectionGuidance = objection
    ? `Detected objection: ${objection.type}. Handling guidance: ${objection.guidance}`
    : 'No objection is currently detected.';

  return `You are Bloom, the website concierge for Bloom'n Events Co.

Voice:
- Warm, confident, useful, and concise.
- Light dry humour is fine; never sarcastic at the user.
- Keep responses under 160 words unless asked for depth.
- If user shares their name, acknowledge once naturally before the next question (for example: "Nice to meet you, Anton.").
- Do not end early with a consult CTA when user is still exploring. Ask one useful follow-up question first.
- If user says they are browsing, point them to the most relevant route and offer to keep guiding.
- If the user has already answered a question, acknowledge it and move to the next missing detail. Do not repeat the same question.
- If the user's answer is vague or incomplete, reframe with examples and ask for a concrete detail instead of repeating wording.

Hard rules:
- Never invent capabilities, pricing, availability, legal terms, or policy promises.
- Pricing is scope-driven. Do not provide fixed pricing promises here.
- If user is ready now, stop broad chat and capture details.
- If uncertain, ask 1-2 crisp questions then offer next action.

Sales operating model:
- Funnel focus: answer fast, qualify politely, route to consult.
- Current funnel: ${flowLabelMap[flow] || 'General'}.
- Current sales stage: ${salesStage}.
- Qualification score snapshot: ${qualification.totalScore}/${qualification.maxScore} (${qualification.band}).
- ${leadModeGuidance}
- ${readyNow ? 'User appears ready now.' : 'User may still be exploring.'}
- ${objectionGuidance}

Grounding snippets (use these facts first):
${snippetText}

When mentioning pages, use exact routes: /events, /workshops, /displays, /capabilities, /gallery, /team, /about, /contact.`;
}

function getFriendlyFirstName(name) {
  const first = normalizeText(name).split(/\s+/)[0] || '';
  const safe = first.replace(/[^a-zA-Z'-]/g, '');
  return safe.slice(0, 24);
}

function buildFallbackReply({
  flow,
  leadMode,
  nextLeadField,
  nextLeadQuestion,
  leadDraft,
  userMessage,
  conversationText,
}) {
  const pickOne = (items) => items[Math.floor(Math.random() * items.length)];
  const allText = `${normalizeText(conversationText)} ${normalizeText(userMessage)}`.toLowerCase();
  const browsingText = `${allText} ${normalizeText(leadDraft?.brief)}`.toLowerCase();
  const isBrowsing = containsAny(browsingText, BROWSING_SIGNAL_KEYWORDS);

  const flowQuestions = {
    events: [
      'Love this, events are right in our lane. Are you planning a launch, conference, or networking style event?',
      'Great fit. What date window and location are you working with?',
      'Nice brief. Roughly how many guests are you planning for?',
    ],
    workshops: [
      'Love this, workshops are a strong fit for us. Is this for kids, adults, or a team session?',
      'Great direction. How many people and what duration are you thinking?',
      'Perfect. Do you already have a date window and location in mind?',
    ],
    displays: [
      'Nice, displays and installs are right in our wheelhouse. Is this indoor or outdoor?',
      'Great fit. Are you after hire or a custom build to keep?',
      'Perfect. Roughly what dimensions or footprint are you planning around?',
    ],
    browse: [
      'Sure thing. Want case studies, process, or service fit first?',
      'Happy to help. Do you want to compare events, workshops, and displays quickly?',
      'Great question. Are you exploring ideas or already planning something specific?',
    ],
  };

  const flowRoutes = {
    events: '/events',
    workshops: '/workshops',
    displays: '/displays',
    browse: '/capabilities',
  };

  if (leadMode && nextLeadQuestion) {
    const firstName = getFriendlyFirstName(leadDraft?.name);
    if (nextLeadField === 'email' && firstName) {
      return `Nice to meet you, ${firstName}. ${nextLeadQuestion}`;
    }

    const leadBridges = [
      'Great, quick one:',
      'Perfect, next detail:',
      'Thanks, one more:',
      'Nice, let me lock in one more thing:',
    ];
    return `${pickOne(leadBridges)} ${nextLeadQuestion}`;
  }

  const discovery = inferDiscoveryContext(flow, allText, leadDraft);
  if (flow === 'events') {
    if (!discovery.formatKnown) {
      return 'Love this, events are right in our lane. Are you planning a launch, conference, networking event, or something else?';
    }
    if (!discovery.timeframeKnown && !discovery.locationKnown) {
      return 'Great fit. What date window and location are you working with?';
    }
    if (!discovery.timeframeKnown) {
      return 'Perfect. What date window are you targeting?';
    }
    if (!discovery.locationKnown) {
      return 'Great. Where is the event happening?';
    }
    if (!discovery.scaleKnown) {
      return 'Nice. Roughly how many guests are you planning for?';
    }
    if (!discovery.outcomeKnown) {
      const answer = normalizeText(userMessage);
      if (answer) {
        if (isVagueOutcomeAnswer(answer)) {
          return `Love that direction. When you say "${truncateWords(
            answer,
          )}", what outcome matters most: stronger connection, celebrating wins, or a specific action like sign-ups?`;
        }
        return 'Nice, that helps. Could you add one concrete success signal (for example engagement, sign-ups, or team feedback)?';
      }
      return 'Great context so far. What do you want people to feel or do at the event?';
    }
    return 'Nice brief so far. Want to keep shaping details here, or tap /events to browse formats and /gallery for examples?';
  }

  if (flow === 'workshops') {
    if (!discovery.audienceKnown) {
      return 'Love this, workshops are a strong fit. Is this for kids, adults, or a team session?';
    }
    if (!discovery.durationKnown) {
      return 'Great. How long should the workshop run (for example 60 mins, half day, or full day)?';
    }
    if (!discovery.timeframeKnown && !discovery.locationKnown) {
      return 'Perfect. What date window and location are you working with?';
    }
    if (!discovery.timeframeKnown) {
      return 'Nice. What date window are you aiming for?';
    }
    if (!discovery.locationKnown) {
      return 'Great. Where would you like the workshop delivered?';
    }
    if (!discovery.scaleKnown) {
      return 'How many people should the session be designed for?';
    }
    return 'Great direction. Want to keep planning here, or tap /workshops to browse formats and examples?';
  }

  if (flow === 'displays') {
    if (!discovery.hireModeKnown) {
      return 'Nice, displays are right in our wheelhouse. Are you after hire, or a custom build to keep?';
    }
    if (!discovery.environmentKnown) {
      return 'Perfect. Is this display going indoor or outdoor?';
    }
    if (!discovery.timeframeKnown) {
      return 'Great. What install window are you working to?';
    }
    if (!discovery.locationKnown) {
      return 'Where will this be installed?';
    }
    if (!discovery.scaleKnown) {
      return 'Do you have target dimensions or a footprint in mind?';
    }
    return 'Great context. Want to keep shaping it here, or tap /displays to explore build styles and examples?';
  }

  if (isBrowsing) {
    if (flow === 'browse') {
      return 'No pressure. If you are browsing, start with /events, /workshops, or /displays, and case studies at /gallery. Tap one of the page buttons below, or tell me your goal and I can point you to the best fit in one step.';
    }
    if (flow === 'workshops') {
      return 'No pressure. Best place to explore is /workshops for audience types, format ideas, and examples. Tap the button below to open it now, or tell me your audience and I can narrow options quickly.';
    }
    if (flow === 'events') {
      return 'No pressure. Start at /events for event formats and delivery scope. Tap the button below to open it now, or share your date window and I can suggest the best path.';
    }
    if (flow === 'displays') {
      return 'No pressure. Start at /displays for install styles and build options. Tap the button below to open it now, or share indoor/outdoor plus size and I can guide you fast.';
    }
    return `No pressure. If you are just looking, the best starting point is ${flowRoutes[flow] || flowRoutes.browse}. Tap the button below to open it now, or I can ask two quick questions and narrow it fast.`;
  }

  return pickOne(flowQuestions[flow] || flowQuestions.browse);
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
  const conversationText = `${validated.message} ${validated.conversationHistory
    .map((item) => item.content)
    .join(' ')}`;

  const qualification = calculateQualification({
    flow: detectedFlow,
    conversationText,
    leadDraft: mergedLeadDraft,
    leadSignals,
  });

  const salesStage = detectSalesStage({
    leadMode,
    leadSignals,
    readyNow: leadSignals.readyNow,
    missingLeadFields,
    qualificationBand: qualification.band,
  });

  const objection = detectObjection(conversationText);
  const stageActions = buildStageActions({
    stage: salesStage,
    leadMode,
    nextLeadQuestion,
    flow: detectedFlow,
  });
  const mutualActionPlan = buildMutualActionPlan({
    stage: salesStage,
    flow: detectedFlow,
  });

  const snippets = getRelevantKnowledge(conversationText, detectedFlow);
  const suggestedReplies = getSuggestedReplies(detectedFlow, leadMode, salesStage);

  const responseSales = {
    stage: salesStage,
    qualification,
    objection,
    nextActions: stageActions,
    mutualActionPlan,
    playbookVersion: '2026-q1',
  };

  if (!env.OPENAI_API_KEY) {
    return withCors(
      json(
        {
          reply: buildFallbackReply({
            flow: detectedFlow,
            leadMode,
            nextLeadField,
            nextLeadQuestion,
            leadDraft: mergedLeadDraft,
            userMessage: validated.message,
            conversationText,
          }),
          model: 'rule-based-fallback',
          intent: detectedFlow,
          leadMode,
          readyNow: leadSignals.readyNow,
          nextLeadField,
          nextLeadQuestion,
          suggestedReplies,
          grounding: snippets.map(({ title, url }) => ({ title, url })),
          sales: responseSales,
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
        salesStage,
        objection,
        qualification,
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
        nextLeadField,
        nextLeadQuestion,
        leadDraft: mergedLeadDraft,
        userMessage: validated.message,
        conversationText,
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
          sales: responseSales,
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
