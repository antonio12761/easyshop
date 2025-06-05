"use server";

import { getServerSession } from "next-auth/next";
import { authOptions } from "../config/authOptions";
import { db } from "@packages/prisma";

export async function markWelcomeSeen() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      console.log("No session or user ID found");
      return { success: false, message: "Utente non autenticato" };
    }

    await db.user.update({
      where: {
        id: session.user.id,
      },
      data: {
        hasSeenWelcome: true,
      },
    });

    return { success: true, message: "Benvenuto aggiornato con successo" };
  } catch (error) {
    console.error("Error marking welcome as seen:", error);
    return { success: false, message: "Errore nell'aggiornamento" };
  }
}
