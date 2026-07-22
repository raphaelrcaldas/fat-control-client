"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import {
   simularMissao,
   CombinacaoSimulacao,
   Pernoite,
   SimulacaoResultado,
} from "services/routes/cegep/missoes";
import { ApiError } from "services/Api";
import { postoGradRecords } from "@/constants/militar/postos";
import {
   formatSimulacaoError,
   type SimulacaoErrorInfo,
} from "../simulacaoErrors";

/** Linha de pernoite com key estável (React) — não vem da API, só do form. */
export type PernoiteRow = Pernoite & { _key: string };

/** Linha de combinação com key estável (React) — não vem da API, só do form. */
export type CombinacaoRow = CombinacaoSimulacao & { _key: string };

/** Pernoite vazio inicial — mesma forma do "+ adicionar pernoite". */
function pernoiteVazio(): PernoiteRow {
   return {
      _key: crypto.randomUUID(),
      data_ini: "",
      data_fim: "",
      cidade_id: 0,
      cidade: undefined,
      meia_diaria: false,
      acrec_desloc: false,
      obs: "",
   };
}

/** Combinação inicial — mesmo default do "+ adicionar combinação". */
function combinacaoInicial(): CombinacaoRow {
   return {
      _key: crypto.randomUUID(),
      p_g: postoGradRecords[6].short,
      sit: "d",
      qtd: 1,
   };
}

/** Um pernoite está completo quando dá para simular: cidade e as duas datas. */
function pernoiteCompleto(p: Pernoite): boolean {
   return p.cidade_id > 0 && !!p.data_ini && !!p.data_fim;
}

/**
 * Índices dos pernoites com problema de data: fim antes do início ou
 * sobreposição com outro pernoite. Dia de fronteira compartilhado NÃO é
 * conflito (comparação estrita, mesma semântica do cadastro real). Usado
 * tanto para sinalizar as linhas quanto para travar o botão Calcular.
 *
 * Invariante: `data_ini`/`data_fim` são strings ISO "YYYY-MM-DD" vindas
 * direto de `<input type="date">`. Comparação lexicográfica de string (`<`)
 * já dá a ordem cronológica correta nesse formato — não converter para
 * `Date` aqui (o projeto já teve bug de fuso horário nessa conversão, ver
 * utils/dateHandler.ts).
 */
function pernoitesInvalidos(pnts: Pernoite[]): Set<number> {
   const set = new Set<number>();
   pnts.forEach((p, i) => {
      if (!p.data_ini || !p.data_fim) return;
      if (p.data_fim < p.data_ini) {
         set.add(i);
         return;
      }
      for (let j = 0; j < pnts.length; j++) {
         if (j === i) continue;
         const o = pnts[j];
         if (!o.data_ini || !o.data_fim) continue;
         if (p.data_ini < o.data_fim && o.data_ini < p.data_fim) {
            set.add(i);
            set.add(j);
            break;
         }
      }
   });
   return set;
}

/**
 * Índices cujo par (p_g, sit) se repete em outra linha de `combinacoes` —
 * duas linhas equivalentes não fazem sentido pro backend (ele soma por
 * p_g+sit) e travam o cálculo até serem resolvidas. Movido de
 * CombinacoesCard para o hook porque também entra em `podeCalcular`.
 */
function combinacoesDuplicadas(
   combinacoes: CombinacaoSimulacao[]
): Set<number> {
   const seen = new Map<string, number>();
   const dups = new Set<number>();
   combinacoes.forEach((c, i) => {
      const key = `${c.p_g}|${c.sit}`;
      if (seen.has(key)) {
         dups.add(i);
         dups.add(seen.get(key)!);
      } else {
         seen.set(key, i);
      }
   });
   return dups;
}

/** Erro de abort disparado ao cancelar o fetch anterior — nunca é erro real. */
function isAbortError(err: unknown): boolean {
   if (err instanceof DOMException && err.name === "AbortError") return true;
   return (
      typeof err === "object" &&
      err !== null &&
      "name" in err &&
      (err as { name?: string }).name === "AbortError"
   );
}

/**
 * Estado completo da tab Calculadora: inputs (acréscimo, pernoites,
 * combinações), a mutation de simulação e a flag "desatualizado" — que marca
 * o resultado como obsoleto sempre que algum input muda depois de já existir
 * um resultado (sem apagar o conteúdo anterior, ver ResultadoPanel).
 */
