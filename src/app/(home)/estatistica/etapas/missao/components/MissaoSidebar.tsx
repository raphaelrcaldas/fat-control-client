"use client";

import { useId } from "react";
import clsx from "clsx";
import { Button, Textarea, TextInput } from "flowbite-react";
import { CiPaperplane } from "react-icons/ci";
import { HiPlus, HiTrash } from "react-icons/hi";

import { EtapaSidebarItem, type EtapaStatus } from "./EtapaSidebarItem";
import { EDITOR_TOP_H } from "./MissaoEditorLayout";

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
   sagem: boolean;
   parte1: boolean;
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

// Campo "no lugar": sem moldura em repouso, borda só no hover/foco, para o
// título ler como título e continuar editável. Foco só com a borda (ring-0):
// borda de 0.8px + ring-1 da mesma cor renderizavam como linha dupla
const inlineFieldBase =
   "-mx-1.5 w-[calc(100%+0.75rem)] rounded border-transparent bg-transparent px-1.5 shadow-none placeholder:text-gray-400 hover:border-gray-200 focus:border-primary-500 focus:bg-white focus:ring-0";

function inlineField(extra: string) {
   return clsx(
      "-mx-1.5",
      "[&_input]:rounded [&_input]:border-transparent [&_input]:bg-transparent [&_input]:px-1.5 [&_input]:shadow-none [&_input]:placeholder:text-gray-400",
      "[&_input]:hover:border-gray-200 [&_input]:focus:border-primary-500 [&_input]:focus:bg-white [&_input]:focus:ring-0",
      extra
   );
}

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
   // useId: a sidebar existe duas vezes no DOM com o drawer aberto
   const tituloId = useId();

   return (
      <aside
         aria-label="Painel da missão"
         className="flex h-full w-full flex-col border-r border-gray-200 bg-gray-50"
      >
         {/* Masthead da página, no canto superior esquerdo como nas demais
             telas: espinha, caixa de ícone, eyebrow e título. Mesma altura do
             cabeçalho da etapa (EDITOR_TOP_H): as bordas formam uma linha só */}
         <div
            className={clsx(
               "relative flex shrink-0 items-center gap-3 border-b border-gray-200 bg-white py-2 pr-3 pl-4",
               EDITOR_TOP_H
            )}
         >
            <span
               aria-hidden
               className="bg-primary-600 absolute top-0 left-0 h-full w-1"
            />
            <div className="bg-primary-50 text-primary-600 ring-primary-100 grid h-10 w-10 shrink-0 place-items-center rounded-md ring-1 ring-inset">
               <CiPaperplane aria-hidden className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1">
               <label
                  htmlFor={tituloId}
                  className="text-primary-600 block font-mono text-[10px] font-bold tracking-[0.3em] uppercase"
               >
                  Missão
               </label>
               {onTituloChange !== undefined ? (
                  // Editável no lugar: parece título até receber o foco
                  <TextInput
                     id={tituloId}
                     value={tituloValue ?? ""}
                     onChange={(e) => onTituloChange(e.target.value)}
                     placeholder="Sem título"
                     autoComplete="off"
                     className={inlineField(
                        "[&_input]:min-h-[24px] [&_input]:py-0 [&_input]:text-xl [&_input]:leading-tight [&_input]:font-extrabold [&_input]:tracking-tight [&_input]:text-slate-900"
                     )}
                  />
               ) : (
                  <h2
                     id={tituloId}
                     className="truncate text-xl leading-tight font-extrabold tracking-tight text-slate-900"
                  >
                     {tituloMissao}
                  </h2>
               )}
               {onObsChange !== undefined && (
                  <Textarea
                     aria-label="Observações da missão"
                     value={obsValue ?? ""}
                     onChange={(e) => onObsChange(e.target.value)}
                     placeholder="Adicionar observação…"
                     rows={1}
                     className={clsx(
                        inlineFieldBase,
                        "min-h-[24px] resize-none py-1 text-xs text-gray-600"
                     )}
                  />
               )}
            </div>
         </div>

         <div className="min-h-0 flex-1 overflow-y-auto mask-[linear-gradient(to_bottom,transparent_0,black_16px,black_calc(100%-16px),transparent_100%)] p-3">
            <ul className="flex flex-col gap-2">
               {etapas.map((etapa) => (
                  <li key={etapa.localId}>
                     <EtapaSidebarItem
                        numero={etapa.numero}
                        data={etapa.data}
                        origem={etapa.origem}
                        destino={etapa.destino}
                        anv={etapa.anv}
                        depHora={etapa.depHora}
                        arrHora={etapa.arrHora}
                        tvooMin={etapa.tvooMin}
                        status={etapa.status}
                        sagem={etapa.sagem}
                        parte1={etapa.parte1}
                        selected={etapa.selected}
                        isModified={etapa.isModified}
                        isNew={etapa.isNew}
                        onClick={() => onSelectEtapa(etapa.localId)}
                     />
                  </li>
               ))}
            </ul>
         </div>

         {/* Rodapé fixo: ações sempre à mão, sem rolar a lista. Os dois
             botões com a mesma largura (flex-1 basis-0), não pelo texto. Cabe no
             drawer do mobile porque ele mede em dvh e a lista acima tem
             min-h-0 (rola sozinha em vez de empurrar o rodapé) */}
         <div className="flex shrink-0 items-center gap-2 border-t border-gray-200 bg-white p-3">
            <Button
               color="light"
               size="sm"
               onClick={onAddEtapa}
               className="flex-1 basis-0 font-semibold"
            >
               <HiPlus aria-hidden className="mr-1.5 h-4 w-4" />
               Nova etapa
            </Button>
            {onDeleteMissao && (
               <Button
                  color="light"
                  size="sm"
                  onClick={onDeleteMissao}
                  className="flex-1 basis-0 font-semibold text-red-700 hover:text-red-800"
               >
                  <HiTrash aria-hidden className="mr-1.5 h-4 w-4" />
                  Excluir missão
               </Button>
            )}
         </div>
      </aside>
   );
}
