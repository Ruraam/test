import { describe, expect, test } from "bun:test"
import { get } from "../src/session/affinity"

describe("SessionAffinity", () => {
  test("uses a volatile random token instead of the persisted session ID", () => {
    const session = { id: "ses_persisted_identifier", parentID: undefined, fork: undefined } as Parameters<
      typeof get
    >[0]
    const affinity = get(session)

    expect(affinity).not.toBe(session.id)
    expect(affinity).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i)
    expect(get(session)).toBe(affinity)
  })

  test("shares volatile affinity with child sessions", () => {
    const parent = { id: "ses_parent_persisted", parentID: undefined, fork: undefined } as Parameters<
      typeof get
    >[0]
    const child = { id: "ses_child_persisted", parentID: parent.id, fork: undefined } as Parameters<
      typeof get
    >[0]

    expect(get(child)).toBe(get(parent))
  })

  test("does not reuse a persisted fork source ID as the provider affinity", () => {
    const fork = {
      id: "ses_fork_persisted",
      parentID: undefined,
      fork: { sessionID: "ses_source_persisted" },
    } as Parameters<typeof get>[0]
    const affinity = get(fork)

    expect(affinity).not.toBe("ses_source_persisted")
    expect(affinity).toMatch(/^[0-9a-f-]{36}$/i)
  })
})
