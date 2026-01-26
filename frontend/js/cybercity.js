// Step 2: wallet + NFT verification wiring. Three.js scene lands in Steps 4/5 after district schema (Step 3).

import { connectMetaMask, verifyOwnership, summarizeHoldings, WALLET_STATE } from "./wallet.js";

async function loadJson(path){
  const res = await fetch(path);
  if (!res.ok) throw new Error(`Failed to load ${path}`);
  return res.json();
}

async function bootstrapCybercity(){
  const statusEl = document.createElement("div");
  statusEl.className = "fixed bottom-3 right-3 text-xs bg-white/10 border border-white/15 rounded px-3 py-2 text-white/70";
  statusEl.textContent = "Cybercity scaffold ready. Wallet verification active. Scene waits for Steps 4-5.";
  document.body.appendChild(statusEl);

  const datasets = {};
  try{
    const [districts, factions, contracts] = await Promise.all([
      loadJson("./frontend/data/districts.json"),
      loadJson("./frontend/data/factions.json"),
      loadJson("./frontend/data/contracts.json")
    ]);
    datasets.districts = districts;
    datasets.factions = factions;
    datasets.contracts = contracts;
    console.info("[cybercity] configs loaded", { districtsCount: districts.length, factions: Object.keys(factions || {}), contracts: contracts?.length || 0 });
    statusEl.textContent = `Datasets loaded: ${districts.length} districts (${districts.filter(d => d.comingSoon).length} coming soon). Wallet verification active.`;
  } catch (err){
    console.warn("[cybercity] config load warning", err);
    statusEl.textContent = "Cybercity scaffold loaded, but config files are missing/invalid. See console.";
  }

  bindWalletUI(datasets);
}

function bindWalletUI(datasets){
  const connectBtn = document.getElementById("cc_connect");
  const verifyBtn = document.getElementById("cc_verify");
  const statusEl = document.getElementById("cc_status");
  const resultsEl = document.getElementById("cc_results");
  if (!connectBtn || !verifyBtn || !statusEl || !resultsEl){
    console.warn("[cybercity] wallet UI elements missing");
    return;
  }

  connectBtn.addEventListener("click", async () => {
    statusEl.textContent = "Connecting to MetaMask...";
    try{
      const { provider, signer, address } = await connectMetaMask();
      WALLET_STATE.provider = provider;
      WALLET_STATE.signer = signer;
      WALLET_STATE.address = address;
      statusEl.textContent = `Connected: ${address}`;
    } catch (err){
      statusEl.textContent = `Connect error: ${err?.message || err}`;
    }
  });

  verifyBtn.addEventListener("click", async () => {
    if (!WALLET_STATE.provider || !WALLET_STATE.address){
      statusEl.textContent = "Connect a wallet first.";
      return;
    }
    const contracts = datasets.contracts || [];
    if (!contracts.length){
      statusEl.textContent = "No contracts configured (frontend/data/contracts.json).";
      return;
    }
    statusEl.textContent = "Verifying NFT ownership...";
    try{
      const results = await verifyOwnership({
        provider: WALLET_STATE.provider,
        address: WALLET_STATE.address,
        contracts
      });
      const summary = summarizeHoldings(results);
      resultsEl.textContent = summary;
      statusEl.textContent = "Verification complete.";
    } catch (err){
      statusEl.textContent = `Verify error: ${err?.message || err}`;
    }
  });
}

if (document.readyState === "complete" || document.readyState === "interactive"){
  bootstrapCybercity();
} else {
  document.addEventListener("DOMContentLoaded", bootstrapCybercity);
}
