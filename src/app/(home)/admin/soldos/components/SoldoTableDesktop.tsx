import {
   Badge,
   Table,
   TableBody,
   TableCell,
   TableHead,
   TableHeadCell,
   TableRow,
} from "flowbite-react";
import { formatNaiveDate } from "@/../utils/dateHandler";
import { SoldoPublic } from "services/routes/admin/soldos";
import {
   formatCurrency,
   getCirculoColor,
   getSoldoStatus,
   resolveCirculo,
   resolveCirculoLabel,
   resolveMid,
} from "../helpers/soldoHelpers";
import SoldoStatusBadge from "./SoldoStatusBadge";
import SoldoRowActions from "./SoldoRowActions";

interface SoldoTableDesktopProps {
   soldos: SoldoPublic[];
   onEdit: (soldo: SoldoPublic) => void;
   onDelete: (soldo: SoldoPublic) => void;
}

export default function SoldoTableDesktop({
   soldos,
   onEdit,
   onDelete,
}: SoldoTableDesktopProps) {
   return (
      <div className="hidden overflow-x-auto md:block">
         <Table hoverable className="text-sm">
            <TableHead>
               <TableRow>
                  <TableHeadCell>Posto/Graduação</TableHeadCell>
                  <TableHeadCell className="text-center">Círculo</TableHeadCell>
                  <TableHeadCell className="text-center">Valor</TableHeadCell>
                  <TableHeadCell className="text-center">
                     Data Início
                  </TableHeadCell>
                  <TableHeadCell className="text-center">
                     Data Fim
                  </TableHeadCell>
                  <TableHeadCell className="text-center">Status</TableHeadCell>
                  <TableHeadCell className="text-center">
                     <span className="sr-only">Ações</span>
                  </TableHeadCell>
               </TableRow>
            </TableHead>
            <TableBody className="divide-y">
               {soldos.map((soldo) => (
                  <TableRow key={soldo.id} className="bg-white">
                     <TableCell>
                        <div className="flex items-center gap-3">
                           <Badge
                              color={getCirculoColor(resolveCirculo(soldo))}
                              className="flex w-10 justify-center"
                              size="sm"
                           >
                              {soldo.pg.toUpperCase()}
                           </Badge>
                           <span className="text-gray-900">
                              {resolveMid(soldo)}
                           </span>
                        </div>
                     </TableCell>
                     <TableCell>
                        <Badge
                           color={getCirculoColor(resolveCirculo(soldo))}
                           className="mx-auto flex w-36 justify-center"
                           size="sm"
                        >
                           {resolveCirculoLabel(soldo)}
                        </Badge>
                     </TableCell>
                     <TableCell className="text-center">
                        <span className="font-mono font-semibold text-green-600">
                           {formatCurrency(soldo.valor)}
                        </span>
                     </TableCell>
                     <TableCell className="text-center font-mono text-gray-600">
                        {formatNaiveDate(soldo.data_inicio) || "-"}
                     </TableCell>
                     <TableCell className="text-center font-mono text-gray-600">
                        {formatNaiveDate(soldo.data_fim) || "-"}
                     </TableCell>
                     <TableCell>
                        <div className="flex justify-center">
                           <SoldoStatusBadge
                              status={getSoldoStatus(
                                 soldo.data_inicio,
                                 soldo.data_fim
                              )}
                           />
                        </div>
                     </TableCell>
                     <TableCell>
                        <SoldoRowActions
                           soldo={soldo}
                           onEdit={onEdit}
                           onDelete={onDelete}
                        />
                     </TableCell>
                  </TableRow>
               ))}
            </TableBody>
         </Table>
      </div>
   );
}
