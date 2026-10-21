import { handleEnquiry } from './lead';
export const prerender = false;
export const POST = async ({ request, clientAddress }) => {
  // The shared handler handles native fields and escaped retry responses.
  return handleEnquiry(request, clientAddress ?? 'unknown', true);
};
