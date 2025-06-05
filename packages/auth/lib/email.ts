import nodemailer from "nodemailer";

// Funzione per verificare se le variabili SMTP sono configurate
function isEmailConfigured(): boolean {
  return !!(
    process.env.EMAIL_SERVER_HOST &&
    process.env.EMAIL_SERVER_PORT &&
    process.env.EMAIL_SERVER_USER &&
    process.env.EMAIL_SERVER_PASSWORD &&
    process.env.EMAIL_FROM
  );
}

// Crea il transporter solo se le variabili sono configurate
function createTransporter() {
  if (!isEmailConfigured()) {
    console.warn(
      "⚠️ Configurazione email SMTP non completa. Email disabilitate."
    );
    return null;
  }

  try {
    return nodemailer.createTransport({
      host: process.env.EMAIL_SERVER_HOST,
      port: Number(process.env.EMAIL_SERVER_PORT),
      secure: false,
      auth: {
        user: process.env.EMAIL_SERVER_USER,
        pass: process.env.EMAIL_SERVER_PASSWORD,
      },
    });
  } catch (error) {
    console.error("Errore nella creazione del transporter email:", error);
    return null;
  }
}

export async function sendEmail({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}) {
  // Durante il build, non inviare email
  if (process.env.NODE_ENV === "production" && !process.env.VERCEL) {
    console.log("📧 Email simulata durante il build:", { to, subject });
    return { success: true, message: "Email simulata durante il build" };
  }

  const transporter = createTransporter();

  if (!transporter) {
    console.warn("📧 Transporter email non disponibile. Email non inviata:", {
      to,
      subject,
    });
    return { success: false, message: "Configurazione email non disponibile" };
  }

  try {
    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to,
      subject,
      html,
    });

    console.log("📧 Email inviata:", info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("❌ Errore invio email:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Errore sconosciuto",
    };
  }
}

export function generateVerificationEmailHtml(
  token: string,
  baseUrl: string,
  type: "primary" | "secondary" = "primary"
): string {
  let verificationUrl: string;
  let title: string;

  if (type === "secondary") {
    verificationUrl = `${baseUrl}/verify-secondary-email?token=${token}`;
    title = "Verifica la tua email secondaria";
  } else {
    verificationUrl = `${baseUrl}/verify-email?token=${token}`;
    title = "Verifica il tuo account RevUp";
  }

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>${title}</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #2563eb;">${title}</h1>
          <p>${
            type === "secondary"
              ? "Clicca sul link qui sotto per verificare la tua email secondaria:"
              : "Grazie per esserti registrato! Clicca sul link qui sotto per verificare il tuo account:"
          }</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${verificationUrl}" 
               style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
              ${
                type === "secondary"
                  ? "Verifica Email Secondaria"
                  : "Verifica Account"
              }
            </a>
          </div>
          <p>Se non riesci a cliccare il pulsante, copia e incolla questo link nel tuo browser:</p>
          <p style="word-break: break-all; color: #666;">${verificationUrl}</p>
          <p style="margin-top: 30px; font-size: 14px; color: #666;">
            Se non hai richiesto questa verifica, puoi ignorare questa email.
          </p>
        </div>
      </body>
    </html>
  `;
}

export function generatePasswordResetEmailHtml(
  token: string,
  baseUrl: string
): string {
  const resetUrl = `${baseUrl}/reset-password?token=${token}`;

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>Reimposta la tua password</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #dc2626;">Reimposta la tua password</h1>
          <p>Hai richiesto di reimpostare la tua password. Clicca sul link qui sotto per procedere:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" 
               style="background-color: #dc2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
              Reimposta Password
            </a>
          </div>
          <p>Se non riesci a cliccare il pulsante, copia e incolla questo link nel tuo browser:</p>
          <p style="word-break: break-all; color: #666;">${resetUrl}</p>
          <p style="margin-top: 30px; font-size: 14px; color: #666;">
            Se non hai richiesto questa reimpostazione, puoi ignorare questa email. Il link scadrà tra 1 ora.
          </p>
        </div>
      </body>
    </html>
  `;
}

// Funzione per inviare email di reset password
export async function sendResetPasswordEmail(email: string, token: string) {
  const baseUrl =
    process.env.NEXTAUTH_URL ||
    process.env.NEXT_PUBLIC_APP_URL ||
    "http://localhost:3000";

  const html = generatePasswordResetEmailHtml(token, baseUrl);

  return await sendEmail({
    to: email,
    subject: "Reimposta la tua password - RevUp",
    html,
  });
}

// Funzione per inviare email di verifica (supporta sia primary che secondary)
export async function sendVerificationEmail(
  email: string,
  token: string,
  type: "primary" | "secondary" = "primary"
) {
  const baseUrl =
    process.env.NEXTAUTH_URL ||
    process.env.NEXT_PUBLIC_APP_URL ||
    "http://localhost:3000";

  const html = generateVerificationEmailHtml(token, baseUrl, type);

  const subject =
    type === "secondary"
      ? "Verifica la tua email secondaria - RevUp"
      : "Verifica il tuo account - RevUp";

  return await sendEmail({
    to: email,
    subject,
    html,
  });
}
