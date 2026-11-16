import { describe, expect, test } from "bun:test"
import { sanitizeProviderHeaders, sanitizeProviderPayload, sanitizeProviderUrl } from "./privacy-headers"

describe("sanitizeProviderHeaders", () => {
  test("removes persistent host and OpenCode session/project identifiers", () => {
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
        "x-opencode-session": "session-affinity",
        "x-opencode-project": "project-id",
        "x-parent-session-id": "parent-id",
      } as never),
    ).toEqual({
      Authorization: "Bearer provider-token",
      "Content-Type": "application/json",
    })
  })

  test("preserves credentials and provider-defined ephemeral session headers", () => {
    const headers = {
      Authorization: "Bearer token",
      "x-api-key": "provider-key",
      "x-session-id": "provider-session",
      "x-session-affinity": "ephemeral-affinity",
      "x-request-id": "request-id",
    }

    expect(sanitizeProviderHeaders(headers as never)).toEqual(headers)
  })
})

describe("sanitizeProviderUrl", () => {
  test("removes persistent host and OpenCode identity query parameters only", () => {
    expect(
      sanitizeProviderUrl(
        "https://provider.example/v1?machine_id=host&device-uuid=device&installationIdentifier=install&x-opencode-project=project&model=deepseek",
      ),
    ).toBe("https://provider.example/v1?model=deepseek")
  })
})

describe("sanitizeProviderPayload", () => {
  test("removes persistent identity fields recursively without touching provider session fields", () => {
    const input = JSON.stringify({
      model: "deepseek",
      session_id: "provider-session",
      metadata: {
        machine_id: "host",
        installation_uuid: "install",
        x_opencode_project: "project",
      },
    })

    expect(JSON.parse(sanitizeProviderPayload(input))).toEqual({
      model: "deepseek",
      session_id: "provider-session",
      metadata: {},
    })
  })

  test("leaves non-JSON provider frames unchanged", () => {
    expect(sanitizeProviderPayload("[DONE]")).toBe("[DONE]")
  })
})
