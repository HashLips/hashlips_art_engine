import { authentication, currentMember, members } from 'wix-members-backend';
import { WantedError } from './wantedUtils.js';

const AUTHORIZATION_HEADER = 'authorization';

export function extractAuthToken(request) {
  const headers = request?.headers || {};
  const raw =
    headers[AUTHORIZATION_HEADER] ||
    headers[AUTHORIZATION_HEADER.toUpperCase()] ||
    headers.Authorization ||
    headers.AUTHORIZATION;
  if (typeof raw !== 'string') return null;
  const trimmed = raw.trim();
  if (!trimmed) return null;
  if (/^Bearer /i.test(trimmed)) {
    return trimmed.slice(7).trim();
  }
  return trimmed;
}

export async function resolveMemberFromRequest(request, tokenOverride) {
  const token = tokenOverride || extractAuthToken(request);
  if (token) {
    try {
      const validation = await authentication.validateAuthToken(token);
      const memberId = validation?.member?._id || validation?.memberId || validation?.id;
      if (memberId) {
        const member = await members.getMember(memberId, { fieldsets: ['FULL'] });
        if (member) return member;
      }
    } catch (err) {
      console.warn('[bridge] validateAuthToken failed', err);
    }
  }
  try {
    return await currentMember.getMember({ fieldsets: ['FULL'] });
  } catch (_err) {
    return null;
  }
}

export async function requireMemberFromRequest(request, tokenOverride) {
  const member = await resolveMemberFromRequest(request, tokenOverride);
  if (!member) {
    throw new WantedError('Login required.', 401);
  }
  return member;
}

export function extractClientDetails(request) {
  const headers = request?.headers || {};
  const forwarded =
    headers['x-real-ip'] ||
    headers['x-forwarded-for'] ||
    headers['X-Forwarded-For'] ||
    headers['client-ip'] ||
    headers['CF-Connecting-IP'] ||
    headers['cf-connecting-ip'] ||
    null;
  let ip = null;
  if (typeof forwarded === 'string' && forwarded.trim()) {
    ip = forwarded.split(',')[0].trim();
  } else if (request?.context?.ip) {
    ip = String(request.context.ip).trim();
  }
  const userAgentHeader = headers['user-agent'] || headers['User-Agent'] || '';
  const userAgent =
    typeof userAgentHeader === 'string' && userAgentHeader.trim()
      ? userAgentHeader.trim().slice(0, 1024)
      : null;
  return { ip, userAgent };
}

export function buildRequestContext(request, member, tokenOverride) {
  const { ip, userAgent } = extractClientDetails(request);
  return {
    member,
    ip,
    userAgent,
    authToken: tokenOverride || extractAuthToken(request)
  };
}
