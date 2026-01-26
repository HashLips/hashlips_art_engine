const datasets = {
  companyStructures: ["Pty Ltd", "Ltd", "Pty", "NL"],
  titles: ["Mr", "Mrs", "Miss", "Ms", "Mx"],
  states: ["ACT", "NSW", "NT", "QLD", "SA", "TAS", "VIC", "WA"],
  roles: [
    "General Labourer", "Skilled Labourer", "Site Cleaner", "Traffic Controller",
    "Carpenter", "Formworker", "Concreter", "Steel Fixer", "Scaffolder",
    "Painter", "Plumber", "Electrician", "HVAC Tech",
    "Operator—Forklift", "Operator—EWP", "Operator—Excavator", "Operator—Skid Steer",
    "Operator—Crane", "Leading Hand", "Site Supervisor"
  ],
  tickets: [
    "White Card (WHS)", "First Aid (HLTAID011+)", "Working at Heights", "Confined Space",
    "Asbestos Awareness", "Traffic Control (TC/TMI)", "Forklift (LF)", "EWP (WP)",
    "Scaffolding (SB/SA/SI)", "Rigging (RB/RI)", "Dogging (DG)", "Crane Operation (CO)",
    "Excavator (LE)", "Skid Steer (LS)", "Telehandler (LT)", "Electrical Licence",
    "HVAC Cert", "Fire Safety Induction", "Manual Handling", "Silica Awareness"
  ],
  otOptions: [
    "No OT","Weekday OT (1.5x)","Weekday OT (2.0x)","Saturday OT (1.5x)","Saturday OT (2.0x)",
    "Sunday OT (2.0x)","Public Holiday (2.5x)","Night Shift Loading","Call-out","Standby"
  ],
  experience: ["Newly ticketed","1","2","3","4","5","6","7","8","9","10+"],
  durationUnits: ["days","weeks"]
};

let map;
let marker;
let autocomplete;
let selectedPlace = null;
let mapReady = false;

const form = document.getElementById("booking-form");
const mapsWarning = document.getElementById("maps-warning");
const modal = document.getElementById("modal");
const jsonOutput = document.getElementById("json-output");
const closeModalBtn = document.getElementById("close-modal");
const openJsonBtn = document.getElementById("open-json");
const exportCsvBtn = document.getElementById("export-csv");
const attachmentsInput = document.getElementById("attachments");
const attachmentsList = document.getElementById("attachments-list");

const groupsEl = document.getElementById("groups");
const addGroupBtn = document.getElementById("add-group");

let groups = [];

function populateSelect(name, values) {
  const el = form.querySelector(`[name='${name}']`);
  values.forEach((v) => {
    const opt = document.createElement("option");
    opt.value = v;
    opt.textContent = v;
    el.appendChild(opt);
  });
}

populateSelect("companyStructure", datasets.companyStructures);
populateSelect("contactTitle", datasets.titles);
populateSelect("registeredState", datasets.states);

function defaultGroup() {
  return {
    count: 1,
    role: "",
    tickets: [],
    experience: "",
    startDate: "",
    startTime: "",
    hoursPerDay: "",
    expectedDurationValue: "",
    expectedDurationUnit: "",
    otOptions: [],
    nextRole: false
  };
}

