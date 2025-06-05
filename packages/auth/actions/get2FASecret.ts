"use server";

import { getUserFromSession } from "../lib/session";
import { prisma } from "../lib/db";
import { generateSecret, generateOTPAuth } from "../lib/totp";

export async function get2FASecret() {
  const user = await getUserFromSession();

  if (!user?.email) {
    return { success: false, message: "Utente non autenticato" };
  }

  try {
    // Genera un nuovo secret
    const secret = generateSecret();
    const otpauth = generateOTPAuth(user.email, secret);

    // Salva il secret nel database (temporaneamente, fino all'attivazione)
    await prisma.user.update({
      where: { email: user.email },
      data: { twoFactorSecret: secret },
    });

    return {
      success: true,
      secret,
      otpauth,
    };
  } catch (error) {
    console.error("Errore nella generazione del secret 2FA:", error);
    return {
      success: false,
      message: "Errore nella generazione del secret 2FA",
    };
  }
}
