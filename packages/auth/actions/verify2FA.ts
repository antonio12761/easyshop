"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "../config/authOptions";
import { prisma } from "@packages/prisma";
import { authenticator } from "otplib";

export async function verify2FACode(code: string): Promise<{ success: boolean; message: string }> {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return { success: false, message: "Sessione non valida" };
  }

  if (!/^[0-9]{6}$/.test(code)) {
    return { success: false, message: "Formato del codice non valido" };
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { twoFactorSecret: true, twoFactorEnabled: true, id: true },
    });

    if (!user?.twoFactorEnabled || !user.twoFactorSecret) {
      return { success: false, message: "2FA non configurato" };
    }

    const isValid = authenticator.verify({
      token: code,
      secret: user.twoFactorSecret,
    });

    if (isValid) {
      return { success: true, message: "2FA verificato con successo" };
    }

    const backup = await prisma.twoFactorCode.findFirst({
      where: {
        userId: user.id,
        code: code.toUpperCase(),
        expiresAt: { gt: new Date() },
      },
    });

    if (backup) {
      await prisma.twoFactorCode.delete({
        where: { id: backup.id },
      });

      return { success: true, message: "Accesso tramite codice di backup" };
    }

    return { success: false, message: "Codice 2FA non valido" };
  } catch (error) {
    console.error("Errore nella verifica 2FA:", error);
    return { success: false, message: "Errore durante la verifica" };
  }
}