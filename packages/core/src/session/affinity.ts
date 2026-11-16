export * as SessionAffinity from "./affinity.js"

import { randomUUID } from "node:crypto"
import type { SessionSchema } from "./schema.js"

// Volatile process-local cache affinity. Persisted session IDs never leave this module.
const values = new Map<string, string>()
const MAX_ENTRIES = 4_096

/**
 * Stable only for the lifetime of this process: children share their parent's cache affinity,
 * while the provider receives a fresh random token after every application restart.
 */
export const get = (session: Pick<SessionSchema.Info, "id" | "parentID" | "fork">) => {
  const key = session.parentID ?? session.fork?.sessionID ?? session.id
  const existing = values.get(key)
  if (existing) {
    values.delete(key)
    values.set(key, existing)
    return existing
  }

  const value = randomUUID()
  values.set(key, value)
  if (values.size > MAX_ENTRIES) {
    const oldest = values.keys().next().value
    if (oldest !== undefined) values.delete(oldest)
  }
  return value
}
