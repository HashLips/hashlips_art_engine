export const STATES = ["ACT", "NSW", "NT", "QLD", "SA", "TAS", "VIC", "WA"] as const;

export const COMPANY_STRUCTURES = ["Pty Ltd", "Ltd", "Pty", "NL"] as const;

export const CONTACT_TITLES = ["Mr", "Mrs", "Miss", "Ms", "Mx"] as const;

export const ROLES = [
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
  "Operator-Forklift",
  "Operator-EWP",
  "Operator-Excavator",
  "Operator-Skid Steer",
  "Operator-Crane",
  "Operator-Telehandler",
  "Rigger",
  "Leading Hand",
  "Site Supervisor",
] as const;

export const TICKETS = [
  "White Card (WHS)",
  "First Aid (HLTAID011+)",
  "Working at Heights",
  "Confined Space",
  "Asbestos Awareness",
  "Traffic Control (TC/TMI)",
  "Forklift - LF (Forklift HRWL)",
  "EWP - WP (>11m)",
  "Scaffolding - SB (Basic)",
  "Scaffolding - SI (Intermediate)",
  "Scaffolding - SA (Advanced)",
  "Rigger - RB (Basic)",
  "Rigger - RI (Intermediate)",
  "Rigger - RA (Advanced)",
  "Dogging (DG)",
  "Crane Operation - CN (Non-slewing >3t)",
  "Crane Operation - C2 (<=20t)",
  "Crane Operation - C6 (<=60t)",
  "Crane Operation - C1 (<=100t)",
  "Crane Operation - C0 (>100t)",
  "Crane Operation - CV (Vehicle Loading >=10mt)",
  "Crane Operation - CT (Tower Crane)",
  "Crane Operation - CS (Self-Erecting Tower Crane)",
  "Excavator (LE)",
  "Skid Steer (LS)",
  "Telehandler - Gold Card (non-slewing ≤3t, any attachment)",
  "Telehandler - CN / Crane Jib (>3t non-slewing)",
  "Telehandler - TV (>3t non-slewing, VIC)",
  "Telehandler - Slewing (C2 or above)",
  "Telehandler - WP (work platform, boom ≥11m)",
  "Electrical Licence",
  "HVAC Cert",
  "Fire Safety Induction",
  "Manual Handling",
  "Silica Awareness",
] as const;

export const OT_OPTIONS = [
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
] as const;

export const EXPERIENCE = ["Newly ticketed", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10+"] as const;

export const DURATION_UNITS = ["days", "weeks", "months", "years"] as const;

export const CRANE_CAPACITIES = [
  "Non-slewing >3t (CN)",
  "Vehicle Loading (CV)",
  "<=20t (C2)",
  "<=60t (C6)",
  "<=100t (C1)",
  ">100t (C0)",
  "Tower Crane (CT)",
  "Self-Erecting Tower Crane (CS)",
] as const;

export const EWP_HEIGHTS = [">11m (WP)"] as const;

export const TELEHANDLER_ATTACH = ["Forks", "Bucket", "Crane Jib", "Work Platform"] as const;

export const SCAFF_LEVELS = ["Basic (SB)", "Intermediate (SI)", "Advanced (SA)"] as const;
export const RIG_LEVELS = ["Basic (RB)", "Intermediate (RI)", "Advanced (RA)"] as const;

export const EXCAVATOR_SIZES = [
  "<=5t",
  "<=8t",
  "<=14t",
  "<=25t",
  ">25t (specify in notes if needed)",
] as const;
