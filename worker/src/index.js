/**
 * Cloudflare Worker entry point for Dikpik Bazaar backend.
 * This is an initial scaffold that exposes a health endpoint and
 * centralises shared configuration (wallet addresses, deposit info).
 * Additional routes (auth, listings, bids, wanted posts) will be layered
 * on top of this foundation.
 */

const ALLOWED_ORIGINS = [
  "https://bazaar.dikpik.io",
  "https://dikpik-bazaar.pages.dev",
  "https://dikpik-bazaar.pages.dev/",
  "https://www.dikpik.io",
  "http://localhost:3000",
  "http://127.0.0.1:3000"
];

const json = (data, { status = 200, headers = {}, request } = {}) => {
  const origin = request ? request.headers.get("origin") || "" : "";
  const allowOrigin = origin && ALLOWED_ORIGINS.some((o) => origin.startsWith(o)) ? origin : "*";
  return new Response(JSON.stringify(data, null, 2), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "access-control-allow-origin": allowOrigin,
      "access-control-allow-credentials": "true",
      ...headers
    }
  });
};

const jsonError = (message, status = 400, extras = {}, request) =>
  json({ error: message, ...extras }, { status, request });

const allowedMethods = ["GET", "POST", "DELETE", "OPTIONS"];

const handleOptions = (request) => {
  const origin = request ? request.headers.get("origin") || "" : "";
  const allowOrigin = origin && ALLOWED_ORIGINS.some((o) => origin.startsWith(o)) ? origin : "*";
  return new Response(null, {
    status: 204,
    headers: {
      "access-control-allow-origin": allowOrigin,
      "access-control-allow-credentials": "true",
      "access-control-allow-methods": allowedMethods.join(", "),
      "access-control-allow-headers": "content-type, authorization"
    }
  });
};

export default {
  async fetch(request, env, ctx) {
    try {
      if (request.method === "OPTIONS") {
        return handleOptions(request);
      }

      const url = new URL(request.url);
      const path = url.pathname.replace(/\/+$/, "") || "/";

      if (!allowedMethods.includes(request.method)) {
        return json({ error: "Method not allowed" }, { status: 405 });
      }

      switch (path) {
        case "/":
        case "/health":
        case "/api/health":
          return json(await buildHealthPayload(env), { request });

        case "/api/auth/request":
          if (request.method !== "POST") break;
          return await handleAuthRequest(request, env);

        case "/api/auth/verify":
          if (request.method !== "POST") break;
          return await handleAuthVerify(request, env);

        case "/api/auth/me":
          if (request.method !== "GET") break;
          return await handleAuthMe(request, env);

        case "/api/listings":
        case "/listings":
          if (request.method === "GET") {
          return await handleListingsList(env, request);
          }
          if (request.method === "POST") {
          return await handleListingCreate(request, env);
          }
          break;

        case "/api/listing-bids":
          if (request.method === "GET") {
            return await handleListingBids(request, env);
          }
          break;

        case "/api/bids":
        case "/bids":
          if (request.method === "GET") {
            return await handleBidList(request, env);
          }
          if (request.method !== "POST") break;
          return await handleBidCreate(request, env);

        case "/api/wanted":
        case "/wanted":
          if (request.method === "GET") {
            return await handleWantedList(env, request);
          }
          if (request.method === "DELETE") {
            return await handleWantedDelete(request, env);
          }
          if (request.method === "POST") {
            return await handleWantedUpsert(request, env);
          }
          break;

        case "/api/relay":
          return json({ ok: true, message: "Relay settings not yet implemented." }, { request });

        default:
          return jsonError("Not found", 404, {}, request);
      }
    } catch (err) {
      console.error("Worker error", err);
      return jsonError("Server error", 500, {}, request);
    }
  }
};

async function buildHealthPayload(env) {
  return {
    ok: true,
    timestamp: new Date().toISOString(),
    depositUsd: Number(env.USD_DEPOSIT_AMOUNT ?? 100),
    wallets: {
      eth: {
        deposit: env.ETH_DEPOSIT_WALLET,
        escrow: env.ETH_ESCROW_WALLET,
        fee: env.ETH_FEE_WALLET
      },
      tron: {
        usdt: env.TRON_USDT_WALLET
      }
    },
    services: {
      database: env.DB ? "configured" : "missing",
      postmark: env.POSTMARK_API_TOKEN ? "configured" : "missing"
    }
  };
}

