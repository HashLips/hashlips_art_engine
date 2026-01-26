import { NextRequest, NextResponse } from "next/server";
import { ZodError } from "zod";
import { sendAutoReplyEmail, sendNotificationEmail } from "@/lib/email";
import { buildSubmittedBooking } from "@/lib/bookings/schema";

async function pushToSheets(payload: unknown) {
  if (!process.env.SHEETS_WEBAPP_URL) return;
  try {
    await fetch(process.env.SHEETS_WEBAPP_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(process.env.SHEETS_WEBAPP_TOKEN
          ? { "X-Webhook-Token": process.env.SHEETS_WEBAPP_TOKEN }
          : {}),
      },
      body: JSON.stringify(payload),
    });
  } catch (err) {
    console.error("Sheets push failed (booking):", err);
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = buildSubmittedBooking(body);

    const subject = `New labour booking - ${parsed.company.name} (${parsed.bookingId})`;
    const summary = parsed.roles
      .map((r, idx) => {
        const extras = [
          r.craneCapacity ? `Crane: ${r.craneCapacity}` : null,
          r.ewpHeight ? `EWP: ${r.ewpHeight}` : null,
          r.telehandlerAttachment && r.telehandlerAttachment.length
            ? `Telehandler: ${r.telehandlerAttachment.join(", ")}`
            : null,
          r.scaffoldingLevel ? `Scaffolding: ${r.scaffoldingLevel}` : null,
          r.riggingLevel ? `Rigging: ${r.riggingLevel}` : null,
        ]
          .filter(Boolean)
          .join("; ");
        return (
          `Role group ${idx + 1}: ${r.count}x ${r.role}, tickets: ${r.tickets?.join(", ") || "None"}, ` +
          `exp: ${r.experience}, start ${r.startDate} ${r.startTime}, hours/day ${r.hoursPerDay}, duration ${r.expectedDurationValue} ${r.expectedDurationUnit}, OT: ${r.otOptions?.join(", ") || "None"}` +
          (extras ? ` | ${extras}` : "")
        );
      })
      .join("\n");

    const text = [
      `Booking ID: ${parsed.bookingId}`,
      `Company: ${parsed.company.name} (${parsed.company.structure})`,
      `ACN: ${parsed.company.acn}`,
      `ABN: ${parsed.company.abn}`,
      `Website: ${parsed.company.website ?? "N/A"}`,
      `Contact: ${parsed.company.contactTitle} ${parsed.company.contactName} (${parsed.company.contactJobTitle})`,
      `Contact email: ${parsed.company.contactEmail}`,
      `Mobile: ${parsed.company.contactMobile}`,
      `Landline: ${parsed.company.contactLandline || "N/A"}`,
      `Preferred contact time: ${parsed.company.preferredContactTime || "N/A"}`,
      `On behalf confirmed: ${parsed.company.contactOnBehalf ? "Yes" : "No"}`,
      `Attachments link: ${parsed.attachmentsLink || "N/A"}`,
      "",
      `Registered address: ${parsed.registeredAddress.street}, ${parsed.registeredAddress.state} ${parsed.registeredAddress.postcode}`,
      `Site: ${parsed.siteAddress.siteName ?? "N/A"}`,
      `Site address: ${parsed.siteAddress.formattedAddress}`,
      `Map: ${parsed.siteAddress.mapUrl ?? "N/A"}`,
      `Lat/Lng: ${parsed.siteAddress.lat ?? "N/A"}, ${parsed.siteAddress.lng ?? "N/A"}`,
      "",
      "Roles:",
      summary,
      "",
      `Notes: ${parsed.notes ?? "N/A"}`,
      `Submitted at: ${parsed.submittedAt}`,
    ].join("\n");

    const attachments =
      parsed.attachments?.length && parsed.attachments.some((a) => a.content)
        ? parsed.attachments.flatMap((a) =>
            a.content
              ? [
                  {
                    filename: a.name,
                    content: a.content,
                    encoding: "base64" as const,
                    contentType: a.type,
                  },
                ]
              : [],
          )
        : undefined;

    try {
      await sendNotificationEmail({ subject, text, attachments });
    } catch (emailError) {
      console.error("Notification email failed for booking:", emailError);
    }

    // Auto-reply only if client provided an email in the body (not part of the stable schema, optional)
    const replyTo = parsed.company.contactEmail || body?.email || body?.contactEmail;
    if (replyTo) {
      try {
        const receivedAt = new Date().toLocaleString("en-AU", {
          timeZone: "Australia/Sydney",
          hour12: false,
        });
        const autoSubject = "Thanks, we've received your labour hire request – SiteReady Workforce";
        const autoText = [
          "Hi,",
          "",
          "Thanks for contacting SiteReady Workforce. We've received your labour hire request and will review it shortly.",
          "",
          `Received at: ${receivedAt} (Sydney time)`,
          "",
          "Summary of your request:",
          `- Company: ${parsed.company.name} (${parsed.company.structure})`,
          `- Site: ${parsed.siteAddress.formattedAddress}`,
          `- Map: ${parsed.siteAddress.mapUrl ?? "N/A"}`,
          `- Role groups: ${parsed.roles.length}`,
          "",
          "If any of this is incorrect, just reply to this email with corrections.",
          "",
          "SiteReady Workforce",
        ].join("\n");

        await sendAutoReplyEmail({
          to: replyTo,
          subject: autoSubject,
          text: autoText,
        });
      } catch (autoReplyError) {
        console.error("Auto-reply send failed for booking:", autoReplyError);
      }
    }

    await pushToSheets(parsed);

    return NextResponse.json({ ok: true, bookingId: parsed.bookingId });
  } catch (error: unknown) {
    if (error instanceof ZodError) {
      return NextResponse.json({ ok: false, error: error.issues }, { status: 400 });
    }
    console.error("Error in bookings API:", error);
    return NextResponse.json({ ok: false, error: "Invalid request payload" }, { status: 400 });
  }
}
