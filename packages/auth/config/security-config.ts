export const securityConfig = {
  // Configurazione sessioni
  session: {
    maxAge: 24 * 60 * 60, // 24 ore
    updateAge: 60 * 60, // Aggiorna ogni ora
    strategy: "jwt" as const,
  },

  // Configurazione password
  password: {
    minLength: 12,
    requireUppercase: true,
    requireLowercase: true,
    requireNumbers: true,
    requireSpecialChars: true,
    maxAge: 90 * 24 * 60 * 60 * 1000, // 90 giorni
  },

  // Configurazione 2FA
  twoFactor: {
    issuer: "RevUp Shopping",
    window: 2, // Permette ±2 intervalli di tempo
    step: 30, // 30 secondi per step
  },

  // Configurazione rate limiting
  rateLimit: {
    login: {
      windowMs: 15 * 60 * 1000, // 15 minuti
      maxAttempts: 5,
      blockDurationMs: 30 * 60 * 1000, // 30 minuti
    },
    twoFactor: {
      windowMs: 5 * 60 * 1000, // 5 minuti
      maxAttempts: 3,
      blockDurationMs: 15 * 60 * 1000, // 15 minuti
    },
    api: {
      windowMs: 60 * 1000, // 1 minuto
      maxAttempts: 100,
    },
  },

  // Configurazione audit
  audit: {
    retentionDays: 365, // Mantieni log per 1 anno
    sensitiveActions: [
      "LOGIN_SUCCESS",
      "LOGIN_FAILURE",
      "PASSWORD_CHANGED",
      "2FA_ENABLED",
      "2FA_DISABLED",
      "ADMIN_ACCESS",
      "DATA_EXPORT",
    ],
  },

  // Configurazione CORS
  cors: {
    origin: process.env.NODE_ENV === "production" ? ["https://yourdomain.com"] : ["http://localhost:3000"],
    credentials: true,
  },
}
