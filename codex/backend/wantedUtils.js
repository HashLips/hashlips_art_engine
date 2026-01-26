// Utility helpers shared by backend wanted-post implementations.
// Handles validation, normalization, and serialization so that both HTTP
// functions and web modules can rely on the same logic.

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_STATUS_LENGTH = 24;
const DEFAULT_COLLECTION = 'Import2';

export const WANTED_COLLECTION = DEFAULT_COLLECTION;

export class WantedError extends Error {
  constructor(message, statusCode = 400, details) {
    super(message);
    this.name = 'WantedError';
    this.statusCode = statusCode;
    if (details) this.details = details;
  }
}

function removeUndefined(obj) {
  return Object.fromEntries(Object.entries(obj).filter(([, value]) => value !== undefined));
}

function requiredString(value, fieldLabel, maxLength = 255) {
  if (value === undefined || value === null) {
    throw new WantedError(`${fieldLabel} is required.`, 400, { field: fieldLabel });
  }
  const str = String(value).trim();
  if (!str) {
    throw new WantedError(`${fieldLabel} is required.`, 400, { field: fieldLabel });
  }
  return maxLength && str.length > maxLength ? str.slice(0, maxLength) : str;
}

function optionalString(value, maxLength = 255) {
  if (value === undefined) return undefined;
  if (value === null) return null;
  const str = String(value).trim();
  if (!str) return null;
  return maxLength && str.length > maxLength ? str.slice(0, maxLength) : str;
}

function optionalMultiline(value, maxLength = 6000) {
  if (value === undefined) return undefined;
  if (value === null) return null;
  let str = String(value).trim();
  if (!str) return null;
  str = str.replace(/\r\n/g, '\n');
  return maxLength && str.length > maxLength ? str.slice(0, maxLength) : str;
}

function optionalEmail(value) {
  if (value === undefined) return undefined;
  if (value === null) return null;
  const str = String(value).trim();
  if (!str) return null;
  if (!EMAIL_RE.test(str)) {
    throw new WantedError('Invalid email address.', 400, { field: 'contactEmail' });
  }
  const email = str.toLowerCase();
  return email.length > 254 ? email.slice(0, 254) : email;
}

function optionalPhone(value) {
  if (value === undefined) return undefined;
  if (value === null) return null;
  const str = String(value).trim();
  if (!str) return null;
  const normalized = str.replace(/[^\d+().\- ]+/g, '');
  return normalized.length > 64 ? normalized.slice(0, 64) : normalized;
}

function optionalBudget(value) {
  if (value === undefined) return undefined;
  if (value === null || value === '') return null;
  const num = Number(value);
  if (!Number.isFinite(num)) {
    throw new WantedError('Budget must be a number.', 400, { field: 'budget' });
  }
  if (num < 0) {
    throw new WantedError('Budget must be zero or greater.', 400, { field: 'budget' });
  }
  return Number(num.toFixed(8));
}

function optionalTokenId(value) {
  if (value === undefined) return undefined;
  if (value === null || value === '') return null;
  const num = Number(value);
  if (!Number.isFinite(num)) {
    throw new WantedError('tokenId must be a number.', 400, { field: 'tokenId' });
  }
  if (num < 0) {
    throw new WantedError('tokenId must be zero or greater.', 400, { field: 'tokenId' });
  }
  return Math.floor(num);
}

function sanitizeCurrency(value) {
  if (value === undefined || value === null || value === '') return 'ETH';
  const str = String(value).trim().toUpperCase();
  if (!str) return 'ETH';
  if (str.length > 12) {
    throw new WantedError('Currency code is too long.', 400, { field: 'currency' });
  }
  return str;
}

function sanitizeStatus(value, defaultValue) {
  if (value === undefined) return defaultValue;
  if (value === null || value === '') return null;
  const str = String(value).trim();
  if (!str) return null;
  const upper = str.toUpperCase();
  if (upper.length > MAX_STATUS_LENGTH) {
    throw new WantedError('Status value is too long.', 400, { field: 'status' });
  }
  return upper;
}

function sanitizeChain(value, currency) {
  if (value === undefined || value === null || value === '') {
    return currency === 'SOL' ? 'solana' : 'evm';
  }
  const str = String(value).trim().toLowerCase();
  if (!str) return currency === 'SOL' ? 'solana' : 'evm';
  if (['sol', 'solana', 'sol-mainnet', 'solana-mainnet'].includes(str)) return 'solana';
  return 'evm';
}

