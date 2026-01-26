import wixData from 'wix-data';
import { currentMember } from 'wix-members-backend';
import { AUCTION_CONFIG, WantedError } from './wantedUtils.js';
import {
  sendBidConfirmation,
  sendOutbidNotice,
  sendWinningEmail,
  sendBuyNowEmail
} from './email.js';

const AUCTIONS_COLLECTION = 'Import2';
const BIDS_COLLECTION = 'Import3';
const BIDDER_PUBLIC_COLLECTION = 'BidderPublic';
const BID_STATUS_RECEIVED = 'RECEIVED';
const BID_STATUS_WITHDRAWN = 'WITHDRAWN';
const AUCTION_STATUS_OPEN = 'OPEN';
const AUCTION_STATUS_CLOSED = 'CLOSED';
const AUCTION_STATUS_SOLD = 'SOLD';
const RATE_LIMIT_WINDOW_MS = 15_000;
const RATE_LIMIT_MAX = 5;

const rateLimitMap = new Map();
const auctionLocks = new Map();

/**
 * Simple in-memory lock per auction to avoid race conditions between bids.
 * @param {string} auctionId
 * @param {() => Promise<any>} fn
 * @returns {Promise<any>}
 */
async function withAuctionLock(auctionId, fn) {
  const prev = auctionLocks.get(auctionId) || Promise.resolve();
  let release;
  const next = prev
    .catch(() => {})
    .then(async () => {
      try {
        return await fn();
      } finally {
        if (release) release();
      }
    });
  auctionLocks.set(auctionId, next);
  release = () => {
    if (auctionLocks.get(auctionId) === next) {
      auctionLocks.delete(auctionId);
    }
  };
  return next;
}

function normalizeCurrency(currency) {
  if (!currency) return 'ETH';
  const str = String(currency).trim().toUpperCase();
  if (!str) return 'ETH';
  if (!/^[A-Z0-9]{2,12}$/.test(str)) {
    throw new WantedError('Unsupported currency.', 400, { field: 'currency' });
  }
  return str;
}

function toNumber(value, field) {
  const num = Number(value);
  if (!Number.isFinite(num)) {
    throw new WantedError(`${field || 'Value'} must be a number.`, 400, { field });
  }
  return num;
}

function ensureAuctionOpen(auction) {
  if (!auction) {
    throw new WantedError('Auction not found.', 404);
  }
  const status = String(auction.status || AUCTION_STATUS_OPEN).toUpperCase();
  if (status !== AUCTION_STATUS_OPEN) {
    throw new WantedError('Auction is not accepting bids.', 409, { status });
  }
  if (auction.endsAt) {
    const ends = new Date(auction.endsAt);
    if (!Number.isNaN(ends.getTime()) && ends < new Date()) {
      throw new WantedError('Auction already ended.', 409);
    }
  }
}

function calculateMinimumBid(auction, currentHighest) {
  const base = currentHighest ? Number(currentHighest.amount) : Number(auction.startingPrice || auction.price || auction.reservePrice || 0);
  const increment = Number(auction.minIncrement ?? AUCTION_CONFIG.MIN_INCREMENT_DEFAULT);
  return currentHighest ? base + increment : Math.max(base, increment);
}

function convertUsdToCurrency(stepUsd, currency) {
  const normalizedCurrency = normalizeCurrency(currency);
  const usd = Number(stepUsd);
  if (!Number.isFinite(usd) || usd <= 0) {
    throw new WantedError('Invalid quick increment.', 400);
  }
  const rate = normalizedCurrency === 'ETH' ? 3000 : 1; // stub conversion
  return Number((usd / rate).toFixed(8));
}

function resolveAuctionId(input) {
  if (!input) return null;
  const rawId =
    (typeof input.auctionId === 'string' && input.auctionId.trim()) ||
    (typeof input.listingId === 'string' && input.listingId.trim()) ||
    null;
  return rawId || null;
}

