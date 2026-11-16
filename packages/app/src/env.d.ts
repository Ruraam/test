interface ImportMetaEnv {
  readonly VITE_OPENCODE_SERVER_MODE?: "none" | "origin"
  readonly VITE_OPENCODE_SERVER_HOST: string
  readonly VITE_OPENCODE_SERVER_PORT: string
  readonly VITE_OPENCODE_CHANNEL?: "local" | "dev" | "beta" | "prod"
  /** The release of the CLI whose server embeds this build. Absent in the hosted web app. */
  readonly VITE_OPENCODE_VERSION?: string

  /** Set to "1" only for builds that explicitly opt in to Sentry reporting. */
  readonly VITE_OPENCODE_ENABLE_SENTRY?: string
  readonly VITE_SENTRY_DSN?: string
  readonly VITE_SENTRY_ENVIRONMENT?: string
  readonly VITE_SENTRY_RELEASE?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

declare module "*.png" {
  const src: string
  export default src
}

declare module "*.mp4" {
  const src: string
  export default src
}

export declare module "solid-js" {
  namespace JSX {
    interface Directives {
      sortable: true
    }

    // The Element Timing attribute, which Solid's DOM types do not list.
    interface ImgHTMLAttributes<T> {
      elementtiming?: string
    }
  }
}
