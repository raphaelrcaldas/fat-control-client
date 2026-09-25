"use client";

import { useCallback, useState } from "react";

/**
 * Controla quando um campo dos especificos exibe erro.
 *
 * Um item recem-adicionado nasce vazio; pintar tudo de vermelho antes de
 * a pessoa digitar e ruido. O erro aparece depois que o campo perde o foco
 * ou depois de uma tentativa de salvar (`showAll`), que e quando a pessoa
 * precisa achar o que falta.
 */
export function useTouchedFields<K extends string>(showAll: boolean) {
   const [touched, setTouched] = useState<ReadonlySet<K>>(() => new Set());

   const touch = useCallback((field: K) => {
      setTouched((prev) => (prev.has(field) ? prev : new Set(prev).add(field)));
   }, []);

   const showError = (field: K, invalid: boolean) =>
      invalid && (showAll || touched.has(field));

   return { touch, showError };
}