async function handleAuthRequest(request, env) {
  const body = await readJson(request);
  if (!body?.email || typeof body.email !== "string") {
    return jsonError("Email is required.", 400, {}, request);
  }
  const email = body.email.trim().toLowerCase();
  if (!isValidEmail(email)) {
    return jsonError("Invalid email format.", 400, {}, request);
  }

  const loginCode = generateLoginCode();
  const expiresAt = Math.floor(Date.now() / 1000) + 15 * 60; // 15 minutes

  await env.DB.prepare(
    `INSERT INTO members (email, auth_token, auth_token_expires_at, created_at, updated_at)
     VALUES (?, ?, ?, strftime('%s','now'), strftime('%s','now'))
     ON CONFLICT(email) DO UPDATE SET
       auth_token = excluded.auth_token,
       auth_token_expires_at = excluded.auth_token_expires_at,
       updated_at = excluded.updated_at`
  )
    .bind(email, loginCode, expiresAt)
    .run();

  await sendAuthEmail(env, email, loginCode);

  return json({ ok: true, message: "Verification code sent." }, { request });
}

async function handleAuthVerify(request, env) {
  const body = await readJson(request);
  const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
  const code = typeof body?.code === "string" ? body.code.trim() : "";
  const profile = body?.profile && typeof body.profile === "object" ? body.profile : {};

  if (!email || !code) {
    return jsonError("Email and code are required.", 400, {}, request);
  }

  const member = await env.DB.prepare(
    `SELECT id, email, name, phone, marketing_opt_in, auth_token, auth_token_expires_at
     FROM members WHERE email = ?`
  )
    .bind(email)
    .first();

  if (!member) {
    return jsonError("Invalid code or email.", 400, {}, request);
  }

  if (!member.auth_token || member.auth_token !== code) {
    return jsonError("Invalid code.", 400, {}, request);
  }

  const now = Math.floor(Date.now() / 1000);
  if (!member.auth_token_expires_at || member.auth_token_expires_at < now) {
    return jsonError("Code has expired.", 400, {}, request);
  }

  const sessionToken = crypto.randomUUID();
  const sessionExpires = now + 30 * 24 * 60 * 60; // 30 days

  await env.DB.batch([
    env.DB.prepare(
      `UPDATE members
       SET auth_token = NULL,
           auth_token_expires_at = NULL,
           name = COALESCE(?, name),
           phone = COALESCE(?, phone),
           marketing_opt_in = COALESCE(?, marketing_opt_in),
           updated_at = strftime('%s','now')
       WHERE id = ?`
    ).bind(
      sanitizeOptionalString(profile.name),
      sanitizeOptionalString(profile.phone),
      typeof profile.marketingOptIn === "boolean" ? (profile.marketingOptIn ? 1 : 0) : member.marketing_opt_in,
      member.id
    ),
    env.DB.prepare(
      `INSERT INTO sessions (member_id, session_token, expires_at, created_at)
       VALUES (?, ?, ?, strftime('%s','now'))`
    ).bind(member.id, sessionToken, sessionExpires)
  ]);

  const updated = await env.DB.prepare(
    `SELECT id, email, name, phone, marketing_opt_in
     FROM members WHERE id = ?`
  )
    .bind(member.id)
    .first();

  return json({
    ok: true,
    sessionToken,
    expiresAt: sessionExpires,
    member: {
      id: updated.id,
      email: updated.email,
      name: updated.name,
      phone: updated.phone,
      marketingOptIn: !!updated.marketing_opt_in
    }
  }, { request });
}

async function handleAuthMe(request, env) {
  const session = await requireSession(request, env, null);
  if (!session) {
    return jsonError("Unauthorized", 401, {}, request);
  }
  return json({
    ok: true,
    member: session.member
  }, { request });
}

