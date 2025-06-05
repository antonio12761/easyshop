// packages/auth/actions/register.ts
"use server";

import { prisma } from "@packages/prisma";

import { hash } from "bcryptjs";
import { z } from "zod";
import { sendVerificationEmail } from "./sendVerificationEmail";

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

type RegisterInput = z.infer<typeof registerSchema>;

export async function register(data: RegisterInput) {
  const parsed = registerSchema.safeParse({
    email: data.email.toLowerCase().trim(), // ✅ normalizzazione
    password: data.password,
  });

  if (!parsed.success) {
    return { success: false, message: "Email o password non validi" };
  }

  const { email, password } = parsed.data;

  const existingUser = await prisma.user.findUnique({ where: { email } });

  if (existingUser) {
    if (process.env.NODE_ENV !== "production") {
      console.warn(
        `⚠️ Tentativo di registrazione con email già registrata: ${email}`
      );
    }

    return { success: false, message: "Email già registrata" };
  }

  const passwordHash = await hash(password, 10);

  await prisma.user.create({
    data: {
      email,
      passwordHash,
      emailVerified: null,
    },
  });

  await sendVerificationEmail(email); // ✅ opzionale

  return { success: true };
}
