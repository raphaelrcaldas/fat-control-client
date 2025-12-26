"use client";

import { useEffect, useRef, useState } from "react";

export default function useDebouncedValue<T>(value: T, delay = 220): T {
   const [debounced, setDebounced] = useState<T>(value);
   const ref = useRef<number | null>(null);

   useEffect(() => {
      if (ref.current) window.clearTimeout(ref.current);
      // @ts-ignore
      ref.current = window.setTimeout(() => setDebounced(value), delay);
      return () => {
         if (ref.current) window.clearTimeout(ref.current);
      };
   }, [value, delay]);

   return debounced;
}