function renderGroups() {
  groupsEl.innerHTML = "";
  groups.forEach((group, idx) => {
    const wrap = document.createElement("div");
    wrap.className = "group";
    wrap.innerHTML = `
      <div class="group-head">
        <h3>Role group ${idx + 1}</h3>
        ${groups.length > 1 ? `<button type="button" data-remove="${idx}">Remove</button>` : ""}
      </div>
      <div class="inline-row">
        <label>Number of workers *
          <input type="number" name="count" min="1" value="${group.count}" data-idx="${idx}" required />
          <span class="error" data-error-for="count-${idx}"></span>
        </label>
        <label>Role needed *
          <select name="role" data-idx="${idx}" required>
            <option value="">Select...</option>
            ${datasets.roles.map((r) => `<option value="${r}" ${group.role === r ? "selected" : ""}>${r}</option>`).join("")}
          </select>
          <span class="error" data-error-for="role-${idx}"></span>
        </label>
        <label>Tickets (optional)
          <select name="tickets" data-idx="${idx}" multiple size="4">
            ${datasets.tickets.map((t) => `<option value="${t}" ${group.tickets.includes(t) ? "selected" : ""}>${t}</option>`).join("")}
          </select>
        </label>
        <label>Minimum years' experience *
          <select name="experience" data-idx="${idx}" required>
            <option value="">Select...</option>
            ${datasets.experience.map((e) => `<option value="${e}" ${group.experience === e ? "selected" : ""}>${e}</option>`).join("")}
          </select>
          <span class="error" data-error-for="experience-${idx}"></span>
        </label>
      </div>
      <div class="inline-row">
        <label>Start date *
          <input type="date" name="startDate" data-idx="${idx}" value="${group.startDate}" required />
          <span class="error" data-error-for="startDate-${idx}"></span>
        </label>
        <label>Daily start time *
          <input type="time" name="startTime" data-idx="${idx}" value="${group.startTime}" required />
          <span class="error" data-error-for="startTime-${idx}"></span>
        </label>
        <label>Estimated hours per day *
          <input type="number" step="0.5" min="1" name="hoursPerDay" data-idx="${idx}" value="${group.hoursPerDay}" required />
          <span class="error" data-error-for="hoursPerDay-${idx}"></span>
        </label>
        <label>Expected duration (value) *
          <input type="number" min="1" name="expectedDurationValue" data-idx="${idx}" value="${group.expectedDurationValue}" required />
          <span class="error" data-error-for="expectedDurationValue-${idx}"></span>
        </label>
        <label>Expected duration (unit) *
          <select name="expectedDurationUnit" data-idx="${idx}" required>
            <option value="">Select...</option>
            ${datasets.durationUnits.map((u) => `<option value="${u}" ${group.expectedDurationUnit === u ? "selected" : ""}>${u}</option>`).join("")}
          </select>
          <span class="error" data-error-for="expectedDurationUnit-${idx}"></span>
        </label>
      </div>
      <div class="inline-row">
        <label>OT/weekend expected? (optional)
          <select name="otOptions" data-idx="${idx}" multiple size="4">
            ${datasets.otOptions.map((o) => `<option value="${o}" ${group.otOptions.includes(o) ? "selected" : ""}>${o}</option>`).join("")}
          </select>
        </label>
        <label class="inline">
          <input type="checkbox" name="nextRole" data-idx="${idx}" ${group.nextRole ? "checked" : ""} />
          Next role needed (auto add another group)
        </label>
      </div>
    `;
    groupsEl.appendChild(wrap);
  });
}

function syncGroupValue(idx, name, value) {
  groups[idx][name] = value;
  if (name === "nextRole" && value) {
    groups[idx][name] = false;
    groups.push(defaultGroup());
    renderGroups();
    attachGroupListeners();
  }
}

function attachGroupListeners() {
  groupsEl.querySelectorAll("input, select").forEach((el) => {
    el.onchange = (e) => {
      const target = e.target;
      const idx = Number(target.dataset.idx);
      if (target.name === "tickets" || target.name === "otOptions") {
        const vals = Array.from(target.selectedOptions).map((o) => o.value);
        syncGroupValue(idx, target.name, vals);
      } else if (target.name === "nextRole") {
        syncGroupValue(idx, target.name, target.checked);
      } else {
        syncGroupValue(idx, target.name, target.value);
      }
    };
  });
  groupsEl.querySelectorAll("[data-remove]").forEach((btn) => {
    btn.onclick = () => {
      const idx = Number(btn.dataset.remove);
      groups.splice(idx, 1);
      if (groups.length === 0) groups.push(defaultGroup());
      renderGroups();
      attachGroupListeners();
    };
  });
}

addGroupBtn.addEventListener("click", () => {
  groups.push(defaultGroup());
  renderGroups();
  attachGroupListeners();
});

// initial group
groups = [defaultGroup()];
renderGroups();
attachGroupListeners();

function showError(name, msg) {
  const el = document.querySelector(`[data-error-for='${name}']`);
  if (el) el.textContent = msg || "";
}

function clearErrors() {
  document.querySelectorAll(".error").forEach((el) => (el.textContent = ""));
}

