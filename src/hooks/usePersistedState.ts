"use client";

import { useState, useEffect } from "react";

export function usePersistedState<T>(key: string, defaultValue: T) {
   const [value, setValue] = useState<T>(() => {
      if (typeof window === "undefined") return defaultValue;
      try {
         const saved = localStorage.getItem(key);
         return saved ? (JSON.parse(saved) as T) : defaultValue;
      } catch {
         return defaultValue;
      }
   });

   useEffect(() => {
      localStorage.setItem(key, JSON.stringify(value));
   }, [key, value]);

   return [value, setValue] as const;
}
