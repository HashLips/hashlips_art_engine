## Wallet & Bids Smoke Checklist

1. **Connect MetaMask**
   - Load `/wanted-and-bazar`.
   - Click Connect; MetaMask prompts; ensure address + chain display.
2. **JWT issuance**
   - Capture Network tab → `auth/verifySiwe` returns 200, `sessionStorage.dikpik_jwt` populated.
3. **Wrong chain**
   - Switch MetaMask to another network; Connect should show “wrong chain” toast and call `switchChain`.
4. **Place bid**
   - Select live auction, enter amount > current high.
   - Verify `/backend/bids.placeBid` returns updated amount and UI toast.
5. **Concurrency**
   - Simulate stale version by placing two bids quickly; second should receive `AUCTION_CONFLICT` toast.
6. **JWT expiry**
   - Clear session storage token, try bid → should force re-auth (getNonce + verify).
7. **Disconnect**
   - Click Disconnect; address label resets; placing bid should fail until reconnection.
