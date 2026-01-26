import nodemailer from "nodemailer";

const {
  SMTP_HOST,
  SMTP_PORT,
  SMTP_USER,
  SMTP_PASS,
  SMTP_FROM,
  NOTIFY_TO,
} = process.env;

const transport = nodemailer.createTransport({
  host: SMTP_HOST,
  port: SMTP_PORT ? parseInt(SMTP_PORT, 10) : 587,
  secure: false,
  auth: SMTP_USER && SMTP_PASS ? { user: SMTP_USER, pass: SMTP_PASS } : undefined,
});

export async function sendNotificationEmail(options: {
  subject: string;
  text: string;
  html?: string;
  attachments?: Array<{
    filename: string;
    content: string | Buffer;
    encoding?: string;
    contentType?: string;
  }>;
}) {
  if (!NOTIFY_TO || !SMTP_FROM) {
    console.warn("Email not fully configured: missing NOTIFY_TO or SMTP_FROM");
    return;
  }

  await transport.sendMail({
    from: SMTP_FROM,
    to: NOTIFY_TO,
    subject: options.subject,
    text: options.text,
    html: options.html ?? `<pre>${options.text}</pre>`,
    attachments: options.attachments,
  });
}

export async function sendAutoReplyEmail(options: {
  to: string;
  subject: string;
  text: string;
  html?: string;
}) {
  if (!SMTP_FROM) {
    console.warn("Auto-reply not sent: missing SMTP_FROM");
    return;
  }

  if (!options.to || !options.to.includes("@")) {
    console.warn("Auto-reply not sent: invalid recipient email");
    return;
  }

  try {
    await transport.sendMail({
      from: SMTP_FROM,
      to: options.to,
      subject: options.subject,
      text: options.text,
      html: options.html ?? `<pre>${options.text}</pre>`,
    });
  } catch (err) {
    console.error("Error sending auto-reply email:", err);
  }
}

export async function sendWorkerReminderEmail(options: {
  to: string;
  subject: string;
  text: string;
  html?: string;
  cc?: string;
}) {
  if (!SMTP_FROM) {
    console.warn("Worker reminder not sent: missing SMTP_FROM");
    return;
  }
  if (!options.to || !options.to.includes("@")) {
    console.warn("Worker reminder not sent: invalid recipient email");
    return;
  }
  const ccList = options.cc || NOTIFY_TO || undefined;
  try {
    await transport.sendMail({
      from: SMTP_FROM,
      to: options.to,
      cc: ccList,
      subject: options.subject,
      text: options.text,
      html: options.html ?? `<pre>${options.text}</pre>`,
    });
  } catch (err) {
    console.error("Error sending worker reminder email:", err);
  }
}

export async function sendClientOnboardingEmail(options: {
  to: string;
  subject: string;
  text: string;
  html?: string;
}) {
  if (!SMTP_FROM) {
    console.warn("Client onboarding email not sent: missing SMTP_FROM");
    return;
  }
  if (!options.to || !options.to.includes("@")) {
    console.warn("Client onboarding email not sent: invalid recipient email");
    return;
  }
  try {
    await transport.sendMail({
      from: SMTP_FROM,
      to: options.to,
      subject: options.subject,
      text: options.text,
      html: options.html ?? `<pre>${options.text}</pre>`,
    });
  } catch (err) {
    console.error("Error sending client onboarding email:", err);
  }
}