async function handleListingsList(env, request) {
  const url = new URL(request.url);
  const typeFilter =
    sanitizeOptionalString(url.searchParams.get("type")) ||
    sanitizeOptionalString(url.searchParams.get("kind"));
  const statusFilter = sanitizeListingStatus(url.searchParams.get("status"));
  const limit = Math.min(500, Math.max(1, toNumber(url.searchParams.get("limit")) || 200));
  const mineFlag = (url.searchParams.get("mine") || "").toLowerCase();
  const mine = mineFlag === "1" || mineFlag === "true" || mineFlag === "yes";

  let session = null;
  if (mine) {
    session = await requireSession(request, env, null);
    if (!session) {
      return jsonError("Unauthorized", 401, {}, request);
    }
  }

  const params = [];
  const where = [];
  if (typeFilter) {
    where.push("l.type = ?");
    params.push(typeFilter.toLowerCase());
  }
  if (statusFilter) {
    where.push("l.status = ?");
    params.push(statusFilter);
  }
  if (mine && session) {
    where.push("l.member_id = ?");
    params.push(session.memberId);
  }

  const rows = await env.DB.prepare(
    `SELECT l.id, l.member_id, l.type, l.status, l.payload, l.created_at, l.updated_at, m.email, m.name
     FROM listings l
     LEFT JOIN members m ON m.id = l.member_id
     ${where.length ? `WHERE ${where.join(" AND ")}` : ""}
     ORDER BY l.created_at DESC
     LIMIT ?`
  )
    .bind(...params, limit)
    .all();

  const items =
    rows?.results?.map((row) => serializeListingRow(row)) || [];

  return json({ items }, { request });
}

async function handleListingCreate(request, env) {
  const body = await readJson(request);
  const session = await requireSession(request, env, body);
  if (!session) {
    return jsonError("Unauthorized", 401, {}, request);
  }

  const tokenId = toNumber(body?.tokenId ?? body?.token_id);
  const expiresAtRaw = body?.expiresAt || body?.endTime || body?.endsAt;
  const expiresAt = expiresAtRaw ? new Date(expiresAtRaw) : null;
  if (!Number.isFinite(tokenId)) {
    return jsonError("Token ID is required.", 400, {}, request);
  }
  if (!expiresAt || Number.isNaN(expiresAt.getTime())) {
    return jsonError("Valid expiresAt is required.", 400, {}, request);
  }
  const nowMs = Date.now();
  if (expiresAt.getTime() < nowMs + 5 * 60 * 1000) {
    return jsonError("expiresAt must be at least 5 minutes in the future.", 400, {}, request);
  }
  const maxWindowMs = 180 * 24 * 60 * 60 * 1000; // 180 days
  if (expiresAt.getTime() - nowMs > maxWindowMs) {
    return jsonError("expiresAt is too far in the future (max 180 days).", 400, {}, request);
  }

  const payload = {
    kind: (body?.kind || body?.type || "auction").toString().toLowerCase(),
    title: sanitizeShortString(body?.title) || `Auction #${tokenId}`,
    tokenId,
    min: toNumber(body?.min),
    min_ccy:
      sanitizeCurrency(body?.min_ccy) ||
      sanitizeCurrency(body?.minCcy) ||
      sanitizeCurrency(body?.currency) ||
      "ETH",
    price: toNumber(body?.price),
    currency: sanitizeCurrency(body?.currency) || "ETH",
    expiresAt: expiresAt.toISOString(),
    escrowed: !!body?.escrowed,
    seller: sanitizeWallet(body?.seller) || sanitizeShortString(body?.seller),
    status: sanitizeListingStatus(body?.status) || "published"
  };

  const now = Math.floor(Date.now() / 1000);
  const result = await env.DB.prepare(
    `INSERT INTO listings (member_id, type, payload, status, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?)`
  )
    .bind(
      session.memberId,
      payload.kind,
      JSON.stringify(payload),
      payload.status,
      now,
      now
    )
    .run();

  const row = {
    id: result.meta.last_row_id,
    member_id: session.memberId,
    type: payload.kind,
    status: payload.status,
    payload: JSON.stringify(payload),
    created_at: now,
    updated_at: now,
    email: session.member.email,
    name: session.member.name
  };

  // Notify seller (non-blocking)
  try {
    const msg = [
      `Hi ${session.member.name || session.member.email},`,
      "",
      `Your auction "${payload.title}" (Token #${tokenId}) is now live.`,
      `Min bid: ${payload.min ?? "N/A"} ${payload.min_ccy || payload.currency}`,
      `Ends: ${payload.expiresAt}`,
      `Escrow: ${payload.escrowed ? "Yes" : "No"}`,
      "",
      "– DIKPIK Bazaar"
    ]
      .filter(Boolean)
      .join("\n");
    await sendEmail(env, session.member.email, `Auction listed: ${payload.title}`, msg);
  } catch (err) {
    console.error("Listing notification send error", err);
  }

  return json(serializeListingRow(row), { status: 201, request });
}

