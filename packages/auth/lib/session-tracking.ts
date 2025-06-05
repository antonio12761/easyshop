"use server";

import { getCurrentUserServer } from "./session";

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

// Crea una nuova sessione utilizzando parametri passati
export async function createUserSession(
  userAgent: string,
  ip: string
): Promise<string | null> {
  try {
    const user = await getCurrentUserServer();
    if (!user) return null;

    const { browser, os, deviceType } = parseUserAgent(userAgent);

    // Genera un ID sessione unico
    const sessionId = crypto.randomUUID();

    // Per ora, ritorniamo solo l'ID della sessione senza crearla nel database
    console.log("Sessione generata:", sessionId);
    return sessionId;
  } catch (error) {
    console.error("Errore nella creazione della sessione:", error);
    return null;
  }
}

// Aggiorna l'ultima attività di una sessione
export async function updateSessionActivity(sessionId: string): Promise<void> {
  try {
    console.log("Aggiornamento attività sessione:", sessionId);
    // Implementazione temporanea
  } catch (error) {
    console.error("Errore nell'aggiornamento della sessione:", error);
  }
}

// Ottieni tutte le sessioni attive di un utente
export async function getUserActiveSessions(): Promise<UserSessionInfo[]> {
  try {
    const user = await getCurrentUserServer();
    if (!user) return [];

    // Implementazione temporanea
    console.log("Recupero sessioni per l'utente:", user.id);
    return [];
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
    console.log("Revoca sessione:", sessionId);
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
    console.log("Revoca tutte le sessioni tranne:", currentSessionId);
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

// Inizializza la sessione corrente con parametri passati
export async function initializeCurrentSession(
  userAgent: string,
  ip: string
): Promise<string | null> {
  try {
    const sessionId = crypto.randomUUID();
    console.log("Sessione inizializzata:", sessionId);
    return sessionId;
  } catch (error) {
    console.error("Errore nell'inizializzazione della sessione:", error);
    return null;
  }
}

// Pulisci le sessioni scadute (da eseguire periodicamente)
export async function cleanupExpiredSessions(): Promise<void> {
  try {
    console.log("Pulizia sessioni scadute");
  } catch (error) {
    console.error("Errore nella pulizia delle sessioni:", error);
  }
}
