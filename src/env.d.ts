/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_GIT_TAG?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