async function handleWantedList(env, request) {
  const rows = await env.DB.prepare(
    `SELECT l.id, l.member_id, l.type, l.status, l.payload, l.created_at, l.updated_at, m.email, m.name
     FROM listings l
     LEFT JOIN members m ON m.id = l.member_id
     WHERE l.type = 'wanted'
     ORDER BY l.created_at DESC
     LIMIT 200`
  ).all();

  const items = rows?.results?.map((row) => serializeListingRow(row)) || [];
  return json({ items }, { request });
}

async function handleWantedUpsert(request, env) {
  const body = await readJson(request);
  const session = await requireSession(request, env, body);
  if (!session) {
    return jsonError("Unauthorized", 401, {}, request);
  }

  const id = toNumber(body?.id);
  const title = sanitizeShortString(body?.title) || "Wanted Request";
  const traitQuery = sanitizeShortString(body?.traitQuery, 200);
  const tokenId = toNumber(body?.tokenId);
  const budget = toNumber(body?.budget);
  const currency = sanitizeCurrency(body?.currency) || "ETH";
  const status = sanitizeListingStatus(body?.status) || "published";
  const expiresAtRaw = body?.expiresAt || body?.endTime || body?.endsAt;
  const expiresAt = expiresAtRaw ? new Date(expiresAtRaw) : null;
  if (!expiresAt || Number.isNaN(expiresAt.getTime())) {
    return jsonError("Valid expiresAt is required.", 400, {}, request);
  }
  const nowMs = Date.now();
  if (expiresAt.getTime() < nowMs + 5 * 60 * 1000) {
    return jsonError("expiresAt must be at least 5 minutes in the future.", 400, {}, request);
  }
  const maxWindowMs = 180 * 24 * 60 * 60 * 1000;
  if (expiresAt.getTime() - nowMs > maxWindowMs) {
    return jsonError("expiresAt is too far in the future (max 180 days).", 400, {}, request);
  }

  const payload = {
    kind: "wanted",
    title,
    traitQuery,
    tokenId,
    budget,
    currency,
    status,
    expiresAt: expiresAt.toISOString(),
    contactLine: sanitizeShortString(body?.contactLine, 200),
    contactWhatsApp: sanitizeShortString(body?.contactWhatsApp, 200),
    contactTelegram: sanitizeShortString(body?.contactTelegram, 200),
    contactEmail: sanitizeEmail(body?.contactEmail),
    contactPhone: sanitizePhone(body?.contactPhone),
    contactMessage: sanitizeShortString(body?.contactMessage, 500)
  };

  const now = Math.floor(Date.now() / 1000);

  if (id) {
    const existing = await env.DB.prepare(
      `SELECT id, member_id FROM listings WHERE id = ? AND type = 'wanted' LIMIT 1`
    )
      .bind(id)
      .first();
    if (!existing) {
      return jsonError("Wanted post not found.", 404, {}, request);
    }
    if (existing.member_id !== session.memberId) {
      return jsonError("Forbidden", 403, {}, request);
    }
    await env.DB.prepare(
      `UPDATE listings
       SET payload = ?, status = ?, updated_at = ?
       WHERE id = ?`
    )
      .bind(JSON.stringify(payload), status, now, id)
      .run();
    const updatedRow = await env.DB.prepare(
      `SELECT l.id, l.member_id, l.type, l.status, l.payload, l.created_at, l.updated_at, m.email, m.name
       FROM listings l
       LEFT JOIN members m ON m.id = l.member_id
       WHERE l.id = ?`
    )
      .bind(id)
      .first();
    return json(serializeListingRow(updatedRow), { request });
  }

  const result = await env.DB.prepare(
    `INSERT INTO listings (member_id, type, payload, status, created_at, updated_at)
     VALUES (?, 'wanted', ?, ?, ?, ?)`
  )
    .bind(session.memberId, JSON.stringify(payload), status, now, now)
    .run();

  const row = {
    id: result.meta.last_row_id,
    member_id: session.memberId,
    type: "wanted",
    status,
    payload: JSON.stringify(payload),
    created_at: now,
    updated_at: now,
    email: session.member.email,
    name: session.member.name
  };

  // Notify poster (non-blocking)
  try {
    const msg = [
      `Hi ${session.member.name || session.member.email},`,
      "",
      `Your wanted request "${title}" is now posted.`,
      traitQuery ? `Looking for: ${traitQuery}` : null,
      `Budget: ${budget ?? "N/A"} ${currency}`,
      `Expires: ${payload.expiresAt}`,
      "",
      "– DIKPIK Bazaar"
    ]
      .filter(Boolean)
      .join("\n");
    await sendEmail(env, session.member.email, `Wanted request posted: ${title}`, msg);
  } catch (err) {
    console.error("Wanted notification send error", err);
  }

  return json(serializeListingRow(row), { status: 201, request });
}