function normalizeWallet(value) {
  if (value === undefined || value === null || value === '') return null;
  const raw = String(value).trim();
  if (!raw) return null;
  const lower = raw.toLowerCase();
  if (!/^0x[a-f0-9]{40}$/.test(lower)) {
    throw new WantedError('Wallet must be a valid 0x address.', 400, { field: 'wallet' });
  }
  return lower;
}

function normalizeTxHash(value) {
  if (value === undefined || value === null || value === '') return null;
  const raw = String(value).trim();
  if (!raw) return null;
  const lower = raw.toLowerCase();
  if (!/^0x[a-f0-9]{64}$/.test(lower)) {
    throw new WantedError('Deposit transaction hash is invalid.', 400, { field: 'depositTx' });
  }
  return lower;
}

function normalizeMessage(value, maxLength = 2000) {
  if (value === undefined || value === null) return null;
  const str = String(value).trim();
  if (!str) return null;
  return str.length > maxLength ? str.slice(0, maxLength) : str;
}

function normalizeTokenId(value) {
  if (value === undefined || value === null || value === '') return null;
  const num = Number(value);
  if (!Number.isFinite(num)) {
    throw new WantedError('tokenId must be numeric.', 400, { field: 'tokenId' });
  }
  if (num < 0) {
    throw new WantedError('tokenId must be zero or greater.', 400, { field: 'tokenId' });
  }
  return Math.floor(num);
}

function keyRateLimit(memberId, ip) {
  return memberId ? `member:${memberId}` : `ip:${ip}`;
}

function applyRateLimit(memberId, ip) {
  const key = keyRateLimit(memberId, ip);
  if (!key) return;

  const now = Date.now();
  const history = rateLimitMap.get(key) || [];
  const recent = history.filter((ts) => now - ts < RATE_LIMIT_WINDOW_MS);
  if (recent.length >= RATE_LIMIT_MAX) {
    throw new WantedError('Too many bids submitted. Please retry shortly.', 429);
  }
  recent.push(now);
  rateLimitMap.set(key, recent);
}

function buildManageLink(auction) {
  if (auction?.manageLink) return auction.manageLink;
  const slug = auction?.slug || auction?._id;
  return `https://www.dikpik.io/wanted-and-bazar?auction=${encodeURIComponent(slug)}`;
}

function shapePublicAuction(auction, highestBid, bidCount) {
  return {
    id: auction._id,
    nftId: auction.nftId || null,
    title: auction.title || '',
    status: auction.status || AUCTION_STATUS_OPEN,
    buyNowPrice: auction.buyNowPrice ?? null,
    minIncrement: auction.minIncrement ?? AUCTION_CONFIG.MIN_INCREMENT_DEFAULT,
    endsAt: auction.endsAt || null,
    highestBidAmount: highestBid?.amount ?? auction.highestBidAmount ?? null,
    highestBidCurrency:
      highestBid?.currency ?? auction.highestBidCurrency ?? (highestBid?.amount ? 'ETH' : null),
    bidCount: bidCount ?? auction.bidCount ?? 0,
    updatedAt: auction.updatedAt || auction._updatedDate || null,
    createdAt: auction.createdAt || auction._createdDate || null
  };
}

function shapePrivateAuction(auction, bids) {
  return {
    ...shapePublicAuction(auction, bids[0], bids.length),
    bids: bids.map((bid) => ({
      id: bid._id,
      amount: bid.amount,
      currency: bid.currency,
      createdAt: bid.createdAt || bid._createdDate,
      bidderUserId: bid.bidderUserId,
      status: bid.status,
      isHighest: bid.isHighest,
      wallet: bid.wallet || null,
      depositTx: bid.depositTx || null,
      message: bid.message || null,
      tokenId: bid.tokenId != null ? Number(bid.tokenId) : null
    }))
  };
}

async function getAuctionById(auctionId) {
  try {
    return await wixData.get(AUCTIONS_COLLECTION, auctionId);
  } catch (_err) {
    return null;
  }
}

async function getBidById(bidId) {
  try {
    return await wixData.get(BIDS_COLLECTION, bidId, { suppressAuth: true });
  } catch (_err) {
    return null;
  }
}

