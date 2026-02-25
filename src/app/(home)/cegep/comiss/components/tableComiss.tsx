"use client";

import { useState, memo, useMemo } from "react";
import {
   Table,
   TableHead,
   TableHeadCell,
   TableBody,
   TableRow,
   TableCell,
   Progress,
   Label,
} from "flowbite-react";
import { isoStrToDate } from "utils/dateHandler";
import { DetailComiss } from "./detailComiss";
import clsx from "clsx";
import { ComissList } from "services/routes/cegep/comiss";

interface TableComissProps {
   cmtos: ComissList[];
}

export const TableComiss = memo(function TableComiss({
   cmtos,
}: TableComissProps) {
   return (
      <div className="overflow-x-auto rounded-md bg-white shadow-md">
         <Table striped hoverable>
            <TableHead>
               <TableRow>
                  <TableHeadCell>Militar</TableHeadCell>
                  <TableHeadCell className="text-center">
                     Abertura
                  </TableHeadCell>
                  <TableHeadCell className="text-center">
                     Fechamento
                  </TableHeadCell>
                  <TableHeadCell className="text-center">Tipo</TableHeadCell>
                  <TableHeadCell className="text-center">
                     Progresso
                  </TableHeadCell>
                  <TableHeadCell className="text-center">Módulo</TableHeadCell>
                  <TableHeadCell className="text-center">
                     Previsto
                  </TableHeadCell>
                  <TableHeadCell className="text-center">
                     Computado
                  </TableHeadCell>
                  <TableHeadCell className="text-center">
                     Restante
                  </TableHeadCell>
                  <TableHeadCell className="text-center">Missoes</TableHeadCell>
               </TableRow>
            </TableHead>
            <TableBody className="divide-y">
               {cmtos.map((comiss) => (
                  <TableComissRow key={comiss.id} comiss={comiss} />
               ))}
            </TableBody>
         </Table>
      </div>
   );
});

const TableComissRow = memo(function TableComissRow({
   comiss,
}: {
   comiss: ComissList;
}) {
   const [showDetail, setShowDetail] = useState(false);
   const user = comiss.user;

   const { dataAbertura, dataFechamento } = useMemo(
      () => ({
         dataAbertura: isoStrToDate(comiss.data_ab).toLocaleDateString(
            "pt-br",
            { day: "2-digit", month: "2-digit", year: "2-digit" }
         ),
         dataFechamento: isoStrToDate(comiss.data_fc).toLocaleDateString(
            "pt-br",
            { day: "2-digit", month: "2-digit", year: "2-digit" }
         ),
      }),
      [comiss.data_ab, comiss.data_fc]
   );

   const ajdAb = comiss.valor_aj_ab;
   const ajdFc = comiss.valor_aj_fc;

   const { previsto, computado, restante } = useMemo(() => {
      if (comiss.dias_cumprir) {
         return {
            previsto: String(comiss.dias_cumprir),
            computado: String(comiss.dias_comp),
            restante: String(comiss.dias_cumprir - comiss.dias_comp),
         };
      }
      const prev = (ajdAb + ajdFc) / 335;
      const comp = comiss.vals_comp / 335;
      return {
         previsto: `~ ${prev.toFixed(0)}`,
         computado: `~ ${comp.toFixed(0)}`,
         restante: `~ ${(prev - comp).toFixed(0)}`,
      };
   }, [comiss.dias_cumprir, comiss.dias_comp, comiss.vals_comp, ajdAb, ajdFc]);

   let progressColor = comiss.modulo ? "green" : "red";
   progressColor = comiss.status === "fechado" ? "gray" : progressColor;

   return (
      <>
         <TableRow
            onClick={() => setShowDetail(true)}
            className="cursor-pointer bg-white"
         >
            <TableCell className="font-medium whitespace-nowrap text-gray-900">
               <div className="flex items-center gap-2">
                  <div
                     className={clsx(
                        "h-2 w-2 shrink-0 rounded-full",
                        comiss.status === "aberto"
                           ? "bg-emerald-500"
                           : "bg-gray-400"
                     )}
                  />
                  <span className="uppercase">
                     {user?.p_g} {user?.nome_guerra}
                  </span>
               </div>
            </TableCell>

            <TableCell className="text-center whitespace-nowrap">
               <span className="font-mono text-sm">{dataAbertura}</span>
            </TableCell>

            <TableCell className="text-center whitespace-nowrap">
               <span className="font-mono text-sm">{dataFechamento}</span>
            </TableCell>

            <TableCell className="text-center whitespace-nowrap">
               <span
                  className={clsx(
                     "inline-flex items-center rounded-lg px-2.5 py-1 text-xs font-medium",
                     comiss.dias_cumprir
                        ? "bg-blue-100 text-blue-700"
                        : "bg-green-100 text-green-700"
                  )}
               >
                  {comiss.dias_cumprir ? "Periodo" : "Comparativo"}
               </span>
            </TableCell>

            <TableCell>
               <div className="mx-auto w-28 space-y-1">
                  <Label className="block text-center text-xs font-medium text-gray-600">
                     {comiss.completude}%
                  </Label>
                  <Progress
                     progress={comiss.completude}
                     color={progressColor}
                     size="sm"
                  />
               </div>
            </TableCell>
            <TableCell className="text-center whitespace-nowrap">
               <span
                  className={clsx(
                     "inline-flex items-center rounded-lg px-2.5 py-1 text-xs font-medium",
                     comiss.modulo
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-red-100 text-red-700"
                  )}
               >
                  {comiss.modulo ? "Sim" : "Não"}
               </span>
            </TableCell>

            <TableCell className="text-center whitespace-nowrap">
               <span className="font-semibold text-gray-900">{previsto}</span>
               <span className="ml-1 text-xs text-gray-500">dias</span>
            </TableCell>

            <TableCell className="text-center whitespace-nowrap">
               <span className="font-semibold text-gray-900">{computado}</span>
               <span className="ml-1 text-xs text-gray-500">dias</span>
            </TableCell>

            <TableCell className="text-center whitespace-nowrap">
               <span className="font-semibold text-gray-900">{restante}</span>
               <span className="ml-1 text-xs text-gray-500">dias</span>
            </TableCell>

            <TableCell className="text-center whitespace-nowrap">
               <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-gray-200 text-xs font-semibold text-gray-700">
                  {comiss.missoes_count}
               </span>
            </TableCell>
         </TableRow>

         {showDetail && (
            <DetailComiss
               show={showDetail}
               setShow={setShowDetail}
               comiss={comiss}
            />
         )}
      </>
   );
});
