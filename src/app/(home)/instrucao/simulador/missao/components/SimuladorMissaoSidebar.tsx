"use client";

import { Button } from "flowbite-react";
import { HiPlus } from "react-icons/hi";

import type { EtapaItem } from "services/routes/estatistica/etapas";
import type { SessaoFormState } from "../../helpers/sessaoDraft";
import MissaoObsField from "../../components/MissaoObsField";
import { SimuladorSessaoSidebarItem } from "./SimuladorSessaoSidebarItem";

interface SimuladorMissaoSidebarProps {
   obsId: string;
   pilotNames: string;
   /** Ano da listagem; sessao fora dele some do filtro e fica invisivel la. */
   anoRef: number;
   etapas: EtapaItem[];
   selectedEtapaId: number | null;
   formState: SessaoFormState;
   obs: string;
   obsDirty: boolean;
   canCreate: boolean;
   onObsChange: (value: string) => void;
   onSelectEtapa: (etapaId: number) => void;
   onAddEtapa: () => void;
}

export function SimuladorMissaoSidebar({
   obsId,
   pilotNames,
   anoRef,
   etapas,
   selectedEtapaId,
   formState,
   obs,
   obsDirty,
   canCreate,
   onObsChange,
   onSelectEtapa,
   onAddEtapa,
}: SimuladorMissaoSidebarProps) {
   return (
      <aside
         aria-label="Painel da missão de simulador"
         className="flex h-full max-w-80 flex-col border-r border-gray-200 bg-gray-50"
      >
         <div className="flex flex-col gap-3 border-b border-gray-200 bg-white p-4">
            <div className="flex flex-col gap-2">
               <div className="min-w-0">
                  <h2
                     className="truncate text-center text-base font-semibold text-gray-900 uppercase"
                     title={pilotNames}
                  >
                     {pilotNames}
                  </h2>
               </div>
               <MissaoObsField id={obsId} value={obs} onChange={onObsChange} />
               {obsDirty && (
                  <p className="text-xs text-amber-700">
                     Será salva junto da sessão.
                  </p>
               )}
            </div>
            {canCreate && (
               <Button
                  color="primary"
                  size="sm"
                  onClick={onAddEtapa}
                  className="w-full"
               >
                  <HiPlus className="mr-1 h-4 w-4" />
                  Nova sessão
               </Button>
            )}
         </div>

         <div className="flex-1 overflow-y-auto mask-[linear-gradient(to_bottom,transparent_0,black_16px,black_calc(100%-16px),transparent_100%)] p-3">
            {etapas.length === 0 && !canCreate ? (
               <p className="px-2 py-6 text-center text-sm text-gray-500">
                  Nenhuma sessão adicionada.
               </p>
            ) : (
               <ul className="flex flex-col gap-2">
                  {etapas.map((etapa, index) => {
                     const selected = etapa.id === selectedEtapaId;
                     return (
                        <li key={etapa.id}>
                           <SimuladorSessaoSidebarItem
                              numero={index + 1}
                              sessao={
                                 selected && formState.preview
                                    ? formState.preview
                                    : etapa
                              }
                              anoRef={anoRef}
                              selected={selected}
                              isDirty={selected && formState.isDirty}
                              onClick={() => onSelectEtapa(etapa.id)}
                           />
                        </li>
                     );
                  })}
                  {selectedEtapaId === null && canCreate && (
                     <li>
                        <SimuladorSessaoSidebarItem
                           numero={etapas.length + 1}
                           sessao={
                              formState.preview ?? {
                                 data: "",
                                 origem: "",
                                 destino: "",
                                 dep: "",
                                 arr: "",
                                 tvoo: 0,
                              }
                           }
                           anoRef={anoRef}
                           selected
                           isNew
                           onClick={onAddEtapa}
                        />
                     </li>
                  )}
               </ul>
            )}
         </div>
      </aside>
   );
}
