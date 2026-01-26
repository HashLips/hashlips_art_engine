// Datasets
const STATES = ["ACT", "NSW", "NT", "QLD", "SA", "TAS", "VIC", "WA"];
const COMPANY_STRUCTURES = ["Pty Ltd", "Ltd", "Pty", "NL"];
const ROLES = [
  "General Labourer",
  "Skilled Labourer",
  "Site Cleaner",
  "Traffic Controller",
  "Carpenter",
  "Formworker",
  "Concreter",
  "Steel Fixer",
  "Scaffolder",
  "Painter",
  "Plumber",
  "Electrician",
  "HVAC Tech",
  "Operator—Forklift",
  "Operator—EWP",
  "Operator—Excavator",
  "Operator—Skid Steer",
  "Operator—Crane",
  "Leading Hand",
  "Site Supervisor",
];
const TICKETS = [
  "White Card (WHS)",
  "First Aid (HLTAID011+)",
  "Working at Heights",
  "Confined Space",
  "Asbestos Awareness",
  "Traffic Control (TC/TMI)",
  "Forklift (LF)",
  "EWP (WP)",
  "Scaffolding (SB/SA/SI)",
  "Rigging (RB/RI)",
  "Dogging (DG)",
  "Crane Operation (CO)",
  "Excavator (LE)",
  "Skid Steer (LS)",
  "Telehandler (LT)",
  "Electrical Licence",
  "HVAC Cert",
  "Fire Safety Induction",
  "Manual Handling",
  "Silica Awareness",
];
const OT_OPTIONS = [
  "No OT",
  "Weekday OT (1.5x)",
  "Weekday OT (2.0x)",
  "Saturday OT (1.5x)",
  "Saturday OT (2.0x)",
  "Sunday OT (2.0x)",
  "Public Holiday (2.5x)",
  "Night Shift Loading",
  "Call-out",
  "Standby",
];
const EXPERIENCE = ["Newly ticketed", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10+"];
const DURATION_UNITS = ["days", "weeks"];

let groups = [];
let map;
let marker;
let autocomplete;
let selectedPlace = null;
let mapSupported = false;

function $(selector) {
  return document.querySelector(selector);
}

function createEl(tag, attrs = {}) {
  const el = document.createElement(tag);
  Object.entries(attrs).forEach(([k, v]) => {
    if (k === "className") el.className = v;
    else if (k === "text") el.textContent = v;
    else el.setAttribute(k, v);
  });
  return el;
}

function populateSelect(select, options) {
  select.innerHTML = "";
  const defaultOpt = createEl("option", { value: "", text: "Select..." });
  select.appendChild(defaultOpt);
  options.forEach((opt) => {
    const o = createEl("option", { value: opt, text: opt });
    select.appendChild(o);
  });
}

function numberOnly(value) {
  return value.replace(/\D/g, "");
}

function setError(name, message) {
  const span = document.querySelector(`[data-error-for="${name}"]`);
  if (span) span.textContent = message || "";
}

function clearAllErrors() {
  document.querySelectorAll(".error").forEach((el) => (el.textContent = ""));
}

function addGroup(initial = {}) {
  const id = crypto.randomUUID ? crypto.randomUUID() : String(Date.now() + Math.random());
  const defaults = {
    id,
    count: "",
    role: "",
    tickets: [],
    experience: "",
    startDate: "",
    startTime: "",
    hoursPerDay: "",
    expectedDurationValue: "",
    expectedDurationUnit: "",
    otOptions: [],
    nextRole: false,
  };
  groups.push({ ...defaults, ...initial, id });
  renderGroups();
}

function removeGroup(id) {
  if (groups.length === 1) return;
  groups = groups.filter((g) => g.id !== id);
  renderGroups();
}

function updateGroup(id, key, value) {
  groups = groups.map((g) => (g.id === id ? { ...g, [key]: value } : g));
}

function toggleInArray(arr, value, checked) {
  if (checked) {
    return arr.includes(value) ? arr : [...arr, value];
  }
  return arr.filter((v) => v !== value);
}

function renderGroups() {
  const container = $("#groups");
  container.innerHTML = "";
  groups.forEach((group, idx) => {
    const wrap = createEl("div", { className: "group" });
    const head = createEl("div", { className: "group-head" });
    head.appendChild(createEl("h3", { text: `Role group ${idx + 1}` }));
    const removeBtn = createEl("button", { type: "button", className: "secondary", text: "Remove" });
    removeBtn.onclick = () => removeGroup(group.id);
    head.appendChild(removeBtn);
    wrap.appendChild(head);

    const grid1 = createEl("div", { className: "grid three" });
    const countLabel = createEl("label");
    countLabel.textContent = "Number of workers";
    const countInput = createEl("input", { type: "number", min: "1", value: group.count });
    countInput.oninput = (e) => updateGroup(group.id, "count", e.target.value);
    countInput.onblur = () => validate();
    countLabel.appendChild(countInput);
    countLabel.appendChild(createEl("span", { className: "error", "data-error-for": `count-${group.id}` }));

    const roleLabel = createEl("label");
    roleLabel.textContent = "Role needed";
    const roleSelect = createEl("select");
    populateSelect(roleSelect, ROLES);
    roleSelect.value = group.role;
    roleSelect.onchange = (e) => updateGroup(group.id, "role", e.target.value);
    roleSelect.onblur = () => validate();
    roleLabel.appendChild(roleSelect);
    roleLabel.appendChild(createEl("span", { className: "error", "data-error-for": `role-${group.id}` }));

    const expLabel = createEl("label");
    expLabel.textContent = "Minimum years’ experience";
    const expSelect = createEl("select");
    populateSelect(expSelect, EXPERIENCE);
    expSelect.value = group.experience;
    expSelect.onchange = (e) => updateGroup(group.id, "experience", e.target.value);
    expSelect.onblur = () => validate();
    expLabel.appendChild(expSelect);
    expLabel.appendChild(createEl("span", { className: "error", "data-error-for": `experience-${group.id}` }));

    grid1.append(countLabel, roleLabel, expLabel);
    wrap.appendChild(grid1);

    const grid2 = createEl("div", { className: "grid three" });
    const startDateLabel = createEl("label");
    startDateLabel.textContent = "Start date";
    const startDateInput = createEl("input", { type: "date", value: group.startDate });
    startDateInput.onchange = (e) => updateGroup(group.id, "startDate", e.target.value);
    startDateInput.onblur = () => validate();
    startDateLabel.appendChild(startDateInput);
    startDateLabel.appendChild(createEl("span", { className: "error", "data-error-for": `startDate-${group.id}` }));

    const startTimeLabel = createEl("label");
    startTimeLabel.textContent = "Daily start time";
    const startTimeInput = createEl("input", { type: "time", value: group.startTime });
    startTimeInput.onchange = (e) => updateGroup(group.id, "startTime", e.target.value);
    startTimeInput.onblur = () => validate();
    startTimeLabel.appendChild(startTimeInput);
    startTimeLabel.appendChild(createEl("span", { className: "error", "data-error-for": `startTime-${group.id}` }));

    const hoursLabel = createEl("label");
    hoursLabel.textContent = "Estimated hours per day";
    const hoursInput = createEl("input", { type: "number", step: "0.1", min: "0", value: group.hoursPerDay });
    hoursInput.oninput = (e) => updateGroup(group.id, "hoursPerDay", e.target.value);
    hoursInput.onblur = () => validate();
    hoursLabel.appendChild(hoursInput);
    hoursLabel.appendChild(createEl("span", { className: "error", "data-error-for": `hoursPerDay-${group.id}` }));

    grid2.append(startDateLabel, startTimeLabel, hoursLabel);
    wrap.appendChild(grid2);

    const grid3 = createEl("div", { className: "grid three" });
    const durationValueLabel = createEl("label");
    durationValueLabel.textContent = "Expected duration (value)";
    const durationValueInput = createEl("input", { type: "number", min: "1", value: group.expectedDurationValue });
    durationValueInput.oninput = (e) => updateGroup(group.id, "expectedDurationValue", e.target.value);
    durationValueInput.onblur = () => validate();
    durationValueLabel.appendChild(durationValueInput);
    durationValueLabel.appendChild(createEl("span", { className: "error", "data-error-for": `expectedDurationValue-${group.id}` }));

    const durationUnitLabel = createEl("label");
    durationUnitLabel.textContent = "Expected duration (unit)";
    const durationUnitSelect = createEl("select");
    populateSelect(durationUnitSelect, DURATION_UNITS);
    durationUnitSelect.value = group.expectedDurationUnit;
    durationUnitSelect.onchange = (e) => updateGroup(group.id, "expectedDurationUnit", e.target.value);
    durationUnitSelect.onblur = () => validate();
    durationUnitLabel.appendChild(durationUnitSelect);
    durationUnitLabel.appendChild(createEl("span", { className: "error", "data-error-for": `expectedDurationUnit-${group.id}` }));

    const nextRoleLabel = createEl("label");
    nextRoleLabel.className = "inline";
    const nextRoleInput = createEl("input", { type: "checkbox" });
    nextRoleInput.onchange = (e) => {
      if (e.target.checked) {
        addGroup();
        e.target.checked = false;
      }
    };
    nextRoleLabel.append(nextRoleInput, createEl("span", { text: "Next role needed (auto add another group)" }));

    grid3.append(durationValueLabel, durationUnitLabel, nextRoleLabel);
    wrap.appendChild(grid3);

    // Tickets and OT multi-select
    const grid4 = createEl("div", { className: "grid two" });
    const ticketsLabel = createEl("label");
    ticketsLabel.textContent = "Tickets (optional)";
    const ticketsDetails = createEl("details");
    const ticketsSummary = createEl("summary", { text: group.tickets.length ? `${group.tickets.length} selected` : "Select tickets" });
    ticketsDetails.appendChild(ticketsSummary);
    const ticketsList = createEl("div");
    TICKETS.forEach((ticket) => {
      const cbLabel = createEl("label", { className: "inline" });
      const cb = createEl("input", { type: "checkbox", value: ticket });
      cb.checked = group.tickets.includes(ticket);
      cb.onchange = (e) => {
        const updated = toggleInArray(group.tickets, ticket, e.target.checked);
        updateGroup(group.id, "tickets", updated);
        ticketsSummary.textContent = updated.length ? `${updated.length} selected` : "Select tickets";
      };
      cbLabel.append(cb, createEl("span", { text: ticket }));
      ticketsList.appendChild(cbLabel);
    });
    ticketsDetails.appendChild(ticketsList);
    ticketsLabel.appendChild(ticketsDetails);
    grid4.appendChild(ticketsLabel);

    const otLabel = createEl("label");
    otLabel.textContent = "OT/weekend expected? (optional)";
    const otDetails = createEl("details");
    const otSummary = createEl("summary", { text: group.otOptions.length ? `${group.otOptions.length} selected` : "Select OT" });
    const otList = createEl("div");
    OT_OPTIONS.forEach((ot) => {
      const cbLabel = createEl("label", { className: "inline" });
      const cb = createEl("input", { type: "checkbox", value: ot });
      cb.checked = group.otOptions.includes(ot);
      cb.onchange = (e) => {
        const updated = toggleInArray(group.otOptions, ot, e.target.checked);
        updateGroup(group.id, "otOptions", updated);
        otSummary.textContent = updated.length ? `${updated.length} selected` : "Select OT";
      };
      cbLabel.append(cb, createEl("span", { text: ot }));
      otList.appendChild(cbLabel);
    });
    otDetails.append(otSummary, otList);
    otLabel.appendChild(otDetails);
    grid4.appendChild(otLabel);

    wrap.appendChild(grid4);
    container.appendChild(wrap);
  });
}

function buildMapLink(lat, lng, placeId) {
  if (lat && lng) {
    return `https://www.google.com/maps/search/?api=1&query=${lat},${lng}` + (placeId ? `&query_place_id=${placeId}` : "");
  }
  return "#";
}

function updateMapMeta() {
  const addr = selectedPlace?.formatted_address || $("#site-search").value || "None";
  $("#selected-address").textContent = addr;
  const lat = selectedPlace?.geometry?.location?.lat() ?? selectedPlace?.lat ?? "";
  const lng = selectedPlace?.geometry?.location?.lng() ?? selectedPlace?.lng ?? "";
  $("#coords").textContent = lat && lng ? `Lat/Lng: ${lat.toFixed(6)}, ${lng.toFixed(6)}` : "Lat/Lng: —";
  const link = buildMapLink(lat, lng, selectedPlace?.place_id);
  const mapLink = $("#map-link");
  mapLink.href = link;
  mapLink.textContent = lat && lng ? "Open in Google Maps" : "Map link unavailable";

  document.querySelector('input[name="siteFormattedAddress"]').value = addr !== "None" ? addr : "";
  document.querySelector('input[name="siteLat"]').value = lat || "";
  document.querySelector('input[name="siteLng"]').value = lng || "";
  document.querySelector('input[name="sitePlaceId"]').value = selectedPlace?.place_id || "";
}

function initMap() {
  mapSupported = typeof google !== "undefined" && !!google.maps;
  if (!mapSupported) {
    $("#maps-warning").hidden = false;
    return;
  }
  $("#maps-warning").hidden = true;
  map = new google.maps.Map(document.getElementById("map"), {
    center: { lat: -33.8688, lng: 151.2093 },
    zoom: 12,
  });
  marker = new google.maps.Marker({
    map,
    draggable: true,
  });
  marker.addListener("dragend", () => {
    const pos = marker.getPosition();
    if (pos) {
      selectedPlace = {
        formatted_address: selectedPlace?.formatted_address || $("#site-search").value,
        lat: pos.lat(),
        lng: pos.lng(),
        place_id: selectedPlace?.place_id,
        geometry: { location: pos },
      };
      updateMapMeta();
    }
  });

  const input = document.getElementById("site-search");
  autocomplete = new google.maps.places.Autocomplete(input, { componentRestrictions: { country: "au" } });
  autocomplete.addListener("place_changed", () => {
    const place = autocomplete.getPlace();
    if (!place.geometry) {
      setError("siteSearch", "Please select a suggested address.");
      return;
    }
    selectedPlace = place;
    map.panTo(place.geometry.location);
    map.setZoom(16);
    marker.setPosition(place.geometry.location);
    updateMapMeta();
  });

  $("#recenter").onclick = () => {
    if (selectedPlace?.geometry?.location) {
      map.panTo(selectedPlace.geometry.location);
      marker.setPosition(selectedPlace.geometry.location);
      map.setZoom(16);
    }
  };
}

// Called by Google script
window.initMap = initMap;

function validate() {
  clearAllErrors();
  let valid = true;
  const form = $("#booking-form");
  const values = Object.fromEntries(new FormData(form).entries());
  values.acn = numberOnly(values.acn || "");
  values.abn = numberOnly(values.abn || "");
  values.registeredPostcode = numberOnly(values.registeredPostcode || "");

  if (!values.companyName?.trim()) {
    setError("companyName", "Company name is required"); valid = false;
  }
  if (!values.companyStructure) { setError("companyStructure", "Select structure"); valid = false; }
  if (values.acn.length !== 9) { setError("acn", "ACN must be 9 digits"); valid = false; }
  if (values.abn.length !== 11) { setError("abn", "ABN must be 11 digits"); valid = false; }
  if (!values.contactName?.trim()) { setError("contactName", "Contact name required"); valid = false; }
  if (!values.contactEmail?.trim()) {
    setError("contactEmail", "Contact email required"); valid = false;
  } else if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(values.contactEmail)) {
    setError("contactEmail", "Enter a valid email"); valid = false;
  }
  if (!values.contactMobile?.trim()) { setError("contactMobile", "Mobile required"); valid = false; }
  const website = values.website?.trim();
  if (website) {
    try {
      const url = new URL(website);
      if (!/^https?:/.test(url.protocol)) throw new Error("bad");
    } catch {
      setError("website", "Enter a valid http/https URL");
      valid = false;
    }
  }
  const searchVal = $("#site-search").value.trim();
  if (!searchVal) { setError("siteSearch", "Site address is required"); valid = false; }

  if (!values.registeredStreet?.trim()) { setError("registeredStreet", "Required"); valid = false; }
  if (!values.registeredState) { setError("registeredState", "Select state"); valid = false; }
  if (values.registeredPostcode.length !== 4) { setError("registeredPostcode", "4 digits"); valid = false; }

  if (!groups.length) { addGroup(); valid = false; }
  groups.forEach((g) => {
    if (!g.count || Number(g.count) < 1) { setError(`count-${g.id}`, "Enter a number ≥ 1"); valid = false; }
    if (!g.role) { setError(`role-${g.id}`, "Select role"); valid = false; }
    if (!g.experience) { setError(`experience-${g.id}`, "Select experience"); valid = false; }
    if (!g.startDate) { setError(`startDate-${g.id}`, "Start date required"); valid = false; }
    if (!g.startTime) { setError(`startTime-${g.id}`, "Start time required"); valid = false; }
    if (!g.hoursPerDay || Number(g.hoursPerDay) <= 0) { setError(`hoursPerDay-${g.id}`, "Enter hours"); valid = false; }
    if (!g.expectedDurationValue || Number(g.expectedDurationValue) <= 0) { setError(`expectedDurationValue-${g.id}`, "Enter duration"); valid = false; }
    if (!g.expectedDurationUnit) { setError(`expectedDurationUnit-${g.id}`, "Select unit"); valid = false; }
  });

  const payload = {
    company: {
      name: values.companyName?.trim(),
      structure: values.companyStructure,
      acn: values.acn,
      abn: values.abn,
      website: website || undefined,
      contactName: values.contactName?.trim(),
      contactEmail: values.contactEmail?.trim(),
      contactMobile: values.contactMobile?.trim(),
      contactLandline: values.contactLandline?.trim(),
    },
    registeredAddress: {
      street: values.registeredStreet?.trim(),
      state: values.registeredState,
      postcode: values.registeredPostcode,
    },
    siteAddress: {
      formattedAddress: selectedPlace?.formatted_address || searchVal,
      lat: document.querySelector('input[name="siteLat"]').value || null,
      lng: document.querySelector('input[name="siteLng"]').value || null,
      placeId: document.querySelector('input[name="sitePlaceId"]').value || null,
      mapUrl: buildMapLink(
        document.querySelector('input[name="siteLat"]').value,
        document.querySelector('input[name="siteLng"]').value,
        document.querySelector('input[name="sitePlaceId"]').value
      ),
    },
    roles: groups.map((g, idx) => ({
      count: Number(g.count),
      role: g.role,
      tickets: g.tickets,
      experience: g.experience,
      startDate: g.startDate,
      startTime: g.startTime,
      hoursPerDay: Number(g.hoursPerDay),
      expectedDurationValue: Number(g.expectedDurationValue),
      expectedDurationUnit: g.expectedDurationUnit,
      otOptions: g.otOptions,
      groupNumber: idx + 1,
    })),
    notes: values.notes?.trim() || "",
    submittedAt: new Date().toISOString(),
  };

  const acn = values.acn;
  const abn = values.abn;
  const hint = $("#abn-hint");
  if (abn && acn && abn.endsWith(acn)) hint.hidden = false;
  else hint.hidden = true;

  return { valid, payload };
}

