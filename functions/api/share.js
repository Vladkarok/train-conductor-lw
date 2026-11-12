import {
  SHARE_TTL_SECONDS,
  createShareId,
  createShareToken,
  hasShareSigningKeys,
  isPagesDevHost,
  jsonResponse,
  methodNotAllowed,
  missingBindingResponse,
  pagesDevCreateRefusedResponse,
  parseShareRequest,
  validateShareCreateRequest
} from './_share.js';

export async function onRequest(context) {
  if (context.request.method !== 'POST') {
    return methodNotAllowed('POST');
  }
  if (isPagesDevHost(new URL(context.request.url).hostname)) {
    return pagesDevCreateRefusedResponse();
  }
  if (!context.env || !context.env.SHARES) {
    return missingBindingResponse('SHARES');
  }
  if (!hasShareSigningKeys(context.env.SHARE_SIGNING_KEY)) {
    return missingBindingResponse('SHARE_SIGNING_KEY');
  }

  const requestIssue = validateShareCreateRequest(context.request);
  if (requestIssue) {
    return jsonResponse({ error: requestIssue.error }, requestIssue.status);
  }

  const parsed = await parseShareRequest(context.request);
  if (parsed.error) {
    return jsonResponse({ error: parsed.error }, parsed.status);
  }

  const id = createShareId();
  await context.env.SHARES.put(id, JSON.stringify({
    createdAt: new Date().toISOString(),
    payload: parsed.payload
  }), {
    expirationTtl: SHARE_TTL_SECONDS
  });
  const token = await createShareToken(id, context.env.SHARE_SIGNING_KEY);

  return jsonResponse({
    id: token,
    expiresIn: SHARE_TTL_SECONDS
  }, 201);
}
