"use server";

import { getUserFromSession } from "../lib/session";
import { db } from "@packages/prisma";
import { z } from "zod";

const emailSchema = z.string().email("Email non valida");

export async function updateSecondaryEmail(email: string) {
  try {
    // Valida l'email
    const validatedEmail = emailSchema.parse(email);

    // Ottieni l'utente corrente
    const user = await getUserFromSession();
    if (!user) {
      return { success: false, message: "Utente non autenticato" };
    }

    // Verifica che l'email secondaria non sia uguale a quella principale
    if (validatedEmail === user.email) {
      return {
        success: false,
        message: "L'email secondaria non può essere uguale a quella principale",
      };
    }

    // Verifica che l'email non sia già utilizzata da un altro utente
    const existingUser = await db.user.findFirst({
      where: {
        OR: [{ email: validatedEmail }, { secondaryEmail: validatedEmail }],
        NOT: {
          id: user.id,
        },
      },
    });

    if (existingUser) {
      return {
        success: false,
        message: "Questa email è già utilizzata da un altro account",
      };
    }

    // Aggiorna l'email secondaria
    await db.user.update({
      where: { id: user.id },
      data: {
        secondaryEmail: validatedEmail,
        secondaryEmailVerified: null, // Reset della verifica
      },
    });

    return {
      success: true,
      message:
        "Email secondaria aggiornata con successo. Controlla la tua casella di posta per il codice di verifica.",
    };
  } catch (error) {
    console.error("Errore nell'aggiornamento dell'email secondaria:", error);

    if (error instanceof z.ZodError) {
      return { success: false, message: "Email non valida" };
    }

    return { success: false, message: "Errore interno del server" };
  }
}
