import { prisma } from "@packages/prisma";

export interface AuditLogEntry {
  userId?: string;
  action: string;
  resource: string;
  details?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  success: boolean;
}

export async function createAuditLog(entry: AuditLogEntry) {
  try {
    await prisma.activityLog.create({
      data: {
        userId: entry.userId || "",
        ip: entry.ipAddress,
        userAgent: entry.userAgent,
        action: entry.action,
        resource: entry.resource,
        details: entry.details ? JSON.stringify(entry.details) : null,
        success: entry.success,
      },
    });
  } catch (error) {
    console.error("Failed to create audit log:", error);
    // Non fallire l'operazione principale se il log fallisce
  }
}

// Funzioni helper per eventi comuni
export const auditEvents = {
  async loginSuccess(userId: string, ipAddress?: string, userAgent?: string) {
    await createAuditLog({
      userId,
      action: "LOGIN_SUCCESS",
      resource: "auth",
      ipAddress,
      userAgent,
      success: true,
    });
  },

  async loginFailure(
    email: string,
    reason: string,
    ipAddress?: string,
    userAgent?: string
  ) {
    await createAuditLog({
      action: "LOGIN_FAILURE",
      resource: "auth",
      details: { email, reason },
      ipAddress,
      userAgent,
      success: false,
    });
  },

  async twoFactorEnabled(userId: string, ipAddress?: string) {
    await createAuditLog({
      userId,
      action: "2FA_ENABLED",
      resource: "security",
      ipAddress,
      success: true,
    });
  },

  async twoFactorDisabled(userId: string, ipAddress?: string) {
    await createAuditLog({
      userId,
      action: "2FA_DISABLED",
      resource: "security",
      ipAddress,
      success: true,
    });
  },

  async passwordChanged(userId: string, ipAddress?: string) {
    await createAuditLog({
      userId,
      action: "PASSWORD_CHANGED",
      resource: "security",
      ipAddress,
      success: true,
    });
  },

  async backupCodeUsed(userId: string, ipAddress?: string) {
    await createAuditLog({
      userId,
      action: "BACKUP_CODE_USED",
      resource: "security",
      ipAddress,
      success: true,
    });
  },

  async suspiciousActivity(
    userId: string,
    activity: string,
    details?: Record<string, any>,
    ipAddress?: string
  ) {
    await createAuditLog({
      userId,
      action: "SUSPICIOUS_ACTIVITY",
      resource: "security",
      details: { activity, ...details },
      ipAddress,
      success: false,
    });
  },

  async adminAccess(userId: string, resource: string, ipAddress?: string) {
    await createAuditLog({
      userId,
      action: "ADMIN_ACCESS",
      resource,
      ipAddress,
      success: true,
    });
  },
};
