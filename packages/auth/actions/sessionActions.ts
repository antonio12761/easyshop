"use server"

import { getServerSession } from "next-auth"
import { authOptions } from "@packages/auth/config/authOptions"
import { db } from "@packages/prisma"
import { headers } from "next/headers"
import { revalidatePath } from "next/cache"

// Tipi per le sessioni
interface SessionData {
  id: string
  device: string
  browser: string
  os: string
  ip: string
  location: string
  lastActive: string
  isCurrent: boolean
  createdAt: string
  expires: string
}

type GetSessionsResult = { success: true; sessions: SessionData[] } | { success: false; message: string }

type TerminateSessionResult = { success: true; message: string } | { success: false; message: string }

// Recupera tutte le sessioni attive dell'utente utilizzando UserSession
export async function getUserSessions(): Promise<GetSessionsResult> {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return { success: false, message: "Non autorizzato" }
    }

    // Recupera tutte le sessioni attive dell'utente dal modello UserSession
    const userSessions = await db.userSession.findMany({
      where: {
        userId: session.user.id,
        isActive: true,
        expiresAt: {
          gt: new Date(), // Solo sessioni non scadute
        },
      },
      select: {
        id: true,
        deviceInfo: true,
        browser: true,
        os: true,
        ip: true,
        location: true,
        userAgent: true,
        lastActiveAt: true,
        createdAt: true,
        expiresAt: true,
      },
      orderBy: {
        lastActiveAt: "desc",
      },
    })

    // Per identificare la sessione corrente, usiamo l'IP e user agent
    const headersList = await headers()
    const currentUserAgent = headersList.get("user-agent") || ""
    const forwarded = headersList.get("x-forwarded-for")
    const realIp = headersList.get("x-real-ip")
    const currentIp = forwarded?.split(",")[0] || realIp || "unknown"

    const formattedSessions: SessionData[] = userSessions.map((sess) => ({
      id: sess.id,
      device: sess.deviceInfo || "Sconosciuto",
      browser: sess.browser || "Sconosciuto",
      os: sess.os || "Sconosciuto",
      ip: sess.ip || "N/A",
      location: sess.location || "Sconosciuto",
      lastActive: sess.lastActiveAt.toISOString(),
      isCurrent: sess.ip === currentIp && sess.userAgent === currentUserAgent,
      createdAt: sess.createdAt.toISOString(),
      expires: sess.expiresAt.toISOString(),
    }))

    return { success: true, sessions: formattedSessions }
  } catch (error) {
    console.error("Errore recupero sessioni:", error)
    return { success: false, message: "Errore nel caricamento delle sessioni" }
  }
}

// Termina una sessione specifica
export async function terminateSession(sessionId: string): Promise<TerminateSessionResult> {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return { success: false, message: "Non autorizzato" }
    }

    // Verifica che la sessione appartenga all'utente corrente
    const sessionToDelete = await db.userSession.findFirst({
      where: {
        id: sessionId,
        userId: session.user.id,
      },
      select: {
        ip: true,
        userAgent: true,
      },
    })

    if (!sessionToDelete) {
      return { success: false, message: "Sessione non trovata" }
    }

    // Controlla se è la sessione corrente
    const headersList = await headers()
    const currentUserAgent = headersList.get("user-agent") || ""
    const forwarded = headersList.get("x-forwarded-for")
    const realIp = headersList.get("x-real-ip")
    const currentIp = forwarded?.split(",")[0] || realIp || "unknown"

    if (sessionToDelete.ip === currentIp && sessionToDelete.userAgent === currentUserAgent) {
      return { success: false, message: "Non puoi terminare la sessione corrente" }
    }

    // Termina la sessione (imposta isActive a false)
    await db.userSession.update({
      where: {
        id: sessionId,
      },
      data: {
        isActive: false,
      },
    })

    // Revalida la pagina per aggiornare i dati
    revalidatePath("/dashboard/my-account/security/sessions")

    return { success: true, message: "Sessione terminata con successo" }
  } catch (error) {
    console.error("Errore terminazione sessione:", error)
    return { success: false, message: "Errore nella terminazione della sessione" }
  }
}

