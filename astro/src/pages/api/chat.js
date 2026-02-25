import { getAllowedOrigins, getEnv } from './_utils/env.js';
import { handleCorsPreflight, withCors } from './_utils/cors.js';
import { checkRateLimit } from './_utils/rateLimit.js';

export const prerender = false;

const SYSTEM_PROMPT = `You are a helpful assistant for Bloom'n Events Co, a professional event planning and display company based in Brookton, Western Australia.

Company Information:
- Name: Bloom'n Events Co Pty Ltd
- Location: Brookton, WA
- Services: Corporate event planning, workshops (adults and kids), custom displays, food festivals
- Notable clients: Hawaiian, Centuria, Stockland
- Service area: Greater Perth area and Western Australia

Your role is to:
- Answer questions about their services (corporate events, workshops, displays)
- Provide information about their capabilities and past work
- Help visitors understand their offerings
- Guide users to appropriate pages (/events, /workshops, /displays, /contact, /gallery, /team, /about)
- Be friendly, professional, and helpful
- If asked about pricing, explain that pricing depends on scope and suggest contacting them for a quote
- Keep responses concise and conversational (max 300 words)
- Always maintain a positive, enthusiastic tone about events and celebrations

If you don't know something specific, suggest they contact the company directly through the contact page.`;

const OPENAI_CONFIG = {
  MODEL: 'gpt-3.5-turbo',
  MAX_TOKENS: 300,
  TEMPERATURE: 0.7,
};

const CHAT_LIMITS = {
  MESSAGE_MAX_CHARS: 500,
  HISTORY_MAX_ITEMS: 20,
  HISTORY_ITEM_MAX_CHARS: 1000,
  HISTORY_TOTAL_MAX_CHARS: 6000,
  OPENAI_TIMEOUT_MS: 15000,
};

const ALLOWED_HISTORY_ROLES = new Set(['user', 'assistant']);

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

function validateChatRequest(body) {
  if (!body || typeof body !== 'object') {
    throw new Error('Invalid request body');
  }

  const { message, conversationHistory } = body;
  const trimmedMessage = typeof message === 'string' ? message.trim() : '';

  if (trimmedMessage.length === 0) {
    throw new Error('Message is required and cannot be empty');
  }

  if (trimmedMessage.length > CHAT_LIMITS.MESSAGE_MAX_CHARS) {
    throw new Error(`Message too long (max ${CHAT_LIMITS.MESSAGE_MAX_CHARS} characters)`);
  }

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

    const role = typeof item.role === 'string' ? item.role.trim() : '';
    const content = typeof item.content === 'string' ? item.content.trim() : '';

    if (!ALLOWED_HISTORY_ROLES.has(role)) {
      throw new Error('conversationHistory role must be user or assistant');
    }

    if (content.length === 0) {
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
    message: trimmedMessage,
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

  const rateLimit = checkRateLimit(request, 'chat', 15 * 60 * 1000, 20);
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

  if (!env.OPENAI_API_KEY) {
    return withCors(
      json(
        {
          success: false,
          error: 'Service unavailable',
          message: 'Chat service is not configured. Please set OPENAI_API_KEY in environment variables.',
        },
        503,
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

  const messages = [
    { role: 'system', content: SYSTEM_PROMPT },
    ...(validated.conversationHistory || []),
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
        model: OPENAI_CONFIG.MODEL,
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
    const reply =
      completion?.choices?.[0]?.message?.content ||
      'I apologize, but I encountered an error processing your request.';

    return withCors(
      json(
        {
          reply,
          model: OPENAI_CONFIG.MODEL,
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
