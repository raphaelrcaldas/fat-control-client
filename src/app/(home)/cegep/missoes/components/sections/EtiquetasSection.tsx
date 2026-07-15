import { Spinner } from "flowbite-react";
import { HiTag, HiX } from "react-icons/hi";
import { Etiqueta } from "services/routes/cegep/missoes";
import { useEtiquetasMissoes } from "@/hooks/queries/useEtiquetasMissoes";
import { SectionWrapper } from "../SectionWrapper";

interface EtiquetasSectionProps {
   etiquetasMissao: Etiqueta[];
   editMode: boolean;
   toggleEtiqueta: (etiqueta: Etiqueta) => void;
}

export function EtiquetasSection({
   etiquetasMissao,
   editMode,
   toggleEtiqueta,
}: EtiquetasSectionProps) {
   const { data: etiquetasDisponiveis = [], isLoading: loadingEtiquetas } =
      useEtiquetasMissoes();

   return (
      <SectionWrapper title="Etiquetas">
         {etiquetasMissao.length > 0 && (
            <div className="mb-3">
               <div className="flex flex-wrap gap-2">
                  {etiquetasMissao.map((etiqueta) => (
                     <span
                        key={etiqueta.id}
                        className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium text-white"
                        style={{ backgroundColor: etiqueta.cor }}
                     >
                        <HiTag className="h-3 w-3" />
                        {etiqueta.nome}
                        {editMode && (
                           <button
                              onClick={() => toggleEtiqueta(etiqueta)}
                              className="ml-0.5 rounded-full p-0.5 hover:bg-white/20"
                              title="Remover etiqueta"
                           >
                              <HiX className="h-3 w-3" />
                           </button>
                        )}
                     </span>
                  ))}
               </div>
            </div>
         )}

         {editMode && (
            <div>
               {loadingEtiquetas ? (
                  <div className="flex items-center gap-2 text-sm text-slate-500">
                     <Spinner className="h-4 w-4" color="primary" />
                     Carregando etiquetas...
                  </div>
               ) : etiquetasDisponiveis.length === 0 ? (
                  <p className="text-sm text-slate-500 italic">
                     Nenhuma etiqueta disponível. Crie etiquetas na aba
                     Configurações.
                  </p>
               ) : (
                  <div className="flex flex-wrap gap-2">
                     {etiquetasDisponiveis
                        .filter(
                           (e) => !etiquetasMissao.some((em) => em.id === e.id)
                        )
                        .map((etiqueta) => (
                           <button
                              key={etiqueta.id}
                              onClick={() => toggleEtiqueta(etiqueta)}
                              className="inline-flex items-center gap-1.5 rounded-full border border-dashed px-2.5 py-1 text-xs font-medium"
                              style={{
                                 borderColor: etiqueta.cor,
                                 color: etiqueta.cor,
                                 backgroundColor: `${etiqueta.cor}10`,
                              }}
                              title={
                                 etiqueta.descricao || "Clique para adicionar"
                              }
                           >
                              <HiTag className="h-3 w-3" />
                              {etiqueta.nome}
                           </button>
                        ))}
                  </div>
               )}
            </div>
         )}

         {!editMode && etiquetasMissao.length === 0 && (
            <p className="text-sm text-slate-500 italic">
               Nenhuma etiqueta atribuída a esta missão.
            </p>
         )}
      </SectionWrapper>
   );
}
