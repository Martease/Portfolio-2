import { query } from './db'

export async function checkRateLimit(params: {
  scope: string
  windowMs: number
  max: number
}) {
  const scope = params.scope.trim().slice(0, 256)
  const windowMs = Math.max(1_000, Math.min(24 * 60 * 60 * 1000, Math.floor(params.windowMs)))
  const max = Math.max(1, Math.min(10_000, Math.floor(params.max)))

  const result = await query<{ count: number; reset_at: Date }>(
    `INSERT INTO request_rate_limit (scope, window_start, count, updated_at)
     VALUES ($1, NOW(), 1, NOW())
     ON CONFLICT (scope)
     DO UPDATE
       SET count = CASE
             WHEN request_rate_limit.window_start > NOW() - make_interval(secs => $2::double precision / 1000.0)
               THEN request_rate_limit.count + 1
             ELSE 1
           END,
           window_start = CASE
             WHEN request_rate_limit.window_start > NOW() - make_interval(secs => $2::double precision / 1000.0)
               THEN request_rate_limit.window_start
             ELSE NOW()
           END,
           updated_at = NOW()
     RETURNING count,
       (window_start + make_interval(secs => $2::double precision / 1000.0)) AS reset_at`,
    [scope, windowMs]
  )

  const row = result.rows[0]
  const count = Number(row?.count || 0)
  const resetAt = row?.reset_at ? new Date(row.reset_at).getTime() : Date.now() + windowMs

  return {
    allowed: count <= max,
    count,
    resetAt,
  }
}
