"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "../lib/auth-config";
import { prisma } from "@packages/prisma";
import { z } from "zod";

const updateProfileSchema = z.object({
  name: z.string().min(1, "Il nome è obbligatorio").optional(),
  email: z.string().email("Email non valida").optional(),
});

interface UpdateProfileResult {
  success: boolean;
  error?: string;
  message?: string;
}

export async function updateProfile(
  data: z.infer<typeof updateProfileSchema>
): Promise<UpdateProfileResult> {
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
    const validatedData = updateProfileSchema.safeParse(data);
    if (!validatedData.success) {
      return {
        success: false,
        error: "Dati non validi",
      };
    }

    const updateData: any = {};

    // Se viene aggiornato il nome
    if (validatedData.data.name !== undefined) {
      updateData.name = validatedData.data.name;
    }

    // Se viene aggiornata l'email
    if (validatedData.data.email !== undefined) {
      // Controlla se l'email è già in uso
      const existingUser = await prisma.user.findFirst({
        where: {
          email: validatedData.data.email,
          NOT: {
            id: session.user.id,
          },
        },
      });

      if (existingUser) {
        return {
          success: false,
          error: "Email già in uso",
        };
      }

      updateData.email = validatedData.data.email;
      updateData.emailVerified = null; // Reset verifica email se cambiata
    }

    // Se non ci sono dati da aggiornare
    if (Object.keys(updateData).length === 0) {
      return {
        success: false,
        error: "Nessun dato da aggiornare",
      };
    }

    // Aggiorna il profilo
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        ...updateData,
        updatedAt: new Date(),
      },
    });

    return {
      success: true,
      message: "Profilo aggiornato con successo",
    };
  } catch (error) {
    console.error("Error updating profile:", error);
    return {
      success: false,
      error: "Errore interno del server",
    };
  }
}
