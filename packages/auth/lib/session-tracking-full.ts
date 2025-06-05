"use server";

import { getCurrentUserServer } from "./session";
import { db } from "@packages/prisma";
import { headers } from "next/headers";

export interface UserSessionInfo {
  id: string;
  userId: string;
  deviceInfo: string;
  browser: string;
  os: string;
  ip: string;
  location?: string;
  userAgent: string;
  createdAt: Date;
  lastActiveAt: Date;
  expiresAt: Date;
  isActive: boolean;
}

// Funzione per estrarre informazioni dal User-Agent
function parseUserAgent(userAgent: string) {
  const browser = userAgent.includes("Chrome")
    ? "Chrome"
    : userAgent.includes("Firefox")
    ? "Firefox"
    : userAgent.includes("Safari")
    ? "Safari"
    : "Unknown";

  const os = userAgent.includes("Windows")
    ? "Windows"
    : userAgent.includes("Mac")
    ? "macOS"
    : userAgent.includes("Linux")
    ? "Linux"
    : userAgent.includes("Android")
    ? "Android"
    : userAgent.includes("iOS")
    ? "iOS"
    : "Unknown";

  const deviceType = userAgent.includes("Mobile")
    ? "mobile"
    : userAgent.includes("Tablet")
    ? "tablet"
    : "desktop";

  return { browser, os, deviceType };
}

// Crea una nuova sessione utilizzando l'infrastruttura esistente
export async function createUserSession(): Promise<string | null> {
  try {
    const user = await getCurrentUserServer();
    if (!user) return null;

    const headersList = await headers();
    const userAgent = headersList.get("user-agent") || "";
    const ip =
      headersList.get("x-forwarded-for") ||
      headersList.get("x-real-ip") ||
      "unknown";

    const { browser, os, deviceType } = parseUserAgent(userAgent);

    // Genera un ID sessione unico
    const sessionId = crypto.randomUUID();

    // Salva la sessione nel database
    await db.userSession.create({
      data: {
        id: sessionId,
        userId: user.id,
        deviceInfo: `${deviceType} - ${os}`,
        browser,
        os,
        ip,
        location: "Posizione non disponibile",
        userAgent,
        lastActiveAt: new Date(),
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 giorni
        isActive: true,
      },
    });

    console.log("Sessione creata nel database:", sessionId);
    return sessionId;
  } catch (error) {
    console.error("Errore nella creazione della sessione:", error);
    return null;
  }
}

// Aggiorna l'ultima attività di una sessione
export async function updateSessionActivity(sessionId: string): Promise<void> {
  try {
    await db.userSession.update({
      where: { id: sessionId },
      data: { lastActiveAt: new Date() },
    });
  } catch (error) {
    console.error("Errore nell'aggiornamento della sessione:", error);
  }
}

// Ottieni tutte le sessioni attive di un utente
export async function getUserActiveSessions(): Promise<UserSessionInfo[]> {
  try {
    const user = await getCurrentUserServer();
    if (!user) return [];

    const sessions = await db.userSession.findMany({
      where: {
        userId: user.id,
        isActive: true,
        expiresAt: { gt: new Date() },
      },
      orderBy: { lastActiveAt: "desc" },
    });

    return sessions.map((s) => ({
      id: s.id,
      userId: s.userId,
      deviceInfo: s.deviceInfo,
      browser: s.browser,
      os: s.os,
      ip: s.ip,
      location: s.location,
      userAgent: s.userAgent,
      createdAt: s.createdAt,
      lastActiveAt: s.lastActiveAt,
      expiresAt: s.expiresAt,
      isActive: s.isActive,
    }));
  } catch (error) {
    console.error("Errore nel recupero delle sessioni:", error);
    return [];
  }
}

// Termina una sessione specifica
export async function revokeUserSession(
  sessionId: string
): Promise<{ success: boolean; message: string }> {
  try {
    const user = await getCurrentUserServer();
    if (!user) {
      return { success: false, message: "Utente non autenticato" };
    }

    await db.userSession.update({
      where: {
        id: sessionId,
        userId: user.id, // Assicurati che l'utente possa terminare solo le sue sessioni
      },
      data: { isActive: false },
    });

    return { success: true, message: "Sessione terminata con successo" };
  } catch (error) {
    console.error("Errore nella terminazione della sessione:", error);
    return {
      success: false,
      message: "Errore nella terminazione della sessione",
    };
  }
}

// Termina tutte le altre sessioni (tranne quella corrente)
export async function revokeAllOtherUserSessions(
  currentSessionId: string
): Promise<{ success: boolean; message: string }> {
  try {
    const user = await getCurrentUserServer();
    if (!user) {
      return { success: false, message: "Utente non autenticato" };
    }

    await db.userSession.updateMany({
      where: {
        userId: user.id,
        id: { not: currentSessionId },
        isActive: true,
      },
      data: { isActive: false },
    });

    return {
      success: true,
      message: "Tutte le altre sessioni sono state terminate",
    };
  } catch (error) {
    console.error("Errore nella terminazione delle sessioni:", error);
    return {
      success: false,
      message: "Errore nella terminazione delle sessioni",
    };
  }
}

// Inizializza la sessione corrente
export async function initializeCurrentSession(): Promise<string | null> {
  try {
    const user = await getCurrentUserServer();
    if (!user) return null;

    const headersList = await headers();
    const userAgent = headersList.get("user-agent") || "";
    const ip =
      headersList.get("x-forwarded-for") ||
      headersList.get("x-real-ip") ||
      "unknown";

    const { browser, os, deviceType } = parseUserAgent(userAgent);

    // Genera un ID sessione unico
    const sessionId = crypto.randomUUID();

    // Salva la sessione nel database
    await db.userSession.create({
      data: {
        id: sessionId,
        userId: user.id,
        deviceInfo: `${deviceType} - ${os}`,
        browser,
        os,
        ip,
        location: "Posizione non disponibile",
        userAgent,
        lastActiveAt: new Date(),
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 giorni
        isActive: true,
      },
    });

    console.log("Sessione inizializzata nel database:", sessionId);
    return sessionId;
  } catch (error) {
    console.error("Errore nell'inizializzazione della sessione:", error);
    return null;
  }
}

// Pulisci le sessioni scadute (da eseguire periodicamente)
export async function cleanupExpiredSessions(): Promise<void> {
  try {
    await db.userSession.updateMany({
      where: {
        OR: [
          { expiresAt: { lt: new Date() } },
          {
            lastActiveAt: {
              lt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
            },
          }, // 30 giorni di inattività
        ],
      },
      data: { isActive: false },
    });
  } catch (error) {
    console.error("Errore nella pulizia delle sessioni:", error);
  }
}
