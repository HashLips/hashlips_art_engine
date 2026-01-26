import { currentMember, authentication } from 'wix-members-frontend';
import { session } from 'wix-storage';

const CACHE_KEY = 'dikpik-member-snapshot';

function persistSnapshot(snapshot) {
  if (!snapshot) {
    session.removeItem(CACHE_KEY);
    return;
  }
  const sanitized = { ...snapshot };
  delete sanitized.authToken;

  try {
    session.setItem(CACHE_KEY, JSON.stringify(sanitized));
  } catch (_err) {
    session.removeItem(CACHE_KEY);
  }
}

function loadCachedSnapshot() {
  const raw = session.getItem(CACHE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch (_err) {
    session.removeItem(CACHE_KEY);
    return null;
  }
}

function resolveRoles(member) {
  const roles = Array.isArray(member?.roles) ? member.roles : [];
  return roles
    .map((role) => role?.name)
    .filter((name) => typeof name === 'string' && name.trim().length > 0);
}

function toSnapshot(member) {
  if (!member) return null;
  const contactEmail = member.contact?.emails?.[0]?.email;
  return {
    id: member._id || null,
    slug: member.profile?.slug || null,
    roles: resolveRoles(member),
    nickname:
      member.profile?.nickname ||
      member.profile?.slug ||
      member.contact?.name ||
      contactEmail ||
      'Member',
    email: contactEmail || null,
    authToken: null
  };
}

async function resolveAuthToken() {
  try {
    if (typeof authentication.getAuthToken === 'function') {
      const token = await authentication.getAuthToken();
      if (token) return token;
    }
  } catch (err) {
    console.warn('[dikpikBridge] getAuthToken failed', err);
  }
  try {
    if (typeof authentication.getMemberTokens === 'function') {
      const tokens = await authentication.getMemberTokens();
      const access =
        tokens?.memberTokens?.accessToken || tokens?.accessToken || null;
      if (access) return access;
    }
  } catch (err) {
    console.warn('[dikpikBridge] getMemberTokens failed', err);
  }
  return null;
}

export function getCachedMember() {
  return loadCachedSnapshot();
}

export async function getMemberSnapshot({ forceRefresh = false } = {}) {
  if (!forceRefresh) {
    const cached = loadCachedSnapshot();
    if (cached) return cached;
  }

  try {
    const member = await currentMember.getMember({ fieldsets: ['FULL'] });
    if (!member) {
      persistSnapshot(null);
      return null;
    }
    const snapshot = toSnapshot(member);
    snapshot.authToken = await resolveAuthToken();
    persistSnapshot(snapshot);
    return snapshot;
  } catch (err) {
    console.warn('[dikpikBridge] currentMember.getMember failed', err);
    return loadCachedSnapshot();
  }
}

export function listenForAuthChanges(handler) {
  if (typeof handler !== 'function') return () => {};

  authentication.onLogin(async () => {
    const snapshot = await getMemberSnapshot({ forceRefresh: true });
    handler(snapshot);
  });

  authentication.onLogout(() => {
    persistSnapshot(null);
    handler(null);
  });

  return () => {};
}
