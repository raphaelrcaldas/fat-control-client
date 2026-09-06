import { TableHead, TableHeadCell, TableRow } from "flowbite-react";

/**
 * Cabeçalho da tabela de tripulantes.
 *
 * Fica num arquivo só porque a lista e o skeleton precisam das MESMAS nove
 * colunas e das mesmas larguras — duplicado, o par diverge no primeiro ajuste
 * e o skeleton passa a mentir sobre o layout que vem.
 */
export function TripTableHead() {
   return (
      <TableHead>
         <TableRow>
            <TableHeadCell className="w-20 whitespace-nowrap">
               P/G
            </TableHeadCell>
            <TableHeadCell className="hidden w-24 whitespace-nowrap lg:table-cell">
               Quadro
            </TableHeadCell>
            <TableHeadCell className="hidden w-28 whitespace-nowrap lg:table-cell">
               Especialidade
            </TableHeadCell>
            <TableHeadCell className="w-44 whitespace-nowrap">
               Nome de guerra
            </TableHeadCell>
            <TableHeadCell className="whitespace-nowrap">
               Nome completo
            </TableHeadCell>
            <TableHeadCell className="w-24 text-center whitespace-nowrap">
               Trigrama
            </TableHeadCell>
            <TableHeadCell className="w-28 text-center whitespace-nowrap">
               Funções
            </TableHeadCell>
            <TableHeadCell className="hidden w-24 text-center whitespace-nowrap lg:table-cell">
               Status
            </TableHeadCell>
            <TableHeadCell className="w-16">
               <span className="sr-only">Ações</span>
            </TableHeadCell>
         </TableRow>
      </TableHead>
   );
}
