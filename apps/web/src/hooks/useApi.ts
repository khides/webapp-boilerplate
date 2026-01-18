import { useState, useCallback } from "react";
import { ApiError } from "@/services/api";

interface UseApiState<T> {
  data: T | null;
  isLoading: boolean;
  error: string | null;
}

interface UseApiResult<T, Args extends unknown[]> extends UseApiState<T> {
  execute: (...args: Args) => Promise<T | null>;
  reset: () => void;
}

/**
 * Hook for handling API calls with loading and error states
 */
export function useApi<T, Args extends unknown[] = []>(
  apiFn: (...args: Args) => Promise<T>
): UseApiResult<T, Args> {
  const [state, setState] = useState<UseApiState<T>>({
    data: null,
    isLoading: false,
    error: null,
  });

  const execute = useCallback(
    async (...args: Args): Promise<T | null> => {
      setState({ data: null, isLoading: true, error: null });

      try {
        const result = await apiFn(...args);
        setState({ data: result, isLoading: false, error: null });
        return result;
      } catch (error) {
        const message =
          error instanceof ApiError
            ? error.message
            : error instanceof Error
              ? error.message
              : "An unexpected error occurred";

        setState({ data: null, isLoading: false, error: message });
        return null;
      }
    },
    [apiFn]
  );

  const reset = useCallback(() => {
    setState({ data: null, isLoading: false, error: null });
  }, []);

  return {
    ...state,
    execute,
    reset,
  };
}

/**
 * Hook for handling mutations (create, update, delete)
 */
export function useMutation<T, Args extends unknown[] = []>(
  mutationFn: (...args: Args) => Promise<T>,
  options?: {
    onSuccess?: (data: T) => void;
    onError?: (error: string) => void;
  }
): UseApiResult<T, Args> {
  const [state, setState] = useState<UseApiState<T>>({
    data: null,
    isLoading: false,
    error: null,
  });

  const execute = useCallback(
    async (...args: Args): Promise<T | null> => {
      setState({ data: null, isLoading: true, error: null });

      try {
        const result = await mutationFn(...args);
        setState({ data: result, isLoading: false, error: null });
        options?.onSuccess?.(result);
        return result;
      } catch (error) {
        const message =
          error instanceof ApiError
            ? error.message
            : error instanceof Error
              ? error.message
              : "An unexpected error occurred";

        setState({ data: null, isLoading: false, error: message });
        options?.onError?.(message);
        return null;
      }
    },
    [mutationFn, options]
  );

  const reset = useCallback(() => {
    setState({ data: null, isLoading: false, error: null });
  }, []);

  return {
    ...state,
    execute,
    reset,
  };
}
