import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getToken } from "next-auth/jwt"
import { checkAccess, logAccessAttempt } from "@packages/auth/lib/access-control"

// Percorsi che richiedono controllo accessi
const PROTECTED_PATHS = ["/dashboard", "/api/admin", "/api/user"]

// Percorsi che sono sempre accessibili
const PUBLIC_PATHS = ["/", "/login", "/register", "/api/auth", "/access-denied"]

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Controlla se il percorso richiede protezione
  const isProtectedPath = PROTECTED_PATHS.some((path) => pathname.startsWith(path))
  const isPublicPath = PUBLIC_PATHS.some((path) => pathname.startsWith(path))

  // Se è un percorso pubblico, consenti l'accesso
  if (isPublicPath && !isProtectedPath) {
    return NextResponse.next()
  }

  // Se è un percorso protetto, esegui il controllo accessi
  if (isProtectedPath) {
    try {
      // Controlla l'accesso geografico/IP
      const accessResult = await checkAccess()

      // Ottieni il token per l'ID utente (se disponibile)
      const token = await getToken({ req: request })

      // Registra il tentativo di accesso
      await logAccessAttempt(accessResult, token?.sub, pathname)

      // Se l'accesso è negato, reindirizza alla pagina di errore
      if (!accessResult.allowed) {
        const url = request.nextUrl.clone()
        url.pathname = "/access-denied"
        url.searchParams.set("reason", accessResult.reason || "Access denied")
        url.searchParams.set("ip", accessResult.userInfo.ip)
        url.searchParams.set("country", accessResult.userInfo.country)

        return NextResponse.redirect(url)
      }

      // Se l'accesso è consentito, continua
      return NextResponse.next()
    } catch (error) {
      console.error("Errore middleware controllo accessi:", error)

      // In caso di errore, consenti l'accesso per evitare lockout
      return NextResponse.next()
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!_next/static|_next/image|favicon.ico|public/).*)",
  ],
}
