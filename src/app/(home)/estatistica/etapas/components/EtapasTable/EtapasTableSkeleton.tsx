"use client";

// Skeleton fiel da listagem de etapas: barra "selecionar todas" + cards de
// missao (header + tabela interna), como o EtapasTable monta.
// Mesmas colunas/larguras/visibilidades responsivas do EtapaRow -> zero layout-shift.

import clsx from "clsx";
import { Table, TableBody, TableCell, TableRow } from "flowbite-react";

// Contagens fixas (sem Math.random) para evitar flicker e hydration mismatch.
const MISSOES_SKELETON = [2, 3, 8, 3]; // nº de etapas por card de missao

function Bar({ className }: { className?: string }) {
   return (
      <div className={clsx("animate-pulse rounded bg-slate-200", className)} />
   );
}

function EtapaRowSkeleton() {
   return (
      <TableRow>
         <TableCell className="w-7 px-0">
            <div className="flex w-7 items-center justify-center">
               <Bar className="size-5" />
            </div>
         </TableCell>
         <TableCell className="w-12 sm:w-20">
            <Bar className="mx-auto h-5 w-18" />
         </TableCell>
         <TableCell className="w-12 sm:w-14">
            <Bar className="mx-auto h-5 w-12" />
         </TableCell>
         <TableCell className="w-12 sm:w-14">
            <Bar className="mx-auto h-5 w-12" />
         </TableCell>
         <TableCell className="w-13 sm:w-16">
            <Bar className="mx-auto h-5 w-13" />
         </TableCell>
         <TableCell className="w-13 sm:w-16">
            <Bar className="mx-auto h-5 w-13" />
         </TableCell>
         <TableCell className="w-13 sm:w-16">
            <Bar className="mx-auto h-5 w-13" />
         </TableCell>
         <TableCell className="hidden w-14 sm:table-cell">
            <Bar className="mx-auto h-5 w-12" />
         </TableCell>
         <TableCell className="hidden w-5 sm:table-cell" />
         <TableCell className="hidden w-80 md:table-cell">
            <Bar className="mx-auto h-5 w-64" />
         </TableCell>
         <TableCell className="hidden min-w-36 lg:table-cell">
            <div className="flex flex-wrap items-center gap-0.5">
               <Bar className="h-5 w-10 bg-slate-100" />
               <Bar className="h-5 w-10 bg-slate-100" />
               <Bar className="h-5 w-10 bg-slate-100" />
               <Bar className="h-5 w-10 bg-slate-100" />
               <Bar className="h-5 w-10 bg-slate-100" />
               <Bar className="h-5 w-10 bg-slate-100" />
               <Bar className="h-5 w-10 bg-slate-100" />
            </div>
         </TableCell>
         <TableCell className="w-10 px-2 sm:w-12">
            <div className="flex items-center gap-0.5">
               <Bar className="h-8 w-7.5 bg-slate-100" />
               <Bar className="h-8 w-7.5 bg-slate-100" />
            </div>
         </TableCell>
      </TableRow>
   );
}

function InnerTableSkeleton({ rows }: { rows: number }) {
   return (
      <div className="overflow-x-auto">
         <Table
            className="text-center"
            theme={{
               body: { cell: { base: "px-1 py-0.5 align-middle" } },
            }}
         >
            <TableBody className="divide-y">
               {Array.from({ length: rows }, (_, i) => (
                  <EtapaRowSkeleton key={i} />
               ))}
            </TableBody>
         </Table>
      </div>
   );
}

function MissaoCardSkeleton({ rows }: { rows: number }) {
   return (
      <div className="mx-0.5 overflow-hidden rounded border border-gray-300 bg-white shadow">
         <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 bg-white py-1.5 pr-1.5">
            <div className="flex w-7 shrink-0 items-center justify-center">
               <Bar className="size-5" />
            </div>
            <Bar className="h-5 w-32" />
         </div>
         <InnerTableSkeleton rows={rows} />
      </div>
   );
}

export function EtapasTableSkeleton() {
   return (
      <div role="status" className="space-y-2">
         <span className="sr-only">Carregando etapas…</span>
         <div className="mx-0.5 flex h-9 flex-wrap items-center gap-2 pr-1 pl-px">
            <div className="flex w-7 shrink-0 items-center justify-center">
               <Bar className="size-5" />
            </div>
            <Bar className="h-5 w-64" />
         </div>
         {MISSOES_SKELETON.map((rows, i) => (
            <MissaoCardSkeleton key={i} rows={rows} />
         ))}
      </div>
   );
}
