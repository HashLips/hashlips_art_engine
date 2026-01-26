import { NextRequest, NextResponse } from "next/server";
import { parseSessionFromRequest } from "@/lib/auth/session";
import { getDb } from "@/lib/db/client";
import { hasD1Binding } from "@/lib/db/config";
import { getWorkerById, updateWorkerProfile } from "@/lib/db/workers";
import { sendAutoReplyEmail } from "@/lib/email";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await parseSessionFromRequest(req, { allowUnverified: true });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (session.adminLevel !== "admin" && session.adminLevel !== "super_admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  if (!hasD1Binding()) {
    return NextResponse.json({ error: "Platform not configured" }, { status: 503 });
  }
  const db = getDb();
  if (!db) return NextResponse.json({ error: "DB unavailable" }, { status: 503 });

  const worker = await getWorkerById(db, id);
  if (!worker) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await updateWorkerProfile(db, id, { verified_status: "verified", last_verification_date: new Date().toISOString() });

  if (worker.email) {
    await sendAutoReplyEmail({
      to: worker.email,
      subject: "Your worker profile is approved",
      html: `
        <h2>Your profile is approved</h2>
        <p>Thank you for sending us your information. We have reviewed your details and approved you.</p>
        <p>We will email or contact you back with proposed work positions.</p>
        <p><a href="https://sitereadyworkforce.com/dashboard/worker" style="display:inline-block;padding:12px 18px;background:#0f172a;color:#fff;text-decoration:none;border-radius:8px;">Go to your worker portal</a></p>
        <p>If you need to update anything, you can log in and edit your profile.</p>
      `,
      text: [
        "Thank you for sending us your information. We have reviewed your details and approved you.",
        "We will email or contact you back with proposed work positions.",
        "Portal: https://sitereadyworkforce.com/dashboard/worker",
      ].join("\n"),
    });
  }

  return NextResponse.json({ ok: true });
}