async function listBidsForAuction(auctionId, limit = 200) {
  const byAuction = wixData.query(BIDS_COLLECTION).eq('auctionId', auctionId);
  const byListing = wixData.query(BIDS_COLLECTION).eq('listingId', auctionId);
  const res = await byAuction
    .or(byListing)
    .descending('amount')
    .limit(limit)
    .find({ suppressAuth: true });
  return res.items || [];
}

async function markBidHighest(bidId, isHighest) {
  if (!bidId) return;
  await wixData.update(BIDS_COLLECTION, { _id: bidId, isHighest, updatedAt: new Date() }, { suppressAuth: true });
}

async function updateAuctionHighest(auctionId) {
  const bids = await listBidsForAuction(auctionId, 1);
  const highest = bids[0] || null;
  const countQueryAuction = wixData.query(BIDS_COLLECTION).eq('auctionId', auctionId);
  const countQueryListing = wixData.query(BIDS_COLLECTION).eq('listingId', auctionId);
  const count = await countQueryAuction.or(countQueryListing).count({ suppressAuth: true });
  const update = {
    _id: auctionId,
    highestBidAmount: highest ? highest.amount : null,
    highestBidCurrency: highest ? highest.currency : null,
    highestBidId: highest ? highest._id : null,
    bidCount: count,
    updatedAt: new Date()
  };
  await wixData.update(AUCTIONS_COLLECTION, update, { suppressAuth: true });
  return highest;
}

async function resolveMember(member) {
  if (member?._id) return member;
  try {
    return await currentMember.getMember({ fieldsets: ['FULL'] });
  } catch (_err) {
    return null;
  }
}

function determineDisplayName(member) {
  if (!member) return 'Member';
  return (
    member.profile?.nickname ||
    member.profile?.slug ||
    member.contact?.name ||
    member.contact?.emails?.[0]?.email ||
    'Member'
  );
}

/**
 * Place a bid on an auction, updating highest bid tracking and sending notifications.
 * @param {{auctionId: string, amount: number, currency?: string}} input
 * @param {{member?: any, ip?: string}} context
 */
export async function placeBid(input, context = {}) {
  const auctionId = resolveAuctionId(input);
  const { amount, currency } = input || {};
  if (!auctionId || typeof auctionId !== 'string') {
    throw new WantedError('auctionId is required.', 400, { field: 'auctionId' });
  }

  const member = await resolveMember(context.member);
  const memberId = member?._id ? String(member._id) : null;

  const normalizedCurrency = normalizeCurrency(currency || 'ETH');
  const numericAmount = toNumber(amount, 'amount');
  if (numericAmount <= 0) {
    throw new WantedError('Bid must be greater than zero.', 400, { field: 'amount' });
  }

  applyRateLimit(memberId, context.ip);

  return withAuctionLock(auctionId, async () => {
    const auction = await getAuctionById(auctionId);
    ensureAuctionOpen(auction);

    const bids = await listBidsForAuction(auctionId, 2);
    const currentHighest = bids[0] || null;

    if (currentHighest) {
      const min = calculateMinimumBid(auction, currentHighest);
      if (numericAmount < min) {
        throw new WantedError(`Bid must be at least ${min}.`, 400, { field: 'amount', minimum: min });
      }
    }

    const wallet = normalizeWallet(input?.wallet);
    const depositTx = normalizeTxHash(input?.depositTx);
    const message = normalizeMessage(input?.message);
    const tokenId = normalizeTokenId(input?.tokenId);

    if (!memberId) {
      if (!wallet) {
        throw new WantedError('Wallet address is required for guests.', 400, { field: 'wallet' });
      }
      if (!depositTx) {
        throw new WantedError('Deposit transaction hash is required for guests.', 400, {
          field: 'depositTx'
        });
      }
    }

    const now = new Date();
    const bidRecord = {
      auctionId,
      listingId: auctionId,
      listingTitle: auction?.title || null,
      amount: numericAmount,
      currency: normalizedCurrency,
      bidderDisplayName: determineDisplayName(member),
      status: BID_STATUS_RECEIVED,
      isHighest: true,
      createdAt: now,
      updatedAt: now,
      createdByIp: context.ip || null,
      createdByUserAgent: context.userAgent || null
    };
    if (memberId) bidRecord.bidderUserId = memberId;
    if (wallet) bidRecord.wallet = wallet;
    if (depositTx) bidRecord.depositTx = depositTx;
    if (message) bidRecord.message = message;
    if (tokenId != null) bidRecord.tokenId = tokenId;

    const saved = await wixData.insert(BIDS_COLLECTION, bidRecord, { suppressAuth: true });

    if (currentHighest && currentHighest._id !== saved._id) {
      await markBidHighest(currentHighest._id, false);
      if (currentHighest.bidderUserId) {
        await sendOutbidNotice({
          toUserId: currentHighest.bidderUserId,
          auctionTitle: auction.title || 'Auction',
          oldAmount: currentHighest.amount,
          newAmount: saved.amount,
          currency: currentHighest.currency || saved.currency || 'ETH',
          manageLink: buildManageLink(auction),
          auctionId
        });
      }
    }

    await updateAuctionHighest(auctionId);

    if (memberId) {
      await sendBidConfirmation({
        toUserId: memberId,
        auctionTitle: auction.title || 'Auction',
        amount: saved.amount,
        currency: saved.currency,
        bidRef: saved._id,
        manageLink: buildManageLink(auction)
      });
    }

    return saved;
  });
}

