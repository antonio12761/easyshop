"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@packages/auth/config/authOptions";
import { db } from "@packages/prisma";
import { authenticator } from "otplib";
import QRCode from "qrcode";
import crypto from "crypto";
import { revalidatePath } from "next/cache";

// Tipi di ritorno per le Server Actions
type Setup2FAResult =
  | { success: true; secret: string; qrCode: string }
  | { success: false; message: string };

type Verify2FAResult =
  | { success: true; backupCodes: string[] }
  | { success: false; message: string };

type Disable2FAResult = { success: true } | { success: false; message: string };

// Setup 2FA - genera secret e QR code
export async function setup2FA(): Promise<Setup2FAResult> {
  try {
    console.log("=== INIZIO SETUP 2FA ===");

    const session = await getServerSession(authOptions);
    console.log("Sessione ottenuta:", !!session);

    if (!session?.user?.id) {
      console.log("Errore: utente non autorizzato");
      return { success: false, message: "Non autorizzato" };
    }

    console.log("Setup 2FA per utente:", {
      id: session.user.id,
      email: session.user.email,
    });

    // Test se le librerie sono disponibili
    console.log("Test librerie:");
    console.log("- authenticator disponibile:", typeof authenticator);
    console.log("- QRCode disponibile:", typeof QRCode);

    // Genera un secret per il 2FA
    const secret = authenticator.generateSecret();
    console.log("Secret generato:", secret, "lunghezza:", secret.length);

    // Crea l'URL per l'authenticator
    const serviceName = "RevUp Shopping";
    const accountName = session.user.email || session.user.id;

    console.log("Parametri OTP:");
    console.log("- serviceName:", serviceName);
    console.log("- accountName:", accountName);
    console.log("- secret:", secret);

    const otpauth = authenticator.keyuri(accountName, serviceName, secret);
    console.log("OTP Auth URL generato:", otpauth);

    // Test se l'URL è valido
    if (!otpauth.startsWith("otpauth://totp/")) {
      console.error("URL OTP non valido:", otpauth);
      return {
        success: false,
        message: "Errore nella generazione dell'URL OTP",
      };
    }

    console.log("Inizio generazione QR code...");

    // Genera il QR code con configurazione semplificata
    const qrCode = await QRCode.toDataURL(otpauth, {
      errorCorrectionLevel: "M",
      type: "image/png",
      width: 256,
      margin: 2,
    });

    console.log("QR Code generato con successo!");
    console.log("- Lunghezza:", qrCode.length);
    console.log("- Inizia con:", qrCode.substring(0, 50));
    console.log("- È un data URL valido:", qrCode.startsWith("data:image/"));

    if (!qrCode.startsWith("data:image/")) {
      console.error("QR Code non è un data URL valido");
      return {
        success: false,
        message: "Errore nella generazione del QR code",
      };
    }

    console.log("=== FINE SETUP 2FA - SUCCESSO ===");

    return {
      success: true,
      secret,
      qrCode,
    };
  } catch (error) {
    console.error("=== ERRORE SETUP 2FA ===");
    console.error("Tipo errore:", typeof error);
    console.error(
      "Messaggio:",
      error instanceof Error ? error.message : String(error)
    );
    console.error("Stack:", error instanceof Error ? error.stack : "N/A");

    return {
      success: false,
      message: `Errore durante la configurazione del 2FA: ${
        error instanceof Error ? error.message : "Errore sconosciuto"
      }`,
    };
  }
}

// Verifica e attiva 2FA
export async function verify2FA(
  token: string,
  secret: string
): Promise<Verify2FAResult> {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return { success: false, message: "Non autorizzato" };
    }

    if (!token || !secret) {
      return { success: false, message: "Token e secret richiesti" };
    }

    console.log(
      "Verifica 2FA - Token:",
      token,
      "Secret:",
      secret.substring(0, 10) + "..."
    );

    // Verifica il token
    const isValid = authenticator.verify({ token, secret });
    console.log("Token valido:", isValid);

    if (!isValid) {
      return { success: false, message: "Codice non valido" };
    }

    // Genera codici di backup
    const backupCodes = Array.from({ length: 8 }, () =>
      crypto.randomBytes(4).toString("hex").toUpperCase()
    );
    console.log("Codici di backup generati:", backupCodes.length);

    // I codici di backup scadono tra 1 anno
    const expiresAt = new Date();
    expiresAt.setFullYear(expiresAt.getFullYear() + 1);

    // Usa una transazione per aggiornare l'utente e creare i codici di backup
    await db.$transaction(async (tx) => {
      // Aggiorna l'utente
      await tx.user.update({
        where: { id: session.user.id },
        data: {
          twoFactorSecret: secret,
          twoFactorEnabled: true,
        },
      });

      // Crea i codici di backup usando il modello esistente
      await tx.twoFactorCode.createMany({
        data: backupCodes.map((code) => ({
          userId: session.user.id!,
          code,
          expiresAt,
        })),
      });
    });

    revalidatePath("/dashboard/my-account/security/2fa");
    revalidatePath("/dashboard/my-account/security");
    revalidatePath("/dashboard/my-account");

    return {
      success: true,
      backupCodes,
    };
  } catch (error) {
    console.error("Errore verifica 2FA:", error);
    return { success: false, message: "Errore durante la verifica del codice" };
  }
}

// Disattiva 2FA
export async function disable2FA(token: string): Promise<Disable2FAResult> {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return { success: false, message: "Non autorizzato" };
    }

    if (!token) {
      return { success: false, message: "Token richiesto" };
    }

    // Recupera l'utente con il secret e i codici di backup
    const user = await db.user.findUnique({
      where: { id: session.user.id },
      select: {
        twoFactorSecret: true,
        twoFactorCodes: {
          where: {
            expiresAt: { gt: new Date() }, // Solo codici non scaduti
          },
          select: { code: true },
        },
      },
    });

    if (!user?.twoFactorSecret) {
      return { success: false, message: "2FA non attivo" };
    }

    // Verifica il token o controlla se è un backup code
    const isValidToken = authenticator.verify({
      token,
      secret: user.twoFactorSecret,
    });

    const backupCodes = user.twoFactorCodes.map((c) => c.code);
    const isValidBackupCode = backupCodes.includes(token.toUpperCase());

    if (!isValidToken && !isValidBackupCode) {
      return { success: false, message: "Codice non valido" };
    }

    // Usa una transazione per disattivare il 2FA e rimuovere i codici
    await db.$transaction(async (tx) => {
      // Disattiva il 2FA
      await tx.user.update({
        where: { id: session.user.id },
        data: {
          twoFactorSecret: null,
          twoFactorEnabled: false,
        },
      });

      // Rimuovi tutti i codici di backup
      await tx.twoFactorCode.deleteMany({
        where: { userId: session.user.id },
      });
    });

    revalidatePath("/dashboard/my-account/security/2fa");
    revalidatePath("/dashboard/my-account/security");
    revalidatePath("/dashboard/my-account");

    return { success: true };
  } catch (error) {
    console.error("Errore disattivazione 2FA:", error);
    return {
      success: false,
      message: "Errore durante la disattivazione del 2FA",
    };
  }
}
