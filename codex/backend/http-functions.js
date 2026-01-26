import { response } from 'wix-http-functions';
import wixData from 'wix-data';
import { currentMember } from 'wix-members-backend';
import {
  WANTED_COLLECTION,
  WantedError,
  normalizeWantedPayload,
  shapeWantedRecord,
  getOwnerId
} from './wantedUtils.js';

const LISTINGS_COLLECTION = 'Import2';
const WANTED_RESPONSES_COLLECTION = 'WantedResponses';

const ALLOWED_ORIGINS = [
  'https://www.dikpik.io',
  'https://www-dikpik-io.filesusr.com',
  'https://editor.wix.com',
  'https://manage.wix.com',
  'https://create.editorx.com',
  'https://manage.editorx.com'
];

const DEFAULT_ORIGIN = ALLOWED_ORIGINS[0];

function pickOrigin(request) {
  const headers = request?.headers || {};
  const rawOrigin = headers.origin || headers.Origin || '';
  const origin = String(rawOrigin).trim();
  if (ALLOWED_ORIGINS.includes(origin)) return origin;
  return DEFAULT_ORIGIN;
}

function corsHeaders(origin, request) {
  const headers = request?.headers || {};
  const acrh =
    headers['access-control-request-headers'] ||
    headers['Access-Control-Request-Headers'] ||
    'Content-Type, Authorization';

  return {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Methods': 'GET,POST,PATCH,DELETE,OPTIONS',
    'Access-Control-Allow-Headers': acrh,
    'Access-Control-Allow-Credentials': 'true',
    'Access-Control-Max-Age': '86400',
    'Access-Control-Expose-Headers': 'Content-Type, Vary',
    Vary: 'Origin, Access-Control-Request-Headers'
  };
}

function httpJson(status, data, origin, request, extraHeaders = {}) {
  return response({
    status,
    headers: { ...corsHeaders(origin, request), ...extraHeaders },
    body: JSON.stringify(data ?? null)
  });
}

function optionsResponse(origin, request) {
  return response({
    status: 204,
    headers: corsHeaders(origin, request)
  });
}

function compact(obj) {
  return Object.fromEntries(Object.entries(obj).filter(([, value]) => value !== undefined));
}

async function parseJson(request) {
  try {
    const raw = await request.body?.text();
    if (!raw) return {};
    return JSON.parse(raw);
  } catch (_err) {
    throw new WantedError('INVALID_JSON', 400);
  }
}

async function fetchCurrentMember() {
  try {
    return await currentMember.getMember({ fieldsets: ['FULL'] });
  } catch (_err) {
    return null;
  }
}

async function requireMember() {
  const member = await fetchCurrentMember();
  if (!member) throw new WantedError('LOGIN_REQUIRED', 401);
  return member;
}

function memberDisplayName(member) {
  if (!member) return 'Member';
  const nickname = member.profile?.nickname;
  if (nickname) return nickname;
  const slug = member.profile?.slug;
  if (slug) return slug;
  const name = member.contact?.name;
  if (name) return name;
  const email = member.contact?.emails?.[0]?.email;
  if (email) return email;
  return 'Member';
}

async function getListingById(id) {
  try {
    return await wixData.get(LISTINGS_COLLECTION, id);
  } catch (_err) {
    return null;
  }
}

function toNumber(value) {
  const num = Number(value);
  return Number.isFinite(num) ? num : undefined;
}

function toText(value) {
  if (value === undefined || value === null) return undefined;
  const str = String(value).trim();
  return str || undefined;
}

function toDate(value) {
  if (!value) return undefined;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? undefined : date;
}

