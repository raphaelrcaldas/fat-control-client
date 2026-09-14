"use client";

import { useMemo } from "react";
import {
   Table,
   TableHead,
   TableHeadCell,
   TableBody,
   TableRow,
   TableCell,
} from "flowbite-react";
import { minutesToTime } from "@/../utils/dateHandler";
import { ListaModal } from "./ListaModal";
import type { EsforcoBloco } from "services/routes/ops/operacoes";

interface Props {
   show: boolean;
   onClose: () => void;
   opNome: string;
   esforco: EsforcoBloco;
}

export function EsforcoModal({ show, onClose, opNome, esforco }: Props) {
   // A barra compara cada categoria à maior delas, não ao total: contra o
   // total, a maior categoria nunca chegaria perto de 100% e a barra de
   // ninguém comunicaria proporção de forma legível.
   const maiorHoras = useMemo(
      () => Math.max(1, ...esforco.rows.map((r) => r.horas)),
      [esforco.rows]
   );

   return (
      <ListaModal
         show={show}
         onClose={onClose}
         titulo="Esforço aéreo"
         contexto={opNome}
         rodape={
            <>
               <span>
                  <strong>{esforco.rows.length}</strong>{" "}
                  {esforco.rows.length === 1 ? "categoria" : "categorias"}
               </span>
               <span>
                  Σ <strong>{minutesToTime(esforco.total_horas)}</strong>
               </span>
            </>
         }
      >
         {esforco.rows.length === 0 ? (
            <div className="flex min-h-70 flex-col items-center justify-center gap-2 px-4 text-center">
               <p className="text-sm font-semibold text-slate-600">
                  Nenhum esforço aéreo registrado nas etapas associadas.
               </p>
            </div>
         ) : (
            <Table aria-label="Esforço aéreo completo por categoria">
               <TableHead className="sticky top-0 z-10">
                  <TableRow>
                     <TableHeadCell className="px-4 normal-case">
                        Categoria
                     </TableHeadCell>
                     <TableHeadCell className="w-px px-2 text-right normal-case">
                        Etapas
                     </TableHeadCell>
                     <TableHeadCell className="w-px px-4 text-right normal-case">
                        Horas
                     </TableHeadCell>
                  </TableRow>
               </TableHead>
               <TableBody className="divide-y divide-slate-100">
                  {esforco.rows.map((r) => {
                     const pct = Math.round((r.horas / maiorHoras) * 100);
                     return (
                        <TableRow
                           key={r.esf_aer_id}
                           className="hover:bg-slate-50"
                        >
                           <TableCell className="max-w-0 px-4 text-slate-700">
                              <span
                                 className="block truncate"
                                 title={r.descricao}
                              >
                                 {r.descricao}
                              </span>
                              <span
                                 aria-hidden
                                 className="bg-primary-500/55 mt-1 block h-[3px] rounded-sm"
                                 style={{ width: `${pct}%` }}
                              />
                           </TableCell>
                           <TableCell className="px-2 text-right whitespace-nowrap text-slate-600 tabular-nums">
                              {r.etapas}
                           </TableCell>
                           <TableCell className="px-4 text-right font-semibold whitespace-nowrap text-slate-900 tabular-nums">
                              {minutesToTime(r.horas)}
                           </TableCell>
                        </TableRow>
                     );
                  })}
                  <TableRow className="bg-slate-50 font-bold">
                     <TableCell className="px-4 text-slate-700">
                        Total
                     </TableCell>
                     <TableCell className="px-2 text-right text-slate-700 tabular-nums">
                        {esforco.total_etapas}
                     </TableCell>
                     <TableCell className="px-4 text-right text-slate-900 tabular-nums">
                        {minutesToTime(esforco.total_horas)}
                     </TableCell>
                  </TableRow>
               </TableBody>
            </Table>
         )}
      </ListaModal>
   );
}
