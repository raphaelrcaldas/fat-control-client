"use client";

import { useCallback, useRef, useEffect } from "react";

/**
 * Returns a debounced version of the provided callback.
 * The debounced function delays invoking `callback` until after `delay`
 * milliseconds have elapsed since the last time it was invoked.
 *
 * Cleans up any pending timeout on unmount.
 */
export function useDebouncedCallback<T extends (...args: unknown[]) => void>(
   callback: T,
   delay: number
): (...args: Parameters<T>) => void {
   const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
   const callbackRef = useRef(callback);

   // Keep callback ref up to date without retriggering the memoization
   useEffect(() => {
      callbackRef.current = callback;
   }, [callback]);

   // Cleanup on unmount
   useEffect(() => {
      return () => {
         if (timeoutRef.current !== null) {
            clearTimeout(timeoutRef.current);
         }
      };
   }, []);

   return useCallback(
      (...args: Parameters<T>) => {
         if (timeoutRef.current !== null) {
            clearTimeout(timeoutRef.current);
         }
         timeoutRef.current = setTimeout(() => {
            callbackRef.current(...args);
         }, delay);
      },
      [delay]
   );
}