async function handleWantedDelete(request, env) {
  const body = await readJson(request);
  const session = await requireSession(request, env, body);
  if (!session) {
    return jsonError("Unauthorized", 401, {}, request);
  }

  const url = new URL(request.url);
  const id = toNumber(body?.id ?? url.searchParams.get("id"));
  if (!Number.isFinite(id) || id <= 0) {
    return jsonError("Wanted id is required.", 400, {}, request);
  }

  const existing = await env.DB.prepare(
    `SELECT id, member_id FROM listings WHERE id = ? AND type = 'wanted' LIMIT 1`
  )
    .bind(id)
    .first();
  if (!existing) {
    return jsonError("Wanted post not found.", 404, {}, request);
  }
  if (existing.member_id !== session.memberId) {
    return jsonError("Forbidden", 403, {}, request);
  }

  await env.DB.prepare(`DELETE FROM listings WHERE id = ?`).bind(id).run();
  return json({ ok: true, deletedId: id }, { status: 200, request });
}

async function handleBidCreate(request, env) {
  const body = await readJson(request);
  const session = await requireSession(request, env, body);
  if (!session) {
    return jsonError("Unauthorized", 401, {}, request);
  }

  const listingId = toNumber(body?.listingId ?? body?.listing_id);
  if (!Number.isFinite(listingId)) {
    return jsonError("Listing ID is required.", 400, {}, request);
  }
  const listing = await env.DB.prepare(
    `SELECT id, status, payload FROM listings WHERE id = ? LIMIT 1`
  )
    .bind(listingId)
    .first();
  if (!listing) {
    return jsonError("Listing not found.", 404, {}, request);
  }
  const listingStatus = (listing.status || "").toLowerCase();
  if (listingStatus && listingStatus !== "published") {
    return jsonError("Listing is not open for bids.", 400, {}, request);
  }

  const amount = toNumber(body?.amount);
  if (!Number.isFinite(amount) || amount <= 0) {
    return jsonError("Bid amount must be positive.", 400, {}, request);
  }

  const wallet = sanitizeWallet(body?.wallet);
  if (!wallet) {
    return jsonError("Wallet is required.", 400, {}, request);
  }

  const depositTx = sanitizeHash(body?.depositTx || body?.tx_hash);
  if (!depositTx) {
    return jsonError("Deposit transaction hash is required.", 400, {}, request);
  }

  const currency =
    (sanitizeOptionalString(body?.currency) || "ETH").toUpperCase();
  const chain = sanitizeOptionalString(body?.chain) || "evm";
  const tokenId = toNumber(body?.tokenId);
  const depositAmount = toNumber(body?.depositAmount);
  const depositUsd = toNumber(
    body?.depositUsd ?? env.USD_DEPOSIT_AMOUNT ?? null
  );
  const now = Math.floor(Date.now() / 1000);

  const prevTopBid = await env.DB.prepare(
    `SELECT b.id, b.amount_eth, b.member_id, m.email
     FROM bids b
     LEFT JOIN members m ON m.id = b.member_id
     WHERE b.listing_id = ?
     ORDER BY b.amount_eth DESC, b.created_at ASC
     LIMIT 1`
  )
    .bind(listingId)
    .first();

  const walletStmt = env.DB.prepare(
    `INSERT INTO wallets (member_id, chain, address, verified, verified_at)
     VALUES (?, ?, ?, 0, NULL)
     ON CONFLICT(member_id, chain) DO UPDATE SET address = excluded.address`
  ).bind(session.memberId, chain, wallet);

  const depositStmt = env.DB.prepare(
    `INSERT INTO deposits (member_id, chain, currency, tx_hash, amount_numeric, amount_usd, status, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, 'submitted', ?, ?)`
  ).bind(
    session.memberId,
    chain,
    currency,
    depositTx,
    depositAmount ?? 0,
    depositUsd ?? null,
    now,
    now
  );

  const [, depositResult] = await env.DB.batch([walletStmt, depositStmt]);
  const depositId = depositResult?.meta?.last_row_id || null;

  const bidResult = await env.DB.prepare(
    `INSERT INTO bids (listing_id, member_id, amount_eth, tx_hash, status, created_at)
     VALUES (?, ?, ?, ?, 'submitted', ?)`
  )
    .bind(listingId, session.memberId, amount, depositTx, now)
    .run();
  const bidId = bidResult?.meta?.last_row_id || null;

  await env.DB.prepare(
    `INSERT OR REPLACE INTO bid_metadata
     (bid_id, wallet, currency, token_id, deposit_id, deposit_amount, deposit_usd, deposit_tx, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
  )
    .bind(
      bidId,
      wallet,
      currency,
      tokenId,
      depositId,
      depositAmount ?? null,
      depositUsd ?? null,
      depositTx,
      now
    )
    .run();

  try {
    const listingOwner = await env.DB.prepare(
      `SELECT m.email, m.name, l.title
       FROM listings l
       LEFT JOIN members m ON m.id = l.member_id
       WHERE l.id = ?`
    )
      .bind(listingId)
      .first();

    if (listingOwner?.email) {
      const sellerMsg = [
        `Hi ${listingOwner.name || listingOwner.email},`,
        "",
        `You received a new bid on "${listingOwner.title || "Auction"}".`,
        `Bid: ${amount} ${currency}`,
        `Bidder wallet: ${wallet}`,
        tokenId ? `Token: #${tokenId}` : null,
        depositTx ? `Deposit tx: ${depositTx}` : null,
        "",
        "– DIKPIK Bazaar"
      ]
        .filter(Boolean)
        .join("\n");
      await sendEmail(env, listingOwner.email, `New bid on ${listingOwner.title || "your auction"}`, sellerMsg);
    }

    if (
      prevTopBid &&
      prevTopBid.member_id &&
      prevTopBid.member_id !== session.memberId &&
      Number(prevTopBid.amount_eth) < amount &&
      prevTopBid.email
    ) {
      const outbidMsg = [
        `Hi ${prevTopBid.email},`,
        "",
        `You’ve been outbid on listing #${listingId}.`,
        `New top bid: ${amount} ${currency}`,
        tokenId ? `Token: #${tokenId}` : null,
        "",
        "– DIKPIK Bazaar"
      ]
        .filter(Boolean)
        .join("\n");
      await sendEmail(env, prevTopBid.email, "You’ve been outbid", outbidMsg);
    }
  } catch (err) {
    console.error("Bid notification send error", err);
  }

  return json(
    {
      ok: true,
      bidId,
      depositId,
      status: "submitted"
    },
    { status: 201, request }
  );
}

