import { SectionWrapper } from "../../../components/SectionWrapper";

interface ComissDocumentosProps {
   docProp: string;
   docAut: string;
   docEnc: string | null;
}

export function ComissDocumentos({
   docProp,
   docAut,
   docEnc,
}: ComissDocumentosProps) {
   return (
      <SectionWrapper title="Documentos de Referência">
         <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <DocCell valor={docProp} label="Proposta" />
            <DocCell valor={docAut} label="Autorização" />
            <DocCell valor={docEnc || "ND"} label="Encerramento" />
         </div>
      </SectionWrapper>
   );
}

function DocCell({ valor, label }: { valor: string; label: string }) {
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
