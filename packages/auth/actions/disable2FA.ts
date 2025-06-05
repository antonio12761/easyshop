"use server";

import { getUserFromSession } from "../lib/session";
import { prisma } from "../lib/db";
import { authenticator } from "otplib";

export async function disable2FA(code: string) {
  const user = await getUserFromSession();

  if (!user?.email) {
    return { success: false, message: "Utente non autenticato" };
  }

  try {
    const dbUser = await prisma.user.findUnique({
      where: { email: user.email },
      select: {
        id: true,
        twoFactorSecret: true,
        twoFactorCodes: {
          where: { expiresAt: { gt: new Date() } },
        },
      },
    });

    if (!dbUser?.twoFactorSecret) {
      return { success: false, message: "2FA non attiva" };
    }

    const isValidToken = authenticator.verify({
      token: code,
      secret: dbUser.twoFactorSecret,
    });

    const isValidBackup = dbUser.twoFactorCodes.some(c => c.code === code.toUpperCase());

    if (!isValidToken && !isValidBackup) {
      return { success: false, message: "Codice non valido per disattivazione" };
    }

    await prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { email: user.email },
        data: {
          twoFactorEnabled: false,
          twoFactorSecret: null,
        },
      });

      await tx.twoFactorCode.deleteMany({
        where: { userId: dbUser.id },
      });
    });

    return { success: true, message: "2FA disattivata con successo" };
  } catch (error) {
    console.error("Errore nella disattivazione 2FA:", error);
    return { success: false, message: "Errore nella disattivazione 2FA" };
  }
}