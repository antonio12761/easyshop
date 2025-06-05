"use server";

import { db } from "@packages/prisma";
import { z } from "zod";

const tokenSchema = z.string().min(1, "Token richiesto");

interface VerifyEmailResult {
  success: boolean;
  error?: string;
}

export async function verifyEmail(token: string): Promise<VerifyEmailResult> {
  try {
    // Validazione token
    const validatedToken = tokenSchema.safeParse(token);
    if (!validatedToken.success) {
      return {
        success: false,
        error: "Token non valido",
      };
    }

    // Cerca il token nel database
    const verificationToken = await db.emailVerificationToken.findUnique({
      where: {
        token: validatedToken.data,
      },
      include: {
        user: true,
      },
    });

    if (!verificationToken) {
      return {
        success: false,
        error: "Token non trovato o non valido",
      };
    }

    // Controlla se il token è scaduto
    if (verificationToken.expiresAt < new Date()) {
      // Elimina il token scaduto
      await db.emailVerificationToken.delete({
        where: { id: verificationToken.id },
      });

      return {
        success: false,
        error: "Token scaduto. Richiedi una nuova email di verifica.",
      };
    }

    // Aggiorna l'utente come verificato
    await db.user.update({
      where: { id: verificationToken.userId },
      data: {
        emailVerified: new Date(),
        updatedAt: new Date(),
      },
    });

    // Elimina il token utilizzato
    await db.emailVerificationToken.delete({
      where: { id: verificationToken.id },
    });

    return {
      success: true,
    };
  } catch (error) {
    console.error("Error verifying email:", error);
    return {
      success: false,
      error: "Errore interno del server",
    };
  }
}
