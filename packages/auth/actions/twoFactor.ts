// packages/auth/actions/twoFactor.ts
"use server";

import { prisma } from "@packages/prisma";
import { authenticator } from "otplib";

type Verify2FAInput = {
  email: string;
  code: string;
};
// packages/auth/actions/twoFactor.ts

export type Verify2FAResponse =
  | {
      success: true;
      user: {
        id: string;
        email: string;
        name: string | null;
        image: string | null;
        role: string;
      };
    }
  | {
      success: false;
      message: string;
    };

export async function verify2FACode({
  email,
  code,
}: {
  email: string;
  code: string;
}): Promise<Verify2FAResponse> {
  try {
    if (!email || !code) {
      return { success: false, message: "Dati mancanti" };
    }

    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        twoFactorSecret: true,
        twoFactorEnabled: true,
        email: true,
        name: true,
        image: true,
        role: true,
      },
    });

    if (!user?.twoFactorSecret || !user.twoFactorEnabled) {
      return {
        success: false,
        message: "2FA non configurato per questo utente",
      };
    }

    const isValid = authenticator.check(code, user.twoFactorSecret);

    if (!isValid) {
      return { success: false, message: "Codice 2FA non valido" };
    }

    return {
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        image: user.image,
        role: user.role,
      },
    };
  } catch (error) {
    console.error("Errore verifica 2FA:", error);
    return { success: false, message: "Errore del server durante la verifica" };
  }
}
