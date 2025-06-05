"use server";

import { db } from "@packages/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "../lib/auth-config";
import { z } from "zod";
import crypto from "crypto";

const emailSchema = z.string().email("Email non valida");

interface SendSecondaryEmailVerificationResult {
  success: boolean;
  error?: string;
}

export async function sendSecondaryEmailVerification(
  email: string
): Promise<SendSecondaryEmailVerificationResult> {
  try {
    // Verifica la sessione
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return {
        success: false,
        error: "Non autorizzato",
      };
    }

    // Validazione email
    const validatedEmail = emailSchema.safeParse(email);
    if (!validatedEmail.success) {
      return {
        success: false,
        error: "Email non valida",
      };
    }

    // Controlla che l'email non sia già in uso
    const existingUser = await db.user.findFirst({
      where: {
        email: validatedEmail.data,
      },
    });

    if (existingUser && existingUser.id !== session.user.id) {
      return {
        success: false,
        error: "Email già in uso da un altro account",
      };
    }

    // Genera un token sicuro
    const token = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 ore

    // Elimina eventuali token esistenti per questo utente
    await db.emailVerificationToken.deleteMany({
      where: {
        userId: session.user.id,
      },
    });

    // Crea il nuovo token
    await db.emailVerificationToken.create({
      data: {
        token,
        userId: session.user.id,
        expiresAt,
      },
    });

    // TODO: Invia l'email con il token
    // Per ora logghiamo il token (rimuovi in produzione)
    console.log(`Secondary email verification token for ${email}: ${token}`);
    console.log(
      `Verification URL: ${process.env.NEXTAUTH_URL}/verify-secondary-email?token=${token}`
    );

    return {
      success: true,
    };
  } catch (error) {
    console.error("Error sending secondary email verification:", error);
    return {
      success: false,
      error: "Errore interno del server",
    };
  }
}
