import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { parseSessionFromRequest } from "@/lib/auth/session";
import { getDb } from "@/lib/db/client";
import { ensureClientForUser, getClientByUser, updateClientProfile } from "@/lib/db/clients";
import { hasD1Binding } from "@/lib/db/config";

const optionalString = z.preprocess((val) => {
  if (val == null) return "";
  if (typeof val !== "string") return val;
  return val.trim();
}, z.string().optional().or(z.literal("")));

const websiteSchema = optionalString;

const profileSchema = z.object({
  org_name: z.string().min(1),
  structure: z.string().min(1),
  acn: z.string().regex(/^\d{9}$/),
  abn: z.string().regex(/^\d{11}$/),
  tfn: optionalString,
  website: websiteSchema,
  contact_title: z.string().min(1),
  contact_name: z.string().min(1),
  contact_job_title: z.string().min(1),
  contact_mobile: z.string().min(1),
  contact_landline: optionalString,
  preferred_contact_time: optionalString,
  contact_email: z.string().email(),
  reg_street: z.string().min(1),
  reg_state: z.string().min(1),
  reg_postcode: z.string().regex(/^\d{4}$/),
  profile_file_name: optionalString,
  profile_file_type: optionalString,
  profile_file_content: optionalString,
}).superRefine((data, ctx) => {
  if (!data.abn.endsWith(data.acn)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "ABN should end with ACN",
      path: ["abn"],
    });
  }
});

export async function GET(req: NextRequest) {
  const session = await parseSessionFromRequest(req, { allowUnverified: true });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (session.role !== "client" && session.role !== "staff") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  if (!hasD1Binding()) {
    return NextResponse.json({ error: "Platform not configured" }, { status: 503 });
  }
  const db = getDb();
  if (!db) return NextResponse.json({ error: "DB unavailable" }, { status: 503 });

  const userId = session.userId || session.email || "";
  const client = await ensureClientForUser(db, userId, session.email);
  const fresh = await getClientByUser(db, client.user_id || userId);
  return NextResponse.json({ ok: true, profile: fresh ?? client });
}

export async function PUT(req: NextRequest) {
  const session = await parseSessionFromRequest(req, { allowUnverified: true });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (session.role !== "client" && session.role !== "staff") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  if (!hasD1Binding()) {
    return NextResponse.json({ error: "Platform not configured" }, { status: 503 });
  }
  const db = getDb();
  if (!db) return NextResponse.json({ error: "DB unavailable" }, { status: 503 });

  const body = await req.json().catch(() => null);
  const parsed = profileSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload", details: parsed.error.flatten() }, { status: 400 });
  }

  const userId = session.userId || session.email || "";
  const client = await ensureClientForUser(db, userId, session.email);
  await updateClientProfile(db, client.client_id, parsed.data);
  return NextResponse.json({ ok: true });
}
