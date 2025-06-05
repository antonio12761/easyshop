// Rimuoviamo l'import di NextResponse e usiamo un tipo generico
export function addSecurityHeaders(response: any): any {
  // Prevenzione XSS
  response.headers.set("X-XSS-Protection", "1; mode=block");

  // Prevenzione MIME sniffing
  response.headers.set("X-Content-Type-Options", "nosniff");

  // Prevenzione clickjacking
  response.headers.set("X-Frame-Options", "DENY");

  // HSTS (HTTPS Strict Transport Security)
  response.headers.set(
    "Strict-Transport-Security",
    "max-age=31536000; includeSubDomains; preload"
  );

  // Referrer Policy
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");

  // Content Security Policy
  response.headers.set(
    "Content-Security-Policy",
    [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'", // Necessario per Next.js dev
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: https:",
      "font-src 'self'",
      "connect-src 'self'",
      "frame-ancestors 'none'",
    ].join("; ")
  );

  // Permissions Policy
  response.headers.set(
    "Permissions-Policy",
    [
      "camera=()",
      "microphone=()",
      "geolocation=()",
      "payment=()",
      "usb=()",
    ].join(", ")
  );

  return response;
}
