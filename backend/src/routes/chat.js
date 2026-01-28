import express from 'express';
import OpenAI from 'openai';
import { chatRateLimiter } from '../config/rateLimiter.js';
import { validateChatRequest } from '../schemas/chat.schema.js';
import { env } from '../config/env.mjs';
import { OPENAI_CONFIG } from '../config/constants.js';

const router = express.Router();

// Initialize OpenAI client (only if API key is provided)
const client = env.OPENAI_API_KEY ? new OpenAI({
  apiKey: env.OPENAI_API_KEY,
}) : null;

// Chatbot system prompt
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

router.post('/chat', chatRateLimiter, async (req, res) => {
  try {
    // Check if OpenAI client is initialized
    if (!client || !env.OPENAI_API_KEY) {
      return res.status(503).json({
        success: false,
        error: 'Service unavailable',
        message: 'Chat service is not configured. Please set OPENAI_API_KEY in environment variables.'
      });
    }

    // Validate and sanitize input
    const validated = validateChatRequest(req.body);
    const { message, conversationHistory } = validated;

    // Build messages array with system prompt, conversation history, and current message
    const messages = [
      { role: 'system', content: SYSTEM_PROMPT },
      ...(conversationHistory || []),
      { role: 'user', content: message }
    ];

    const completion = await client.chat.completions.create({
      model: OPENAI_CONFIG.MODEL,
      messages: messages,
      max_tokens: OPENAI_CONFIG.MAX_TOKENS,
      temperature: OPENAI_CONFIG.TEMPERATURE,
    });

    const reply = completion.choices[0]?.message?.content ?? 'I apologize, but I encountered an error processing your request.';

    res.json({ 
      reply: reply,
      model: OPENAI_CONFIG.MODEL
    });

  } catch (err) {
    // Handle validation errors
    if (err.name === 'ZodError') {
      return res.status(400).json({
        error: 'Validation failed',
        message: 'Invalid request data',
        details: err.errors
      });
    }
    
    // Handle OpenAI API errors
    if (err.response) {
      console.error('OpenAI API error:', err.response.data);
      return res.status(502).json({
        error: 'External service error',
        message: 'The AI service is temporarily unavailable. Please try again later.'
      });
    }
    
    // Handle other errors
    console.error('Chat error:', err.message || err);
    res.status(500).json({ 
      error: 'Internal server error',
      message: 'Sorry, I encountered an error. Please try again or contact us directly.'
    });
  }
});

export default router;
