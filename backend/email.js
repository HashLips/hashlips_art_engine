import { fetch } from 'wix-fetch';
import { secrets } from 'wix-secrets-backend';
import { members } from 'wix-members-backend';
import { AUCTION_CONFIG } from './wantedUtils.js';

const SENDGRID_SECRET_NAME = 'SENDGRID_API_KEY';
const EMAIL_RATE_WINDOW_MS = 60_000;
const emailDedupCache = new Map();

/**
 * Resolve the primary contact email for a Wix member.
 * @param {string} memberId
 * @returns {Promise<string|null>}
 */
async function resolveMemberEmail(memberId) {
  if (!memberId) return null;
  try {
    const member = await members.getMember(memberId, { fieldsets: ['CONTACT'] });
    const emails = member?.contact?.emails;
    const email = Array.isArray(emails) ? emails[0]?.email ?? null : null;
    return email && typeof email === 'string' ? email : null;
  } catch (err) {
    console.warn('[email] failed to resolve member email', { memberId, err });
    return null;
  }
}

/**
 * Retrieve the SendGrid API key once and cache in memory.
 * @returns {Promise<string|null>}
 */
let cachedSendgridKeyPromise;
async function getSendgridKey() {
  if (!cachedSendgridKeyPromise) {
    cachedSendgridKeyPromise = secrets.getSecret(SENDGRID_SECRET_NAME).catch((err) => {
      console.warn('[email] failed to load SENDGRID_API_KEY secret', err);
      return null;
    });
  }
  return cachedSendgridKeyPromise;
}

function composeEmail(subject, htmlBody, textBody) {
  return {
    personalizations: [
      {
        to: [],
        subject
      }
    ],
    from: {
      email: AUCTION_CONFIG.EMAIL_FROM_ADDRESS,
      name: AUCTION_CONFIG.EMAIL_FROM_NAME
    },
    content: [
      { type: 'text/plain', value: textBody },
      { type: 'text/html', value: htmlBody }
    ]
  };
}

async function sendEmailPayload(toEmail, subject, htmlBody, textBody) {
  const apiKey = await getSendgridKey();
  if (!apiKey) {
    console.log('[email] SENDGRID_API_KEY missing – logging payload instead', {
      toEmail,
      subject,
      textBody
    });
    return;
  }

  const payload = composeEmail(subject, htmlBody, textBody);
  payload.personalizations[0].to.push({ email: toEmail });

  const res = await fetch('https://api.sendgrid.com/v3/mail/send', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });

  if (!res.ok) {
    const body = await res.text().catch(() => '<no-body>');
    console.error('[email] sendgrid send failed', { status: res.status, body });
  }
}

function shouldSkipDedup(key) {
  const now = Date.now();
  const lastSent = emailDedupCache.get(key);
  if (lastSent && now - lastSent < EMAIL_RATE_WINDOW_MS) {
    return true;
  }
  emailDedupCache.set(key, now);
  return false;
}

function formatCurrency(amount, currency) {
  const safeAmount = Number(amount);
  if (!Number.isFinite(safeAmount)) return `${amount} ${currency}`;
  return `${safeAmount.toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 8
  })} ${currency}`;
}

function buildManageLink(manageLink) {
  return manageLink || 'https://www.dikpik.io/wanted-and-bazar';
}

export async function sendBidConfirmation({ toUserId, auctionTitle, amount, currency, bidRef, manageLink }) {
  const email = await resolveMemberEmail(toUserId);
  if (!email) return;

  const subject = `Bid placed on ${auctionTitle}`;
  const amountText = formatCurrency(amount, currency);
  const link = buildManageLink(manageLink);
  const text = [
    `Congratulations! Your bid for ${auctionTitle} was placed successfully.`,
    `Amount: ${amountText}`,
    `Reference: ${bidRef}`,
    `Manage your bid: ${link}`
  ].join('\n');

  const html = `
    <div style="font-family: Arial, sans-serif; padding: 16px;">
      <h2 style="color:#0ff;">Congratulations!</h2>
      <p>Your bid for <strong>${auctionTitle}</strong> was placed successfully.</p>
      <p><strong>Amount:</strong> ${amountText}</p>
      <p><strong>Reference:</strong> ${bidRef}</p>
      <p><a href="${link}" style="background:#0ff;color:#000;padding:10px 16px;text-decoration:none;border-radius:4px;">Manage your bid</a></p>
    </div>
  `;

  await sendEmailPayload(email, subject, html, text);
}