function exportCsv(payload) {
  const rows = [];
  const header = [
    "Company Structure",
    "ACN",
    "ABN",
    "Website",
    "Registered Street",
    "Registered State",
    "Registered Postcode",
    "Site Address",
    "Site Map Link",
    "Role Group #",
    "Number of Workers",
    "Role",
    "Tickets",
    "Experience",
    "Start Date",
    "Start Time",
    "Hours/Day",
    "Expected Duration",
    "OT Options",
    "Notes",
    "Submitted At",
  ];
  rows.push(header);
  payload.roles.forEach((r, idx) => {
    rows.push([
      payload.company.structure,
      payload.company.acn,
      payload.company.abn,
      payload.company.website || "",
      payload.registeredAddress.street,
      payload.registeredAddress.state,
      payload.registeredAddress.postcode,
      payload.siteAddress.formattedAddress,
      payload.siteAddress.mapUrl,
      idx + 1,
      r.count,
      r.role,
      r.tickets.join("; "),
      r.experience,
      r.startDate,
      r.startTime,
      r.hoursPerDay,
      `${r.expectedDurationValue} ${r.expectedDurationUnit}`,
      r.otOptions.join("; "),
      payload.notes,
      payload.submittedAt,
    ]);
  });
  const csvContent = rows.map((row) => row.map((cell) => `"${String(cell ?? "").replace(/"/g, '""')}"`).join(",")).join("\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "booking.csv";
  a.click();
  URL.revokeObjectURL(url);
}

document.addEventListener("DOMContentLoaded", () => {
  populateSelect(document.querySelector('select[name="companyStructure"]'), COMPANY_STRUCTURES);
  populateSelect(document.querySelector('select[name="registeredState"]'), STATES);

  const form = $("#booking-form");

  ["acn", "abn", "registeredPostcode"].forEach((name) => {
    const input = form.elements.namedItem(name);
    input?.addEventListener("input", (e) => {
      e.target.value = numberOnly(e.target.value);
    });
    input?.addEventListener("blur", validate);
  });

  addGroup();

  $("#add-group").onclick = () => addGroup();

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const { valid } = validate();
    if (!valid) return;
    alert("Form valid. See JSON preview or CSV export for payload.");
  });

  document.querySelectorAll("input, select, textarea").forEach((el) => {
    el.addEventListener("blur", validate);
  });

  $("#open-json").onclick = () => {
    const { valid, payload } = validate();
    if (!valid) {
      alert("Fix errors before previewing JSON.");
      return;
    }
    $("#json-output").textContent = JSON.stringify(payload, null, 2);
    $("#modal").hidden = false;
  };
  $("#close-modal").onclick = () => { $("#modal").hidden = true; };
  $("#modal").addEventListener("click", (e) => {
    if (e.target.id === "modal") $("#modal").hidden = true;
  });

  $("#export-csv").onclick = () => {
    const { valid, payload } = validate();
    if (!valid) {
      alert("Fix errors before exporting CSV.");
      return;
    }
    exportCsv(payload);
  };

  // Fallback map warning if Google never calls initMap
  setTimeout(() => {
    if (!mapSupported) {
      const warning = $("#maps-warning");
      warning.hidden = false;
      warning.textContent = "Google Maps did not load (API key missing?). You can still submit the form, but map search/pin are unavailable.";
    }
  }, 2000);
});
