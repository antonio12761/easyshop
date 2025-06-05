"use server";

import { getUserFromSession } from "../lib/session";
import { prisma } from "../lib/db";
import { verifyTOTP } from "../lib/totp";

export async function enable2FA(code: string) {
  const user = await getUserFromSession();

  if (!user?.email) {
    return { success: false, message: "Utente non autenticato" };
  }

 if (!/^[0-9]{6}$/.test(code)) {
    return { success: false, message: "Formato del codice non valido" };
  }

  try {
    // Recupera l'utente completo dal database
    const dbUser = await prisma.user.findUnique({
      where: { email: user.email },
      select: { twoFactorSecret: true },
    });

    if (!dbUser?.twoFactorSecret) {
      return { success: false, message: "Secret 2FA non trovato" };
    }

    // Verifica il codice TOTP
    const isValid = verifyTOTP(code, dbUser.twoFactorSecret);

    if (!isValid) {
      return { success: false, message: "Codice 2FA non valido" };
    }

    // Attiva il 2FA
    await prisma.user.update({
      where: { email: user.email },
      data: { twoFactorEnabled: true },
    });

    return { success: true, message: "2FA attivata con successo" };
  } catch (error) {
    console.error("Errore nell'attivazione 2FA:", error);
    return { success: false, message: "Errore nell'attivazione 2FA" };
  }
}