function validate() {
  clearErrors();
  const data = new FormData(form);
  let ok = true;
  const required = [
    "companyName","companyStructure","contactTitle","contactName","contactJobTitle",
    "contactMobile","contactEmail","acn","abn","registeredStreet","registeredState","registeredPostcode",
    "siteSearch"
  ];
  required.forEach((field) => {
    if (!data.get(field)) {
      ok = false;
      showError(field, "Required");
    }
  });
  const acn = (data.get("acn") || "").toString().replace(/\D/g, "");
  const abn = (data.get("abn") || "").toString().replace(/\D/g, "");
  if (acn.length !== 9) { ok = false; showError("acn", "Must be 9 digits"); }
  if (abn.length !== 11) { ok = false; showError("abn", "Must be 11 digits"); }
  if (acn && abn && abn.endsWith(acn)) document.getElementById("abn-hint").hidden = false;
  else document.getElementById("abn-hint").hidden = true;

  const email = data.get("contactEmail");
  if (email && !/^[^@\\s]+@[^@\\s]+\\.[^@\\s]+$/.test(email)) { ok = false; showError("contactEmail", "Invalid email"); }
  const website = data.get("website");
  if (website && !/^https?:\\/\\//i.test(website)) { ok = false; showError("website", "Must start with http/https"); }
  const pc = (data.get("registeredPostcode") || "").toString().replace(/\D/g, "");
  if (pc.length !== 4) { ok = false; showError("registeredPostcode", "4 digits"); }

  groups.forEach((g, idx) => {
    const prefix = (field) => `${field}-${idx}`;
    if (!g.count || Number(g.count) < 1) { ok = false; showError(prefix("count"), "Required"); }
    if (!g.role) { ok = false; showError(prefix("role"), "Required"); }
    if (!g.experience) { ok = false; showError(prefix("experience"), "Required"); }
    if (!g.startDate) { ok = false; showError(prefix("startDate"), "Required"); }
    if (!g.startTime) { ok = false; showError(prefix("startTime"), "Required"); }
    if (!g.hoursPerDay) { ok = false; showError(prefix("hoursPerDay"), "Required"); }
    if (!g.expectedDurationValue) { ok = false; showError(prefix("expectedDurationValue"), "Required"); }
    if (!g.expectedDurationUnit) { ok = false; showError(prefix("expectedDurationUnit"), "Required"); }
  });

  return ok;
}

function gatherPayload() {
  const data = new FormData(form);
  return {
    company: {
      name: data.get("companyName") || "",
      structure: data.get("companyStructure") || "",
      contactTitle: data.get("contactTitle") || "",
      contactName: data.get("contactName") || "",
      contactJobTitle: data.get("contactJobTitle") || "",
      contactEmail: data.get("contactEmail") || "",
      contactMobile: data.get("contactMobile") || "",
      contactLandline: data.get("contactLandline") || "",
      preferredContactTime: data.get("preferredContactTime") || "",
      contactOnBehalf: data.get("contactOnBehalf") === "on",
      acn: (data.get("acn") || "").toString().replace(/\D/g, ""),
      abn: (data.get("abn") || "").toString().replace(/\D/g, ""),
      website: data.get("website") || ""
    },
    registeredAddress: {
      street: data.get("registeredStreet") || "",
      state: data.get("registeredState") || "",
      postcode: (data.get("registeredPostcode") || "").toString().replace(/\D/g, "")
    },
    siteAddress: {
      siteName: data.get("siteName") || "",
      formattedAddress: data.get("siteFormattedAddress") || data.get("siteSearch") || "",
      lat: data.get("siteLat") ? Number(data.get("siteLat")) : null,
      lng: data.get("siteLng") ? Number(data.get("siteLng")) : null,
      placeId: data.get("sitePlaceId") || null,
      mapUrl: document.getElementById("map-link").href || ""
    },
    roles: groups.map((g) => ({
      count: Number(g.count) || 0,
      role: g.role,
      tickets: g.tickets,
      experience: g.experience,
      startDate: g.startDate,
      startTime: g.startTime,
      hoursPerDay: Number(g.hoursPerDay) || 0,
      expectedDurationValue: Number(g.expectedDurationValue) || 0,
      expectedDurationUnit: g.expectedDurationUnit,
      otOptions: g.otOptions
    })),
    notes: data.get("notes") || "",
    attachments: window.__attachments || [],
    attachmentsLink: data.get("attachmentsLink") || "",
    submittedAt: new Date().toISOString()
  };
}

function openModal(json) {
  jsonOutput.textContent = JSON.stringify(json, null, 2);
  modal.hidden = false;
}
function closeModal() {
  modal.hidden = true;
}
closeModalBtn.onclick = closeModal;
modal.addEventListener("click", (e) => {
  if (e.target === modal) closeModal();
});
window.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && !modal.hidden) closeModal();
});

openJsonBtn.addEventListener("click", () => {
  if (!validate()) {
    alert("Fix errors before previewing JSON.");
    return;
  }
  const payload = gatherPayload();
  openModal(payload);
});

