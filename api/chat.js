/**
 * Vercel serverless function for chatbot API
 * POST /api/chat
 */

import OpenAI from 'openai';
import { getEnv } from './_utils/env.js';
import { setCorsHeaders, handleCorsPreflight } from './_utils/cors.js';
import { checkRateLimit } from './_utils/rateLimit.js';

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

// Validation schema (simplified for Vercel)
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
    conversationHistory: conversationHistory || []
  };
}

export default async function handler(req, res) {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return handleCorsPreflight(req, res);
  }
  
  // Set CORS headers
  setCorsHeaders(req, res);
  
  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  // Rate limiting: 20 requests per 15 minutes
  const rateLimit = checkRateLimit(req, 'chat', 15 * 60 * 1000, 20);
  if (!rateLimit.allowed) {
    res.setHeader('Retry-After', Math.ceil((rateLimit.resetTime - Date.now()) / 1000));
    return res.status(429).json({
      error: 'Too many requests',
      message: 'Rate limit exceeded. Please try again later.',
      retryAfter: Math.ceil((rateLimit.resetTime - Date.now()) / 1000)
    });
  }
  
  try {
    const env = getEnv();
    
    // Check if OpenAI API key is configured
    if (!env.OPENAI_API_KEY) {
      return res.status(503).json({
        success: false,
        error: 'Service unavailable',
        message: 'Chat service is not configured. Please set OPENAI_API_KEY in environment variables.'
      });
    }
    
    // Validate request
    let validated;
    try {
      validated = validateChatRequest(req.body);
    } catch (error) {
      return res.status(400).json({
        error: 'Validation failed',
        message: error.message
      });
    }
    
    const { message, conversationHistory } = validated;
    
    // Initialize OpenAI client
    const client = new OpenAI({
      apiKey: env.OPENAI_API_KEY,
    });
    
    // Build messages array
    const messages = [
      { role: 'system', content: SYSTEM_PROMPT },
      ...(conversationHistory || []),
      { role: 'user', content: message }
    ];
    
    // Call OpenAI API
    const completion = await client.chat.completions.create({
      model: OPENAI_CONFIG.MODEL,
      messages: messages,
      max_tokens: OPENAI_CONFIG.MAX_TOKENS,
      temperature: OPENAI_CONFIG.TEMPERATURE,
    });
    
    const reply = completion.choices[0]?.message?.content ?? 'I apologize, but I encountered an error processing your request.';
    
    // Add rate limit headers
    res.setHeader('X-RateLimit-Remaining', rateLimit.remaining);
    
    return res.status(200).json({ 
      reply: reply,
      model: OPENAI_CONFIG.MODEL
    });
    
  } catch (err) {
    console.error('Chat error:', err);
    
    // Handle OpenAI API errors
    if (err.response) {
      return res.status(502).json({
        error: 'External service error',
        message: 'The AI service is temporarily unavailable. Please try again later.'
      });
    }
    
    // Handle validation errors
    if (err.message && err.message.includes('Validation')) {
      return res.status(400).json({
        error: 'Validation failed',
        message: err.message
      });
    }
    
    // Generic error
    return res.status(500).json({ 
      error: 'Internal server error',
      message: 'Sorry, I encountered an error. Please try again or contact us directly.'
    });
  }
}
