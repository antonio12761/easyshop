"use server";

import { getUserFromSession } from "../lib/session";

export async function resendSecondaryEmailVerification() {
  try {
    // Ottieni l'utente corrente
    const user = await getUserFromSession();
    if (!user) {
      return { success: false, message: "Utente non autenticato" };
    }

    // Verifica che ci sia un'email secondaria
    if (!user.secondaryEmail) {
      return {
        success: false,
        message: "Nessuna email secondaria configurata",
      };
    }

    // Verifica che l'email non sia già verificata
    if (user.secondaryEmailVerified) {
      return { success: false, message: "L'email secondaria è già verificata" };
    }

    // Simula l'invio dell'email di verifica
    // In produzione, qui invieresti una vera email
    console.log(`Invio email di verifica a: ${user.secondaryEmail}`);

    return {
      success: true,
      message:
        "Codice di verifica inviato con successo alla tua email secondaria",
    };
  } catch (error) {
    console.error("Errore nel reinvio della verifica email:", error);
    return { success: false, message: "Errore interno del server" };
  }
}
