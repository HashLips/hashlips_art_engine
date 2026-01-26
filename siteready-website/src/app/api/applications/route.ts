import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { sendAutoReplyEmail, sendNotificationEmail } from "@/lib/email";

const applicationSchema = z.object({
  firstName: z.string().trim().min(1, "First name is required").max(80),
  lastName: z.string().trim().min(1, "Last name is required").max(80),
  mobile: z.string().trim().min(1, "Mobile is required").max(40),
  email: z.string().trim().email("Valid email required"),
  suburb: z.string().trim().optional().or(z.literal("")),
  travelRadiusKm: z.union([z.string(), z.number()]).optional(),
  rightToWork: z.union([z.string(), z.boolean()]).optional(),
  visaType: z.string().trim().optional().or(z.literal("")),
  roles: z.union([z.array(z.string()), z.string()]).optional(),
  tickets: z.string().trim().optional().or(z.literal("")),
  experienceYears: z.union([z.string(), z.number()]).optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = applicationSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.flatten() },
        { status: 400 },
      );
    }
    const data = parsed.data;

    const subject = `New worker application – ${data.firstName} ${data.lastName}`;
    const text = [
      `Name: ${data.firstName} ${data.lastName}`,
      `Mobile: ${data.mobile}`,
      `Email: ${data.email}`,
      `Suburb: ${data.suburb ?? "N/A"}`,
      `Travel radius: ${data.travelRadiusKm ?? "N/A"}`,
      `Right to work: ${data.rightToWork ?? "N/A"}`,
      `Visa type: ${data.visaType ?? "N/A"}`,
      `Roles: ${
        Array.isArray(data.roles) ? data.roles.join(", ") : data.roles ?? "N/A"
      }`,
      `Tickets: ${data.tickets ?? "N/A"}`,
      `Experience years: ${data.experienceYears ?? "N/A"}`,
    ].join("\n");

    try {
      await sendNotificationEmail({ subject, text });
    } catch (emailError) {
      console.error("Email send failed for application:", emailError);
      console.log("New worker application (email failed):", data);
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

        const nameLine =
          data.firstName || data.lastName
            ? `Hi ${[data.firstName, data.lastName].filter(Boolean).join(" ")},`
            : "Hi,";

        const autoSubject =
          "Thanks, we've received your application - SiteReady Workforce";
        const autoText = [
          nameLine,
          "",
          "Thanks for applying to work with SiteReady Workforce. We've received your details and will review your application shortly.",
          "",
          `Received at: ${receivedAt} (Sydney time)`,
          "",
          "Summary of your application:",
          `- Mobile: ${data.mobile ?? "N/A"}`,
          `- Suburb: ${data.suburb ?? "N/A"}`,
          `- Travel radius (km): ${data.travelRadiusKm ?? "N/A"}`,
          `- Right to work: ${data.rightToWork ?? "N/A"}`,
          `- Visa type: ${data.visaType ?? "N/A"}`,
          `- Roles: ${
            Array.isArray(data.roles)
              ? data.roles.join(", ")
              : data.roles ?? "N/A"
          }`,
          `- Tickets: ${data.tickets ?? "N/A"}`,
          `- Experience: ${data.experienceYears ?? "N/A"}`,
          "",
          "If anything needs updating, reply to this email with corrections.",
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
      console.error("Auto-reply send failed for application:", autoReplyError);
    }

    console.log("New worker application:", data);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error in applications API:", error);
    return NextResponse.json(
      { success: false, error: "Invalid request payload" },
      { status: 400 },
    );
  }
}
