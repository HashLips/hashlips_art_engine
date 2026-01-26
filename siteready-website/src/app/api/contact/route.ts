import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { sendAutoReplyEmail, sendNotificationEmail } from "@/lib/email";

const contactSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(120),
  email: z.string().trim().email("Valid email required"),
  phone: z.string().trim().optional().or(z.literal("")),
  whatsapp: z.string().trim().optional().or(z.literal("")),
  company: z.string().trim().optional().or(z.literal("")),
  message: z.string().trim().min(1, "Message is required").max(4000),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = contactSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.flatten() },
        { status: 400 },
      );
    }
    const data = parsed.data;

    const subject = `New contact message – ${data.name}`;
    const text = [
      `Name: ${data.name}`,
      `Company: ${data.company ?? "N/A"}`,
      `Email: ${data.email}`,
      `Phone: ${data.phone ?? "N/A"}`,
      `WhatsApp: ${data.whatsapp ?? "N/A"}`,
      `Message:`,
      data.message,
    ].join("\n");

    try {
      await sendNotificationEmail({ subject, text });
    } catch (emailError) {
      console.error("Email send failed for contact:", emailError);
      console.log("New contact message (email failed):", data);
      return NextResponse.json({
        success: true,
        warning: "Email failed to send",
      });
    }

    try {
      if (data.email) {
        const receivedAt = new Date().toLocaleString("en-AU", {
          timeZone: "Australia/Sydney",
          hour12: false,
        });

        const nameLine = data.name ? `Hi ${data.name},` : "Hi,";
        const autoSubject =
          "Thanks, we've received your message - SiteReady Workforce";
        const autoText = [
          nameLine,
          "",
          "Thanks for contacting SiteReady Workforce. We've received your message and will respond as soon as we can.",
          "",
          `Received at: ${receivedAt} (Sydney time)`,
          "",
          "Summary of your enquiry:",
          `- Name: ${data.name ?? "N/A"}`,
          `- Company: ${data.company ?? "N/A"}`,
          `- Phone: ${data.phone ?? "N/A"}`,
          `- WhatsApp: ${data.whatsapp ?? "N/A"}`,
          "",
          "Your message:",
          data.message ?? "(No message provided)",
          "",
          "If you need to add anything, you can simply reply to this email.",
          "",
          "SiteReady Workforce",
        ].join("\n");

        await sendAutoReplyEmail({
          to: data.email,
          subject: autoSubject,
          text: autoText,
        });
      }
    } catch (autoReplyError) {
      console.error("Auto-reply send failed for contact:", autoReplyError);
    }

    console.log("New contact message:", data);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error in contact API:", error);
    return NextResponse.json(
      { success: false, error: "Invalid request payload" },
      { status: 400 },
    );
  }
}
