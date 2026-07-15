import clsx from "clsx";
import { Button } from "flowbite-react";
import { INDISP_OPTIONS } from "@/constants/ops/indisponibilidades";
import { CrewIndispList } from "services/routes/indisps";
import { useIndispModalActions } from "../context/indispModalContext";
import { computeIndispStatus } from "../utils/indispStatus";

type IndispCellProps = {
   dateRef: Date;
   tripData: CrewIndispList;
};

export function IndispCell({ dateRef, tripData }: IndispCellProps) {
   const { open } = useIndispModalActions();

   const { color, canOpen, filterIndisp } = computeIndispStatus(
      tripData,
      dateRef
   );
   // Mesma ordem de prioridade do getStatusColor (INDISP_OPTIONS) — garante
   // que a sigla estampada corresponde à cor de fundo exibida.
   const shownOption = INDISP_OPTIONS.find((o) =>
      filterIndisp.some((i) => i.mtv === o.value)
   );
   const sigla = shownOption?.value.toUpperCase();

   const handleClick = () => {
      open({ tripId: tripData.trip.id, dateRef });
   };

   return (
      <Button
         onClick={handleClick}
         disabled={!canOpen}
         className={clsx(
            "size-10 rounded transition-all duration-200 disabled:opacity-90",
            canOpen && "hover:scale-110 hover:shadow-lg",
            color
         )}
         aria-label={
            canOpen ? "Abrir detalhes de indisponibilidade" : "Disponível"
         }
      >
         {sigla && (
            <span
               className={clsx(
                  "text-[10px] font-semibold",
                  shownOption.color.sigla
               )}
            >
               {sigla}
            </span>
         )}
      </Button>
   );
}
