import type { Dupla } from "../../types";
import { DuplaCard } from "./DuplaCard";

interface DuplasListProps {
   duplas: Dupla[];
   onDeleteDupla: (dupla: Dupla) => void;
   isDeletingDupla: boolean;
}

export function DuplasList({
   duplas,
   onDeleteDupla,
   isDeletingDupla,
}: DuplasListProps) {
   return (
      <div className="space-y-2">
         {duplas.map((dupla) => (
            <DuplaCard
               key={dupla.key}
               dupla={dupla}
               onDeleteDupla={onDeleteDupla}
               isDeletingDupla={isDeletingDupla}
            />
         ))}
      </div>
   );
}
