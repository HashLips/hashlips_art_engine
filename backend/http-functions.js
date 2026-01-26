// Copy this entire file into Wix Dev Mode -> backend/http-functions.js
// It provides simple listings/bids/relay HTTP functions with CORS for preview + prod.
import { response } from 'wix-http-functions';
import wixData from 'wix-data';

const LISTINGS_COLLECTION = 'Import2';
const BIDS_COLLECTION = 'Import3';
const RELAY_COLLECTION = 'Import4';
const FALLBACK_CACHE = {
  listings: [],
  bids: [],
  relay: []
};

const ALLOWED_ORIGINS = [
  'https://www.dikpik.io',
  'https://www-dikpik-io.filesusr.com',
  'https://editor.wix.com',
  'https://manage.wix.com',
  'https://create.editorx.com',
  'https://manage.editorx.com'
];
const ORIGIN_SUFFIXES = ['.filesusr.com'];
const DEFAULT_ORIGIN = ALLOWED_ORIGINS[0];

function isAllowedOrigin(origin) {
  if (!origin) return false;
  if (ALLOWED_ORIGINS.includes(origin)) return true;
  try {
    const { hostname } = new URL(origin);
    return ORIGIN_SUFFIXES.some((suffix) => hostname.endsWith(suffix));
  } catch (_err) {
    return false;
  }
}

function pickOrigin(request) {
  const raw = request?.headers?.origin || request?.headers?.Origin || '';
  const origin = String(raw || '').trim();
  return isAllowedOrigin(origin) ? origin : DEFAULT_ORIGIN;
}

function corsHeaders(origin, request) {
  const acrh =
    request?.headers?.['access-control-request-headers'] ||
    request?.headers?.['Access-Control-Request-Headers'] ||
    'Content-Type, Authorization';
  return {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Credentials': 'true',
    'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
    'Access-Control-Allow-Headers': acrh,
    'Access-Control-Max-Age': '86400',
    Vary: 'Origin, Access-Control-Request-Headers'
  };
}

function json(status, payload, origin, request) {
  return response({
    status,
    headers: corsHeaders(origin, request),
    body: JSON.stringify(payload ?? null)
  });
}

function options(origin, request) {
  return response({
    status: 204,
    headers: corsHeaders(origin, request)
  });
}

async function parseBody(request) {
  try {
    const raw = await request.body?.text();
    if (!raw) return {};
    return JSON.parse(raw);
  } catch (_err) {
    throw new Error('INVALID_JSON');
  }
}

function logDataWarning(context, err) {
  console.warn(`[bazaar:http-functions] ${context} failed`, err?.message || err);
}

async function listCollection(collection, fallbackKey) {
  const pageSize = 100;
  try {
    let results = await wixData.query(collection).limit(pageSize).find();
    const items = [...results.items];
    while (results.hasNext()) {
      results = await results.next();
      items.push(...results.items);
    }
    return { items, fallback: false };
  } catch (err) {
    logDataWarning(`list ${collection}`, err);
    return { items: [...FALLBACK_CACHE[fallbackKey]], fallback: true };
  }
}

// ---- listings ----
export function options_listings(request) {
  return options(pickOrigin(request), request);
}

export async function get_listings(request) {
  const origin = pickOrigin(request);
  const { items, fallback } = await listCollection(LISTINGS_COLLECTION, 'listings');
  return json(200, { items, fallback }, origin, request);
}

async function insertWithFallback(collection, payload, fallbackKey) {
  try {
    return await wixData.insert(collection, payload, { suppressAuth: true });
  } catch (err) {
    logDataWarning(`insert ${collection}`, err);
    const record = { ...payload, _id: payload._id || `fallback_${fallbackKey}_${Date.now()}` };
    FALLBACK_CACHE[fallbackKey].unshift(record);
    return record;
  }
}

