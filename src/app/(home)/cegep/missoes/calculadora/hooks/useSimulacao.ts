"use client";

import { useEffect, useMemo, useState } from "react";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
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
export function pernoiteCompleto(p: Pernoite): boolean {
   return p.cidade_id > 0 && !!p.data_ini && !!p.data_fim;
}

/**
 * Índices dos pernoites com problema de data: fim antes do início ou
 * sobreposição com outro pernoite. Dia de fronteira compartilhado NÃO é
 * conflito (comparação estrita, mesma semântica do cadastro real). Usado
 * tanto para sinalizar as linhas quanto para segurar o cálculo reativo.
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
 * CombinacoesCard para o hook porque também entra em `podeSimular`.
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

/** Espera entre a última mexida no formulário e o cálculo. */
const DEBOUNCE_MS = 400;

function useDebounced<T>(value: T, delay: number): T {
   const [debounced, setDebounced] = useState(value);
   useEffect(() => {
      const id = setTimeout(() => setDebounced(value), delay);
      return () => clearTimeout(id);
   }, [value, delay]);
   return debounced;
}

/**
 * Estado completo da tab Calculadora: inputs (acréscimo, pernoites,
 * combinações) e o resultado.
 *
 * **O cálculo é reativo** — não há botão. Assim que o formulário fica válido
 * (todos os pernoites completos, ao menos uma combinação, sem conflito nem
 * duplicata) a simulação dispara sozinha, com debounce, e se refaz a cada
 * mudança. `keepPreviousData` segura o resultado anterior enquanto o próximo
 * vem, e `atualizando` avisa que o que está na tela ainda é o de antes — sem
 * esmaecer o conteúdo, que a esta densidade custaria contraste.
 */
export function useSimulacao() {
   const [acrecDesloc, setAcrecDesloc] = useState(false);
   // Começa com uma linha em cada — o cálculo exige ao menos um pernoite e
   // uma combinação, então já deixamos os dois campos prontos para preencher.
   const [pnts, setPnts] = useState<PernoiteRow[]>(() => [pernoiteVazio()]);
   const [combinacoes, setCombinacoes] = useState<CombinacaoRow[]>(() => [
      combinacaoInicial(),
   ]);

   const invalidPernoites = useMemo(() => pernoitesInvalidos(pnts), [pnts]);
   const duplicateIdx = useMemo(
      () => combinacoesDuplicadas(combinacoes),
      [combinacoes]
   );
   const pernoitesValidos = useMemo(
      () => pnts.filter(pernoiteCompleto),
      [pnts]
   );

   // O cálculo só roda quando TODOS os pernoites estão completos (cidade + as
   // duas datas), há ≥1 combinação, nenhuma duplicada e nenhum conflito de
   // datas — não se aceita pernoite pela metade (espelha as regras do
   // backend).
   const podeSimular =
      pnts.length > 0 &&
      pnts.every(pernoiteCompleto) &&
      combinacoes.length > 0 &&
      invalidPernoites.size === 0 &&
      duplicateIdx.size === 0;

   // Payload explícito (não spread) para o `_key` interno (React) não vazar
   // para a API — e serializável, que é o que a queryKey precisa.
   const payload = useMemo(
      () => ({
         acrec_desloc: acrecDesloc,
         pernoites: pernoitesValidos.map((p) => ({
            data_ini: p.data_ini,
            data_fim: p.data_fim,
            cidade_id: p.cidade_id,
            meia_diaria: p.meia_diaria,
            acrec_desloc: p.acrec_desloc,
         })),
         combinacoes: combinacoes.map((c) => ({
            p_g: c.p_g,
            sit: c.sit,
            qtd: c.qtd,
         })),
      }),
      [acrecDesloc, pernoitesValidos, combinacoes]
   );

   const debounced = useDebounced(payload, DEBOUNCE_MS);

   const query = useQuery({
      queryKey: ["calculadora", "simulacao", debounced],
      queryFn: async ({ signal }) => {
         const result = await simularMissao(debounced, signal);
         if (!result.ok) {
            throw new ApiError(
               result.message ?? "Erro ao calcular simulação",
               result.errors
            );
         }
         return result.data as SimulacaoResultado;
      },
      enabled: podeSimular,
      placeholderData: keepPreviousData,
   });

   // Enquanto o formulário está incompleto não há resultado: exibir o último
   // seria mostrar um número que não corresponde ao que está na tela.
   const resultado = podeSimular ? (query.data ?? null) : null;

   // O que está em tela ainda é do payload anterior — ou porque a resposta
   // não chegou, ou porque o debounce ainda não deixou o pedido sair.
   const atualizando =
      podeSimular &&
      (query.isFetching ||
         JSON.stringify(payload) !== JSON.stringify(debounced));

   // Primeira regra que falha explica o vazio do painel de resultado.
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

   // Erro pronto para o banner do ResultadoPanel — abort (cancelado por um
   // novo cálculo) nunca é um erro real, então não vira mensagem.
   const erro: SimulacaoErrorInfo | null = useMemo(() => {
      if (!query.error || isAbortError(query.error)) return null;
      return formatSimulacaoError(query.error);
   }, [query.error]);

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
      motivoBloqueio,
      /** Primeiro cálculo em voo, sem nada anterior para segurar a tela. */
      calculandoPrimeiro: podeSimular && query.isFetching && !query.data,
      atualizando,
      erro,
      tentarNovamente: () => query.refetch(),
   };
}
