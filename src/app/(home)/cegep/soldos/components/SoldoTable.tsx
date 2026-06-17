import { SoldoPublic } from "services/routes/cegep/soldos";
import SoldoTableDesktop from "./SoldoTableDesktop";
import SoldoCardList from "./SoldoCardList";

interface SoldoTableProps {
   soldos: SoldoPublic[];
   onEdit: (soldo: SoldoPublic) => void;
   onDelete: (soldo: SoldoPublic) => void;
}

/** Decide o layout por breakpoint: tabela no desktop, cards no mobile. */
export default function SoldoTable({
   soldos,
   onEdit,
   onDelete,
}: SoldoTableProps) {
   return (
      <>
         <SoldoTableDesktop
            soldos={soldos}
            onEdit={onEdit}
            onDelete={onDelete}
         />
         <SoldoCardList soldos={soldos} onEdit={onEdit} onDelete={onDelete} />
      </>
   );
}