export function useSimulacao() {
   const [acrecDesloc, setAcrecDesloc] = useState(false);
   // Começa com uma linha em cada — o cálculo exige ao menos um pernoite e
   // uma combinação, então já deixamos os dois campos prontos para preencher.
   const [pnts, setPnts] = useState<PernoiteRow[]>(() => [pernoiteVazio()]);
   const [combinacoes, setCombinacoes] = useState<CombinacaoRow[]>(() => [
      combinacaoInicial(),
   ]);

   const [resultado, setResultado] = useState<SimulacaoResultado | null>(null);
   const [desatualizado, setDesatualizado] = useState(false);

   // Cancela a simulação em voo quando uma nova é disparada (ou o componente
   // desmonta) — evita "race" entre duas respostas fora de ordem.
   const abortRef = useRef<AbortController | null>(null);
   useEffect(() => {
      return () => abortRef.current?.abort();
   }, []);

   const invalidPernoites = useMemo(() => pernoitesInvalidos(pnts), [pnts]);
   const duplicateIdx = useMemo(
      () => combinacoesDuplicadas(combinacoes),
      [combinacoes]
   );
   const pernoitesValidos = useMemo(
      () => pnts.filter(pernoiteCompleto),
      [pnts]
   );

   const mutation = useMutation({
      mutationFn: async (signal: AbortSignal) => {
         const result = await simularMissao(
            {
               acrec_desloc: acrecDesloc,
               pernoites: pernoitesValidos.map((p) => ({
                  data_ini: p.data_ini,
                  data_fim: p.data_fim,
                  cidade_id: p.cidade_id,
                  meia_diaria: p.meia_diaria,
                  acrec_desloc: p.acrec_desloc,
               })),
               // Explícito (não spread) para o `_key` interno (React) não
               // vazar para o payload da API.
               combinacoes: combinacoes.map((c) => ({
                  p_g: c.p_g,
                  sit: c.sit,
                  qtd: c.qtd,
               })),
            },
            signal
         );
         if (!result.ok) {
            throw new ApiError(
               result.message ?? "Erro ao calcular simulação",
               result.errors
            );
         }
         return result.data as SimulacaoResultado;
      },
      onSuccess: (data) => {
         setResultado(data);
         setDesatualizado(false);
      },
   });

   // Marca o resultado como desatualizado sempre que qualquer input mudar
   // DEPOIS de já existir um resultado em tela — ignora a primeira renderização
   // (montagem) para não marcar como "desatualizado" antes do primeiro cálculo.
   const isFirstRender = useRef(true);
   useEffect(() => {
      if (isFirstRender.current) {
         isFirstRender.current = false;
         return;
      }
      setDesatualizado((prev) => (resultado ? true : prev));
      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, [acrecDesloc, pnts, combinacoes]);

   // Calcular só habilita quando TODOS os pernoites estão completos (cidade
   // + as duas datas), há ≥1 combinação, nenhuma duplicada e nenhum conflito
   // de datas — não se aceita pernoite pela metade (espelha as regras do
   // backend).
   const podeCalcular =
      pnts.length > 0 &&
      pnts.every(pernoiteCompleto) &&
      combinacoes.length > 0 &&
      invalidPernoites.size === 0 &&
      duplicateIdx.size === 0 &&
      !mutation.isPending;

   // Primeira regra que falha vira o texto ao lado do botão desabilitado —
   // não usamos Tooltip porque elemento `disabled` não dispara pointer events.
   const motivoBloqueio: string | null = useMemo(() => {
      if (pnts.length === 0) return "Adicione ao menos um pernoite";
      if (!pnts.every(pernoiteCompleto))
         return "Preencha cidade e datas de todos os pernoites";
      if (invalidPernoites.size > 0)
         return "Há pernoites com datas em conflito";
      if (combinacoes.length === 0)
         return "Adicione ao menos uma combinação de militar";
      if (duplicateIdx.size > 0) return "Remova as combinações duplicadas";
      return null;
   }, [pnts, combinacoes, invalidPernoites, duplicateIdx]);

   function calcular() {
      if (!podeCalcular) return;
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;
      mutation.mutate(controller.signal);
   }

   // Erro pronto para o banner do ResultadoPanel — abort (cancelado por um
   // novo cálculo) nunca é um erro real, então não vira mensagem.
   const erro: SimulacaoErrorInfo | null = useMemo(() => {
      if (!mutation.error || isAbortError(mutation.error)) return null;
      return formatSimulacaoError(mutation.error);
   }, [mutation.error]);

   return {
      acrecDesloc,
      setAcrecDesloc,
      pnts,
      setPnts,
      combinacoes,
      setCombinacoes,
      invalidPernoites,
      duplicateIdx,
      resultado,
      desatualizado,
      podeCalcular,
      motivoBloqueio,
      calcular,
      isCalculando: mutation.isPending,
      erro,
   };
}
