import { SectionWrapper } from "../../../components/SectionWrapper";
import { DadoCell } from "./DadoCell";

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
         {/* Tres colunas ja no celular: os valores sao curtos ("P", "ND") e,
             empilhados, a secao custava tres linhas para dizer o que cabe em
             uma. O numero da autorizacao trunca com `title`. */}
         <div className="grid grid-cols-3 gap-2 sm:gap-3">
            <DadoCell valor={docProp} label="Proposta" />
            <DadoCell valor={docAut} label="Autorização" />
            <DadoCell valor={docEnc || "ND"} label="Encerramento" />
         </div>
      </SectionWrapper>
   );
}