async function handleBidList(request, env) {
  const url = new URL(request.url);
  const listingId = toNumber(url.searchParams.get("listingId") || url.searchParams.get("listing_id"));

  const body = await readJson(request);
  const session = await requireSession(request, env, body);
  if (!session) {
    return jsonError("Unauthorized", 401, {}, request);
  }

  const params = [];
  let sql = `
    SELECT b.id, b.listing_id, b.amount_eth, b.tx_hash, b.status, b.created_at,
           bm.wallet, bm.currency, bm.token_id, bm.deposit_id, bm.deposit_amount, bm.deposit_usd, bm.deposit_tx
    FROM bids b
    LEFT JOIN bid_metadata bm ON bm.bid_id = b.id
    WHERE b.member_id = ?`;
  params.push(session.memberId);

  if (Number.isFinite(listingId)) {
    sql += " AND b.listing_id = ?";
    params.push(listingId);
  }

  sql += " ORDER BY b.created_at DESC LIMIT 200";

  const rows = await env.DB.prepare(sql).bind(...params).all();
  const items =
    rows?.results?.map((row) => ({
      id: row.id,
      listingId: row.listing_id,
      amountEth: row.amount_eth,
      txHash: row.tx_hash,
      status: row.status,
      createdAt: isoFromEpoch(row.created_at),
      metadata: {
        wallet: row.wallet,
        currency: row.currency,
        tokenId: row.token_id,
        depositId: row.deposit_id,
        depositAmount: row.deposit_amount,
        depositUsd: row.deposit_usd,
        depositTx: row.deposit_tx
      }
    })) || [];

  return json({ items }, { request });
}

