import { db } from "@packages/prisma"
import type { AccessRule, AccessLog } from "../types/access-control"

// Definisci i tipi di ritorno per le funzioni
interface GetAccessRulesResult {
  success: boolean
  rules?: AccessRule[]
  error?: string
}

interface CreateAccessRuleResult {
  success: boolean
  rule?: AccessRule
  error?: string
}

interface UpdateAccessRuleResult {
  success: boolean
  rule?: AccessRule
  error?: string
}

interface DeleteAccessRuleResult {
  success: boolean
  error?: string
}

interface GetAccessLogsResult {
  success: boolean
  logs?: AccessLog[]
  error?: string
}

// Implementazioni delle funzioni con tipi espliciti
export async function getAccessRules(): Promise<GetAccessRulesResult> {
  try {
    const rules = await db.accessRule.findMany({
      orderBy: { createdAt: "asc" },
    })

    return {
      success: true,
      rules,
    }
  } catch (error) {
    console.error("Error fetching access rules:", error)
    return {
      success: false,
      error: "Impossibile recuperare le regole di accesso",
    }
  }
}

const createAccessRuleLib = async (data: {
  type: string
  value: string
  action: string
  description?: string
}): Promise<CreateAccessRuleResult> => {
  try {
    const rule = await db.accessRule.create({
      data: {
        ...data,
        isActive: true,
      },
    })

    return {
      success: true,
      rule,
    }
  } catch (error) {
    console.error("Error creating access rule:", error)
    return {
      success: false,
      error: "Impossibile creare la regola di accesso",
    }
  }
}

const updateAccessRuleLib = async (id: string, data: Partial<AccessRule>): Promise<UpdateAccessRuleResult> => {
  try {
    const rule = await db.accessRule.update({
      where: { id },
      data,
    })

    return {
      success: true,
      rule,
    }
  } catch (error) {
    console.error("Error updating access rule:", error)
    return {
      success: false,
      error: "Impossibile aggiornare la regola di accesso",
    }
  }
}

const deleteAccessRuleLib = async (id: string): Promise<DeleteAccessRuleResult> => {
  try {
    await db.accessRule.delete({
      where: { id },
    })

    return {
      success: true,
    }
  } catch (error) {
    console.error("Error deleting access rule:", error)
    return {
      success: false,
      error: "Impossibile eliminare la regola di accesso",
    }
  }
}

const getAccessLogsLib = async (): Promise<GetAccessLogsResult> => {
  try {
    const logs = await db.accessLog.findMany({
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 100,
    })

    return {
      success: true,
      logs,
    }
  } catch (error) {
    console.error("Error fetching access logs:", error)
    return {
      success: false,
      error: "Impossibile recuperare i log di accesso",
    }
  }
}

// Esporta le funzioni con tipi espliciti
export const createAccessRule: (data: {
  type: string
  value: string
  action: string
  description?: string
}) => Promise<CreateAccessRuleResult> = createAccessRuleLib
export const updateAccessRule: (id: string, data: Partial<AccessRule>) => Promise<UpdateAccessRuleResult> =
  updateAccessRuleLib
export const deleteAccessRule: (id: string) => Promise<DeleteAccessRuleResult> = deleteAccessRuleLib
export const getAccessLogs: () => Promise<GetAccessLogsResult> = getAccessLogsLib