function shapeAuction(record) {
  if (!record) return null;
  const tokenNum = toNumber(record.tokenId);
  const priceNum = toNumber(record.price);
  const minNum = toNumber(record.min);
  const expires = record.expiresAt ? new Date(record.expiresAt) : null;
  return {
    id: record._id,
    kind: 'auction',
    title: record.title || '',
    tokenId: tokenNum != null ? tokenNum : null,
    price: priceNum != null ? priceNum : null,
    currency: record.currency || null,
    min: minNum != null ? minNum : null,
    min_ccy: record.min_ccy || record.currency || null,
    traitQuery: record.traitQuery || null,
    notes: record.notes || null,
    ownerMemberId: record.ownerMemberId || getOwnerId(record) || null,
    escrowed: Boolean(record.escrowed),
    createdAt: record.createdAt || record._createdDate || null,
    expiresAt: expires ? expires.toISOString() : null
  };
}

function buildErrorBody(err) {
  const message = err instanceof WantedError ? err.message : 'Internal error';
  const payload = { error: message };
  if (err instanceof WantedError && err.details) {
    payload.details = err.details;
  }
  return payload;
}

function handleError(err, origin, request) {
  const status = err?.statusCode || err?.status || 500;
  if (status >= 500) {
    console.error('[bazaar] http-functions unhandled error', err);
  }
  return httpJson(status, buildErrorBody(err), origin, request);
}

async function listWanted(origin, request) {
  const member = await fetchCurrentMember();
  const viewerId = member?._id ? String(member._id) : null;
  const results = await wixData
    .query(WANTED_COLLECTION)
    .eq('kind', 'wanted')
    .descending('_createdDate')
    .limit(1000)
    .find();
  const items = results.items.map((item) =>
    shapeWantedRecord(item, { includeContact: Boolean(viewerId), viewerId })
  );
  return httpJson(200, items, origin, request);
}

async function listWantedMine(origin, request) {
  const member = await requireMember();
  const memberId = String(member._id);

  let results = await wixData
    .query(WANTED_COLLECTION)
    .eq('kind', 'wanted')
    .eq('ownerMemberId', memberId)
    .descending('_createdDate')
    .limit(1000)
    .find();

  if (!results.items.length) {
    results = await wixData
      .query(WANTED_COLLECTION)
      .eq('kind', 'wanted')
      .eq('_owner', memberId)
      .descending('_createdDate')
      .limit(1000)
      .find();
  }

  const items = results.items.map((item) =>
    shapeWantedRecord(item, { includeContact: true, viewerId: memberId })
  );
  return httpJson(200, items, origin, request);
}

async function createWanted(body, origin, request) {
  const member = await requireMember();
  const memberId = String(member._id);
  const normalized = normalizeWantedPayload(body || {}, { partial: false });
  const now = new Date();
  const doc = compact({
    ...normalized,
    ownerMemberId: memberId,
    ownerDisplayName: memberDisplayName(member),
    createdAt: now,
    updatedAt: now
  });
  const saved = await wixData.insert(WANTED_COLLECTION, doc, { suppressAuth: true });
  const shaped = shapeWantedRecord(saved, { includeContact: true, viewerId: memberId });
  return httpJson(201, shaped, origin, request);
}

async function updateWanted(id, payload, origin, request) {
  const member = await requireMember();
  const memberId = String(member._id);
  const existing = await getListingById(id);
  if (!existing || existing.kind !== 'wanted') {
    throw new WantedError('Wanted post not found.', 404);
  }
  const ownerId = getOwnerId(existing);
  if (!ownerId || String(ownerId) !== memberId) {
    throw new WantedError('You are not allowed to perform this action.', 403);
  }
  const normalized = normalizeWantedPayload(payload || {}, { partial: true });
  const updateDoc = compact({
    ...normalized,
    _id: id,
    ownerMemberId: ownerId,
    updatedAt: new Date()
  });
  const keys = Object.keys(updateDoc).filter((key) => key !== '_id');
  if (!keys.length) {
    throw new WantedError('NO_ALLOWED_FIELDS', 400);
  }
  const updated = await wixData.update(WANTED_COLLECTION, updateDoc, { suppressAuth: true });
  const merged = { ...existing, ...updated };
  const shaped = shapeWantedRecord(merged, { includeContact: true, viewerId: memberId });
  return httpJson(200, shaped, origin, request);
}

