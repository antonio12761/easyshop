import { db } from "@packages/prisma";
import { v4 as uuidv4 } from "uuid";
import { addMinutes } from "date-fns";
import { sendVerificationEmail as sendEmailLib } from "../lib/email";

// Funzione principale con supporto per type
export async function sendVerificationEmail(
  email: string,
  type: "primary" | "secondary" = "primary"
) {
  try {
    // Verifica se l'utente esiste
    const user = await db.user.findUnique({
      where: { email },
      select: { id: true, emailVerified: true },
    });

    if (!user) {
      return { success: false, message: "Utente non trovato" };
    }

    if (type === "primary" && user.emailVerified) {
      return { success: false, message: "Email già verificata" };
    }

    // Genera un token di verifica
    const token = uuidv4();
    const expires = addMinutes(new Date(), 30); // Scade dopo 30 minuti

    // Salva il token nel database
    await db.verificationToken.create({
      data: {
        identifier: email,
        token,
        expires,
      },
    });

    // Invia l'email utilizzando la funzione dal lib/email
    const result = await sendEmailLib(email, token, type);

    if (!result.success) {
      throw new Error(result.message);
    }

    return { success: true };
  } catch (error) {
    console.error("Errore invio email di verifica:", error);
    return {
      success: false,
      message: "Errore durante l'invio dell'email di verifica",
    };
  }
}

// Wrapper per compatibilità con l'handler esistente
export async function sendVerificationEmailCompat(email: string) {
  return sendVerificationEmail(email, "primary");
}
