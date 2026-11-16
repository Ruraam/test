# Desktop privacy defaults

This Desktop fork uses opt-in switches for optional diagnostics that can transmit or capture
information beyond normal application requests.

## Defaults

- **Sentry:** disabled unless the Desktop renderer is built with
  `VITE_OPENCODE_ENABLE_SENTRY=1` and a `VITE_SENTRY_DSN` is supplied. The release workflow
  explicitly sets the enable flag to `0`.
- **OpenTelemetry export:** disabled for the bundled Desktop CLI unless
  `OPENCODE_DESKTOP_ENABLE_OTEL=1` is set. When enabled, an
  `OTEL_EXPORTER_OTLP_ENDPOINT` must also be configured; optional headers are read from
  `OTEL_EXPORTER_OTLP_HEADERS`. Standalone CLI behavior is unchanged.
- **Chromium NetLog:** not started by default. Set `OPENCODE_DESKTOP_ENABLE_NETLOG=1`
  in the Desktop process environment to opt in to automatic network capture for diagnostics.
  NetLog can contain sensitive request and connection metadata; keep the resulting files private.
- **Crashpad:** crash dumps remain local. Electron is configured with
  `uploadToServer: false`.

## Enabling diagnostics explicitly

For a custom build, enable Sentry at build time only when you intentionally want to use the
configured DSN:

```bash
VITE_OPENCODE_ENABLE_SENTRY=1 VITE_SENTRY_DSN="https://your-dsn" bun run build
```

For a Desktop launch, the optional runtime switches are:

```bash
OPENCODE_DESKTOP_ENABLE_NETLOG=1 opencode-desktop
OPENCODE_DESKTOP_ENABLE_OTEL=1 OTEL_EXPORTER_OTLP_ENDPOINT="https://your-collector" opencode-desktop
```

The command name depends on how the application is packaged. These switches are environment
configuration, not yet in-app preference controls. No diagnostic archive is uploaded automatically
by these changes; exporting an archive remains a user-initiated action. Review an archive before
sharing it because logs and NetLog may contain sensitive information.