export async function sendOutbidNotice({
  toUserId,
  auctionTitle,
  oldAmount,
  newAmount,
  currency = 'ETH',
  manageLink,
  auctionId
}) {
  const email = await resolveMemberEmail(toUserId);
  if (!email) return;
  const dedupKey = `outbid:${toUserId}:${auctionId || auctionTitle}:${newAmount}`;
  if (shouldSkipDedup(dedupKey)) return;

  const subject = `You've been outbid on ${auctionTitle}`;
  const oldAmountText = formatCurrency(oldAmount, currency);
  const newAmountText = formatCurrency(newAmount, currency);
  const link = buildManageLink(manageLink);

  const text = [
    `Another bidder just surpassed your offer on ${auctionTitle}.`,
    `Your previous bid: ${oldAmountText}`,
    `Current leading bid: ${newAmountText}`,
    `Respond here: ${link}`
  ].join('\n');

  const html = `
    <div style="font-family: Arial, sans-serif; padding: 16px;">
      <h2 style="color:#ff4081;">You've been outbid</h2>
      <p>Your previous bid on <strong>${auctionTitle}</strong> has been surpassed.</p>
      <p><strong>Your bid:</strong> ${oldAmountText}</p>
      <p><strong>Current leading bid:</strong> ${newAmountText}</p>
      <p><a href="${link}" style="background:#ff4081;color:#fff;padding:10px 16px;text-decoration:none;border-radius:4px;">Place a new bid</a></p>
    </div>
  `;

  await sendEmailPayload(email, subject, html, text);
}

export async function sendWinningEmail({
  toUserId,
  auctionTitle,
  finalAmount,
  currency = 'ETH',
  claimLink
}) {
  const email = await resolveMemberEmail(toUserId);
  if (!email) return;

  const subject = `You won ${auctionTitle}`;
  const amountText = formatCurrency(finalAmount, currency);
  const link = claimLink || buildManageLink(claimLink);

  const text = [
    `You won the auction for ${auctionTitle}.`,
    `Final amount: ${amountText}`,
    `Claim instructions: ${link}`
  ].join('\n');

  const html = `
    <div style="font-family: Arial, sans-serif; padding: 16px;">
      <h2 style="color:#0ff;">You won ${auctionTitle}</h2>
      <p>Great news! You are the winning bidder.</p>
      <p><strong>Final amount:</strong> ${amountText}</p>
      <p><a href="${link}" style="background:#0ff;color:#000;padding:10px 16px;text-decoration:none;border-radius:4px;">Claim your NFT</a></p>
    </div>
  `;

  await sendEmailPayload(email, subject, html, text);
}

export async function sendBuyNowEmail({
  toUserId,
  auctionTitle,
  price,
  currency = 'ETH',
  receiptLink
}) {
  const email = await resolveMemberEmail(toUserId);
  if (!email) return;

  const subject = `Purchased ${auctionTitle} via Buy Now`;
  const priceText = formatCurrency(price, currency);
  const link = receiptLink || buildManageLink(receiptLink);

  const text = [
    `You successfully purchased ${auctionTitle} via Buy Now.`,
    `Price: ${priceText}`,
    `Receipt / next steps: ${link}`
  ].join('\n');

  const html = `
    <div style="font-family: Arial, sans-serif; padding: 16px;">
      <h2 style="color:#0ff;">Purchase confirmed</h2>
      <p>You bought <strong>${auctionTitle}</strong> using Buy Now.</p>
      <p><strong>Price:</strong> ${priceText}</p>
      <p><a href="${link}" style="background:#0ff;color:#000;padding:10px 16px;text-decoration:none;border-radius:4px;">View receipt</a></p>
    </div>
  `;

  await sendEmailPayload(email, subject, html, text);
}
