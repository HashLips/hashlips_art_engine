import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { parseSessionFromRequest } from "@/lib/auth/session";
import { getDb } from "@/lib/db/client";
import { hasD1Binding } from "@/lib/db/config";
import { getWorkerById, updateWorkerProfile } from "@/lib/db/workers";

const payloadSchema = z.object({
  key: z.string().min(1),
  verification_status: z.string().min(1),
  verification_notes: z.string().optional().or(z.literal("")),
});

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await parseSessionFromRequest(req, { allowUnverified: true });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (session.adminLevel !== "admin" && session.adminLevel !== "super_admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  if (!hasD1Binding()) return NextResponse.json({ error: "Platform not configured" }, { status: 503 });
  const db = getDb();
  if (!db) return NextResponse.json({ error: "DB unavailable" }, { status: 503 });

  const body = await req.json().catch(() => null);
  const parsed = payloadSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload", details: parsed.error.flatten() }, { status: 400 });
  }

  const worker = await getWorkerById(db, id);
  if (!worker) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const updateMediaList = (
    list: Array<Record<string, unknown>>,
    key: string,
    status: string,
    notes: string,
  ) => {
    let changed = false;
    const updated = list.map((item) => {
      if (item?.key === key) {
        changed = true;
        return { ...item, verification_status: status, verification_notes: notes };
      }
      return item;
    });
    return { updated, changed };
  };

  let workMedia = [];
  let workMediaChanged = false;
  if (worker.work_media_json) {
    try {
      workMedia = JSON.parse(worker.work_media_json);
    } catch {
      workMedia = [];
    }
  }
  const workMediaResult = updateMediaList(workMedia, parsed.data.key, parsed.data.verification_status, parsed.data.verification_notes || "");
  workMedia = workMediaResult.updated;
  workMediaChanged = workMediaResult.changed;

  let workExperience = [];
  let experienceChanged = false;
  if (worker.work_experience_json) {
    try {
      workExperience = JSON.parse(worker.work_experience_json);
    } catch {
      workExperience = [];
    }
  }
  const updatedExperiences = (workExperience as Array<Record<string, unknown>>).map((exp) => {
    const media = Array.isArray(exp.work_media) ? exp.work_media : [];
    const result = updateMediaList(media, parsed.data.key, parsed.data.verification_status, parsed.data.verification_notes || "");
    if (result.changed) experienceChanged = true;
    return { ...exp, work_media: result.updated };
  });

  if (!workMediaChanged && !experienceChanged) {
    return NextResponse.json({ error: "Media not found" }, { status: 404 });
  }

  await updateWorkerProfile(db, id, {
    work_media_json: JSON.stringify(workMedia),
    work_experience_json: JSON.stringify(updatedExperiences),
  });

  return NextResponse.json({ ok: true });
}
