"use client";

import { useMemo, useState } from "react";
import {
   Table,
   TableBody,
   TableCell,
   TableHead,
   TableHeadCell,
   TableRow,
} from "flowbite-react";
import { minutesToTime } from "@/../utils/dateHandler";
import type { SeboRow } from "services/routes/ops/operacoes";
import { PainelResumo, PainelVazio } from "./PainelResumo";
import { Segmented } from "./Segmented";

const TOPO = 5;

/**
 * Pau de sebo no dossiê — os cinco primeiros.
 *
 * Único painel do dossiê com filtro próprio. A regra geral é "filtrar é
 * trabalho, e trabalho mora no modal", mas aqui o recorte por função é leitura:
 * a pergunta "quem mais voou" quase sempre vem qualificada por função, e sem o
 * filtro os cinco primeiros são pilotos em toda operação — mecânico e loadmaster
 * nunca apareceriam no dossiê.
 *
 * A posição mostrada é a do ranking geral, não a do recorte: filtrando por MEC,
 * o primeiro mecânico mantém sua colocação real na operação.
 */
export function SeboResumo({
   sebo,
   onVerTudo,
}: {
   sebo: SeboRow[];
   onVerTudo: () => void;
}) {
   const [func, setFunc] = useState<string | null>(null);

   // Funções vêm do dado, não de uma allowlist: o backend devolve string livre.
   const funcoes = useMemo(() => {
      const contagem = new Map<string, number>();
      for (const s of sebo)
         contagem.set(s.func, (contagem.get(s.func) ?? 0) + 1);
      return Array.from(contagem.entries()).sort((a, b) =>
         a[0].localeCompare(b[0])
      );
   }, [sebo]);

   const comPosicao = useMemo(
      () => sebo.map((s, i) => ({ ...s, posicao: i + 1 })),
      [sebo]
   );

   const ativo = func && funcoes.some(([f]) => f === func) ? func : null;
   const linhas = (
      ativo ? comPosicao.filter((s) => s.func === ativo) : comPosicao
   ).slice(0, TOPO);

   return (
      <PainelResumo
         titulo="Pau de sebo"
         resumo={`${sebo.length} ${sebo.length === 1 ? "tripulante" : "tripulantes"}`}
         filtro={
            funcoes.length > 1 ? (
               <Segmented
                  size="xs"
                  ariaLabel="Filtrar por função"
                  value={ativo}
                  onChange={setFunc}
                  options={[
                     { value: null, label: "Todas", count: sebo.length },
                     ...funcoes.map(([f, n]) => ({
                        value: f,
                        label: f,
                        count: n,
                     })),
                  ]}
               />
            ) : undefined
         }
         verTudo={
            sebo.length === 1
               ? "Ver o tripulante"
               : `Ver os ${sebo.length} tripulantes`
         }
         onVerTudo={onVerTudo}
      >
         {sebo.length === 0 ? (
            <PainelVazio>
               Nenhuma tripulação registrada nas etapas associadas.
            </PainelVazio>
         ) : linhas.length === 0 ? (
            <PainelVazio>Nenhum tripulante nesta função.</PainelVazio>
         ) : (
            <Table>
               <TableHead>
                  <TableRow>
                     <TableHeadCell className="w-px px-3">
                        <span className="sr-only">Posição</span>#
                     </TableHeadCell>
                     <TableHeadCell className="px-2 normal-case">
                        Tripulante
                     </TableHeadCell>
                     <TableHeadCell className="w-px px-2 normal-case">
                        Função
                     </TableHeadCell>
                     <TableHeadCell className="w-px px-2 text-right normal-case">
                        Et.
                     </TableHeadCell>
                     <TableHeadCell className="w-px px-3 text-right normal-case">
                        Horas
                     </TableHeadCell>
                  </TableRow>
               </TableHead>
               <TableBody className="divide-y divide-slate-100">
                  {linhas.map((s) => (
                     <TableRow key={s.trip_id} className="bg-white">
                        <TableCell className="w-px px-3 text-right font-mono text-slate-500 tabular-nums">
                           {s.posicao}
                        </TableCell>
                        <TableCell className="max-w-0 px-2">
                           <span
                              className="block truncate font-semibold text-slate-800 uppercase"
                              title={s.nome}
                           >
                              {s.nome}
                           </span>
                        </TableCell>
                        <TableCell className="w-px px-2">
                           <span className="inline-block rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-bold text-slate-600 uppercase">
                              {s.func}
                           </span>
                        </TableCell>
                        <TableCell className="w-px px-2 text-right font-mono text-slate-600 tabular-nums">
                           {s.etapas}
                        </TableCell>
                        <TableCell className="w-px px-3 text-right font-mono font-bold whitespace-nowrap text-slate-900 tabular-nums">
                           {minutesToTime(s.horas)}
                        </TableCell>
                     </TableRow>
                  ))}
               </TableBody>
            </Table>
         )}
      </PainelResumo>
   );
}
