"use client";

import { Button } from "flowbite-react";
import { HiPlus, HiTrash } from "react-icons/hi";
import { EtapaSidebarItem, type EtapaStatus } from "./EtapaSidebarItem";

export type SidebarEtapa = {
   localId: string;
   numero: string;
   data: string;
   origem: string;
   destino: string;
   anv: string;
   depHora: string;
   arrHora: string;
   tvooMin: number;
   status: EtapaStatus;
   selected: boolean;
   isModified?: boolean;
   isNew?: boolean;
};

type Props = {
   tituloMissao: string;
   etapas: SidebarEtapa[];
   onAddEtapa: () => void;
   onSelectEtapa: (localId: string) => void;
   onTituloChange?: (value: string) => void;
   tituloValue?: string | null;
   onObsChange?: (value: string) => void;
   obsValue?: string | null;
   onDeleteMissao?: () => void;
};

export function MissaoSidebar({
   tituloMissao,
   etapas,
   onAddEtapa,
   onSelectEtapa,
   onTituloChange,
   tituloValue,
   onObsChange,
   obsValue,
   onDeleteMissao,
}: Props) {
   return (
      <aside className="flex h-full max-w-80 flex-col border-r border-gray-200 bg-gray-50">
         <div className="flex flex-col gap-3 border-b border-gray-200 bg-white p-4">
            <div className="flex flex-col gap-2">
               {onTituloChange !== undefined ? (
                  <input
                     type="text"
                     value={tituloValue ?? ""}
                     onChange={(e) => onTituloChange(e.target.value)}
                     placeholder="Título da missão (opcional)"
                     className="w-full rounded-md border border-gray-200 bg-gray-50 px-3 py-1.5 text-base font-semibold text-gray-900 placeholder:text-gray-400 focus:border-red-400 focus:ring-1 focus:ring-red-400 focus:outline-none"
                  />
               ) : (
                  <h2 className="text-lg font-semibold text-gray-900">
                     {tituloMissao}
                  </h2>
               )}
               {onObsChange !== undefined && (
                  <textarea
                     value={obsValue ?? ""}
                     onChange={(e) => onObsChange(e.target.value)}
                     placeholder="Observações da missão (opcional)"
                     rows={2}
                     className="w-full resize-y rounded-md border border-gray-200 bg-gray-50 px-3 py-1.5 text-xs text-gray-700 placeholder:text-gray-400 focus:border-red-400 focus:ring-1 focus:ring-red-400 focus:outline-none"
                  />
               )}
            </div>
            <Button
               color="red"
               size="sm"
               onClick={onAddEtapa}
               className="w-full"
            >
               <HiPlus className="mr-1 h-4 w-4" />
               Nova etapa
            </Button>
         </div>

         <div className="flex-1 overflow-y-auto mask-[linear-gradient(to_bottom,transparent_0,black_16px,black_calc(100%-16px),transparent_100%)] p-3">
            {etapas.length === 0 ? (
               <p className="px-2 py-6 text-center text-sm text-gray-400">
                  Nenhuma etapa adicionada.
               </p>
            ) : (
               <ul className="flex flex-col gap-2">
                  {etapas.map((etapa) => (
                     <li key={etapa.localId}>
                        <EtapaSidebarItem
                           data={etapa.data}
                           origem={etapa.origem}
                           destino={etapa.destino}
                           anv={etapa.anv}
                           depHora={etapa.depHora}
                           arrHora={etapa.arrHora}
                           tvooMin={etapa.tvooMin}
                           status={etapa.status}
                           selected={etapa.selected}
                           isModified={etapa.isModified}
                           isNew={etapa.isNew}
                           onClick={() => onSelectEtapa(etapa.localId)}
                        />
                     </li>
                  ))}
               </ul>
            )}
         </div>

         {onDeleteMissao && (
            <div className="border-t border-gray-200 bg-white px-4 py-3">
               <button
                  type="button"
                  onClick={onDeleteMissao}
                  className="flex w-full items-center justify-center gap-1.5 rounded-md border border-red-200 bg-red-50 px-3 py-1.5 text-sm font-medium text-red-600 transition hover:bg-red-100"
               >
                  <HiTrash className="h-4 w-4" />
                  Excluir missão
               </button>
            </div>
         )}
      </aside>
   );
}
