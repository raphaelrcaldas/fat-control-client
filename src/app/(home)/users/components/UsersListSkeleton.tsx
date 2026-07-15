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
         <TableCell>
            <Bar className="w-12" />
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
            <Bar className="ml-auto w-14 bg-slate-100" />
         </TableCell>
      </TableRow>
   );
}

function MobileCard() {
   return (
      <div className="rounded border border-slate-200 bg-white p-4 shadow-sm">
         <div className="mb-3 flex items-start justify-between">
            <div className="flex items-center gap-2">
               <div className="h-10 w-10 rounded-full bg-slate-200" />
               <div className="space-y-1.5">
                  <Bar className="w-24" />
                  <div className="h-3 w-32 rounded bg-slate-100" />
               </div>
            </div>
            <div className="h-8 w-8 rounded bg-slate-100" />
         </div>
         <div className="grid grid-cols-4 gap-2 border-t border-slate-100 pt-3">
            {Array.from({ length: 4 }).map((_, i) => (
               <div key={i} className="space-y-1.5">
                  <div className="h-3 w-10 rounded bg-slate-100" />
                  <div className="h-5 w-12 rounded bg-slate-200" />
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
         <div className="mx-2 hidden min-h-100 overflow-x-auto rounded border border-slate-200 bg-white shadow-sm lg:block">
            <Table
               theme={{
                  body: { cell: { base: "py-1" } },
                  head: {
                     cell: { base: "bg-white border-b border-slate-200" },
                  },
               }}
            >
               <TableHead>
                  <TableRow>
                     <TableHeadCell>P/G</TableHeadCell>
                     <TableHeadCell>Quadro</TableHeadCell>
                     <TableHeadCell>Especialidade</TableHeadCell>
                     <TableHeadCell>Nome de Guerra</TableHeadCell>
                     <TableHeadCell>Nome Completo</TableHeadCell>
                     <TableHeadCell className="text-center">
                        SARAM
                     </TableHeadCell>
                     <TableHeadCell className="text-center">ID</TableHeadCell>
                     <TableHeadCell className="text-center">
                        Unidade
                     </TableHeadCell>
                     <TableHeadCell className="text-center">
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
         <div className="space-y-3 p-4 lg:hidden">
            {Array.from({ length: 4 }).map((_, i) => (
               <MobileCard key={i} />
            ))}
         </div>
      </div>
   );
}
