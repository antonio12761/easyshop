// Tipi per le regole di accesso
export interface AccessRule {
  id: string;
  type: string;
  value: string;
  action: string;
  description?: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Tipi per i log di accesso
export interface AccessLog {
  id: string;
  ip: string;
  country: string;
  userAgent: string | null; // Cambiato da string a string | null
  path: string;
  allowed: boolean;
  reason: string;
  createdAt: Date;
  userId?: string | null;
  user?: {
    name: string | null;
    email: string | null;
  } | null;
}
