'use client';

import { useEffect } from 'react';

type WebMcpTool = {
  name: string;
  title: string;
  description: string;
  inputSchema: object;
  annotations: {
    readOnlyHint: boolean;
    untrustedContentHint: boolean;
  };
  execute(input: unknown): unknown;
};

declare global {
  interface Document {
    modelContext?: {
      registerTool(
        tool: WebMcpTool,
        options?: { signal?: AbortSignal },
      ): void | Promise<void>;
    };
  }
}

export function useWebMcpTool(tool: WebMcpTool) {
  useEffect(() => {
    const context =
      typeof document === 'undefined' ? undefined : document.modelContext;
    if (!context?.registerTool) return;

    const lifecycle = new AbortController();
    try {
      void Promise.resolve(
        context.registerTool(tool, { signal: lifecycle.signal }),
      ).catch(() => undefined);
    } catch {
      return;
    }

    return () => lifecycle.abort();
  }, [tool]);
}
