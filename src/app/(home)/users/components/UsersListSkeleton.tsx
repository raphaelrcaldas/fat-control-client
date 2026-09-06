/**
 * Skeleton da listagem de usuários. Espelha o UserTable (desktop, 10 colunas)
 * e os UserCard (mobile) 1:1 para zero layout-shift na troca skeleton →
 * conteúdo. Contagem de linhas fixa (estável, sem flicker).
 */

import {
   Table,
   TableHead,
   TableHeadCell,
   TableBody,
   TableRow,
   TableCell,
} from "flowbite-react";

const Bar = ({ className = "" }: { className?: string }) => (
   <div className={`h-7 rounded bg-slate-200 ${className}`} />
);

function DesktopRow() {
   return (
      <TableRow>
         <TableCell className="px-3">
            <Bar className="size-5" />
         </TableCell>
         <TableCell>
            <Bar className="w-10" />
         </TableCell>
         <TableCell>
            <Bar className="w-10" />
         </TableCell>
         <TableCell>
            <Bar className="w-12" />
         </TableCell>
         <TableCell>
            <Bar className="w-24" />
         </TableCell>
         <TableCell>
            <Bar className="w-40" />
         </TableCell>
         <TableCell>
            <Bar className="mx-auto w-20" />
         </TableCell>
         <TableCell>
            <Bar className="mx-auto w-14" />
         </TableCell>
         <TableCell>
            <Bar className="mx-auto w-16" />
         </TableCell>
         <TableCell>
            <Bar className="mx-auto w-16 bg-slate-100" />
         </TableCell>
         <TableCell>
            <Bar className="ml-auto w-7 bg-slate-100" />
         </TableCell>
      </TableRow>
   );
}

function MobileCard() {
   return (
      // As alturas em px vem da MEDIDA do card real (nome 17.5 + completo 14;
      // rotulo 15 + valor 14): o contorno das barras pode ser mais magro que a
      // linha de texto, mas a CAIXA tem de ter a altura exata, senao a lista
      // salta quando os dados chegam.
      <div className="rounded border border-slate-200 bg-white p-3 shadow-sm">
         <div className="flex items-center gap-3">
            <div className="size-10 shrink-0 rounded-full bg-slate-200" />
            <div className="flex h-[31.5px] min-w-0 flex-1 flex-col justify-center gap-1">
               <div className="h-3.5 w-24 rounded bg-slate-200" />
               <div className="h-2.5 w-40 rounded bg-slate-100" />
            </div>
            <div className="size-5 shrink-0 rounded bg-slate-100" />
         </div>
         <div className="mt-2.5 grid grid-cols-3 gap-3 border-t border-slate-100 pt-2">
            {Array.from({ length: 3 }).map((_, i) => (
               <div
                  key={i}
                  className="flex h-[29px] flex-col justify-center gap-1"
               >
                  <div className="h-2.5 w-10 rounded bg-slate-100" />
                  <div className="h-3 w-14 rounded bg-slate-200" />
               </div>
            ))}
         </div>
      </div>
   );
}

export function UsersListSkeleton({ rows = 8 }: { rows?: number }) {
   return (
      <div className="animate-pulse">
         {/* Desktop — mesma moldura e colunas do UserTable */}
         <div className="hidden min-h-100 overflow-x-auto lg:block">
            <Table
               theme={{
                  body: { cell: { base: "px-2.5 py-1 xl:px-4" } },
                  head: {
                     cell: {
                        base: "bg-gray-50 px-2.5 xl:px-4",
                     },
                  },
               }}
            >
               <TableHead>
                  <TableRow>
                     <TableHeadCell className="w-10 px-3">
                        <span className="sr-only">Seleção</span>
                     </TableHeadCell>
                     <TableHeadCell className="whitespace-nowrap">
                        P/G
                     </TableHeadCell>
                     <TableHeadCell className="whitespace-nowrap">
                        Quadro
                     </TableHeadCell>
                     <TableHeadCell className="whitespace-nowrap">
                        Especialidade
                     </TableHeadCell>
                     <TableHeadCell className="whitespace-nowrap">
                        Nome de Guerra
                     </TableHeadCell>
                     <TableHeadCell className="whitespace-nowrap">
                        Nome Completo
                     </TableHeadCell>
                     <TableHeadCell className="text-center whitespace-nowrap">
                        SARAM
                     </TableHeadCell>
                     <TableHeadCell className="text-center whitespace-nowrap">
                        ID
                     </TableHeadCell>
                     <TableHeadCell className="text-center whitespace-nowrap">
                        Unidade
                     </TableHeadCell>
                     <TableHeadCell className="text-center whitespace-nowrap">
                        Status
                     </TableHeadCell>
                     <TableHeadCell>
                        <span className="sr-only">Ações</span>
                     </TableHeadCell>
                  </TableRow>
               </TableHead>
               <TableBody className="divide-y divide-slate-100">
                  {Array.from({ length: rows }).map((_, i) => (
                     <DesktopRow key={i} />
                  ))}
               </TableBody>
            </Table>
         </div>

         {/* Mobile — mesma moldura dos UserCard */}
         <div className="space-y-2 p-2 lg:hidden">
            {Array.from({ length: 4 }).map((_, i) => (
               <MobileCard key={i} />
            ))}
         </div>
      </div>
   );
}
