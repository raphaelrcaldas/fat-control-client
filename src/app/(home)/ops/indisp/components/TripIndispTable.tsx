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
import { PermBased } from "@/app/(home)/hooks/usePermBased";
import { CrewIndisp, IndispType } from "services/routes/indisps";
import { useIndispModalActions } from "../context/indispModalContext";

interface TripIndispTableProps {
   indisps: IndispType[];
   trip: CrewIndisp;
}

export function TripIndispTable({ indisps, trip }: TripIndispTableProps) {
   return (
      <div className="overflow-hidden rounded border border-slate-200 shadow">
         <Table hoverable className="text-center uppercase">
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
         <TableCell className="h-10 p-1 font-semibold">
            <span className={clsx("rounded-md p-2", indispProps?.color.bg)}>
               {indispProps?.value}
            </span>
         </TableCell>
         <TableCell className="hidden h-10 p-1 whitespace-pre-line md:table-cell">
            {indisp.obs}
         </TableCell>
         <TableCell className="h-10 p-1 font-semibold">{dateStart}</TableCell>
         <TableCell className="h-10 p-1 font-semibold">{dateEnd}</TableCell>
         <TableCell className="h-10 p-1">
            <div className="flex items-center justify-center">
               <PermBased requiredPerm="create" resource="indisp_trips">
                  <Button
                     pill
                     color="light"
                     size="sm"
                     onClick={() => openForm({ trip, indisp })}
                  >
                     Editar
                  </Button>
               </PermBased>
            </div>
         </TableCell>
      </TableRow>
   );
}
