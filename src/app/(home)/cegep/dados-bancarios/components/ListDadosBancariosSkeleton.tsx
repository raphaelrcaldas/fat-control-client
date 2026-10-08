import {
   Table,
   TableHead,
   TableHeadCell,
   TableBody,
   TableRow,
   TableCell,
} from "flowbite-react";
import { TABELA_DADOS_BANCARIOS_THEME } from "./listDadosBancarios";
import { SortableHeadCell } from "./SortableHeadCell";

interface ListDadosBancariosSkeletonProps {
   rows?: number;
}

function Bar({ className = "" }: { className?: string }) {
   return (
      <span
         className={`inline-block h-4 animate-pulse rounded bg-slate-200 ${className}`}
      />
   );
}

/** Skeleton que espelha a tabela de listDadosBancarios (9 colunas). */
export default function ListDadosBancariosSkeleton({
   rows = 8,
}: ListDadosBancariosSkeletonProps) {
   return (
      <div
         role="status"
         className="overflow-x-auto rounded border border-slate-200 shadow-sm"
      >
         <span className="sr-only">Carregando dados bancários…</span>
         <Table
            hoverable
            aria-hidden
            className="whitespace-nowrap"
            theme={TABELA_DADOS_BANCARIOS_THEME}
         >
            <TableHead>
               <TableRow>
                  {/* Mesma anatomia ordenável da tabela: os ícones ocupam
                      largura e mudariam a coluna ao chegar o dado. */}
                  <SortableHeadCell label="Militar" active direction="asc" />
                  <TableHeadCell className="min-w-[140px]">
                     Nome Completo
                  </TableHeadCell>
                  <TableHeadCell>Banco</TableHeadCell>
                  <TableHeadCell>Agência</TableHeadCell>
                  <TableHeadCell>Conta</TableHeadCell>
                  <TableHeadCell className="text-right">
                     Remuneração
                  </TableHeadCell>
                  <SortableHeadCell
                     label="Mês/Ano"
                     align="center"
                     active={false}
                     direction="asc"
                  />
                  <TableHeadCell className="text-right">
                     Aux. Transp.
                  </TableHeadCell>
                  <SortableHeadCell
                     label="Atualizado em"
                     align="center"
                     active={false}
                     direction="asc"
                  />
               </TableRow>
            </TableHead>
            <TableBody>
               {Array.from({ length: rows }).map((_, i) => (
                  <TableRow key={i} className="bg-white">
                     <TableCell>
                        <Bar className="w-24" />
                     </TableCell>
                     <TableCell className="w-full max-w-0 min-w-[140px]">
                        <Bar className="w-40" />
                     </TableCell>
                     <TableCell>
                        <span className="inline-flex items-baseline gap-2">
                           <Bar className="w-7" />
                           <Bar className="w-24" />
                        </span>
                     </TableCell>
                     <TableCell>
                        <Bar className="w-12" />
                     </TableCell>
                     <TableCell>
                        <Bar className="w-16" />
                     </TableCell>
                     <TableCell className="text-right">
                        <Bar className="w-20" />
                     </TableCell>
                     <TableCell className="text-center">
                        <Bar className="w-14" />
                     </TableCell>
                     <TableCell className="text-right">
                        <Bar className="w-16" />
                     </TableCell>
                     <TableCell className="text-center">
                        <Bar className="w-20" />
                     </TableCell>
                  </TableRow>
               ))}
            </TableBody>
         </Table>
      </div>
   );
}
