import { hash, compare } from "bcryptjs";
import { z } from "zod";

// Schema per validazione password robusta
export const passwordSchema = z
  .string()
  .min(12, "La password deve essere di almeno 12 caratteri")
  .regex(/[a-z]/, "La password deve contenere almeno una lettera minuscola")
  .regex(/[A-Z]/, "La password deve contenere almeno una lettera maiuscola")
  .regex(/[0-9]/, "La password deve contenere almeno un numero")
  .regex(
    /[^a-zA-Z0-9]/,
    "La password deve contenere almeno un carattere speciale"
  )
  .refine((password) => {
    // Controlla password comuni
    const commonPasswords = [
      "password123",
      "123456789",
      "qwerty123",
      "admin123",
      "password1",
    ];
    return !commonPasswords.includes(password.toLowerCase());
  }, "Password troppo comune, scegline una più sicura");

// Funzione per hash sicuro delle password
export async function hashPassword(password: string): Promise<string> {
  // Usa un salt round alto per maggiore sicurezza
  return await hash(password, 14);
}

// Funzione per verificare password
export async function verifyPassword(
  password: string,
  hashedPassword: string
): Promise<boolean> {
  return await compare(password, hashedPassword);
}

// Controlla se la password è stata compromessa (simulazione)
export async function checkPasswordBreach(password: string): Promise<boolean> {
  // In produzione, potresti usare HaveIBeenPwned API
  // Per ora, una lista di password comuni
  const breachedPasswords = [
    "password",
    "123456",
    "password123",
    "admin",
    "qwerty",
    "letmein",
  ];

  return breachedPasswords.includes(password.toLowerCase());
}
