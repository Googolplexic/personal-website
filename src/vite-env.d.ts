/// <reference types="vite/client" />

declare module '*.md?parsed' {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  export const attributes: Record<string, any>;
  export const body: string;
}
