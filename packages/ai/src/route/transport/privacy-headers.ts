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
