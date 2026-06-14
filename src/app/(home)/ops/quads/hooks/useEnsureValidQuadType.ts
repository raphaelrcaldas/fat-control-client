"use client";
import { useEffect } from "react";
import { QuadTypeGroup } from "services/routes/quads";

/**
 * Garante que o `quadType` selecionado cobre a `quadFunc` atual. Quando o tipo
 * vigente não inclui a função, seleciona automaticamente o primeiro tipo válido
 * encontrado. Não dispara nada enquanto os tipos ainda não carregaram.
 */
export function useEnsureValidQuadType(
   quadsType: QuadTypeGroup[],
   quadFunc: string,
   quadType: number,
   setQuadType: (id: number) => void
): void {
   useEffect(() => {
      if (quadsType.length === 0) return;

      const isValidType = quadsType.some((group) =>
         group.types.some(
            (type) => type.id === quadType && type.funcs_list.includes(quadFunc)
         )
      );

      if (!isValidType) {
         for (const group of quadsType) {
            const validType = group.types.find((t) =>
               t.funcs_list.includes(quadFunc)
            );
            if (validType) {
               setQuadType(validType.id);
               break;
            }
         }
      }
   }, [quadsType, quadFunc, quadType, setQuadType]);
}
