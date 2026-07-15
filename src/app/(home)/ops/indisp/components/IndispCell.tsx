import clsx from "clsx";
import { Button } from "flowbite-react";
import { CrewIndispList } from "services/routes/indisps";
import { useIndispModalActions } from "../context/indispModalContext";
import { computeIndispStatus } from "../utils/indispStatus";

type IndispCellProps = {
   dateRef: Date;
   tripData: CrewIndispList;
};

export function IndispCell({ dateRef, tripData }: IndispCellProps) {
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
            // Quadrado perfeito em qualquer tela: 35px no mouse, 44px no toque.
            // O tema global só força min-h no coarse — igualamos a largura para
            // não virar retângulo. p-0 evita o padding do Button distorcer.
            "size-10 shrink-0 rounded p-0 transition-all duration-200 disabled:opacity-90 pointer-coarse:size-[44px]",
            canOpen && "hover:scale-110 hover:shadow-lg",
            color
         )}
         aria-label={
            canOpen ? "Abrir detalhes de indisponibilidade" : "Disponível"
         }
      />
   );
}
