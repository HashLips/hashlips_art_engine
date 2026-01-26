// Step 2: Wallet + NFT verification scaffold.
// Uses ethers via ESM CDN; MetaMask only (WalletConnect placeholder).

import { ethers, BrowserProvider, Contract } from "https://esm.sh/ethers@6.13.0";

const ABI_721 = [
  "function balanceOf(address) view returns (uint256)",
  "function ownerOf(uint256) view returns (address)",
  "function tokenOfOwnerByIndex(address,uint256) view returns (uint256)",
  "function tokenURI(uint256) view returns (string)"
];
const ABI_1155 = [
  "function balanceOf(address,uint256) view returns (uint256)",
  "function uri(uint256) view returns (string)"
];

function ipfsToHttp(uri){
  if (!uri) return null;
  return uri.startsWith("ipfs://") ? uri.replace("ipfs://", "https://ipfs.io/ipfs/") : uri;
}

async function fetchJsonMaybe(uri){
  if (!uri) return null;
  const url = ipfsToHttp(uri);
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Metadata fetch failed for ${url}`);
  return res.json();
}

export async function connectMetaMask(){
  if (!window.ethereum) throw new Error("MetaMask not found in this browser");
  const provider = new BrowserProvider(window.ethereum);
  const [addr] = await provider.send("eth_requestAccounts", []);
  const address = ethers.getAddress(addr);
  const signer = await provider.getSigner();
  return { provider, signer, address };
}

export async function verifyOwnership({ provider, address, contracts }){
  if (!provider) throw new Error("Provider missing");
  const out = [];
  for (const cfg of contracts || []){
    const standard = (cfg.standard || "").toUpperCase();
    const addr = cfg.address;
    if (!addr || /your/i.test(addr) || /^0x0{40}$/i.test(addr)){
      out.push({ contract: addr || "unset", standard, status: "skipped", reason: "placeholder address" });
      continue;
    }
    try{
      if (standard === "ERC721"){
        out.push(await verifyErc721(provider, address, cfg));
      } else if (standard === "ERC1155"){
        out.push(await verifyErc1155(provider, address, cfg));
      } else {
        out.push({ contract: addr, standard, status: "skipped", reason: "unsupported standard" });
      }
    } catch (err){
      out.push({ contract: addr, standard, status: "error", error: err?.message || String(err) });
    }
  }
  return out;
}

async function verifyErc721(provider, owner, cfg){
  const contract = new Contract(cfg.address, ABI_721, provider);
  let ownedIds = [];
  if (Array.isArray(cfg.tokenIds) && cfg.tokenIds.length){
    for (const id of cfg.tokenIds){
      try{
        const o = await contract.ownerOf(id);
        if (ethers.getAddress(o) === owner) ownedIds.push(String(id));
      } catch (_err){
        // ignore missing token
      }
    }
  } else {
    try{
      const bal = Number(await contract.balanceOf(owner));
      if (Number.isFinite(bal) && bal > 0){
        // attempt enumeration; if fails, we only report count
        for (let i = 0; i < Math.min(bal, 10); i++){
          try{
            const id = await contract.tokenOfOwnerByIndex(owner, i);
            ownedIds.push(String(id));
          } catch (_err){
            break;
          }
        }
      }
    } catch (err){
      return { contract: cfg.address, standard: "ERC721", status: "error", error: err?.message || String(err) };
    }
  }
  const items = [];
  for (const id of ownedIds){
    try{
      const uri = await contract.tokenURI(id);
      const meta = await fetchJsonMaybe(uri);
      items.push({ tokenId: id, uri, metadata: meta });
    } catch (_err){
      items.push({ tokenId: id, uri: null, metadata: null });
    }
  }
  return {
    contract: cfg.address,
    name: cfg.name || "ERC721",
    standard: "ERC721",
    status: "ok",
    ownedIds,
    items
  };
}

async function verifyErc1155(provider, owner, cfg){
  const contract = new Contract(cfg.address, ABI_1155, provider);
  const tokenIds = Array.isArray(cfg.tokenIds) ? cfg.tokenIds : [];
  const items = [];
  for (const id of tokenIds){
    try{
      const bal = await contract.balanceOf(owner, id);
      if (bal && bal > 0n){
        let meta = null;
        try{
          const uri = await contract.uri(id);
          meta = await fetchJsonMaybe(uri);
        } catch (_err){}
        items.push({ tokenId: String(id), balance: bal.toString(), metadata: meta });
      }
    } catch (_err){
      // ignore missing
    }
  }
  return {
    contract: cfg.address,
    name: cfg.name || "ERC1155",
    standard: "ERC1155",
    status: "ok",
    items
  };
}

export function summarizeHoldings(results){
  const lines = [];
  results.forEach(r => {
    if (r.status === "ok"){
      const count = r.items?.length || 0;
      lines.push(`${r.name || r.contract} (${r.standard}): ${count} item${count === 1 ? "" : "s"}`);
      r.items?.forEach(item => {
        const attrs = extractTraits(item.metadata);
        lines.push(`- #${item.tokenId}${attrs ? ` | ${attrs}` : ""}`);
      });
    } else if (r.status === "skipped"){
      lines.push(`${r.contract || "contract"}: skipped (${r.reason})`);
    } else if (r.status === "error"){
      lines.push(`${r.contract || "contract"}: error ${r.error}`);
    }
  });
  return lines.join("\n") || "No holdings detected.";
}

export function extractTraits(meta){
  if (!meta || !meta.attributes) return "";
  const pairs = [];
  for (const attr of meta.attributes){
    if (attr?.trait_type && attr?.value) pairs.push(`${attr.trait_type}: ${attr.value}`);
  }
  return pairs.join(" | ");
}

export const WALLET_STATE = {
  provider: null,
  address: null,
  signer: null
};
