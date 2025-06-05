// Rate limiting avanzato
interface RateLimitConfig {
  windowMs: number;
  maxAttempts: number;
  blockDurationMs: number;
}

interface RateLimitRecord {
  attempts: number;
  firstAttempt: number;
  blockedUntil?: number;
}

// In produzione, usa Redis invece di Map
const rateLimitStore = new Map<string, RateLimitRecord>();

export class RateLimiter {
  private config: RateLimitConfig;

  constructor(config: RateLimitConfig) {
    this.config = config;
  }

  async checkLimit(
    identifier: string
  ): Promise<{
    allowed: boolean;
    remainingAttempts: number;
    resetTime?: number;
  }> {
    const now = Date.now();
    const record = rateLimitStore.get(identifier);

    // Se non esiste record, crea nuovo
    if (!record) {
      rateLimitStore.set(identifier, {
        attempts: 1,
        firstAttempt: now,
      });
      return { allowed: true, remainingAttempts: this.config.maxAttempts - 1 };
    }

    // Se è bloccato, controlla se il blocco è scaduto
    if (record.blockedUntil && now < record.blockedUntil) {
      return {
        allowed: false,
        remainingAttempts: 0,
        resetTime: record.blockedUntil,
      };
    }

    // Se la finestra è scaduta, resetta
    if (now - record.firstAttempt > this.config.windowMs) {
      rateLimitStore.set(identifier, {
        attempts: 1,
        firstAttempt: now,
      });
      return { allowed: true, remainingAttempts: this.config.maxAttempts - 1 };
    }

    // Incrementa tentativi
    record.attempts++;

    // Se supera il limite, blocca
    if (record.attempts > this.config.maxAttempts) {
      record.blockedUntil = now + this.config.blockDurationMs;
      rateLimitStore.set(identifier, record);
      return {
        allowed: false,
        remainingAttempts: 0,
        resetTime: record.blockedUntil,
      };
    }

    rateLimitStore.set(identifier, record);
    return {
      allowed: true,
      remainingAttempts: this.config.maxAttempts - record.attempts,
    };
  }

  async reset(identifier: string): Promise<void> {
    rateLimitStore.delete(identifier);
  }
}

// Configurazioni predefinite
export const loginRateLimit = new RateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minuti
  maxAttempts: 5,
  blockDurationMs: 30 * 60 * 1000, // 30 minuti di blocco
});

export const twoFactorRateLimit = new RateLimiter({
  windowMs: 5 * 60 * 1000, // 5 minuti
  maxAttempts: 3,
  blockDurationMs: 15 * 60 * 1000, // 15 minuti di blocco
});
