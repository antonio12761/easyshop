// packages/auth/actions/reset-password.ts
"use server";

import { prisma } from "@packages/prisma";

import { hash } from "bcryptjs";
import { sendResetPasswordEmail } from "../lib/email";

/**
 * Esegue il reset della password dato un token e una nuova password.
 */
export async function resetPassword(input: {
  token: string;
  password: string;
}) {
  const { token, password } = input;

  const record = await prisma.passwordResetToken.findUnique({
    where: { token },
  });

  if (!record || record.expiresAt < new Date()) {
    return { success: false, message: "Token non valido o scaduto." };
  }

  const passwordHash = await hash(password, 10);

  await prisma.user.update({
    where: { id: record.userId },
    data: { passwordHash },
  });

  await prisma.passwordResetToken.delete({ where: { token } });

  return { success: true };
}

/**
 * Genera un token di reset per l'utente, lo salva nel database e invia una mail.
 */
export async function requestPasswordReset(email: string) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    // Silenzioso per privacy
    return { success: true };
  }

  const token = crypto.randomUUID();

  await prisma.passwordResetToken.create({
    data: {
      token,
      userId: user.id,
      expiresAt: new Date(Date.now() + 1000 * 60 * 15), // 15 minuti
    },
  });

  await sendResetPasswordEmail(email, token);

  return { success: true };
}
