import { Badge } from "flowbite-react";
import { formatNaiveDate } from "@/../utils/dateHandler";
import { SoldoPublic } from "services/routes/cegep/soldos";
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

interface SoldoCardListProps {
   soldos: SoldoPublic[];
   onEdit: (soldo: SoldoPublic) => void;
   onDelete: (soldo: SoldoPublic) => void;
}

export default function SoldoCardList({
   soldos,
   onEdit,
   onDelete,
}: SoldoCardListProps) {
   return (
      <div className="space-y-3 p-4 md:hidden">
         {soldos.map((soldo) => (
            <div
               key={soldo.id}
               className="rounded border border-slate-200 bg-white p-4 shadow-sm"
            >
               <div className="mb-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                     <Badge
                        color={getCirculoColor(resolveCirculo(soldo))}
                        size="sm"
                     >
                        {soldo.pg.toUpperCase()}
                     </Badge>
                     <span className="font-medium text-gray-900">
                        {resolveMid(soldo)}
                     </span>
                  </div>
                  <SoldoStatusBadge
                     status={getSoldoStatus(soldo.data_inicio, soldo.data_fim)}
                     size="xs"
                  />
               </div>

               <div className="mb-2 text-xs text-gray-500">
                  {resolveCirculoLabel(soldo)}
               </div>

               <div className="mb-3">
                  <span className="font-mono text-lg font-bold text-green-600">
                     {formatCurrency(soldo.valor)}
                  </span>
               </div>

               <div className="mb-3 flex gap-4 text-sm text-gray-600">
                  <div>
                     <span className="text-gray-400">Início: </span>
                     <span className="font-mono">
                        {formatNaiveDate(soldo.data_inicio) || "-"}
                     </span>
                  </div>
                  {soldo.data_fim && (
                     <div>
                        <span className="text-gray-400">Fim: </span>
                        <span className="font-mono">
                           {formatNaiveDate(soldo.data_fim)}
                        </span>
                     </div>
                  )}
               </div>

               <SoldoRowActions
                  soldo={soldo}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  variant="labeled"
               />
            </div>
         ))}
      </div>
   );
}
