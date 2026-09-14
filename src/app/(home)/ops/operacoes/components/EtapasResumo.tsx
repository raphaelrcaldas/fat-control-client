"use client";

import {
   Button,
   Table,
   TableBody,
   TableCell,
   TableHead,
   TableHeadCell,
   TableRow,
} from "flowbite-react";
import { HiPlus } from "react-icons/hi";
import {
   formatTime,
   isoDateToShort,
   minutesToTime,
} from "@/../utils/dateHandler";
import { PermBased } from "../../../hooks/usePermBased";
import type { OperacaoEtapaRow } from "services/routes/ops/operacoes";
import { PainelResumo } from "./PainelResumo";

const TOPO = 5;

/**
 * Etapas no dossiê — as cinco mais recentes.
 *
 * O vazio aqui explica a consequência: sem etapa associada os indicadores lá em
 * cima ficam zerados, e quem abre a tela precisa saber que é por isso, não por
 * falta de voo. Por isso o estado vazio traz a ação de associar junto.
 */
export function EtapasResumo({
   etapas,
   onVerTudo,
   onAssociar,
}: {
   etapas: OperacaoEtapaRow[];
   onVerTudo: () => void;
   onAssociar: () => void;
}) {
   // O backend devolve em ordem crescente de data: sem inverter, "últimas
   // 5" mostraria as cinco mais ANTIGAS.
   const linhas = etapas.slice(-TOPO).reverse();

   if (etapas.length === 0) {
      return (
         <PainelResumo titulo="Voos associados">
            <div className="flex flex-col items-center gap-1.5 px-4 py-10 text-center">
               <p className="text-sm font-semibold text-slate-800">
                  Nenhuma etapa associada
               </p>
               <p className="max-w-[46ch] text-xs leading-relaxed text-slate-600">
                  Os indicadores desta operação ficam zerados até que etapas do
                  período sejam associadas a ela.
               </p>
               <PermBased resource="ops.operacoes.etapas" requiredPerm="create">
                  <Button
                     color="primary"
                     size="xs"
                     className="mt-2"
                     onClick={onAssociar}
                  >
                     <HiPlus className="mr-1 h-4 w-4" /> Associar etapas
                  </Button>
               </PermBased>
            </div>
         </PainelResumo>
      );
   }

   return (
      <PainelResumo
         titulo="Voos associados"
         resumo={`últimas ${linhas.length} de ${etapas.length}`}
         verTudo={
            etapas.length === 1
               ? "Abrir a etapa"
               : `Abrir as ${etapas.length} etapas`
         }
         onVerTudo={onVerTudo}
      >
         {/* Seis colunas não sobrevivem a 360px (a coluna Anv fica cortada
             fora da tela) — abaixo de `md` a etapa vira linha de duas alturas. */}
         <ul className="divide-y divide-slate-100 md:hidden">
            {linhas.map((e) => (
               <li key={e.id} className="flex flex-col gap-0.5 px-3 py-2">
                  <div className="flex items-baseline justify-between gap-2">
                     <span className="min-w-0 truncate font-mono text-[13px] font-bold text-slate-900">
                        {e.origem}{" "}
                        <span aria-hidden className="text-slate-500">
                           →
                        </span>{" "}
                        {e.destino}
                     </span>
                     <span className="shrink-0 font-mono text-[13px] font-bold text-slate-900 tabular-nums">
                        {minutesToTime(e.tvoo)}
                     </span>
                  </div>
                  <div className="flex items-baseline justify-between gap-2">
                     <span className="min-w-0 truncate text-[11px] text-slate-500">
                        {isoDateToShort(e.data)} · {formatTime(e.dep)} →{" "}
                        {formatTime(e.arr)}
                        {e.esforco ? ` · ${e.esforco}` : ""}
                     </span>
                     <span className="shrink-0 font-mono text-[11px] text-slate-500">
                        {e.anv}
                     </span>
                  </div>
               </li>
            ))}
         </ul>

         {/* Região rolável precisa ser alcançável por teclado: sem
             `tabIndex`, quem não usa mouse não chega às colunas que
             ficam fora da largura (reprova `scrollable-region-focusable`). */}
         <div
            className="focus-visible:outline-primary-600 hidden overflow-x-auto focus-visible:outline-2 md:block"
            role="region"
            aria-label="Etapas associadas"
            tabIndex={0}
         >
            <Table>
               <TableHead>
                  <TableRow>
                     <TableHeadCell className="w-px px-3 normal-case">
                        Data
                     </TableHeadCell>
                     <TableHeadCell className="w-px px-3 normal-case">
                        Rota
                     </TableHeadCell>
                     <TableHeadCell className="w-px px-3 whitespace-nowrap normal-case">
                        Dep → Pso
                     </TableHeadCell>
                     <TableHeadCell className="w-px px-3 text-right normal-case">
                        T. voo
                     </TableHeadCell>
                     <TableHeadCell className="w-px px-3 normal-case">
                        Anv
                     </TableHeadCell>
                     <TableHeadCell className="px-3 normal-case">
                        Esforço
                     </TableHeadCell>
                  </TableRow>
               </TableHead>
               <TableBody className="divide-y divide-slate-100">
                  {linhas.map((e) => (
                     <TableRow key={e.id} className="bg-white">
                        <TableCell className="w-px px-3 font-mono whitespace-nowrap text-slate-600 tabular-nums">
                           {isoDateToShort(e.data)}
                        </TableCell>
                        <TableCell className="w-px px-3 font-mono font-bold whitespace-nowrap text-slate-800">
                           {e.origem}{" "}
                           <span aria-hidden className="text-slate-500">
                              →
                           </span>{" "}
                           {e.destino}
                        </TableCell>
                        <TableCell className="w-px px-3 font-mono whitespace-nowrap text-slate-600 tabular-nums">
                           {formatTime(e.dep)}{" "}
                           <span aria-hidden className="text-slate-500">
                              →
                           </span>{" "}
                           {formatTime(e.arr)}
                        </TableCell>
                        <TableCell className="w-px px-3 text-right font-mono font-bold whitespace-nowrap text-slate-900 tabular-nums">
                           {minutesToTime(e.tvoo)}
                        </TableCell>
                        <TableCell className="w-px px-3 font-mono whitespace-nowrap text-slate-700">
                           {e.anv}
                        </TableCell>
                        <TableCell className="max-w-0 px-3">
                           {e.esforco ? (
                              <span
                                 className="block truncate text-slate-600"
                                 title={e.esforco}
                              >
                                 {e.esforco}
                              </span>
                           ) : (
                              <span className="text-slate-500">—</span>
                           )}
                        </TableCell>
                     </TableRow>
                  ))}
               </TableBody>
            </Table>
         </div>
      </PainelResumo>
   );
}