/**
 * Convenience helper to place a bid using the quick USD increment.
 * @param {{auctionId: string, stepUSD?: number}} input
 * @param {{member?: any, ip?: string}} context
 */
export async function increaseBidQuick(input, context = {}) {
  const auctionId = resolveAuctionId(input);
  const { stepUSD = AUCTION_CONFIG.QUICK_INCREMENT_USD } = input || {};
  if (!auctionId) {
    throw new WantedError('auctionId is required.', 400, { field: 'auctionId' });
  }
  const auction = await getAuctionById(auctionId);
  ensureAuctionOpen(auction);
  const bids = await listBidsForAuction(auctionId, 1);
  const currentHighest = bids[0] || null;
  const baseAmount = currentHighest?.amount ?? auction.startingPrice ?? AUCTION_CONFIG.MIN_INCREMENT_DEFAULT;
  const increment = convertUsdToCurrency(stepUSD, currentHighest?.currency || auction.currency || 'ETH');
  const nextAmount = Number((Number(baseAmount) + increment).toFixed(8));
  return placeBid(
    {
      auctionId,
      amount: nextAmount,
      currency: currentHighest?.currency || auction.currency || 'ETH'
    },
    context
  );
}

/**
 * Withdraw a bid owned by the current member.
 * @param {{bidId: string}} input
 * @param {{member?: any}} context
 */
export async function withdrawBid(input, context = {}) {
  const { bidId } = input || {};
  if (!bidId) {
    throw new WantedError('bidId is required.', 400, { field: 'bidId' });
  }
  const member = await resolveMember(context.member);
  if (!member?._id) {
    throw new WantedError('Login required.', 401);
  }
  const bid = await getBidById(bidId);
  if (!bid) {
    throw new WantedError('Bid not found.', 404);
  }
  if (String(bid.bidderUserId) !== String(member._id)) {
    throw new WantedError('You can only withdraw your own bids.', 403);
  }
  if (bid.status === BID_STATUS_WITHDRAWN) {
    return bid;
  }

  await wixData.update(
    BIDS_COLLECTION,
    { _id: bidId, status: BID_STATUS_WITHDRAWN, isHighest: false, updatedAt: new Date() },
    { suppressAuth: true }
  );

  await updateAuctionHighest(bid.auctionId);
  return await getBidById(bidId);
}

export function isAuctionAdmin(member) {
  if (!member) return false;
  const roles = Array.isArray(member.roles) ? member.roles : [];
  return roles.some((role) => role?.name?.toLowerCase?.() === 'admin' || role?.name === 'BazaarAdmin');
}

/**
 * Close an auction as an admin and notify the winning bidder.
 * @param {{auctionId: string}} input
 * @param {{member?: any}} context
 */
