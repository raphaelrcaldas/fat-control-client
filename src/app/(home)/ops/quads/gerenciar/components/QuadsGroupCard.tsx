"use client";

import clsx from "clsx";
import { Button } from "flowbite-react";
import {
   FaPenToSquare,
   FaTrashCan,
   FaPlus,
   FaUserGroup,
} from "react-icons/fa6";
import { useFuncoes } from "@/hooks/queries";
import type { QuadType, QuadTypeGroup } from "services/routes/quads";

interface QuadsGroupCardProps {
   group: QuadTypeGroup;
   onEditGroup: (group: QuadTypeGroup) => void;
   onDeleteGroup: (group: QuadTypeGroup) => void;
   onAddType: (group: QuadTypeGroup) => void;
   onEditType: (group: QuadTypeGroup, type: QuadType) => void;
   onDeleteType: (group: QuadTypeGroup, type: QuadType) => void;
   onEditFuncs: (group: QuadTypeGroup, type: QuadType) => void;
}

export function QuadsGroupCard({
   group,
   onEditGroup,
   onDeleteGroup,
   onAddType,
   onEditType,
   onDeleteType,
   onEditFuncs,
}: QuadsGroupCardProps) {
   const { label, colors, ordem } = useFuncoes();

   return (
      <div className="rounded border border-slate-200 bg-white shadow-sm">
         <div className="flex items-center justify-between gap-3 border-b border-slate-200 px-4 py-3">
            <div className="min-w-0">
               <h2
                  className="truncate text-lg font-semibold text-slate-900 uppercase"
                  title={group.long}
               >
                  {group.long}
               </h2>
               <p className="text-xs font-medium tracking-wide text-slate-500 uppercase">
                  {group.short}
               </p>
            </div>
            <div className="flex shrink-0 items-center gap-2">
               <Button
                  color="light"
                  size="sm"
                  onClick={() => onEditGroup(group)}
                  aria-label={`Editar grupo ${group.short}`}
               >
                  <FaPenToSquare className="h-4 w-4" />
               </Button>
               <Button
                  color="light"
                  size="sm"
                  onClick={() => onDeleteGroup(group)}
                  aria-label={`Excluir grupo ${group.short}`}
               >
                  <FaTrashCan className="h-4 w-4 text-red-600" />
               </Button>
            </div>
         </div>

         <div className="divide-y divide-slate-200">
            {group.types.length === 0 ? (
               <p className="px-4 py-3 text-sm text-slate-500">
                  Nenhum tipo cadastrado neste grupo.
               </p>
            ) : (
               group.types.map((type) => (
                  <div
                     key={type.id}
                     className="flex items-center justify-between gap-3 px-4 py-3"
                  >
                     <div className="min-w-0">
                        <p
                           className="truncate font-medium text-slate-800 uppercase"
                           title={`${type.long} (${type.short})`}
                        >
                           {type.long}
                           <span className="ml-2 text-xs font-normal text-slate-500">
                              {type.short}
                           </span>
                        </p>
                        <div className="mt-1 flex flex-wrap items-center gap-1">
                           {type.funcs_list.length === 0 ? (
                              <span className="text-xs text-slate-500">
                                 Nenhuma função associada
                              </span>
                           ) : (
                              // O GET não ordena as funções; a ordem canônica é a
                              // do catálogo, a mesma que o modal envia.
                              [...type.funcs_list]
                                 .sort((a, b) => ordem(a) - ordem(b))
                                 .map((func) => (
                                    <span
                                       key={func}
                                       title={label(func)}
                                       className={clsx(
                                          "inline-flex items-center rounded border px-2 py-0.5 font-mono text-xs font-semibold uppercase",
                                          colors(func).badge
                                       )}
                                    >
                                       {func}
                                    </span>
                                 ))
                           )}
                        </div>
                     </div>
                     <div className="flex shrink-0 items-center gap-2">
                        <Button
                           color="light"
                           size="xs"
                           onClick={() => onEditFuncs(group, type)}
                           aria-label={`Editar funções de ${type.short}`}
                        >
                           {/* No celular só o ícone, para as ações caberem
                               ao lado do nome em vez de descerem de linha. */}
                           <FaUserGroup className="h-3 w-3 sm:mr-1" />
                           <span className="sr-only sm:not-sr-only">
                              Funções
                           </span>
                        </Button>
                        <Button
                           color="light"
                           size="xs"
                           onClick={() => onEditType(group, type)}
                           aria-label={`Editar tipo ${type.short}`}
                        >
                           <FaPenToSquare className="h-3 w-3" />
                        </Button>
                        <Button
                           color="light"
                           size="xs"
                           onClick={() => onDeleteType(group, type)}
                           aria-label={`Excluir tipo ${type.short}`}
                        >
                           <FaTrashCan className="h-3 w-3 text-red-600" />
                        </Button>
                     </div>
                  </div>
               ))
            )}
         </div>

         <div className="border-t border-slate-200 px-4 py-3">
            <Button
               color="light"
               size="sm"
               onClick={() => onAddType(group)}
               aria-label={`Novo tipo no grupo ${group.short}`}
            >
               <FaPlus className="mr-2 h-3 w-3" />
               Novo tipo
            </Button>
         </div>
      </div>
   );
}
