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
import { useToast } from "@/app/context/toast";

/** Pernoite vazio inicial — mesma forma do "+ adicionar pernoite". */
function pernoiteVazio(): Pernoite {
   return {
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
function combinacaoInicial(): CombinacaoSimulacao {
   return { p_g: postoGradRecords[6].short, sit: "d", qtd: 1 };
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
 * Estado completo da tab Calculadora: inputs (acréscimo, pernoites,
 * combinações), a mutation de simulação e a flag "desatualizado" — que marca
 * o resultado como obsoleto sempre que algum input muda depois de já existir
 * um resultado (sem apagar o conteúdo anterior, ver ResultadoPanel).
 */
export function useSimulacao() {
   const { push } = useToast();

   const [acrecDesloc, setAcrecDesloc] = useState(false);
   // Começa com uma linha em cada — o cálculo exige ao menos um pernoite e
   // uma combinação, então já deixamos os dois campos prontos para preencher.
   const [pnts, setPnts] = useState<Pernoite[]>(() => [pernoiteVazio()]);
   const [combinacoes, setCombinacoes] = useState<CombinacaoSimulacao[]>(() => [
      combinacaoInicial(),
   ]);

   const [resultado, setResultado] = useState<SimulacaoResultado | null>(null);
   const [desatualizado, setDesatualizado] = useState(false);

   const invalidPernoites = useMemo(() => pernoitesInvalidos(pnts), [pnts]);
   const pernoitesValidos = useMemo(
      () => pnts.filter(pernoiteCompleto),
      [pnts]
   );

   const mutation = useMutation({
      mutationFn: async () => {
         const result = await simularMissao({
            acrec_desloc: acrecDesloc,
            pernoites: pernoitesValidos.map((p) => ({
               data_ini: p.data_ini,
               data_fim: p.data_fim,
               cidade_id: p.cidade_id,
               meia_diaria: p.meia_diaria,
               acrec_desloc: p.acrec_desloc,
            })),
            combinacoes,
         });
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
      onError: (err) => {
         push({
            type: "error",
            message:
               err instanceof Error
                  ? err.message
                  : "Erro ao calcular simulação",
         });
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
   // + as duas datas), há ≥1 combinação e nenhum conflito de datas — não se
   // aceita pernoite pela metade (espelha as regras do backend).
   const podeCalcular =
      pnts.length > 0 &&
      pnts.every(pernoiteCompleto) &&
      combinacoes.length > 0 &&
      invalidPernoites.size === 0 &&
      !mutation.isPending;

   function calcular() {
      if (!podeCalcular) return;
      mutation.mutate();
   }

   return {
      acrecDesloc,
      setAcrecDesloc,
      pnts,
      setPnts,
      combinacoes,
      setCombinacoes,
      invalidPernoites,
      resultado,
      desatualizado,
      podeCalcular,
      calcular,
      isCalculando: mutation.isPending,
   };
}
