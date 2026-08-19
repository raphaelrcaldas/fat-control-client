"use client";
import { useCallback, useMemo, useState } from "react";
import { useFuncoes, useSebo } from "@/hooks/queries";
import { usePersistedState } from "@/hooks/usePersistedState";
import { defaultInfoCols } from "../constants";
import type { InfoColumn } from "../types";

/**
 * Centraliza o estado de filtros do Pau de Sebo (persistido + efêmero),
 * deriva os parâmetros da API (oper/func_bordo) e expõe a query já ordenada.
 * Mantém a `page.tsx` enxuta (só layout + seleção de UI).
 */
export function useSeboFilters() {
   const { posicoes: posicoesDe } = useFuncoes();
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
   } = useSebo({
      func: seboFunc,
      oper: allActive || operParams.length === 0 ? undefined : operParams,
      func_bordo: funcBordo,
      ano,
   });

   // Ordena por horas no ano (desc).
   const trips = useMemo(() => {
      if (!rawTrips) return [];
      return [...rawTrips].sort((a, b) => b.voo.h_ano - a.voo.h_ano);
   }, [rawTrips]);

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
      isLoading,
      isFetching,
   };
}
