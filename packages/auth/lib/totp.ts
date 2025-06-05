import { authenticator } from "otplib";

// Configurazione TOTP
authenticator.options = {
  step: 30, // 30 secondi di validità
  window: 1, // Accetta codici con 1 step di differenza
};

/**
 * Genera un secret casuale per TOTP
 */
export function generateSecret(): string {
  return authenticator.generateSecret();
}

/**
 * Genera l'URL OTPAuth per i QR code
 */
export function generateOTPAuth(email: string, secret: string): string {
  return authenticator.keyuri(email, "RevUp Shopping", secret);
}

/**
 * Verifica un codice TOTP
 */
export function verifyTOTP(token: string, secret: string): boolean {
  try {
    return authenticator.verify({ token, secret });
  } catch (error) {
    console.error("Errore nella verifica TOTP:", error);
    return false;
  }
}

/**
 * Genera un codice TOTP (per testing)
 */
export function generateTOTP(secret: string): string {
  return authenticator.generate(secret);
}

/**
 * Ottiene il tempo rimanente per il codice corrente
 */
export function getTimeRemaining(): number {
  return authenticator.timeRemaining();
}

/**
 * Verifica se un secret è valido
 */
export function isValidSecret(secret: string): boolean {
  try {
    // Prova a generare un codice per verificare la validità del secret
    authenticator.generate(secret);
    return true;
  } catch {
    return false;
  }
}

/**
 * Genera un backup code (per recovery)
 */
export function generateBackupCode(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let result = "";
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * Genera multipli backup codes
 */
export function generateBackupCodes(count = 10): string[] {
  const codes: string[] = [];
  for (let i = 0; i < count; i++) {
    codes.push(generateBackupCode());
  }
  return codes;
}
