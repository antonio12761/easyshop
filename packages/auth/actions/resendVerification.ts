"use server";

import { prisma } from "@packages/prisma";

import { sendVerificationEmail } from "./sendVerificationEmail";

export async function resendVerification(email: string) {
  const user = await prisma.user.findUnique({ where: { email } });

  if (!user || user.emailVerified) {
    return {
      success: false,
      message: "Email già verificata o utente non trovato.",
    };
  }

  await sendVerificationEmail(email);

  return { success: true };
}
