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
      <div className="hidden gap-4 md:grid md:grid-cols-3">
         <DocCard valor={docProp} label="Proposta" />
         <DocCard valor={docAut} label="Autorizacao" />
         <DocCard valor={docEnc || "ND"} label="Encerramento" />
      </div>
   );
}

function DocCard({ valor, label }: { valor: string; label: string }) {
   return (
      <div className="rounded border border-gray-200 bg-white p-4 text-center shadow-sm">
         <span className="block text-base font-semibold text-gray-900 uppercase">
            {valor}
         </span>
         <span className="text-xs tracking-wide text-gray-500 uppercase">
            {label}
         </span>
      </div>
   );
}
