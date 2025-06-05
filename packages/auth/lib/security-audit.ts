import { db } from "./db";

export interface SecurityEvent {
  userId: string;
  event:
    | "LOGIN_SUCCESS"
    | "LOGIN_FAILED"
    | "2FA_VERIFIED"
    | "2FA_FAILED"
    | "SUSPICIOUS_ACTIVITY";
  ip?: string;
  userAgent?: string;
  metadata?: Record<string, any>;
}

export async function logSecurityEvent(event: SecurityEvent) {
  try {
    await db.activityLog.create({
      data: {
        userId: event.userId,
        timestamp: new Date(),
        ip: event.ip || "unknown",
        userAgent: event.userAgent || event.event,
      },
    });
  } catch (error) {
    console.error("Errore nel logging evento di sicurezza:", error);
  }
}

export async function detectSuspiciousActivity(
  userId: string
): Promise<boolean> {
  try {
    const recentLogs = await db.activityLog.findMany({
      where: {
        userId,
        timestamp: {
          gte: new Date(Date.now() - 60 * 60 * 1000), // Ultima ora
        },
      },
      orderBy: { timestamp: "desc" },
    });

    // Rileva tentativi multipli falliti
    const failedAttempts = recentLogs.filter((log) =>
      log.userAgent?.includes("FAILED")
    ).length;

    return failedAttempts >= 5;
  } catch (error) {
    console.error("Errore nel rilevamento attività sospette:", error);
    return false;
  }
}
