import { SectionWrapper } from "../../../components/SectionWrapper";

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
         <div className="grid grid-cols-3 gap-3">
            <StatusCell label="Status" valor={status} />
            <StatusCell label="Módulo" valor={modulo ? "Sim" : "Não"} />
            <StatusCell label="Dependente" valor={dep ? "Sim" : "Não"} />
         </div>
      </SectionWrapper>
   );
}

function StatusCell({ label, valor }: { label: string; valor: string }) {
   return (
      <div className="rounded bg-slate-50 p-3 text-center">
         <span className="block text-base font-semibold text-gray-900 uppercase">
            {valor}
         </span>
         <span className="text-xs tracking-wide text-gray-500 uppercase">
            {label}
         </span>
      </div>
   );
}
