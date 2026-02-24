import { getEnv } from './_utils/env.js';
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
- Guide users to appropriate pages (events.html, workshops.html, displays.html, contact.html, gallery.html, team.html, about.html)
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

  if (!message || typeof message !== 'string' || message.trim().length === 0) {
    throw new Error('Message is required and cannot be empty');
  }

  if (message.length > 500) {
    throw new Error('Message too long (max 500 characters)');
  }

  if (conversationHistory && !Array.isArray(conversationHistory)) {
    throw new Error('conversationHistory must be an array');
  }

  if (conversationHistory && conversationHistory.length > 20) {
    throw new Error('Too many conversation history items (max 20)');
  }

  return {
    message: message.trim(),
    conversationHistory: conversationHistory || [],
  };
}

export const OPTIONS = async ({ request }) => handleCorsPreflight(request);

export const POST = async ({ request }) => {
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

  const env = getEnv();
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
    });

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
