import type { Headers } from "effect/http"

const isPersistentIdentityName = (name: string) => {
  const normalized = name.toLowerCase().replace(/[^a-z0-9]/g, "")
  const hasPersistentHostIdentity = /(machine|device|installation|install).*?(id|uuid|identifier)$/.test(normalized)
  const hasOpenCodeSessionIdentity = /opencode.*session.*(id|uuid|identifier)$/.test(normalized)
  return hasPersistentHostIdentity || hasOpenCodeSessionIdentity
}

/**
 * Remove persistent host identity from model-provider transport headers.
 * Provider credentials and provider-defined session headers are intentionally preserved.
 */
export function sanitizeProviderHeaders(headers: Headers.Headers): Headers.Headers {
  return Object.fromEntries(Object.entries(headers).filter(([name]) => !isPersistentIdentityName(name))) as Headers.Headers
}

/**
 * Remove persistent host identity parameters from provider URLs. Query parameters unrelated
 * to host identity (including provider routing and authentication parameters) are preserved.
 */
export function sanitizeProviderUrl(value: string): string {
  const url = new URL(value)
  for (const key of url.searchParams.keys()) {
    if (isPersistentIdentityName(key)) url.searchParams.delete(key)
  }
  return url.toString()
}
