"use server"

import { db } from "@packages/prisma"
import { hash } from "bcryptjs"
import { sendResetPasswordEmail } from "../lib/email"

/**
 * Esegue il reset della password dato un token e una nuova password.
 */
export async function resetPassword(input: {
  token: string
  password: string
}) {
  const { token, password } = input

  const record = await db.passwordResetToken.findUnique({
    where: { token },
  })

  if (!record || record.expiresAt < new Date()) {
    return { success: false, message: "Token non valido o scaduto." }
  }

  const passwordHash = await hash(password, 10)

  await db.user.update({
    where: { id: record.userId },
    data: { passwordHash },
  })

  await db.passwordResetToken.delete({ where: { token } })

  return { success: true }
}

/**
 * Genera un token di reset per l'utente, lo salva nel database e invia una mail.
 */
export async function requestPasswordReset(email: string) {
  const user = await db.user.findUnique({ where: { email } })
  if (!user) {
    // Silenzioso per privacy
    return { success: true }
  }

  const token = crypto.randomUUID()

  await db.passwordResetToken.create({
    data: {
      token,
      userId: user.id,
      expiresAt: new Date(Date.now() + 1000 * 60 * 15), // 15 minuti
    },
  })

  await sendResetPasswordEmail(email, token)

  return { success: true }
}
