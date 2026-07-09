import type { Prisma } from '@prisma/client'
import { prisma } from './prisma'

export type AuditLogFilters = {
  action?: string
  entityType?: string
  actorEmail?: string
  limit?: number
}

export async function logAdminAudit(params: {
  actorEmail: string
  actorRole: string
  action: string
  entityType: string
  entityId?: string | number | null
  metadata?: Record<string, unknown>
}) {
  await prisma.auditLog.create({
    data: {
      actor_email: params.actorEmail,
      actor_role: params.actorRole,
      action: params.action,
      entity_type: params.entityType,
      entity_id: params.entityId ? String(params.entityId) : null,
      metadata_json: (params.metadata || {}) as Prisma.InputJsonValue,
    },
  })
}

export async function listAuditLogs(filters: AuditLogFilters) {
  const safeLimit = Math.max(1, Math.min(500, Number(filters.limit || 100)))

  return prisma.auditLog.findMany({
    where: {
      ...(filters.action
        ? {
            action: {
              equals: filters.action,
              mode: 'insensitive',
            },
          }
        : {}),
      ...(filters.entityType
        ? {
            entity_type: {
              equals: filters.entityType,
              mode: 'insensitive',
            },
          }
        : {}),
      ...(filters.actorEmail
        ? {
            actor_email: {
              equals: filters.actorEmail,
              mode: 'insensitive',
            },
          }
        : {}),
    },
    orderBy: {
      created_at: 'desc',
    },
    take: safeLimit,
  })
}