async function deleteWanted(id, origin, request) {
  const member = await requireMember();
  const memberId = String(member._id);
  const listing = await getListingById(id);
  if (!listing || listing.kind !== 'wanted') {
    throw new WantedError('Wanted post not found.', 404);
  }
  const ownerId = getOwnerId(listing);
  if (!ownerId || String(ownerId) !== memberId) {
    throw new WantedError('You are not allowed to perform this action.', 403);
  }
  await wixData.remove(WANTED_COLLECTION, id);
  return httpJson(200, { ok: true }, origin, request);
}

async function wantedContact(id, origin, request) {
  const member = await requireMember();
  const listing = await getListingById(id);
  if (!listing || listing.kind !== 'wanted') {
    throw new WantedError('Wanted post not found.', 404);
  }
  const shaped = shapeWantedRecord(listing, {
    includeContact: true,
    viewerId: String(member._id)
  });
  const contact = {
    contactLine: shaped.contactLine,
    contactWhatsApp: shaped.contactWhatsApp,
    contactTelegram: shaped.contactTelegram,
    contactEmail: shaped.contactEmail,
    contactPhone: shaped.contactPhone,
    contactMessage: shaped.contactMessage
  };
  return httpJson(200, contact, origin, request);
}

function sanitizeResponsePayload(payload) {
  const messageRaw = typeof payload?.message === 'string' ? payload.message.trim() : '';
  if (!messageRaw) {
    throw new WantedError('MESSAGE_REQUIRED', 400, { field: 'message' });
  }
  let offer;
  if (payload?.offer !== undefined && payload.offer !== null && payload.offer !== '') {
    const num = Number(payload.offer);
    if (!Number.isFinite(num)) {
      throw new WantedError('OFFER_INVALID', 400, { field: 'offer' });
    }
    offer = Number(num);
  }
  return { message: messageRaw, offer };
}

async function wantedRespond(id, payload, origin, request) {
  const member = await requireMember();
  const listing = await getListingById(id);
  if (!listing || listing.kind !== 'wanted') {
    throw new WantedError('Wanted post not found.', 404);
  }
  const { message, offer } = sanitizeResponsePayload(payload || {});
  const record = compact({
    listingId: id,
    responderMemberId: String(member._id),
    message,
    offer,
    createdAt: new Date()
  });
  const saved = await wixData.insert(WANTED_RESPONSES_COLLECTION, record, { suppressAuth: true });
  return httpJson(201, { ok: true, id: saved._id }, origin, request);
}

export function get_ping(request) {
  const origin = pickOrigin(request);
  const headers = {
    ...corsHeaders(origin, request),
    'Content-Type': 'text/plain'
  };
  return response({ status: 200, headers, body: 'pong' });
}

export function options_listings(request) {
  const origin = pickOrigin(request);
  return optionsResponse(origin, request);
}

export function options_wanted(request) {
  const origin = pickOrigin(request);
  return optionsResponse(origin, request);
}

export function options_bids(request) {
  const origin = pickOrigin(request);
  return optionsResponse(origin, request);
}

export async function get_listings(request) {
  const origin = pickOrigin(request);
  try {
    const now = new Date();
    const results = await wixData
      .query(LISTINGS_COLLECTION)
      .eq('kind', 'auction')
      .gt('expiresAt', now)
      .descending('_createdDate')
      .limit(1000)
      .find();
    const items = results.items.map(shapeAuction).filter(Boolean);
    return httpJson(200, items, origin, request);
  } catch (err) {
    return handleError(err, origin, request);
  }
}

function normalizeAuctionPayload(body, ownerMemberId) {
  const title = toText(body.title);
  const tokenId = toNumber(body.tokenId);
  const expiresAt = toDate(body.expiresAt);
  if (!title) throw new WantedError('Missing "title".', 400);
  if (!Number.isFinite(tokenId)) throw new WantedError('"tokenId" is required for auctions.', 400);
  if (!expiresAt) throw new WantedError('"expiresAt" is required for auctions.', 400);
  const payload = compact({
    kind: 'auction',
    title,
    tokenId,
    price: toNumber(body.price),
    currency: toText(body.currency)?.toUpperCase() || null,
    min: toNumber(body.min),
    min_ccy: toText(body.min_ccy)?.toUpperCase() || null,
    traitQuery: toText(body.traitQuery),
    notes: toText(body.notes),
    contact: toText(body.contact),
    expiresAt,
    ownerMemberId: ownerMemberId ? String(ownerMemberId) : undefined
  });
  return payload;
}

