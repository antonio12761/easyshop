"use server";

import { db } from "@packages/prisma";
import bcrypt from "bcryptjs";
import { getServerSession } from "next-auth";
import { authOptions } from "../lib/auth-config";

interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

interface ChangePasswordResult {
  success: boolean;
  error?: string;
  message?: string;
}

export async function changePassword(
  data: ChangePasswordData
): Promise<ChangePasswordResult> {
  try {
    // Verifica la sessione
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return {
        success: false,
        error: "Non autorizzato",
      };
    }

    // Validazione dei dati
    if (!data.currentPassword || !data.newPassword || !data.confirmPassword) {
      return {
        success: false,
        error: "Tutti i campi sono obbligatori",
      };
    }

    if (data.newPassword !== data.confirmPassword) {
      return {
        success: false,
        error: "Le nuove password non corrispondono",
      };
    }

    if (data.newPassword.length < 8) {
      return {
        success: false,
        error: "La nuova password deve essere di almeno 8 caratteri",
      };
    }

    // Recupera l'utente dal database
    const user = await db.user.findUnique({
      where: { id: session.user.id },
      select: { id: true, passwordHash: true },
    });

    if (!user || !user.passwordHash) {
      return {
        success: false,
        error: "Utente non trovato",
      };
    }

    // Verifica la password corrente
    const isCurrentPasswordValid = await bcrypt.compare(
      data.currentPassword,
      user.passwordHash
    );
    if (!isCurrentPasswordValid) {
      return {
        success: false,
        error: "Password corrente non corretta",
      };
    }

    // Verifica che la nuova password sia diversa da quella corrente
    const isSamePassword = await bcrypt.compare(
      data.newPassword,
      user.passwordHash
    );
    if (isSamePassword) {
      return {
        success: false,
        error: "La nuova password deve essere diversa da quella corrente",
      };
    }

    // Hash della nuova password
    const hashedNewPassword = await bcrypt.hash(data.newPassword, 12);

    // Aggiorna la password nel database
    await db.user.update({
      where: { id: session.user.id },
      data: {
        passwordHash: hashedNewPassword,
        updatedAt: new Date(),
      },
    });

    return {
      success: true,
      message: "Password cambiata con successo",
    };
  } catch (error) {
    console.error("Error changing password:", error);
    return {
      success: false,
      error: "Errore interno del server",
    };
  }
}
