import { auditEvents } from "./audit-log";

interface SecurityAlert {
  type: "BRUTE_FORCE" | "SUSPICIOUS_LOGIN" | "MULTIPLE_DEVICES" | "GEO_ANOMALY";
  userId?: string;
  details: Record<string, any>;
  severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
}

export class SecurityMonitor {
  private static instance: SecurityMonitor;
  private alerts: SecurityAlert[] = [];

  static getInstance(): SecurityMonitor {
    if (!SecurityMonitor.instance) {
      SecurityMonitor.instance = new SecurityMonitor();
    }
    return SecurityMonitor.instance;
  }

  async detectBruteForce(ip: string, attempts: number): Promise<void> {
    if (attempts >= 10) {
      await this.createAlert({
        type: "BRUTE_FORCE",
        details: { ip, attempts },
        severity: "HIGH",
      });
    }
  }

  async detectSuspiciousLogin(
    userId: string,
    currentIp: string,
    lastIp?: string
  ): Promise<void> {
    if (lastIp && currentIp !== lastIp) {
      // Controlla se gli IP sono da paesi diversi (implementazione semplificata)
      await this.createAlert({
        type: "SUSPICIOUS_LOGIN",
        userId,
        details: { currentIp, lastIp },
        severity: "MEDIUM",
      });
    }
  }

  async detectMultipleDevices(
    userId: string,
    deviceCount: number
  ): Promise<void> {
    if (deviceCount > 5) {
      await this.createAlert({
        type: "MULTIPLE_DEVICES",
        userId,
        details: { deviceCount },
        severity: "MEDIUM",
      });
    }
  }

  private async createAlert(alert: SecurityAlert): Promise<void> {
    this.alerts.push(alert);

    // Log l'alert
    console.warn(
      `🚨 Security Alert [${alert.severity}]: ${alert.type}`,
      alert.details
    );

    // In produzione, invia notifiche (email, Slack, etc.)
    if (alert.severity === "CRITICAL" || alert.severity === "HIGH") {
      await this.sendNotification(alert);
    }

    // Salva nel database
    await auditEvents.suspiciousActivity(
      alert.userId || "system",
      alert.type,
      alert.details
    );
  }

  private async sendNotification(alert: SecurityAlert): Promise<void> {
    // Implementa notifiche (email, Slack, webhook, etc.)
    console.log(`📧 Sending security notification for ${alert.type}`);
  }

  getRecentAlerts(hours = 24): SecurityAlert[] {
    const cutoff = Date.now() - hours * 60 * 60 * 1000;
    return this.alerts.filter(
      (alert) => Date.now() - cutoff < hours * 60 * 60 * 1000
    );
  }
}
