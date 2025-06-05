// packages/auth/lib/twofa.ts
import { authenticator } from "otplib";

export function verifyTOTP(secret: string, token: string): boolean {
  return authenticator.verify({ token, secret });
}

export function generateTOTPSecret(): string {
  return authenticator.generateSecret();
}

export function generateTOTPToken(secret: string): string {
  return authenticator.generate(secret);
}
