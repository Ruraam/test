import type { Headers } from "effect/http"

const persistentIdentityParts = new Set(["machine", "device", "installation", "install"])
const identifierSuffixes = new Set(["id", "uuid", "identifier"])

/**
 * Remove persistent host identity from model-provider transport headers.
 * Provider credentials and provider-defined session headers are intentionally preserved.
 */
export function sanitizeProviderHeaders(headers: Headers.Headers): Headers.Headers {
  return Object.fromEntries(
    Object.entries(headers).filter(([name]) => {
      const parts = name.toLowerCase().split(/[-_]/)
      const hasIdentifier = identifierSuffixes.has(parts.at(-1) ?? "")
      if (!hasIdentifier) return true

      const hasPersistentIdentity = parts.some((part) => persistentIdentityParts.has(part))
      const hasOpenCodeSessionIdentity = parts.includes("opencode") && parts.includes("session")

      return !hasPersistentIdentity && !hasOpenCodeSessionIdentity
    }),
  ) as Headers.Headers
}