async function handleListingBids(request, env) {
  const url = new URL(request.url);
  const listingId = toNumber(url.searchParams.get("listingId") || url.searchParams.get("listing_id"));
  if (!Number.isFinite(listingId) || listingId <= 0) {
    return jsonError("listingId is required.", 400, {}, request);
  }

  const body = await readJson(request);
  const session = await requireSession(request, env, body);
  if (!session) {
    return jsonError("Unauthorized", 401, {}, request);
  }

  const listing = await env.DB.prepare(
    `SELECT id, member_id, status FROM listings WHERE id = ? LIMIT 1`
  )
    .bind(listingId)
    .first();
  if (!listing) {
    return jsonError("Listing not found.", 404, {}, request);
  }
  if (listing.member_id !== session.memberId) {
    return jsonError("Forbidden", 403, {}, request);
  }

  const rows = await env.DB.prepare(
    `SELECT b.id, b.listing_id, b.amount_eth, b.tx_hash, b.status, b.created_at,
            bm.wallet, bm.currency, bm.token_id, bm.deposit_id, bm.deposit_amount, bm.deposit_usd, bm.deposit_tx,
            m.email, m.name
     FROM bids b
     LEFT JOIN bid_metadata bm ON bm.bid_id = b.id
     LEFT JOIN members m ON m.id = b.member_id
     WHERE b.listing_id = ?
     ORDER BY b.created_at DESC
     LIMIT 200`
  )
    .bind(listingId)
    .all();

  const items =
    rows?.results?.map((row) => ({
      id: row.id,
      listingId: row.listing_id,
      amountEth: row.amount_eth,
      txHash: row.tx_hash,
      status: row.status,
      createdAt: isoFromEpoch(row.created_at),
      bidder: {
        email: row.email,
        name: row.name
      },
      metadata: {
        wallet: row.wallet,
        currency: row.currency,
        tokenId: row.token_id,
        depositId: row.deposit_id,
        depositAmount: row.deposit_amount,
        depositUsd: row.deposit_usd,
        depositTx: row.deposit_tx
      }
    })) || [];

  return json({ items }, { request });
}

function generateLoginCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

async function sendAuthEmail(env, to, code) {
  const subject = "Your DIKPIK BAZAAR login code";
  const textBody = `Use this verification code to sign in: ${code}\n\nIt expires in 15 minutes.`;
  await sendEmail(env, to, subject, textBody);
}

async function sendEmail(env, to, subject, textBody) {
  if (!to || !subject || !textBody) return;

  // Prefer Mailgun if configured
  if (env.MAILGUN_API_KEY && env.MAILGUN_DOMAIN) {
    try {
      const auth = btoa(`api:${env.MAILGUN_API_KEY}`);
      const from = env.MAILGUN_FROM || `info@${env.MAILGUN_DOMAIN}`;
      const params = new URLSearchParams();
      params.append("from", from);
      params.append("to", to);
      params.append("subject", subject);
      params.append("text", textBody);

      const res = await fetch(`https://api.mailgun.net/v3/${env.MAILGUN_DOMAIN}/messages`, {
        method: "POST",
        headers: {
          Authorization: `Basic ${auth}`,
          "content-type": "application/x-www-form-urlencoded"
        },
        body: params
      });
      if (!res.ok) {
        const errText = await res.text();
        console.error("Mailgun send failed", res.status, errText);
      }
      return;
    } catch (err) {
      console.error("Mailgun request error", err);
      return;
    }
  }

  // Fallback to Postmark if Mailgun is not configured
  if (!env.POSTMARK_API_TOKEN) {
    console.warn("Email send skipped: no MAILGUN or POSTMARK credentials present.");
    return;
  }
  try {
    const res = await fetch("https://api.postmarkapp.com/email", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "X-Postmark-Server-Token": env.POSTMARK_API_TOKEN
      },
      body: JSON.stringify({
        From: "info@dikpik.io",
        To: to,
        Subject: subject,
        TextBody: textBody
      })
    });
    if (!res.ok) {
      const errText = await res.text();
      console.error("Postmark send failed", res.status, errText);
    }
  } catch (err) {
    console.error("Postmark request error", err);
  }
}

