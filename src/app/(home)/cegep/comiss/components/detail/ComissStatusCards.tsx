import { SectionWrapper } from "../../../components/SectionWrapper";
import { DadoCell } from "./DadoCell";

interface ComissStatusCardsProps {
   status: string;
   modulo: boolean;
   dep: boolean;
}

export function ComissStatusCards({
   status,
   modulo,
   dep,
}: ComissStatusCardsProps) {
   return (
      <SectionWrapper title="Classificação">
         <div className="grid grid-cols-3 gap-2 sm:gap-3">
            <DadoCell label="Status" valor={status} />
            <DadoCell label="Módulo" valor={modulo ? "Sim" : "Não"} />
            <DadoCell label="Dependente" valor={dep ? "Sim" : "Não"} />
         </div>
      </SectionWrapper>
   );
}
