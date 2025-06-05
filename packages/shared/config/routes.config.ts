// Configurazione route semplificata
export const APP_ROUTES = {
  // Public routes
  HOME: "/",
  LOGIN: "/login",
  REGISTER: "/register",
  VERIFY_2FA: "/verify-2fa",

  // Protected routes
  DASHBOARD: "/dashboard",
  PROFILE: "/my-account/profile",
  SETTINGS_2FA: "/my-account/2fa",

  // Admin routes
  ADMIN: "/admin",
  ADMIN_USERS: "/admin/users",
  ADMIN_SETTINGS: "/admin/settings",

  // API routes
  API_AUTH: "/api/auth",
  API_CHECK_2FA: "/api/auth/check-2fa",
} as const;

export type AppRoute = (typeof APP_ROUTES)[keyof typeof APP_ROUTES];

// Helper per verificare se una route è protetta
export function isProtectedRoute(pathname: string): boolean {
  const protectedPrefixes = ["/dashboard", "/my-account", "/admin"];
  return protectedPrefixes.some((prefix) => pathname.startsWith(prefix));
}

// Helper per verificare se una route è admin
export function isAdminRoute(pathname: string): boolean {
  return pathname.startsWith("/admin");
}
