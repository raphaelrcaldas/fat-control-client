"use client";

import {
   Table,
   TableBody,
   TableCell,
   TableHead,
   TableHeadCell,
   TableRow,
} from "flowbite-react";
import { minutesToTime } from "@/../utils/dateHandler";
import type { EsforcoBloco } from "services/routes/ops/operacoes";
import { PainelResumo, PainelVazio } from "./PainelResumo";

const TOPO = 4;

/**
 * Esforço aéreo no dossiê — as quatro maiores categorias, com total.
 *
 * A barra sob o nome usa a maior categoria como 100%, não o total: com o total
 * como referência, uma operação com seis categorias equilibradas vira seis
 * barras curtas indistinguíveis. O que se compara aqui é uma categoria com a
 * outra.
 */
export function EsforcoResumo({
   esforco,
   onVerTudo,
}: {
   esforco: EsforcoBloco;
   onVerTudo: () => void;
}) {
   const { rows, total_etapas, total_horas } = esforco;
   const maior = rows.length > 0 ? Math.max(...rows.map((r) => r.horas)) : 0;
   const linhas = rows.slice(0, TOPO);

   return (
      <PainelResumo
         titulo="Esforço aéreo"
         resumo={`${rows.length} ${rows.length === 1 ? "categoria" : "categorias"}`}
         verTudo={
            rows.length > TOPO ? `Ver as ${rows.length} categorias` : undefined
         }
         onVerTudo={rows.length > TOPO ? onVerTudo : undefined}
      >
         {rows.length === 0 ? (
            <PainelVazio>
               Nenhum esforço aéreo registrado nas etapas associadas.
            </PainelVazio>
         ) : (
            <Table>
               <TableHead>
                  <TableRow>
                     <TableHeadCell className="px-3 normal-case">
                        Categoria
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
                  {linhas.map((r) => (
                     <TableRow key={r.esf_aer_id} className="bg-white">
                        <TableCell className="max-w-0 px-3">
                           <span
                              className="block truncate text-slate-700"
                              title={r.descricao}
                           >
                              {r.descricao}
                           </span>
                           <span
                              aria-hidden
                              className="bg-primary-500/55 mt-1 block h-[3px] rounded-sm"
                              style={{
                                 width: `${maior > 0 ? (r.horas / maior) * 100 : 0}%`,
                              }}
                           />
                        </TableCell>
                        <TableCell className="w-px px-2 text-right font-mono text-slate-600 tabular-nums">
                           {r.etapas}
                        </TableCell>
                        <TableCell className="w-px px-3 text-right font-mono font-bold whitespace-nowrap text-slate-900 tabular-nums">
                           {minutesToTime(r.horas)}
                        </TableCell>
                     </TableRow>
                  ))}
                  <TableRow className="bg-slate-50 font-bold">
                     <TableCell className="px-3 text-slate-700">
                        Total da operação
                     </TableCell>
                     <TableCell className="px-2 text-right font-mono text-slate-700 tabular-nums">
                        {total_etapas}
                     </TableCell>
                     <TableCell className="px-3 text-right font-mono whitespace-nowrap text-slate-900 tabular-nums">
                        {minutesToTime(total_horas)}
                     </TableCell>
                  </TableRow>
               </TableBody>
            </Table>
         )}
      </PainelResumo>
   );
}
