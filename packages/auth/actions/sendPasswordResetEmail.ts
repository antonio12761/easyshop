"use server";

import { db } from "@packages/prisma";
import { z } from "zod";
import crypto from "crypto";

const emailSchema = z.string().email("Email non valida");

interface SendPasswordResetEmailResult {
  success: boolean;
  error?: string;
}

export async function sendPasswordResetEmail(
  email: string
): Promise<SendPasswordResetEmailResult> {
  try {
    // Validazione email
    const validatedEmail = emailSchema.safeParse(email);
    if (!validatedEmail.success) {
      return {
        success: false,
        error: "Email non valida",
      };
    }

    // Cerca l'utente nel database
    const user = await db.user.findUnique({
      where: { email: validatedEmail.data },
    });

    // Per sicurezza, restituiamo sempre successo anche se l'utente non esiste
    // Questo previene l'enumerazione degli account
    if (!user) {
      return {
        success: true, // Non rivelare che l'utente non esiste
      };
    }

    // Genera un token sicuro
    const token = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minuti

    // Elimina eventuali token esistenti per questo utente
    await db.passwordResetToken.deleteMany({
      where: { userId: user.id },
    });

    // Crea il nuovo token
    await db.passwordResetToken.create({
      data: {
        token,
        userId: user.id,
        expiresAt,
      },
    });

    // TODO: Invia l'email con il token
    // Per ora logghiamo il token (rimuovi in produzione)
    console.log(`Reset token for ${email}: ${token}`);
    console.log(
      `Reset URL: ${process.env.NEXTAUTH_URL}/reset-password?token=${token}`
    );

    // In un'implementazione reale, qui invieresti l'email
    // await sendEmail({
    //   to: email,
    //   subject: "Reset Password",
    //   html: `<a href="${process.env.NEXTAUTH_URL}/reset-password?token=${token}">Reset Password</a>`
    // })

    return {
      success: true,
    };
  } catch (error) {
    console.error("Error sending password reset email:", error);
    return {
      success: false,
      error: "Errore interno del server",
    };
  }
}
