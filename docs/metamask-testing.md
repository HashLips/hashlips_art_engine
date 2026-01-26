# MetaMask testing with fake crypto

You can safely test wallet flows without real funds by pointing MetaMask at a test network or a local chain.

## Quick options
- **Sepolia/Holesky testnets:** Add the network in MetaMask (often prelisted), then use a faucet to claim test ETH. Search “Sepolia faucet” or “Holesky faucet” and paste your address.
- **Local chain:** Run a dev chain (Hardhat/Ganache/Anvil). Add a custom RPC in MetaMask with the local RPC URL (e.g., `http://127.0.0.1:8545`) and chain ID the dev node reports. Use the pre-funded private keys from the dev chain.

## Tips
- Never import a production private key into test or local MetaMask profiles.
- For cross‑origin dApp tests, keep the site using the same chain ID that MetaMask is connected to.
- Reset MetaMask nonce/caches via Settings → Advanced → “Reset Account” if txs get stuck.***
