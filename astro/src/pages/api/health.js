import { handleCorsPreflight, withCors } from './_utils/cors.js';

export const prerender = false;

function json(payload, status = 200) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: {
      'content-type': 'application/json; charset=utf-8',
    },
  });
}

export const OPTIONS = async ({ request }) => handleCorsPreflight(request);

export const GET = async ({ request }) =>
  withCors(
    json({
      status: 'ok',
      service: 'bloomn-events-chatbot',
      timestamp: new Date().toISOString(),
    }),
    request,
  );

export const HEAD = async ({ request }) =>
  withCors(
    new Response(null, {
      status: 200,
    }),
    request,
  );
