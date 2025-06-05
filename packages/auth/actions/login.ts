"use server";

import { prisma } from "@packages/prisma";

export async function login(email: string) {
  const user = await prisma.user.findUnique({ where: { email } });

  if (!user || !user.passwordHash) {
    return { success: false, message: "Credenziali non valide" };
  }

  if (!user.emailVerified) {
    return {
      success: false,
      message: "Email non verificata. Controlla la posta.",
    };
  }

  if (user.lockedUntil && user.lockedUntil > new Date()) {
    return {
      success: false,
      message: "Account bloccato temporaneamente. Riprova più tardi.",
    };
  }

  return { success: true };
}
