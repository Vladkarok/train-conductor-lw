import {
  hasShareSigningKeys,
  isPendingShareId,
  jsonResponse,
  methodNotAllowed,
  missingBindingResponse,
  parseStoredShare,
  resolveShareToken
} from '../_share.js';

export async function onRequest(context) {
  if (context.request.method !== 'GET') {
    return methodNotAllowed('GET');
  }
  if (!context.env || !context.env.SHARES) {
    return missingBindingResponse('SHARES');
  }

  const shareToken = context.params && context.params.id ? context.params.id : '';
  if (shareToken.includes('.') && !hasShareSigningKeys(context.env.SHARE_SIGNING_KEY)) {
    return missingBindingResponse('SHARE_SIGNING_KEY');
  }
  const token = await resolveShareToken(shareToken, context.env.SHARE_SIGNING_KEY);
  if (!token.valid) {
    return jsonResponse({ error: 'Invalid share id.' }, 400);
  }

  const raw = await context.env.SHARES.get(token.id);
  const payload = parseStoredShare(raw);
  if (!payload) {
    if (token.signed && isPendingShareId(token.id)) {
      return jsonResponse({ error: 'Share is still propagating.', pending: true }, 202);
    }
    return jsonResponse({ error: 'Share not found.' }, 404);
  }

  return jsonResponse(payload);
}
