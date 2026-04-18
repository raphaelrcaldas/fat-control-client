import { Button } from "flowbite-react";
import { CrewIndispList } from "services/routes/indisps";
import { useIndispModalActions } from "../../context/indispModalContext";
import { computeIndispStatus } from "../../utils/indispStatus";
import clsx from "clsx";

type IndispCellProps = {
   dateRef: Date;
   tripData: CrewIndispList;
};

export default function IndispCell({ dateRef, tripData }: IndispCellProps) {
   const { open } = useIndispModalActions();

   const { color, canOpen } = computeIndispStatus(tripData, dateRef);

   const handleClick = () => {
      open({ tripId: tripData.trip.id, dateRef });
   };

   return (
      <Button
         onClick={handleClick}
         disabled={!canOpen}
         className={clsx(
            "size-10 transition-all duration-200 disabled:opacity-90",
            canOpen && "hover:scale-110 hover:shadow-lg",
            color
         )}
         aria-label={
            canOpen ? "Abrir detalhes de indisponibilidade" : "Disponível"
         }
      >
         {""}
      </Button>
   );
}
