import { describe, expect, test } from "bun:test"
import { sanitizeProviderHeaders } from "./privacy-headers"

describe("sanitizeProviderHeaders", () => {
  test("removes persistent machine, device and installation identifiers", () => {
    expect(
      sanitizeProviderHeaders({
        Authorization: "Bearer provider-token",
        "Content-Type": "application/json",
        "X-Machine-ID": "machine-uuid",
        "machine-id": "machine-id",
        "X-OpenCode-Installation-UUID": "installation-uuid",
        "installation_session_id": "persistent-session-uuid",
        "X-Device-Identifier": "device-id",
        "X-OpenCode-Session-ID": "persistent-session-id",
      } as never),
    ).toEqual({
      Authorization: "Bearer provider-token",
      "Content-Type": "application/json",
    })
  })

  test("preserves credentials and provider-owned ephemeral session headers", () => {
    const headers = {
      Authorization: "Bearer token",
      "x-api-key": "provider-key",
      "x-session-id": "provider-session",
      "x-request-id": "request-id",
    }

    expect(sanitizeProviderHeaders(headers as never)).toEqual(headers)
  })
})