function sanitizeWalletEntry(entry) {
  if (!entry || typeof entry !== 'object') return null;
  const address = optionalString(entry.address, 200);
  if (address === undefined || address === null) return null;
  const chain = sanitizeChain(entry.chain);
  const wallet = {
    address: chain === 'solana' ? address : address.toLowerCase(),
    chain,
    verified: Boolean(entry.verified)
  };

  const type = optionalString(entry.type, 32);
  if (type) wallet.type = type;

  const signature = optionalMultiline(entry.signature, 4000);
  if (signature) wallet.signature = signature;

  const message = optionalMultiline(entry.message, 4000);
  if (message) wallet.message = message;

  if (entry.connectedAt) wallet.connectedAt = String(entry.connectedAt);

  return wallet;
}

function sanitizeWallets(value) {
  if (value === undefined) return undefined;
  if (value === null) return [];
  if (!Array.isArray(value)) return [];
  return value.map(sanitizeWalletEntry).filter(Boolean);
}

function toNumberOrNull(value) {
  if (value === undefined || value === null || value === '') return null;
  const num = Number(value);
  return Number.isFinite(num) ? Number(num) : null;
}

function toTokenIdOrNull(value) {
  if (value === undefined || value === null || value === '') return null;
  const num = Number(value);
  return Number.isFinite(num) ? Math.floor(num) : null;
}

export function normalizeWantedPayload(input = {}, { partial = false } = {}) {
  if (!input || typeof input !== 'object') {
    throw new WantedError('Invalid payload.', 400);
  }

  const output = {};

  if (!partial || Object.prototype.hasOwnProperty.call(input, 'title')) {
    output.title = requiredString(input.title, 'title', 140);
  }

  if (!partial || Object.prototype.hasOwnProperty.call(input, 'traitQuery')) {
    if (Object.prototype.hasOwnProperty.call(input, 'traitQuery')) {
      const trait = optionalString(input.traitQuery, 240);
      if (trait !== undefined) output.traitQuery = trait;
    }
  }

  if (!partial || Object.prototype.hasOwnProperty.call(input, 'tokenId')) {
    if (Object.prototype.hasOwnProperty.call(input, 'tokenId')) {
      const token = optionalTokenId(input.tokenId);
      if (token !== undefined) output.tokenId = token;
    }
  }

  if (!partial) {
    const hasToken = Object.prototype.hasOwnProperty.call(output, 'tokenId') && output.tokenId !== null && output.tokenId !== undefined;
    const traitSeed = Object.prototype.hasOwnProperty.call(output, 'traitQuery')
      ? output.traitQuery
      : optionalString(input.traitQuery, 240);
    const hasTrait = Boolean(traitSeed && traitSeed.length);
    if (!hasToken && !hasTrait) {
      throw new WantedError('Provide a tokenId or trait query.', 400, { field: 'tokenId' });
    }
  }

  if (!partial || Object.prototype.hasOwnProperty.call(input, 'budget') || Object.prototype.hasOwnProperty.call(input, 'price')) {
    const budgetSource = Object.prototype.hasOwnProperty.call(input, 'budget')
      ? input.budget
      : input.price;
    const budget = optionalBudget(budgetSource);
    if (budget === undefined) {
      if (!partial) throw new WantedError('Budget is required.', 400, { field: 'budget' });
    } else if (budget === null) {
      output.budget = null;
      output.price = null;
    } else {
      output.budget = budget;
      output.price = budget;
    }
  }

  if (!partial || Object.prototype.hasOwnProperty.call(input, 'currency')) {
    output.currency = sanitizeCurrency(input.currency);
  }

  if (!partial || Object.prototype.hasOwnProperty.call(input, 'status')) {
    output.status = sanitizeStatus(
      Object.prototype.hasOwnProperty.call(input, 'status') ? input.status : undefined,
      partial ? undefined : 'OPEN'
    );
  }

  if (!partial || Object.prototype.hasOwnProperty.call(input, 'description') || Object.prototype.hasOwnProperty.call(input, 'descriptionRich')) {
    const descriptionSource = Object.prototype.hasOwnProperty.call(input, 'descriptionRich')
      ? input.descriptionRich
      : input.description;
    const description = optionalMultiline(descriptionSource, 6000);
    if (description === undefined) {
      if (!partial) {
        output.description = '';
        output.descriptionRich = '';
      }
    } else {
      output.description = description ?? '';
      output.descriptionRich = description ?? '';
    }
  }

  if (!partial || Object.prototype.hasOwnProperty.call(input, 'contactLine')) {
    const val = optionalString(input.contactLine, 120);
    if (val !== undefined) output.contactLine = val;
  }
  if (!partial || Object.prototype.hasOwnProperty.call(input, 'contactWhatsApp')) {
    const val = optionalString(input.contactWhatsApp, 120);
    if (val !== undefined) output.contactWhatsApp = val;
  }
  if (!partial || Object.prototype.hasOwnProperty.call(input, 'contactTelegram')) {
    const val = optionalString(input.contactTelegram, 120);
    if (val !== undefined) output.contactTelegram = val;
  }
  if (!partial || Object.prototype.hasOwnProperty.call(input, 'contactEmail')) {
    const val = optionalEmail(input.contactEmail);
    if (val !== undefined) output.contactEmail = val;
  }
  if (!partial || Object.prototype.hasOwnProperty.call(input, 'contactPhone')) {
    const val = optionalPhone(input.contactPhone);
    if (val !== undefined) output.contactPhone = val;
  }
  if (!partial || Object.prototype.hasOwnProperty.call(input, 'contactMessage')) {
    const val = optionalMultiline(input.contactMessage, 2000);
    if (val !== undefined) output.contactMessage = val ?? null;
  }

  if (!partial || Object.prototype.hasOwnProperty.call(input, 'wallets')) {
    const wallets = sanitizeWallets(input.wallets);
    if (wallets !== undefined) output.wallets = wallets;
  }

  if (!partial || Object.prototype.hasOwnProperty.call(input, 'chain') || output.currency) {
    const chain = sanitizeChain(input.chain, output.currency || sanitizeCurrency(input.currency));
    if (chain !== undefined) output.chain = chain;
  }

  if (!partial) {
    output.kind = 'wanted';
  }

  return removeUndefined(output);
}

