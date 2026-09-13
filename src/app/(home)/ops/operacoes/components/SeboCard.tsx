"use client";

import { useState } from "react";
import {
   Button,
   Badge,
   Table,
   TableHead,
   TableHeadCell,
   TableBody,
   TableRow,
   TableCell,
} from "flowbite-react";
import { minutesToTime } from "@/../utils/dateHandler";
import type { SeboRow } from "services/routes/ops/operacoes";

export function SeboCard({ sebo }: { sebo: SeboRow[] }) {
   const [funcFilter, setFuncFilter] = useState<string | null>(null);
   const funcs = Array.from(new Set(sebo.map((s) => s.func)));
   const selected =
      funcFilter && funcs.includes(funcFilter) ? funcFilter : null;
   const rows = selected ? sebo.filter((s) => s.func === selected) : sebo;

   return (
      <section className="min-w-0 overflow-hidden rounded border border-slate-200 bg-white shadow-sm">
         <header className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 px-4 py-3">
            <h2 className="text-base font-bold text-slate-900">Pau de sebo</h2>
            <span className="text-xs text-slate-600">Horas por tripulante</span>
         </header>
         {funcs.length > 0 && (
            <div
               aria-label="Filtrar por função"
               className="flex flex-wrap items-center gap-1.5 border-b border-slate-200 px-3 py-2"
            >
               <Button
                  size="xs"
                  color={selected === null ? "primary" : "light"}
                  aria-pressed={selected === null}
                  onClick={() => setFuncFilter(null)}
               >
                  Todas
               </Button>
               {funcs.map((f) => (
                  <Button
                     key={f}
                     size="xs"
                     color={selected === f ? "primary" : "light"}
                     aria-pressed={selected === f}
                     onClick={() => setFuncFilter(selected === f ? null : f)}
                     className="uppercase"
                  >
                     {f}
                  </Button>
               ))}
            </div>
         )}
         {rows.length === 0 ? (
            <p className="px-4 py-12 text-center text-sm text-slate-600">
               Nenhuma tripulação registrada nas etapas associadas.
            </p>
         ) : (
            <div
               className="focus-visible:outline-primary-600 h-80 overflow-y-auto overscroll-contain focus-visible:outline-2 sm:h-96"
               role="region"
               aria-label="Lista do pau de sebo"
               tabIndex={0}
            >
               <Table aria-label="Ranking de horas por tripulante">
                  <TableHead className="sticky top-0 z-10">
                     <TableRow>
                        <TableHeadCell className="w-px px-2">
                           <span className="sr-only">Posição</span>#
                        </TableHeadCell>
                        <TableHeadCell className="px-2 normal-case">
                           Nome de guerra
                        </TableHeadCell>
                        <TableHeadCell className="w-px px-2 normal-case">
                           Função
                        </TableHeadCell>
                        <TableHeadCell className="w-px px-2 text-right normal-case">
                           Etapas
                        </TableHeadCell>
                        <TableHeadCell className="w-px px-3 text-right normal-case">
                           Horas
                        </TableHeadCell>
                     </TableRow>
                  </TableHead>
                  <TableBody className="divide-y divide-slate-100">
                     {rows.map((s, idx) => (
                        <TableRow key={s.trip_id} className="hover:bg-slate-50">
                           <TableCell className="px-2 text-center text-slate-500 tabular-nums">
                              {idx + 1}
                           </TableCell>
                           <TableCell className="max-w-0 px-2 font-medium text-slate-700 uppercase">
                              <span className="block truncate" title={s.nome}>
                                 {s.nome}
                              </span>
                           </TableCell>
                           <TableCell className="px-2">
                              <Badge color="gray" className="w-fit uppercase">
                                 {s.func}
                              </Badge>
                           </TableCell>
                           <TableCell className="px-2 text-right text-slate-600 tabular-nums">
                              {s.etapas}
                           </TableCell>
                           <TableCell className="px-3 text-right font-semibold whitespace-nowrap text-slate-900 tabular-nums">
                              {minutesToTime(s.horas)}
                           </TableCell>
                        </TableRow>
                     ))}
                  </TableBody>
               </Table>
            </div>
         )}
      </section>
   );
}