// Termina tutte le altre sessioni tranne quella corrente
export async function terminateAllOtherSessions(): Promise<TerminateSessionResult> {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return { success: false, message: "Non autorizzato" }
    }

    // Ottieni informazioni sulla sessione corrente
    const headersList = await headers()
    const currentUserAgent = headersList.get("user-agent") || ""
    const forwarded = headersList.get("x-forwarded-for")
    const realIp = headersList.get("x-real-ip")
    const currentIp = forwarded?.split(",")[0] || realIp || "unknown"

    // Conta le sessioni che verranno terminate
    const sessionsToTerminate = await db.userSession.count({
      where: {
        userId: session.user.id,
        isActive: true,
        expiresAt: {
          gt: new Date(),
        },
        NOT: {
          AND: [{ ip: currentIp }, { userAgent: currentUserAgent }],
        },
      },
    })

    if (sessionsToTerminate === 0) {
      return { success: false, message: "Nessuna altra sessione da terminare" }
    }

    // Termina tutte le altre sessioni
    await db.userSession.updateMany({
      where: {
        userId: session.user.id,
        isActive: true,
        NOT: {
          AND: [{ ip: currentIp }, { userAgent: currentUserAgent }],
        },
      },
      data: {
        isActive: false,
      },
    })

    // Revalida la pagina per aggiornare i dati
    revalidatePath("/dashboard/my-account/security/sessions")

    return {
      success: true,
      message: `${sessionsToTerminate} sessioni terminate con successo`,
    }
  } catch (error) {
    console.error("Errore terminazione sessioni:", error)
    return { success: false, message: "Errore nella terminazione delle sessioni" }
  }
}

// Aggiorna le informazioni della sessione corrente
export async function updateCurrentSessionInfo(): Promise<{ success: boolean; message?: string }> {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return { success: false, message: "Sessione non valida" }
    }

    const headersList = await headers()
    const userAgent = headersList.get("user-agent") || ""
    const forwarded = headersList.get("x-forwarded-for")
    const realIp = headersList.get("x-real-ip")
    const ipAddress = forwarded?.split(",")[0] || realIp || "unknown"

    // Parse user agent per ottenere info su device, browser, OS
    const deviceInfo = parseUserAgent(userAgent)

    // Ottieni la posizione approssimativa dall'IP
    const location = await getLocationFromIP(ipAddress)

    // Cerca una sessione esistente per questo utente/IP/userAgent
    const existingSession = await db.userSession.findFirst({
      where: {
        userId: session.user.id,
        ip: ipAddress,
        userAgent: userAgent,
        isActive: true,
      },
    })

    if (existingSession) {
      // Aggiorna la sessione esistente
      await db.userSession.update({
        where: {
          id: existingSession.id,
        },
        data: {
          deviceInfo: deviceInfo.device,
          browser: deviceInfo.browser,
          os: deviceInfo.os,
          location,
          lastActiveAt: new Date(),
        },
      })
    } else {
      // Crea una nuova sessione
      await db.userSession.create({
        data: {
          userId: session.user.id,
          deviceInfo: deviceInfo.device,
          browser: deviceInfo.browser,
          os: deviceInfo.os,
          ip: ipAddress,
          location,
          userAgent,
          lastActiveAt: new Date(),
          expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 giorni
        },
      })
    }

    return { success: true }
  } catch (error) {
    console.error("Errore aggiornamento sessione:", error)
    return { success: false, message: "Errore aggiornamento sessione" }
  }
}

// Funzione helper per parsare lo user agent
function parseUserAgent(userAgent: string) {
  // Implementazione semplificata
  const device = userAgent.includes("Mobile") ? "Mobile" : userAgent.includes("Tablet") ? "Tablet" : "Desktop"

  let browser = "Sconosciuto"
  if (userAgent.includes("Chrome")) browser = "Chrome"
  else if (userAgent.includes("Firefox")) browser = "Firefox"
  else if (userAgent.includes("Safari")) browser = "Safari"
  else if (userAgent.includes("Edge")) browser = "Edge"

  let os = "Sconosciuto"
  if (userAgent.includes("Windows")) os = "Windows"
  else if (userAgent.includes("Mac")) os = "macOS"
  else if (userAgent.includes("Linux")) os = "Linux"
  else if (userAgent.includes("Android")) os = "Android"
  else if (userAgent.includes("iOS")) os = "iOS"

  return { device, browser, os }
}

// Funzione helper per ottenere la posizione dall'IP
async function getLocationFromIP(ip: string): Promise<string> {
  try {
    if (ip === "unknown" || ip.startsWith("192.168.") || ip.startsWith("127.") || ip === "::1") {
      return "Locale"
    }

    // Usa un servizio gratuito per la geolocalizzazione
    const response = await fetch(`https://ipapi.co/${ip}/json/`, {
      next: { revalidate: 3600 }, // Cache per 1 ora
    })

    if (!response.ok) {
      return "Sconosciuto"
    }

    const data = await response.json()

    if (data.city && data.country_name) {
      return `${data.city}, ${data.country_code}`
    }

    return data.country_name || "Sconosciuto"
  } catch (error) {
    console.error("Errore geolocalizzazione IP:", error)
    return "Sconosciuto"
  }
}
