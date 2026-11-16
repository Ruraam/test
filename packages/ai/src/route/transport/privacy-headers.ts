import type { Headers } from "effect/http"

const isPersistentIdentityName = (name: string) => {
  const normalized = name.toLowerCase().replace(/[^a-z0-9]/g, "")
  const hasPersistentHostIdentity = /(machine|device|installation|install).*?(id|uuid|identifier)$/.test(normalized)
  const hasOpenCodeIdentity =
    normalized.startsWith("xopencode") && /(session|project|parent)/.test(normalized)
  const hasParentSessionIdentity = /parent.*session.*(id|uuid|identifier)$/.test(normalized)
  return hasPersistentHostIdentity || hasOpenCodeIdentity || hasParentSessionIdentity
}

/**
 * Remove persistent host and OpenCode session/project identity from provider headers.
 * Provider credentials and provider-defined session headers are intentionally preserved.
 */
export function sanitizeProviderHeaders(headers: Headers.Headers): Headers.Headers {
  return Object.fromEntries(Object.entries(headers).filter(([name]) => !isPersistentIdentityName(name))) as Headers.Headers
}

/**
 * Remove persistent host and OpenCode session/project identity parameters from provider URLs.
 * Unrelated query parameters (including provider routing and authentication parameters) are preserved.
 */
export function sanitizeProviderUrl(value: string): string {
  const url = new URL(value)
  for (const key of url.searchParams.keys()) {
    if (isPersistentIdentityName(key)) url.searchParams.delete(key)
  }
  return url.toString()
}

type SanitizedValue = { readonly value: unknown; readonly changed: boolean }

const sanitizeValue = (value: unknown): SanitizedValue => {
  if (Array.isArray(value)) {
    const items = value.map(sanitizeValue)
    return { value: items.map((item) => item.value), changed: items.some((item) => item.changed) }
  }
  if (typeof value !== "object" || value === null || Object.getPrototypeOf(value) !== Object.prototype)
    return { value, changed: false }

  let changed = false
  const result: Record<string, unknown> = {}
  for (const [name, item] of Object.entries(value)) {
    if (isPersistentIdentityName(name)) {
      changed = true
      continue
    }
    const sanitized = sanitizeValue(item)
    result[name] = sanitized.value
    changed ||= sanitized.changed
  }
  return { value: changed ? result : value, changed }
}

/** Remove named persistent host/OpenCode identity fields from JSON WebSocket frames. */
export function sanitizeProviderPayload(message: string): string {
  try {
    const result = sanitizeValue(JSON.parse(message))
    return result.changed ? JSON.stringify(result.value) : message
  } catch {
    return message
  }
}
