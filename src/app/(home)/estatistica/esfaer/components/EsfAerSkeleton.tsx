// Espelha o layout real (tabela principal + cards de grupo + área de gráfico)
// para zero layout-shift na troca skeleton → conteúdo.
// A tabela principal usa a mesma <Table> do EsfAerTable (mesmo theme) para que
// as colunas se distribuam exatamente como no conteúdo real.

import {
   Table,
   TableHead,
   TableHeadCell,
   TableBody,
   TableRow,
   TableCell,
} from "flowbite-react";
import clsx from "clsx";
import { MONTH_LABELS } from "../constants";

// Contagens/alturas fixas (sem Math.random) para evitar flicker e hydration mismatch.
const MAIN_ROWS = Array.from({ length: 16 });
const CHART_TABLE_ROWS = Array.from({ length: 12 });
const BAR_HEIGHTS = [
   "42%",
   "58%",
   "48%",
   "70%",
   "60%",
   "82%",
   "66%",
   "88%",
   "74%",
   "92%",
   "70%",
   "96%",
];

// Espelha o theme do EsfAerTable.
const TABLE_THEME = {
   root: { base: "text-sm text-center" },
   body: { cell: { base: "p-2" } },
   head: {
      cell: { base: "p-2 bg-slate-100 border-b border-slate-300 text-sm" },
   },
};

function Bar({ className }: { className?: string }) {
   return <div className={clsx("rounded bg-slate-200", className)} />;
}

function MainTableSkeleton() {
   return (
      <div className="w-full overflow-x-auto rounded border border-slate-200 bg-white">
         <Table striped theme={TABLE_THEME}>
            <TableHead>
               <TableRow>
                  <TableHeadCell>
                     <Bar className="mx-auto h-4 w-36 bg-slate-300" />
                  </TableHeadCell>
                  <TableHeadCell>
                     <Bar className="mx-auto h-4 w-14 bg-slate-300" />
                  </TableHeadCell>
                  <TableHeadCell>
                     <Bar className="mx-auto h-4 w-12 bg-slate-300" />
                  </TableHeadCell>
                  <TableHeadCell className="border-r border-slate-300">
                     <Bar className="mx-auto h-4 w-12 bg-slate-300" />
                  </TableHeadCell>
                  {MONTH_LABELS.map((m) => (
                     <TableHeadCell key={m}>
                        <Bar className="mx-auto h-4 w-10 bg-slate-300" />
                     </TableHeadCell>
                  ))}
               </TableRow>
            </TableHead>
            <TableBody className="divide-y">
               {MAIN_ROWS.map((_, r) => (
                  <TableRow key={r}>
                     <TableCell>
                        <Bar className="mx-auto h-5 w-48" />
                     </TableCell>
                     <TableCell>
                        <Bar className="mx-auto h-5 w-20" />
                     </TableCell>
                     <TableCell>
                        <Bar className="mx-auto h-5 w-20 bg-slate-100" />
                     </TableCell>
                     <TableCell className="border-r border-slate-300">
                        <Bar className="mx-auto h-5 w-20" />
                     </TableCell>
                     {MONTH_LABELS.map((m) => (
                        <TableCell key={m}>
                           <Bar className="mx-auto h-5 w-14 bg-slate-100" />
                        </TableCell>
                     ))}
                  </TableRow>
               ))}

               {/* Linha de total */}
               <TableRow>
                  <TableCell className="bg-slate-300">
                     <Bar className="mx-auto h-5 w-22 bg-slate-200" />
                  </TableCell>
                  <TableCell className="bg-slate-300">
                     <Bar className="mx-auto h-5 w-20 bg-slate-200" />
                  </TableCell>
                  <TableCell className="bg-slate-300">
                     <Bar className="mx-auto h-5 w-20 bg-slate-200" />
                  </TableCell>
                  <TableCell className="border-r border-slate-300 bg-slate-300">
                     <Bar className="mx-auto h-5 w-20 bg-slate-200" />
                  </TableCell>
                  {MONTH_LABELS.map((m) => (
                     <TableCell key={m} className="bg-slate-300">
                        <Bar className="mx-auto h-5 w-14 bg-slate-200" />
                     </TableCell>
                  ))}
               </TableRow>
            </TableBody>
         </Table>
      </div>
   );
}

// Espelha EsfAerGroupCards (border-t-4 colorido, 3 linhas Alocado/Voado/Saldo).
const GROUP_CARDS = [
   "border-orange-400",
   "border-blue-400",
   "border-slate-400",
];

function GroupCardsSkeleton() {
   return (
      <div className="grid w-full grid-cols-3 gap-4 md:w-2/3">
         {GROUP_CARDS.map((border, i) => (
            <div
               key={i}
               className={clsx(
                  "rounded border-t-4 bg-white p-4 shadow-sm",
                  border
               )}
            >
               <Bar className="mb-3 h-4 w-20" />
               <div className="space-y-1">
                  {Array.from({ length: 3 }).map((_, j) => (
                     <div key={j} className="flex justify-between">
                        <Bar className="h-3 w-14 bg-slate-100" />
                        <Bar className="h-3 w-12" />
                     </div>
                  ))}
               </div>
            </div>
         ))}
      </div>
   );
}

// Espelha a área de gráfico (gráfico de linha/barra + tabela mensal), apenas em lg.
function ChartAreaSkeleton() {
   return (
      <div className="col-span-full hidden w-full grid-cols-1 gap-4 lg:grid lg:grid-cols-3">
         {/* Gráfico (EsfAerChartLine, height 320) */}
         <div className="rounded border border-slate-200 bg-white p-4 shadow-sm lg:col-span-2">
            <div className="mb-4 flex justify-center gap-4">
               <Bar className="h-3 w-16 bg-slate-100" />
               <Bar className="h-3 w-16 bg-slate-100" />
               <Bar className="h-3 w-16 bg-slate-100" />
            </div>
            <div className="flex h-80 items-end gap-2 border-b border-l border-slate-200 pl-1">
               {BAR_HEIGHTS.map((h, i) => (
                  <div
                     key={i}
                     className="flex-1 rounded-t bg-slate-100"
                     style={{ height: h }}
                  />
               ))}
            </div>
         </div>

         {/* Tabela mensal (EsfAerChartTable: MES / PLANEJADO / VOADO / ACUMULADO) */}
         <div className="overflow-hidden rounded border border-slate-200 bg-white shadow-sm lg:col-span-1">
            <div className="flex gap-3 bg-slate-100 px-3 py-2.5">
               <Bar className="h-3 w-10 bg-slate-300" />
               <Bar className="h-3 flex-1 bg-slate-300" />
               <Bar className="h-3 flex-1 bg-slate-300" />
               <Bar className="h-3 flex-1 bg-slate-300" />
            </div>
            {CHART_TABLE_ROWS.map((_, i) => (
               <div
                  key={i}
                  className="flex items-center gap-3 border-t border-slate-100 px-3 py-2.5"
               >
                  <Bar className="h-3 w-10" />
                  <Bar className="h-3 flex-1 bg-slate-100" />
                  <Bar className="h-3 flex-1 bg-slate-100" />
                  <Bar className="h-3 flex-1 bg-slate-100" />
               </div>
            ))}
         </div>
      </div>
   );
}

export function EsfAerSkeleton() {
   return (
      <div
         role="status"
         aria-label="Carregando esforço aéreo"
         className="grid animate-pulse justify-items-center gap-4"
      >
         <MainTableSkeleton />
         <GroupCardsSkeleton />
         <ChartAreaSkeleton />
      </div>
   );
}
