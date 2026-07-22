import { Select, Label, TextInput } from "flowbite-react";
import { SectionWrapper } from "../../../components/SectionWrapper";

interface DocumentoSectionProps {
   tipoDoc: string;
   setTipoDoc: (value: string) => void;
   nDoc: string;
   setNDoc: (value: string) => void;
   editMode: boolean;
}

export function DocumentoSection({
   tipoDoc,
   setTipoDoc,
   nDoc,
   setNDoc,
   editMode,
}: DocumentoSectionProps) {
   return (
      <SectionWrapper title="Documento de Referência">
         <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
               <Label
                  htmlFor="doc-tipo-ordem"
                  className="text-sm font-medium text-slate-600"
               >
                  Tipo de Ordem
               </Label>
               {editMode ? (
                  <Select
                     id="doc-tipo-ordem"
                     value={tipoDoc}
                     onChange={(e) => setTipoDoc(e.target.value)}
                     className="w-full"
                  >
                     <option value=""></option>
                     <option value="om">Ordem de Missão</option>
                     <option value="os">Ordem de Serviço</option>
                  </Select>
               ) : (
                  <div className="rounded border border-slate-200 bg-white px-4 py-2">
                     <span className="text-base font-semibold text-slate-800 uppercase">
                        {tipoDoc}
                     </span>
                  </div>
               )}
            </div>
            <div className="space-y-2">
               <Label
                  htmlFor="doc-n-documento"
                  className="text-sm font-medium text-slate-600"
               >
                  Nº do Documento
               </Label>
               {editMode ? (
                  <TextInput
                     id="doc-n-documento"
                     className="w-full"
                     value={nDoc}
                     onChange={(e) => setNDoc(e.target.value)}
                     onKeyDown={(e) => {
                        if (!(
                           (e.key >= "0" && e.key <= "9") ||
                           [
                              "Backspace",
                              "Tab",
                              "Delete",
                              "ArrowLeft",
                              "ArrowRight",
                           ].includes(e.key)
                        )) {
                           e.preventDefault();
                        }
                     }}
                  />
               ) : (
                  <div className="rounded border border-slate-200 bg-white px-4 py-2">
                     <span className="text-base font-semibold text-slate-800">
                        {nDoc}
                     </span>
                  </div>
               )}
            </div>
         </div>
      </SectionWrapper>
   );
}