export async function post_listings(request) {
  const origin = pickOrigin(request);
  try {
    const body = await parseBody(request);
    const payload = {
      ...body,
      kind: body?.kind || 'auction',
      _createdDate: new Date()
    };
    const saved = await insertWithFallback(LISTINGS_COLLECTION, payload, 'listings');
    return json(201, saved, origin, request);
  } catch (err) {
    const status = err.message === 'INVALID_JSON' ? 400 : 500;
    return json(status, { error: err.message || 'Failed to save listing.' }, origin, request);
  }
}

// ---- bids ----
export function options_bids(request) {
  return options(pickOrigin(request), request);
}

export async function get_bids(request) {
  const origin = pickOrigin(request);
  const [listingId] = request.path || [];
  try {
    let query = wixData.query(BIDS_COLLECTION).ascending('_createdDate');
    if (listingId) {
      query = query.eq('listingId', listingId);
    }
    const items = await listCollectionFromQuery(query, listingId);
    return json(200, { items }, origin, request);
  } catch (err) {
    logDataWarning('get_bids', err);
    const items = FALLBACK_CACHE.bids.filter((bid) =>
      listingId ? bid.listingId === listingId : true
    );
    return json(200, { items, fallback: true }, origin, request);
  }
}

async function listCollectionFromQuery(query, listingId) {
  const pageSize = 100;
  try {
    let results = await query.limit(pageSize).find();
    const items = [...results.items];
    while (results.hasNext()) {
      results = await results.next();
      items.push(...results.items);
    }
    return items;
  } catch (err) {
    logDataWarning(`query bids ${listingId || 'all'}`, err);
    return FALLBACK_CACHE.bids.filter((bid) =>
      listingId ? bid.listingId === listingId : true
    );
  }
}

export async function post_bids(request) {
  const origin = pickOrigin(request);
  try {
    const body = await parseBody(request);
    if (!body?.listingId) {
      return json(400, { error: 'listingId is required.' }, origin, request);
    }
    if (typeof body?.amount !== 'number') {
      return json(400, { error: 'amount is required.' }, origin, request);
    }
    const bid = {
      listingId: String(body.listingId),
      amount: Number(body.amount),
      bidder: String(body.bidder || 'anonymous'),
      status: body.status || 'RECEIVED',
      _createdDate: new Date()
    };
    const saved = await insertWithFallback(BIDS_COLLECTION, bid, 'bids');
    return json(201, saved, origin, request);
  } catch (err) {
    const status = err.message === 'INVALID_JSON' ? 400 : 500;
    return json(status, { error: err.message || 'Failed to save bid.' }, origin, request);
  }
}

// ---- relay settings ----
export function options_relay(request) {
  return options(pickOrigin(request), request);
}

export async function get_relay(request) {
  const origin = pickOrigin(request);
  const { items, fallback } = await listCollection(RELAY_COLLECTION, 'relay');
  return json(200, { items, fallback }, origin, request);
}

async function updateWithFallback(collection, doc, fallbackKey) {
  try {
    return await wixData.update(collection, doc, { suppressAuth: true });
  } catch (err) {
    logDataWarning(`update ${collection}`, err);
    if (doc?._id) {
      const idx = FALLBACK_CACHE[fallbackKey].findIndex((item) => item._id === doc._id);
      if (idx >= 0) {
        FALLBACK_CACHE[fallbackKey][idx] = doc;
      } else {
        FALLBACK_CACHE[fallbackKey].push(doc);
      }
    } else {
      FALLBACK_CACHE[fallbackKey].push({ ...doc, _id: `fallback_${fallbackKey}_${Date.now()}` });
    }
    return doc;
  }
}

export async function post_relay(request) {
  const origin = pickOrigin(request);
  try {
    const body = await parseBody(request);
    const doc = { ...body, _updatedDate: new Date() };
    const saved = await updateWithFallback(RELAY_COLLECTION, doc, 'relay');
    return json(200, saved, origin, request);
  } catch (err) {
    const status = err.message === 'INVALID_JSON' ? 400 : 500;
    return json(status, { error: err.message || 'Failed to save relay data.' }, origin, request);
  }
}
