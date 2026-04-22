"use client";

import { useEffect, useRef, useState } from "react";

export default function useDebouncedValue<T>(value: T, delay = 400): T {
   const [debounced, setDebounced] = useState<T>(value);
   const ref = useRef<ReturnType<typeof setTimeout> | null>(null);

   useEffect(() => {
      if (ref.current) clearTimeout(ref.current);
      ref.current = setTimeout(() => setDebounced(value), delay);
      return () => {
         if (ref.current) window.clearTimeout(ref.current);
      };
   }, [value, delay]);

   return debounced;
}
