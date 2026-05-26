import { QueryClient } from "@tanstack/react-query";

/**
 * Shared QueryClient — centralized so both React hooks, the router,
 * and non-React singletons (e.g. UploadManager) can reference it
 * without introducing circular dependency import loops.
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 300_000,
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});
