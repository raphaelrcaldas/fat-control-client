"use client";
import { useCallback, useMemo, useState } from "react";
import { useFuncoes } from "@/hooks/queries/useFuncoes";
import { useSebo } from "@/hooks/queries/useSebo";
import { usePersistedState } from "@/hooks/usePersistedState";
import { defaultInfoCols } from "../constants";
import type { InfoColumn } from "../types";

/**
 * Centraliza o estado de filtros do Pau de Sebo (persistido + efêmero),
 * deriva os parâmetros da API (oper/func_bordo) e expõe a query (a API já
 * ordena por horas no ano).
 * Mantém a `page.tsx` enxuta (só layout + seleção de UI).
 */
export function useSeboFilters() {
   const { posicoes: posicoesDe, isLoading: funcoesLoading } = useFuncoes();
   const [opIn, setOpIn] = usePersistedState("estatistica.seboOpIn", true);
   const [opOp, setOpOp] = usePersistedState("estatistica.seboOpOp", true);
   const [opBa, setOpBa] = usePersistedState("estatistica.seboOpBa", true);
   const [opAl, setOpAl] = usePersistedState("estatistica.seboOpAl", false);

   const [infoCols, setInfoCols] = usePersistedState<
      Record<InfoColumn, boolean>
   >("estatistica.seboInfoCols", defaultInfoCols);

   const [seboFunc, setSeboFuncRaw] = usePersistedState(
      "estatistica.seboFunc",
      "mc"
   );
   const [soO3, setSoO3] = usePersistedState("estatistica.seboSoO3", false);
   const [ano, setAno] = useState(() => new Date().getFullYear());

   const setSeboFunc = useCallback(
      (value: string) => {
         setSeboFuncRaw(value);
         setSoO3(false);
      },
      [setSeboFuncRaw, setSoO3]
   );

   // Operacionalidade: monta o array enviado à API.
   const operParams = useMemo(() => {
      const oper: string[] = [];
      if (opIn) oper.push("in");
      if (opOp) oper.push("op");
      if (opBa) oper.push("ba");
      if (opAl) oper.push("al");
      return oper;
   }, [opIn, opOp, opBa, opAl]);

   // Todos ativos => não enviar oper (a API retorna todos).
   const allActive = opIn && opOp && opBa && opAl;
   const hasOper = operParams.length > 0;

   // func_bordo: derivado das posições da função selecionada.
   const funcBordo = useMemo(() => {
      if (seboFunc === "pil") {
         // pilotos: toggle OE filtra apenas O3; default exclui O3.
         if (soO3) return ["O3"];
         return posicoesDe("pil")
            .filter((p) => p.cod !== "O3")
            .map((p) => p.cod);
      }
      const posicoes = posicoesDe(seboFunc);
      if (posicoes.length === 0) return undefined;
      return posicoes.map((p) => p.cod);
   }, [seboFunc, soO3, posicoesDe]);

   const {
      data: rawTrips,
      isLoading,
      isFetching,
      isPlaceholderData,
      isError,
      refetch,
   } = useSebo(
      {
         func: seboFunc,
         oper: allActive ? undefined : operParams,
         func_bordo: funcBordo,
         ano,
      },
      // Sem o catálogo, `func_bordo` sai vazio e a API soma todas as posições
      // (O3 incluída para pilotos): a primeira resposta viria errada.
      hasOper && !funcoesLoading
   );

   // A API já ordena por horas. Sem operacionalidades, nem o cache é exibido.
   const trips = useMemo(() => {
      return hasOper ? (rawTrips ?? []) : [];
   }, [rawTrips, hasOper]);

   return {
      seboFunc,
      setSeboFunc,
      opIn,
      setOpIn,
      opOp,
      setOpOp,
      opBa,
      setOpBa,
      opAl,
      setOpAl,
      soO3,
      setSoO3,
      ano,
      setAno,
      infoCols,
      setInfoCols,
      trips,
      hasOper,
      isLoading: hasOper && (funcoesLoading || isLoading),
      isFetching: hasOper && isFetching,
      isPlaceholderData: hasOper && isPlaceholderData,
      isError: hasOper && isError,
      refetch,
   };
}