export function getOwnerId(record) {
  if (!record) return null;
  const owner =
    record.ownerMemberId ||
    record.ownerId ||
    record.owner ||
    record._owner ||
    null;
  return owner != null ? String(owner) : null;
}

function sanitizeWalletEntrySafe(entry) {
  try {
    return sanitizeWalletEntry(entry);
  } catch (_err) {
    return null;
  }
}

export function shapeWantedRecord(record, { includeContact = false, viewerId } = {}) {
  if (!record) return null;
  const ownerId = getOwnerId(record);
  const viewerIsOwner = viewerId && ownerId && String(ownerId) === String(viewerId);
  const canViewContact = includeContact || viewerIsOwner;

  const currencyRaw = typeof record.currency === 'string' ? record.currency.trim() : '';
  const currency = currencyRaw ? currencyRaw.toUpperCase().slice(0, 12) : null;
  const chain = sanitizeChain(record.chain, currency || 'ETH');

  const budget = toNumberOrNull(record.budget != null ? record.budget : record.price);
  const tokenId = toTokenIdOrNull(record.tokenId);

  const walletsRaw = Array.isArray(record.wallets) ? record.wallets : [];
  const wallets = walletsRaw.map(sanitizeWalletEntrySafe).filter(Boolean);

  const shaped = {
    _id: record._id,
    id: record._id,
    kind: 'wanted',
    title: record.title || '',
    traitQuery: record.traitQuery || null,
    tokenId,
    budget,
    price: budget,
    currency,
    status: record.status ? String(record.status).toUpperCase().slice(0, MAX_STATUS_LENGTH) : 'OPEN',
    description: record.description ?? record.notes ?? '',
    descriptionRich: record.descriptionRich ?? record.description ?? '',
    chain,
    ownerId,
    ownerMemberId: ownerId,
    ownerDisplayName: record.ownerDisplayName || record.ownerName || null,
    createdAt: record.createdAt || record._createdDate || null,
    updatedAt: record.updatedAt || record._updatedDate || null,
    wallets
  };

  shaped.contactLine = canViewContact ? record.contactLine ?? null : null;
  shaped.contactWhatsApp = canViewContact ? record.contactWhatsApp ?? null : null;
  shaped.contactTelegram = canViewContact ? record.contactTelegram ?? null : null;
  shaped.contactEmail = canViewContact ? record.contactEmail ?? null : null;
  shaped.contactPhone = canViewContact ? record.contactPhone ?? null : null;
  shaped.contactMessage = canViewContact ? (record.contactMessage ?? record.message ?? null) : null;

  return shaped;
}