exportCsvBtn.addEventListener("click", () => {
  if (!validate()) {
    alert("Fix errors before exporting CSV.");
    return;
  }
  const payload = gatherPayload();
  const rows = [];
  payload.roles.forEach((role, idx) => {
    rows.push({
      "Company Structure": payload.company.structure,
      "ACN": payload.company.acn,
      "ABN": payload.company.abn,
      "Website": payload.company.website,
      "Registered Street": payload.registeredAddress.street,
      "Registered State": payload.registeredAddress.state,
      "Registered Postcode": payload.registeredAddress.postcode,
      "Site Name": payload.siteAddress.siteName,
      "Site Address": payload.siteAddress.formattedAddress,
      "Site Map Link": payload.siteAddress.mapUrl,
      "Role Group #": idx + 1,
      "Number of Workers": role.count,
      "Role": role.role,
      "Tickets": role.tickets.join("; "),
      "Experience": role.experience,
      "Start Date": role.startDate,
      "Start Time": role.startTime,
      "Hours/Day": role.hoursPerDay,
      "Expected Duration": `${role.expectedDurationValue} ${role.expectedDurationUnit}`,
      "OT Options": role.otOptions.join("; "),
      "Notes": payload.notes,
      "Attachments Link": payload.attachmentsLink,
      "Submitted At": payload.submittedAt
    });
  });
  const header = Object.keys(rows[0] || {});
  const csv = [header.join(",")].concat(
    rows.map((r) =>
      header
        .map((h) => `"${String(r[h] ?? "").replace(/"/g, '""')}"`)
        .join(","),
    ),
  ).join("\\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "booking.csv";
  a.click();
  URL.revokeObjectURL(url);
});

form.addEventListener("submit", (e) => {
  e.preventDefault();
  if (!validate()) return;
  const payload = gatherPayload();
  openModal(payload);
});

attachmentsInput?.addEventListener("change", async (e) => {
  const files = e.target.files;
  if (!files) return;
  let total = 0;
  const arr = [];
  for (const file of Array.from(files)) {
    total += file.size;
    if (total > 10 * 1024 * 1024) {
      alert("Attachments exceed 10MB total. Please reduce file sizes.");
      return;
    }
    const base64 = await file.arrayBuffer().then((buf) => btoa(String.fromCharCode(...new Uint8Array(buf))));
    arr.push({ name: file.name, type: file.type, size: file.size, content: base64 });
  }
  window.__attachments = arr;
  attachmentsList.innerHTML = arr.map((f) => `<li>${f.name} (${Math.round(f.size / 1024)} KB)</li>`).join("");
});

// MAPS
window.initMap = function initMap() {
  try {
    const mapEl = document.getElementById("map");
    if (!mapEl) return;
    map = new google.maps.Map(mapEl, {
      center: { lat: -33.8688, lng: 151.2093 },
      zoom: 12,
      streetViewControl: false,
      mapTypeControl: false,
    });
    marker = new google.maps.Marker({ map, draggable: true, position: map.getCenter() });
    google.maps.event.addListener(marker, "dragend", () => {
      const pos = marker.getPosition();
      updateSelected(null, pos);
    });

    const input = document.getElementById("site-search");
    autocomplete = new google.maps.places.Autocomplete(input, { fields: ["formatted_address", "geometry", "place_id"] });
    autocomplete.addListener("place_changed", () => {
      const place = autocomplete.getPlace();
      if (!place.geometry) return;
      updateSelected(place, place.geometry.location);
    });

    document.getElementById("recenter").onclick = () => {
      if (selectedPlace && selectedPlace.location) {
        map.panTo(selectedPlace.location);
        marker.setPosition(selectedPlace.location);
      }
    };
    mapReady = true;
  } catch (e) {
    mapsWarning.hidden = false;
    mapReady = false;
  }
};

function updateSelected(place, latLng) {
  const formatted = place?.formatted_address || "";
  const loc = latLng || place?.geometry?.location;
  const lat = loc?.lat?.() ?? loc?.lat;
  const lng = loc?.lng?.() ?? loc?.lng;
  selectedPlace = { formatted, placeId: place?.place_id || null, location: loc };
  document.querySelector("[name='siteFormattedAddress']").value = formatted;
  document.querySelector("[name='siteLat']").value = lat ?? "";
  document.querySelector("[name='siteLng']").value = lng ?? "";
  document.querySelector("[name='sitePlaceId']").value = place?.place_id || "";
  document.getElementById("selected-address").textContent = formatted || "None";
  document.getElementById("coords").textContent = lat ? `Lat/Lng: ${lat.toFixed(5)}, ${lng.toFixed(5)}` : "Lat/Lng: -";
  const link = lat ? `https://www.google.com/maps/search/?api=1&query=${lat},${lng}${place?.place_id ? `&query_place_id=${place.place_id}` : ""}` : "#";
  document.getElementById("map-link").href = link;
  if (mapReady && lat && lng) {
    map.panTo({ lat, lng });
    marker.setPosition({ lat, lng });
  }
}

// Fallback if Maps fails to load
setTimeout(() => {
  if (!mapReady && !window.google) {
    mapsWarning.hidden = false;
  }
}, 2000);
