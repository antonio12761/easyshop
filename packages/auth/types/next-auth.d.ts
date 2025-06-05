import type { DefaultSession } from "next-auth"
import type { Role } from "@prisma/client"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      role?: Role
      previousLoginAt?: string | null
      lastLoginAt?: string | null
      lastLoginIp?: string | null
      twoFactorEnabled?: boolean
    } & DefaultSession["user"]
  }

  interface User {
    role?: Role
    previousLoginAt?: Date | null
    lastLoginAt?: Date | null
    lastLoginIp?: string | null
    twoFactorEnabled?: boolean
    failedLoginAttempts?: number
    lockedUntil?: Date | null
    passwordHash?: string
  }
}
