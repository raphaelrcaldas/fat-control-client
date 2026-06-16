"use client";
import { Tooltip, TableCell } from "flowbite-react";
import { isoDateToString } from "@/../utils/dateHandler";
import { getDateBadgeClasses, getDateTooltip } from "../utils";

interface CardDateCellProps {
   iso: string | null;
   label: string;
}

/** Célula de validade de cartão: badge colorido por proximidade do vencimento + tooltip. */
export function CardDateCell({ iso, label }: CardDateCellProps) {
   return (
      <TableCell className="px-0.5 text-center">
         <Tooltip
            content={getDateTooltip(iso, label)}
            theme={{ target: "mx-auto w-fit" }}
         >
            <span className={getDateBadgeClasses(iso)}>
               {iso ? isoDateToString(iso) : "NIL"}
            </span>
         </Tooltip>
      </TableCell>
   );
}
