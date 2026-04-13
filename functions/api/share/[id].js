import {
  isPendingShareId,
  isValidShareId,
  jsonResponse,
  methodNotAllowed,
  missingBindingResponse,
  parseStoredShare
} from '../_share.js';

export async function onRequest(context) {
  if (context.request.method !== 'GET') {
    return methodNotAllowed('GET');
  }
  if (!context.env || !context.env.SHARES) {
    return missingBindingResponse();
  }

  const shareId = context.params && context.params.id ? context.params.id : '';
  if (!isValidShareId(shareId)) {
    return jsonResponse({ error: 'Invalid share id.' }, 400);
  }

  const raw = await context.env.SHARES.get(shareId);
  const payload = parseStoredShare(raw);
  if (!payload) {
    if (isPendingShareId(shareId)) {
      return jsonResponse({ error: 'Share is still propagating.', pending: true }, 202);
    }
    return jsonResponse({ error: 'Share not found.' }, 404);
  }

  return jsonResponse(payload);
}