export async function finalizeAuction(input, context = {}) {
  const auctionId = resolveAuctionId(input);
  if (!auctionId) {
    throw new WantedError('auctionId is required.', 400);
  }
  const member = await resolveMember(context.member);
  if (!isAuctionAdmin(member)) {
    throw new WantedError('Admin privileges required.', 403);
  }

  return withAuctionLock(auctionId, async () => {
    const auction = await getAuctionById(auctionId);
    if (!auction) throw new WantedError('Auction not found.', 404);

    const highest = await updateAuctionHighest(auctionId);

    await wixData.update(
      AUCTIONS_COLLECTION,
      { _id: auctionId, status: AUCTION_STATUS_CLOSED, updatedAt: new Date() },
      { suppressAuth: true }
    );

    if (highest?.bidderUserId) {
      await sendWinningEmail({
        toUserId: highest.bidderUserId,
        auctionTitle: auction.title || 'Auction',
        finalAmount: highest.amount,
        currency: highest.currency || auction.highestBidCurrency || 'ETH',
        claimLink: buildManageLink(auction)
      });
    }

    return { auctionId, status: AUCTION_STATUS_CLOSED, winningBidId: highest?._id || null };
  });
}

/**
 * Complete an auction instantly using the Buy Now flow.
 * @param {{auctionId: string}} input
 * @param {{member?: any}} context
 */
export async function buyNow(input, context = {}) {
  const auctionId = resolveAuctionId(input);
  if (!auctionId) {
    throw new WantedError('auctionId is required.', 400);
  }
  const member = await resolveMember(context.member);
  if (!member?._id) {
    throw new WantedError('Login required to complete purchase.', 401);
  }

  return withAuctionLock(auctionId, async () => {
    const auction = await getAuctionById(auctionId);
    ensureAuctionOpen(auction);
    if (!Number.isFinite(Number(auction.buyNowPrice))) {
      throw new WantedError('Buy Now unavailable for this auction.', 409);
    }

    await wixData.update(
      AUCTIONS_COLLECTION,
      {
        _id: auctionId,
        status: AUCTION_STATUS_SOLD,
        buyerMemberId: String(member._id),
        soldAt: new Date(),
        updatedAt: new Date()
      },
      { suppressAuth: true }
    );

    await sendBuyNowEmail({
      toUserId: String(member._id),
      auctionTitle: auction.title || 'Auction',
      price: auction.buyNowPrice,
      currency: auction.buyNowCurrency || auction.currency || 'ETH',
      receiptLink: buildManageLink(auction)
    });

    return { auctionId, status: AUCTION_STATUS_SOLD };
  });
}

/**
 * Return the public-safe snapshot for an auction.
 * @param {{auctionId: string}} input
 */
export async function getAuctionPublic(input) {
  const auctionId = resolveAuctionId(input);
  if (!auctionId) {
    throw new WantedError('auctionId is required.', 400);
  }
  const auction = await getAuctionById(auctionId);
  if (!auction) {
    throw new WantedError('Auction not found.', 404);
  }
  const bids = await listBidsForAuction(auctionId, 1);
  const bidCount = Number.isFinite(Number(auction.bidCount))
    ? Number(auction.bidCount)
    : bids.length;
  return shapePublicAuction(auction, bids[0], bidCount);
}

/**
 * Return the full administrative view for an auction.
 * @param {{auctionId: string}} input
 * @param {{member?: any}} context
 */
export async function getAuctionPrivate(input, context = {}) {
  const auctionId = resolveAuctionId(input);
  if (!auctionId) {
    throw new WantedError('auctionId is required.', 400);
  }
  const member = await resolveMember(context.member);
  if (!isAuctionAdmin(member)) {
    throw new WantedError('Admin privileges required.', 403);
  }
  const auction = await getAuctionById(auctionId);
  if (!auction) {
    throw new WantedError('Auction not found.', 404);
  }
  const bids = await listBidsForAuction(auctionId, 200);
  return shapePrivateAuction(auction, bids);
}
