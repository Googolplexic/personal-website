/// <reference types="vite/client" />

declare const __GIT_HASH__: string;
declare const __GIT_DATE__: string;
declare const __SITE_VERSION__: string;

declare module '*.md?parsed' {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  export const attributes: Record<string, any>;
  export const body: string;
}
