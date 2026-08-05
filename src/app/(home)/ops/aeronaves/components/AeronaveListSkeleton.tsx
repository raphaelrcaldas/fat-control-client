"use client";

import {
   Table,
   TableBody,
   TableCell,
   TableHead,
   TableHeadCell,
   TableRow,
} from "flowbite-react";

// Cards de resumo (Ativas + 4 situações) — mesma contagem do SituacaoSummary.
const SUMMARY_CARDS = [0, 1, 2, 3, 4] as const;

// Larguras da barra de "Observação" variam por linha para não parecer um
// bloco maciço — padrão fixo (nunca Math.random, que causa flicker/mismatch
// de hidratação).
const OBS_WIDTHS = ["w-40", "w-52", "w-28", "w-48", "w-36", "w-56"] as const;

// Nem toda linha tem observação na tabela real; padrão fixo alternando
// presença/ausência para aproximar a variação real sem ser aleatório.
const SHOW_OBS = [true, false, true, false, true, false] as const;

interface AeronaveListSkeletonProps {
   rows?: number;
}

export function AeronaveListSkeleton({ rows = 6 }: AeronaveListSkeletonProps) {
   return (
      <div className="space-y-2">
         {/* Resumo por situação */}
         <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
            {SUMMARY_CARDS.map((card) => (
               <div
                  key={card}
                  className="flex items-center justify-between rounded border border-slate-200 bg-white px-3 py-2.5 shadow-sm"
               >
                  <div className="min-w-0 space-y-1.5">
                     <div className="h-2.5 w-16 animate-pulse rounded bg-slate-100" />
                     <div className="h-6 w-10 animate-pulse rounded bg-slate-200" />
                  </div>
                  <div className="h-5 w-5 shrink-0 animate-pulse rounded bg-slate-100" />
               </div>
            ))}
         </div>

         {/*
            Tabela desktop — skeleton montado com os MESMOS componentes
            (Table/TableHead/TableHeadCell/TableBody/TableRow/TableCell) e o
            mesmo theme override do cabeçalho que AeronaveTable.tsx usa. Isso
            acopla o skeleton à lib, mas garante padding idêntico (px-6 py-3
            no head, px-6 py-4 no body — vem do tema padrão da Table) e deixa
            o navegador calcular a largura de cada coluna pelo auto-layout do
            <table>, igual à tabela real: uma trilha de grid com frações
            chutadas sempre ia divergir da largura que o conteúdo real impõe
            (Matrícula estreita, Observação larga). As barras de cada célula
            abaixo aproximam o tamanho do conteúdo real para o auto-layout
            convergir para colunas parecidas.
         */}
         <div className="hidden overflow-x-auto rounded border border-slate-200 bg-white shadow-sm md:block">
            <Table
               className="text-center"
               theme={{
                  head: {
                     cell: { base: "bg-white border-b border-slate-200" },
                  },
               }}
            >
               <TableHead>
                  <TableRow>
                     <TableHeadCell>
                        <div className="mx-auto h-3 w-14 animate-pulse rounded bg-slate-200" />
                     </TableHeadCell>
                     <TableHeadCell>
                        <div className="mx-auto h-3 w-14 animate-pulse rounded bg-slate-200" />
                     </TableHeadCell>
                     <TableHeadCell>
                        <div className="mx-auto h-3 w-10 animate-pulse rounded bg-slate-200" />
                     </TableHeadCell>
                     <TableHeadCell>
                        <div className="mx-auto h-3 w-14 animate-pulse rounded bg-slate-200" />
                     </TableHeadCell>
                     <TableHeadCell>
                        <div className="mx-auto h-3 w-20 animate-pulse rounded bg-slate-200" />
                     </TableHeadCell>
                     <TableHeadCell>
                        <div className="mx-auto h-3 w-12 animate-pulse rounded bg-slate-200" />
                     </TableHeadCell>
                     <TableHeadCell>
                        <div className="mx-auto h-3 w-10 animate-pulse rounded bg-slate-200" />
                     </TableHeadCell>
                  </TableRow>
               </TableHead>
               <TableBody className="divide-y">
                  {Array.from({ length: rows }).map((_, i) => (
                     <TableRow key={i} className="bg-white">
                        {/* Matrícula — text-base font-bold */}
                        <TableCell>
                           <div className="mx-auto h-4 w-16 animate-pulse rounded bg-slate-200" />
                        </TableCell>
                        {/* Projeto — modelo (semibold) + id_projeto (xs) empilhados */}
                        <TableCell>
                           <div className="mx-auto flex w-fit flex-col items-center gap-1">
                              <div className="h-3.5 w-20 animate-pulse rounded bg-slate-200" />
                              <div className="h-2.5 w-12 animate-pulse rounded bg-slate-100" />
                           </div>
                        </TableCell>
                        {/* Tipo — pill Aeronave/Simulador */}
                        <TableCell>
                           <div className="mx-auto h-5 w-20 animate-pulse rounded-full bg-slate-100" />
                        </TableCell>
                        {/* Situação — chip w-10 */}
                        <TableCell>
                           <div className="mx-auto h-8 w-10 animate-pulse rounded bg-slate-200" />
                        </TableCell>
                        {/* Observação — largura variável, nem toda linha tem */}
                        <TableCell>
                           {SHOW_OBS[i % SHOW_OBS.length] ? (
                              <div
                                 className={`mx-auto h-3 max-w-xs animate-pulse rounded bg-slate-100 ${OBS_WIDTHS[i % OBS_WIDTHS.length]}`}
                              />
                           ) : (
                              <div className="mx-auto h-3 w-3 animate-pulse rounded bg-slate-100" />
                           )}
                        </TableCell>
                        {/* Status — pill Ativa/Inativa */}
                        <TableCell>
                           <div className="mx-auto h-5 w-14 animate-pulse rounded-full bg-slate-100" />
                        </TableCell>
                        {/* Ações — botão de editar */}
                        <TableCell>
                           <div className="mx-auto h-7 w-7 animate-pulse rounded bg-slate-100" />
                        </TableCell>
                     </TableRow>
                  ))}
               </TableBody>
            </Table>
         </div>

         {/* Cards mobile — mesma anatomia e contagem do AeronaveCard real */}
         <div className="space-y-3 md:hidden">
            {Array.from({ length: rows }).map((_, i) => (
               <div
                  key={i}
                  className="rounded border border-slate-200 bg-white shadow-sm"
               >
                  <div className="flex items-center justify-between gap-3 px-4 py-3">
                     <div className="flex min-w-0 items-center gap-3">
                        {/* Chip de situação — w-12, mesma largura do real */}
                        <div className="h-7 w-12 shrink-0 animate-pulse rounded bg-slate-200" />
                        <div className="min-w-0 space-y-1.5">
                           {/* Matrícula — font-mono text-lg */}
                           <div className="h-5 w-24 animate-pulse rounded bg-slate-200" />
                           {/* Linha de projeto — text-xs */}
                           <div className="h-3 w-32 animate-pulse rounded bg-slate-100" />
                        </div>
                     </div>
                     {/* Botão de editar */}
                     <div className="h-7 w-7 shrink-0 animate-pulse rounded bg-slate-100 pointer-coarse:min-h-[44px] pointer-coarse:min-w-[44px]" />
                  </div>

                  {/* Bloco de observação — só em parte das linhas, como no real */}
                  {SHOW_OBS[i % SHOW_OBS.length] && (
                     <div className="border-t border-slate-100 px-4 py-2.5">
                        <div className="h-3 w-3/4 animate-pulse rounded bg-slate-100" />
                     </div>
                  )}
               </div>
            ))}
         </div>
      </div>
   );
}
