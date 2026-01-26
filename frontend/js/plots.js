const factionColors = {
  Corebreakers: "#00ffff",
  Scrapshamans: "#ff00ff",
  Gutterborns: "#ff5500",
  Hydrohackers: "#00ff99",
  Cloudjackers: "#66a3ff",
  Bassfiends: "#ffcc33",
  default: "#7dd3fc"
};

function maskWallet(w) {
  if (!w) return "Available";
  return w.length > 10 ? `${w.slice(0, 6)}…${w.slice(-4)}` : w;
}

async function loadJson(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to load ${url}`);
  return res.json();
}

async function buildGrid() {
  const grid = document.getElementById("plotsGrid");
  if (!grid) return;
  grid.innerHTML = "";

  let plots = [];
  let slots = [];
  try {
    plots = await loadJson("./frontend/data/districts.json");
    slots = await loadJson("./frontend/data/plots.json");
  } catch (err) {
    console.error("[plots] failed to load data", err);
    grid.innerHTML = `<div class="text-sm text-red-300">Failed to load plot data.</div>`;
    return;
  }

  const byFaction = new Map();
  plots.forEach(d => {
    const key = d.faction || d.name || "Unknown";
    if (!byFaction.has(key)) byFaction.set(key, []);
    (d.subDistricts || []).forEach(sd => byFaction.get(key).push({ district: d, sub: sd }));
  });
  byFaction.forEach((items, faction) => {
    const wrap = document.createElement("div");
    wrap.className = "rounded-xl border border-white/10 bg-black/40 p-4";
    const title = document.createElement("div");
    title.className = "text-lg font-semibold flex items-center gap-2";
    const color = factionColors[faction] || factionColors.default;
    title.innerHTML = `<span class="inline-block w-3 h-3 rounded-full" style="background:${color}"></span>${faction}`;
    wrap.appendChild(title);

    const mapWrap = document.createElement("div");
    mapWrap.className = "mt-3 relative overflow-hidden rounded-lg border border-white/10 bg-gradient-to-br from-slate-900/60 via-slate-900/30 to-slate-900/60 p-3";
    mapWrap.style.minHeight = "260px";
    const cloud = document.createElement("div");
    cloud.className = "grid gap-2 sm:grid-cols-6 auto-rows-[60px]";

    items.forEach(({ district, sub }, idx) => {
      const slotId = sub.id;
      const slot = slots.find(s => s.slotId === slotId) || {};
      const owned = Boolean(slot.owner);
      const size = clampSize(sub.areaSqKm || 0.3);
      const tile = document.createElement("div");
      const shapeClass = `plot-tile-shape-${(idx % 3) + 1}`;
      tile.className = `p-2 plot-iso ${shapeClass} border shadow-[0_0_20px_-10px_rgba(0,255,255,0.4)] ${owned ? "border-white/15 bg-white/5" : "border-cyan-500/30 bg-cyan-500/5"} hover:border-cyan-400/60 transition`;
      tile.style.gridColumn = `span ${size.w}`;
      tile.style.gridRow = `span ${size.h}`;
      tile.innerHTML = `
        <div class="plot-inner">
          <div class="flex items-center justify-between text-xs">
            <span class="font-semibold">${sub.name}</span>
            <span class="text-[10px] uppercase tracking-wide text-white/60">${sub.tier}</span>
          </div>
          <div class="text-[11px] text-white/50 truncate">${district.name}</div>
          <div class="text-[10px] text-white/40">Area wt: ${sub.areaSqKm}</div>
          <div class="mt-1 text-[11px] ${owned ? "text-white/70" : "text-cyan-200"}">${owned ? maskWallet(slot.owner) : "Available"}</div>
        </div>
      `;
      tile.addEventListener("click", () => openModal({ district, sub, slot }));
      cloud.appendChild(tile);
    });
    mapWrap.appendChild(cloud);
    wrap.appendChild(mapWrap);
    grid.appendChild(wrap);
  });
}

function clampSize(area) {
  // Map area weights to grid spans (min 1x1, max 3x3)
  if (area >= 0.45) return { w: 3, h: 2 };
  if (area >= 0.35) return { w: 2, h: 2 };
  if (area >= 0.3) return { w: 2, h: 1 };
  return { w: 1, h: 1 };
}

function openModal({ district, sub, slot }) {
  const modal = document.getElementById("plotModal");
  if (!modal) return;
  const owned = Boolean(slot.owner);
  document.getElementById("modalTier").textContent = sub.tier;
  document.getElementById("modalName").textContent = sub.name;
  document.getElementById("modalDistrict").textContent = district.name;
  document.getElementById("modalLore").textContent = sub.lore || district.lore || "";
  document.getElementById("modalFaction").textContent = district.faction || "Unknown";
  document.getElementById("modalArea").textContent = sub.areaSqKm || "n/a";
  document.getElementById("modalStatus").textContent = owned ? "Owned" : "Available";
  document.getElementById("modalOwner").textContent = owned ? maskWallet(slot.owner) : "—";

  const offerBtn = document.getElementById("modalOffer");
  const wantedBtn = document.getElementById("modalWanted");
  const buyBtn = document.getElementById("modalBuy");
  offerBtn.classList.toggle("hidden", !owned);
  wantedBtn.classList.toggle("hidden", !owned);
  buyBtn.classList.toggle("hidden", owned);
  document.getElementById("modalInfo").textContent = owned ? "You can post an offer or a wanted message to the owner." : "Place an offer to buy this plot.";

  modal.classList.remove("hidden");
}

function closeModal() {
  const modal = document.getElementById("plotModal");
  if (modal) modal.classList.add("hidden");
}

document.addEventListener("DOMContentLoaded", () => {
  buildGrid();
  const modalClose = document.getElementById("modalClose");
  if (modalClose) modalClose.addEventListener("click", closeModal);
  document.getElementById("modalOffer")?.addEventListener("click", () => alert("Offer flow stub"));
  document.getElementById("modalWanted")?.addEventListener("click", () => alert("Wanted flow stub"));
  document.getElementById("modalBuy")?.addEventListener("click", () => alert("Buy/Offer flow stub"));
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeModal(); });
});
