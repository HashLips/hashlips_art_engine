import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { parseSessionFromRequest } from "@/lib/auth/session";
import { getDb } from "@/lib/db/client";
import { hasD1Binding } from "@/lib/db/config";
import { listPolicyDocuments, upsertPolicyDocument } from "@/lib/db/policies";
import { listClientPolicyRecipientEmails } from "@/lib/db/clients";
import { listWorkerEmails } from "@/lib/db/workers";
import { sendAutoReplyEmail } from "@/lib/email";
import { DEFAULT_POLICIES } from "@/lib/policies/defaults";
import { getEmailTemplateRecord } from "@/lib/db/emailTemplates";

const schema = z.object({
  policy_key: z.enum(["worker_terms", "client_terms", "privacy_policy", "frontend_terms"]),
  title: z.string().min(1),
  content_markdown: z.string().min(1),
});

function applyVars(template: string, vars: Record<string, string>) {
  let output = template;
  for (const [key, value] of Object.entries(vars)) {
    output = output.split(`{{${key}}}`).join(value);
  }
  return output;
}

export async function GET(req: NextRequest) {
  const session = await parseSessionFromRequest(req, { allowUnverified: true });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (session.role !== "staff") return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  if (!hasD1Binding()) return NextResponse.json({ error: "Platform not configured" }, { status: 503 });
  const db = getDb();
  if (!db) return NextResponse.json({ error: "DB unavailable" }, { status: 503 });

  const rows = await listPolicyDocuments(db);
  const rowMap = new Map(rows.map((row) => [row.policy_key, row]));
  const merged = (Object.keys(DEFAULT_POLICIES) as Array<keyof typeof DEFAULT_POLICIES>).map((policy_key) => {
    const policy = DEFAULT_POLICIES[policy_key];
    const existing = rowMap.get(policy_key);
    return {
      policy_key,
      title: existing?.title ?? policy.title,
      content_markdown: existing?.content_markdown ?? policy.content_markdown,
      version: existing?.version ?? policy.version,
      updated_at: existing?.updated_at ?? 0,
      published_at: existing?.published_at ?? 0,
      updated_by: existing?.updated_by ?? null,
    };
  });
  return NextResponse.json({ ok: true, policies: merged });
}

export async function POST(req: NextRequest) {
  const session = await parseSessionFromRequest(req, { allowUnverified: true });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (session.role !== "staff") return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  if (!hasD1Binding()) return NextResponse.json({ error: "Platform not configured" }, { status: 503 });
  const db = getDb();
  if (!db) return NextResponse.json({ error: "DB unavailable" }, { status: 503 });

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid payload", details: parsed.error.flatten() }, { status: 400 });

  const saved = await upsertPolicyDocument(db, {
    policy_key: parsed.data.policy_key,
    title: parsed.data.title,
    content_markdown: parsed.data.content_markdown,
    updated_by: session.userId || session.email || null,
  });

  const origin = req.headers.get("origin") || "https://sitereadyworkforce.com";
  const sendUpdateEmails = async (
    emails: string[],
    templateKey: string,
    fallbackSubject: string,
    url: string,
    audience: string,
  ) => {
    const template = await getEmailTemplateRecord(db, templateKey);
    const ctaLabel = template?.effective_cta_label || "Click here to review and agree";
    const defaultText = [
      `The ${audience} policy has been updated.`,
      "",
      "Please log in to review the updated policy:",
      url,
      "",
      "By continuing to use the platform, you agree to the updated policy.",
    ].join("\n");
    const text = template?.effective_message
      ? applyVars(template.effective_message, { audience, cta_url: url, cta_label: ctaLabel })
      : defaultText;
    const subject = template?.effective_subject || fallbackSubject;
    await Promise.all(
      emails.map((email) =>
        sendAutoReplyEmail({
          to: email,
          subject,
          text,
          html: `<p>${text.replace(/\n/g, "<br/>")}</p><p><a href="${url}">${ctaLabel}</a></p>`,
        }),
      ),
    );
  };

  try {
    if (saved.policy_key === "worker_terms") {
      const url = `${origin}/dashboard/policies/worker-terms`;
      const emails = await listWorkerEmails(db);
      await sendUpdateEmails(
        emails,
        "policy_worker_terms_updated",
        "Updated Worker Terms - Action Required",
        url,
        "Worker Terms",
      );
    }
    if (saved.policy_key === "client_terms") {
      const url = `${origin}/dashboard/policies/client-terms`;
      const emails = await listClientPolicyRecipientEmails(db);
      await sendUpdateEmails(
        emails,
        "policy_client_terms_updated",
        "Updated Client Terms - Action Required",
        url,
        "Client Terms",
      );
    }
    if (saved.policy_key === "privacy_policy") {
      const url = `${origin}/dashboard/policies/privacy`;
      const clientEmails = await listClientPolicyRecipientEmails(db);
      const workerEmails = await listWorkerEmails(db);
      const combined = Array.from(new Set([...clientEmails, ...workerEmails]));
      await sendUpdateEmails(
        combined,
        "policy_privacy_updated",
        "Updated Privacy Policy - Action Required",
        url,
        "Privacy Policy",
      );
    }
    if (saved.policy_key === "frontend_terms") {
      const url = `${origin}/login?next=${encodeURIComponent("/dashboard/policies/website-terms")}`;
      const workerEmails = await listWorkerEmails(db);
      const clientEmails = await listClientPolicyRecipientEmails(db);
      const combined = Array.from(new Set([...workerEmails, ...clientEmails]));
      await sendUpdateEmails(
        combined,
        "policy_frontend_terms_updated",
        "Updated Website Terms - Action Required",
        url,
        "Website Terms",
      );
    }
  } catch (err) {
    console.error("Policy update email failed:", err);
  }

  return NextResponse.json({ ok: true, policy: saved });
}
