"use server"

import { getServerSession } from "next-auth"
import { authOptions } from "@packages/auth/config/authOptions"
import {
  getAccessRules,
  createAccessRule,
  updateAccessRule,
  deleteAccessRule,
  getAccessLogs,
} from "@packages/auth/lib/access-control"

// Wrapper per verificare i permessi admin
async function requireAdmin() {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id || session.user.role?.toLowerCase() !== "admin") {
    throw new Error("Non autorizzato - solo gli admin possono accedere")
  }

  return session
}

// Server Actions esportate
export async function getAccessRulesAction() {
  try {
    await requireAdmin()
    return await getAccessRules()
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Errore sconosciuto",
    }
  }
}

export async function createAccessRuleAction(data: {
  type: "country" | "ip" | "ip_range"
  value: string
  action: "allow" | "deny"
  description?: string
}) {
  try {
    await requireAdmin()
    return await createAccessRule(data)
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Errore sconosciuto",
    }
  }
}

export async function updateAccessRuleAction(ruleId: string, data: { isActive?: boolean }) {
  try {
    await requireAdmin()
    return await updateAccessRule(ruleId, data)
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Errore sconosciuto",
    }
  }
}

export async function deleteAccessRuleAction(ruleId: string) {
  try {
    await requireAdmin()
    return await deleteAccessRule(ruleId)
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Errore sconosciuto",
    }
  }
}

export async function getAccessLogsAction() {
  try {
    await requireAdmin()
    return await getAccessLogs()
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Errore sconosciuto",
    }
  }
}
