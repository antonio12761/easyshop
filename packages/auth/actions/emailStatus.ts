"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@packages/auth/config/authOptions";
import { db } from "@packages/prisma";

export async function getEmailStatus() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return {
      success: false,
      message: "Utente non autenticato.",
    };
  }

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: {
      emailVerified: true,
      secondaryEmail: true,
      secondaryEmailVerified: true,
    },
  });

  if (!user) {
    return {
      success: false,
      message: "Utente non trovato.",
    };
  }

  return {
    success: true,
    data: {
      primaryVerified: !!user.emailVerified,
      secondaryEmail: user.secondaryEmail,
      secondaryVerified: !!user.secondaryEmailVerified,
    },
  } satisfies {
    success: true;
    data: {
      primaryVerified: boolean;
      secondaryEmail: string | null;
      secondaryVerified: boolean;
    };
  };
}

// Alias per compatibilità con importazioni come `emailStatus`
export { getEmailStatus as emailStatus };
