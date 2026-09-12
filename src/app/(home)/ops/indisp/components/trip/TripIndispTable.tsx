"use client";

import clsx from "clsx";
import {
   Button,
   Table,
   TableBody,
   TableCell,
   TableHead,
   TableHeadCell,
   TableRow,
} from "flowbite-react";
import { isoDateToString } from "utils/dateHandler";
import { getIndispOption } from "@/constants/ops/indisponibilidades";
import { CrewIndisp, IndispType } from "services/routes/indisps";
import { useIndispModalActions } from "../../context/indispModalContext";

interface TripIndispTableProps {
   indisps: IndispType[];
   trip: CrewIndisp;
}

export function TripIndispTable({ indisps, trip }: TripIndispTableProps) {
   return (
      <div className="overflow-hidden rounded border border-slate-200 shadow-sm">
         <Table
            hoverable
            className="text-center uppercase"
            theme={{
               head: { cell: { base: "px-2 whitespace-nowrap" } },
               body: { cell: { base: "px-2 whitespace-nowrap" } },
            }}
         >
            <TableHead className="bg-gray-100">
               <TableRow>
                  <TableHeadCell className="font-bold">MOTIVO</TableHeadCell>
                  <TableHeadCell className="hidden font-bold md:table-cell">
                     OBS
                  </TableHeadCell>
                  <TableHeadCell className="font-bold">INÍCIO</TableHeadCell>
                  <TableHeadCell className="font-bold">FIM</TableHeadCell>
                  <TableHeadCell>
                     <span className="sr-only">Ações</span>
                  </TableHeadCell>
               </TableRow>
            </TableHead>
            <TableBody className="divide-y divide-slate-200">
               {indisps.map((indisp) => (
                  <TripIndispRow key={indisp.id} indisp={indisp} trip={trip} />
               ))}
            </TableBody>
         </Table>
      </div>
   );
}

function TripIndispRow({
   indisp,
   trip,
}: {
   indisp: IndispType;
   trip: CrewIndisp;
}) {
   const { openForm } = useIndispModalActions();
   const dateStart = isoDateToString(indisp.date_start);
   const dateEnd = isoDateToString(indisp.date_end);
   const indispProps = getIndispOption(indisp.mtv);

   return (
      <TableRow>
         <TableCell className="w-px font-semibold">
            <span
               title={indispProps?.label}
               className={clsx(
                  "inline-block rounded px-2 py-1",
                  indispProps?.bar
               )}
            >
               {indispProps?.value ?? indisp.mtv}
            </span>
         </TableCell>
         <TableCell className="hidden max-w-0 md:table-cell">
            <span className="block truncate" title={indisp.obs ?? undefined}>
               {indisp.obs || "—"}
            </span>
         </TableCell>
         <TableCell className="w-px font-medium tabular-nums">
            {dateStart}
         </TableCell>
         <TableCell className="w-px font-medium tabular-nums">
            {dateEnd}
         </TableCell>
         <TableCell className="w-px">
            {/* Sem gate aqui de propósito: quem decide entre editar e apenas
                consultar é o formulário, que conhece dono e permissão POR AÇÃO.
                Este botão pedia `create` para uma edição — ação errada — e,
                escondido, tirava também o histórico de quem tem direito de
                ler o registro sem poder alterá-lo. */}
            <div className="flex items-center justify-center">
               <Button
                  color="light"
                  size="sm"
                  aria-label={`Abrir ${indispProps?.label ?? indisp.mtv}, ${dateStart} a ${dateEnd}`}
                  onClick={() => openForm({ trip, indisp })}
               >
                  Abrir
               </Button>
            </div>
         </TableCell>
      </TableRow>
   );
}
