const COMMON_HEADERS = {
  Accept: 'application/json'
};

let overrideBase = null;

function trimTrailingSlash(value) {
  return value.endsWith('/') ? value.replace(/\/+$/, '') : value;
}

function resolveBase() {
  if (overrideBase) return trimTrailingSlash(String(overrideBase).trim());
  if (typeof window !== 'undefined') {
    if (window.DIKPIK_API_BASE) {
      return trimTrailingSlash(String(window.DIKPIK_API_BASE).trim());
    }
    if (window.DIKPIK_BAZAAR?.apiBase) {
      return trimTrailingSlash(String(window.DIKPIK_BAZAAR.apiBase).trim());
    }
    if (window.location?.origin) {
      return `${window.location.origin.replace(/\/+$/, '')}/_functions`;
    }
  }
  return 'https://www.dikpik.io/_functions';
}

function buildUrl(path) {
  const base = resolveBase();
  const cleanBase = trimTrailingSlash(base);
  const cleanPath = String(path || '').replace(/^\/+/, '');
  return cleanPath ? `${cleanBase}/${cleanPath}` : cleanBase;
}

function createFetchOptions(method, body, init = {}) {
  const headers = { ...COMMON_HEADERS, ...(init.headers || {}) };
  let payload;
  if (body !== undefined) {
    headers['Content-Type'] = headers['Content-Type'] || 'application/json';
    payload = headers['Content-Type'].includes('application/json') ? JSON.stringify(body) : body;
  }
  return {
    mode: 'cors',
    credentials: 'include',
    ...init,
    method,
    headers,
    body: payload
  };
}

async function parseResponse(res) {
  if (res.status === 204) return null;
  const contentType = res.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    return res.json().catch(() => null);
  }
  return res.text().catch(() => null);
}

async function handleResponse(res) {
  const payload = await parseResponse(res);
  if (!res.ok) {
    const error = new Error(
      (payload && (payload.error || payload.message)) || res.statusText || `HTTP ${res.status}`
    );
    error.status = res.status;
    error.payload = payload;
    throw error;
  }
  return payload;
}

async function request(method, path, body, init) {
  const url = buildUrl(path);
  const options = createFetchOptions(method, body, init);
  const res = await fetch(url, options);
  return handleResponse(res);
}

export function configureApi({ base } = {}) {
  overrideBase = base ? String(base).trim() : null;
}

export function apiGet(path, init) {
  return request('GET', path, undefined, init);
}

export function apiPost(path, body, init) {
  return request('POST', path, body, init);
}

export function apiPatch(path, body, init) {
  return request('PATCH', path, body, init);
}

export function apiDelete(path, init) {
  return request('DELETE', path, undefined, init);
}

export function fetchListings(init) {
  return apiGet('listings', init);
}

export function createListing(payload, init) {
  return apiPost('listings', payload, init);
}

export function deleteListing(id, init) {
  return apiDelete(`listings/${id}`, init);
}

export function listWantedPosts(init) {
  return apiGet('wanted', init);
}

export function getMyWantedPosts(init) {
  return apiGet('wanted/mine', init);
}

export function createWantedPost(payload, init) {
  return apiPost('wanted', payload, init);
}

export function updateWantedPost(id, payload, init) {
  return apiPatch(`wanted/${id}`, payload, init);
}

export function deleteWantedPost(id, init) {
  return apiDelete(`wanted/${id}`, init);
}

export function fetchWantedContact(id, init) {
  return apiGet(`wanted/${id}/contact`, init);
}

export function respondToWanted(id, payload, init) {
  return apiPost(`wanted/${id}/respond`, payload, init);
}
