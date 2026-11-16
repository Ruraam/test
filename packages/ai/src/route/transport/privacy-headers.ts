import type { Headers } from "effect/http"

const persistentIdentityParts = new Set(["machine", "device", "installation", "install"])
const identifierSuffixes = new Set(["id", "uuid", "identifier"])

const isPersistentIdentityName = (name: string) => {
  const parts = name.toLowerCase().split(/[-_]/)
  const hasIdentifier = identifierSuffixes.has(parts.at(-1) ?? "")
  if (!hasIdentifier) return false
  const hasPersistentHostIdentity = parts.some((part) => persistentIdentityParts.has(part))
  const hasOpenCodeSessionIdentity = parts.includes("opencode") && parts.includes("session")
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