export async function post_listings(request) {
  const origin = pickOrigin(request);
  try {
    const body = await parseJson(request);
    const kindRaw = typeof body?.kind === 'string' ? body.kind.toLowerCase() : 'auction';
    if (kindRaw === 'wanted') {
      return await createWanted(body, origin, request);
    }

    const member = await fetchCurrentMember();
    const ownerId = member?._id ? String(member._id) : undefined;
    const doc = normalizeAuctionPayload(body || {}, ownerId);
    const saved = await wixData.insert(LISTINGS_COLLECTION, doc, { suppressAuth: true });
    return httpJson(201, shapeAuction(saved), origin, request);
  } catch (err) {
    return handleError(err, origin, request);
  }
}

export async function del_listings(request) {
  const origin = pickOrigin(request);
  const [id] = request.path || [];
  if (!id) {
    return httpJson(400, { error: 'Missing id.' }, origin, request);
  }
  try {
    const member = await requireMember();
    const memberId = String(member._id);
    const listing = await getListingById(id);
    if (!listing) throw new WantedError('Listing not found.', 404);
    const ownerId = listing.ownerMemberId || getOwnerId(listing);
    if (!ownerId || String(ownerId) !== memberId) {
      throw new WantedError('You are not allowed to perform this action.', 403);
    }
    await wixData.remove(LISTINGS_COLLECTION, id);
    return httpJson(200, { ok: true }, origin, request);
  } catch (err) {
    return handleError(err, origin, request);
  }
}

export async function get_wanted(request) {
  const origin = pickOrigin(request);
  const [first, second] = request.path || [];
  try {
    if (!first) {
      return await listWanted(origin, request);
    }
    if (first === 'mine' && !second) {
      return await listWantedMine(origin, request);
    }

    const id = first;
    if (second === 'contact') {
      return await wantedContact(id, origin, request);
    }
    if (!second) {
      const member = await fetchCurrentMember();
      const viewerId = member?._id ? String(member._id) : null;
      const listing = await getListingById(id);
      if (!listing || listing.kind !== 'wanted') {
        return httpJson(404, { error: 'Wanted post not found.' }, origin, request);
      }
      const shaped = shapeWantedRecord(listing, {
        includeContact: Boolean(viewerId),
        viewerId
      });
      return httpJson(200, shaped, origin, request);
    }
    return httpJson(400, { error: 'Unsupported wanted endpoint.' }, origin, request);
  } catch (err) {
    return handleError(err, origin, request);
  }
}

export async function post_wanted(request) {
  const origin = pickOrigin(request);
  const [id, action] = request.path || [];
  try {
    if (!id) {
      const body = await parseJson(request);
      return await createWanted(body, origin, request);
    }
    if (action === 'respond') {
      const body = await parseJson(request);
      return await wantedRespond(id, body, origin, request);
    }
    return httpJson(400, { error: 'Unsupported wanted endpoint.' }, origin, request);
  } catch (err) {
    return handleError(err, origin, request);
  }
}

export async function patch_wanted(request) {
  const origin = pickOrigin(request);
  const [id] = request.path || [];
  if (!id) {
    return httpJson(400, { error: 'Missing id.' }, origin, request);
  }
  try {
    const body = await parseJson(request);
    return await updateWanted(id, body, origin, request);
  } catch (err) {
    return handleError(err, origin, request);
  }
}

export async function del_wanted(request) {
  const origin = pickOrigin(request);
  const [id] = request.path || [];
  if (!id) {
    return httpJson(400, { error: 'Missing id.' }, origin, request);
  }
  try {
    return await deleteWanted(id, origin, request);
  } catch (err) {
    return handleError(err, origin, request);
  }
}
