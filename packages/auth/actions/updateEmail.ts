"use server";

import { getCurrentUserServer } from "@auth/lib/session";
import { db } from "@auth/lib/db";
import { sendVerificationEmail } from "@auth/lib/email";
import { generateEmailVerificationToken } from "@auth/lib/tokens";

export async function updateEmail(newEmail: string) {
  try {
    const user = await getCurrentUserServer();

    if (!user) {
      return {
        success: false,
        message: "Utente non autenticato",
      };
    }

    // Controlla se la nuova email è diversa da quella attuale
    if (newEmail === user.email) {
      return {
        success: false,
        message: "La nuova email deve essere diversa da quella attuale",
      };
    }

    // Controlla se l'email è già in uso da un altro utente
    const existingUser = await db.user.findUnique({
      where: { email: newEmail },
    });

    if (existingUser && existingUser.id !== user.id) {
      return {
        success: false,
        message: "Questa email è già in uso da un altro utente",
      };
    }

    // Genera token di verifica
    const token = await generateEmailVerificationToken(newEmail, user.id);

    // Aggiorna l'email dell'utente (non verificata)
    await db.user.update({
      where: { id: user.id },
      data: {
        email: newEmail,
        emailVerified: null, // Reset verifica
      },
    });

    // Invia email di verifica
    await sendVerificationEmail(newEmail, token);

    return {
      success: true,
      message:
        "Email aggiornata. Controlla la tua casella di posta per verificarla.",
    };
  } catch (error) {
    console.error("Errore nell'aggiornamento email:", error);
    return {
      success: false,
      message: "Errore interno del server",
    };
  }
}
