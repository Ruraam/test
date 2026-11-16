export * as DesktopInitialization from "./desktop-initialization"

import { app } from "electron"
import { Context, Effect, Layer } from "effect"
import { DesktopLogging } from "../native/logging"
import { marks } from "./marks"
import {
  loadProxyEnvironment,
  preferApplicationEnvironment,
  prepareApplicationEnvironment,
  prepareDesktop,
} from "./environment"

export interface Interface {
  readonly version: string
}

export class Service extends Context.Service<Service, Interface>()("opencode/desktop/DesktopInitialization") {}

export const layer = Layer.effect(
  Service,
  Effect.gen(function* () {
    // The bundled CLI inherits this marker and applies Desktop-specific telemetry defaults.
    process.env.OPENCODE_DESKTOP = "1"
    const logging = yield* DesktopLogging.Service
    yield* preferApplicationEnvironment
    // System certificates and proxy settings are prepared in the background. Network capture is
    // privacy-sensitive and starts only after an explicit environment opt-in.
    yield* Effect.forkScoped(
      prepareApplicationEnvironment.pipe(
        Effect.andThen(loadProxyEnvironment),
        Effect.andThen(
          Effect.suspend(() =>
            process.env.OPENCODE_DESKTOP_ENABLE_NETLOG === "1" ? logging.startNetwork : Effect.void,
          ),
        ),
      ),
    )
    yield* Effect.promise(() => app.whenReady())
    yield* prepareDesktop
    marks.init = Date.now()

    return Service.of({
      version: app.getVersion(),
    })
  }),
)
