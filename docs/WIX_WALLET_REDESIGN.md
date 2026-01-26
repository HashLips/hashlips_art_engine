## Wix Wallet Flow Redesign

We are removing the Auctions iframe dependency because it blocks first‑party cookies, causes MetaMask popups to fail, and makes `/ _functions` auth impossible to secure. Phase 1 moves all wallet UX directly into the Velo page so Wix owns the window context and can run SIWE without cross‑origin messages.

### Event Flow
```mermaid
sequenceDiagram
    participant U as User (Wix Page)
    participant W as wallet.ts
    participant MM as MetaMask / WC
    participant A as backend/auth.jsw
    participant B as backend/bids.jsw
    participant D as Wix Collections

    U->>W: Click "Connect Wallet"
    W->>MM: requestAccounts / WalletConnect handshake
    MM-->>W: address, chainId
    W->>A: getNonce(memberId)
    A-->>W: nonce
    W->>MM: SIWE message signature
    MM-->>W: signature
    W->>A: verifySiwe(address, signature, nonce)
    A-->>W: JWT
    W->>B: placeBid({auctionId, amount}, JWT)
    B->>D: validate auction (optimistic version)
    D-->>B: updated auction/bid
    B-->>W: bid confirmation
    W-->>U: Toast + UI update
```

### Phase 1 Scope

- EVM wallets: MetaMask + WalletConnect v2 (covers Binance Wallet).
- Single chain id (config via secret `SUPPORTED_CHAIN_ID`).
- SIWE login, JWT stored in wix-storage session.
- Collections: `MembersWallets`, `Auctions` (add `version`), `Bids`, `AuthNonces`.
- Actions supported: connect wallet, sign SIWE, place bid, create/update auction, list bids.

### Phase 2 Backlog

- Additional chains (Solana/Phantom) with chain-agnostic signatures.
- Automatic escrow settlement + on-chain proofs.
- Scale beyond Wix collection limits with external DB + HTTP functions proxy.
- Push notifications / WebSocket live bids.