async function readJson(request) {
  try {
    return await request.json();
  } catch (_err) {
    return null;
  }
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function sanitizeOptionalString(value) {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed.length ? trimmed : null;
}

function sanitizeShortString(value, max = 140) {
  const v = sanitizeOptionalString(value);
  if (!v) return null;
  return v.length > max ? v.slice(0, max) : v;
}

function sanitizeWallet(value) {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  if (/^0x[a-fA-F0-9]{40}$/.test(trimmed)) {
    return trimmed.toLowerCase();
  }
  return null;
}

function sanitizeHash(value) {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return /^0x[a-fA-F0-9]{64}$/.test(trimmed) ? trimmed : null;
}

function sanitizeCurrency(value) {
  const v = sanitizeOptionalString(value);
  if (!v) return null;
  return v.slice(0, 8).toUpperCase();
}

function sanitizeListingStatus(value) {
  const v = sanitizeOptionalString(value);
  if (!v) return null;
  const lower = v.toLowerCase();
  const allowed = ["draft", "published", "closed"];
  return allowed.includes(lower) ? lower : null;
}

function sanitizePhone(value) {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  const normalized = trimmed.replace(/[^0-9+()\-\s]/g, "");
  return normalized || null;
}

function sanitizeEmail(value) {
  const v = sanitizeOptionalString(value);
  if (!v) return null;
  const normalized = v.toLowerCase();
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized) ? normalized : null;
}

function toNumber(value) {
  if (value === null || value === undefined) return null;
  const num = typeof value === "string" ? Number(value) : value;
  return Number.isFinite(num) ? num : null;
}

function isoFromEpoch(value) {
  if (value === null || value === undefined) return null;
  const num =
    typeof value === "string" && value.trim().length
      ? Number(value)
      : value;
  if (!Number.isFinite(num)) return null;
  try {
    return new Date(num * 1000).toISOString();
  } catch (_err) {
    return null;
  }
}

function safeParseJson(text) {
  if (!text) return {};
  try {
    return JSON.parse(text);
  } catch (_err) {
    return {};
  }
}

function serializeListingRow(row) {
  const payload = safeParseJson(row?.payload);
  const kind = payload.kind || row?.type || "auction";
  return {
    ...payload,
    id: row?.id,
    kind,
    status: row?.status || payload.status || "draft",
    memberId: row?.member_id ?? null,
    createdAt: isoFromEpoch(row?.created_at),
    updatedAt: isoFromEpoch(row?.updated_at),
    ownerEmail: row?.email || null,
    ownerName: row?.name || null
  };
}

function extractAuthToken(request, body) {
  const authHeader =
    request.headers.get("authorization") ||
    request.headers.get("Authorization");
  if (authHeader && typeof authHeader === "string") {
    const match = authHeader.match(/^Bearer\s+(.+)$/i);
    if (match && match[1]) {
      return match[1].trim();
    }
  }
  if (body && typeof body.authToken === "string" && body.authToken.trim()) {
    return body.authToken.trim();
  }
  return null;
}

async function requireSession(request, env, body) {
  const token = extractAuthToken(request, body);
  if (!token) return null;
  const session = await env.DB.prepare(
    `SELECT s.member_id, s.expires_at, m.email, m.name, m.phone, m.marketing_opt_in
     FROM sessions s
     JOIN members m ON m.id = s.member_id
     WHERE s.session_token = ?`
  )
    .bind(token)
    .first();
  if (!session) return null;
  const now = Math.floor(Date.now() / 1000);
  if (session.expires_at && session.expires_at < now) return null;
  return {
    memberId: session.member_id,
    member: {
      id: session.member_id,
      email: session.email,
      name: session.name,
      phone: session.phone,
      marketingOptIn: !!session.marketing_opt_in
    }
  };
}
