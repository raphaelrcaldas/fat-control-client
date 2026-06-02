"use client";

import { Button } from "flowbite-react";
import {
   FaPenToSquare,
   FaTrashCan,
   FaPlus,
   FaUserGroup,
} from "react-icons/fa6";
import { getFuncLabel } from "@/constants";
import type { FuncType } from "@/constants";
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
   return (
      <div className="rounded-xl bg-white shadow-sm ring-1 ring-gray-200">
         <div className="flex items-center justify-between gap-3 border-b border-gray-100 px-4 py-3">
            <div className="min-w-0">
               <h3 className="truncate text-lg font-semibold text-gray-900 uppercase">
                  {group.long}
               </h3>
               <p className="text-xs font-medium tracking-wide text-gray-400 uppercase">
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
                  color="red"
                  size="sm"
                  onClick={() => onDeleteGroup(group)}
                  aria-label={`Excluir grupo ${group.short}`}
               >
                  <FaTrashCan className="h-4 w-4" />
               </Button>
            </div>
         </div>

         <div className="divide-y divide-gray-100">
            {group.types.length === 0 ? (
               <p className="px-4 py-3 text-sm text-gray-400">
                  Nenhum tipo cadastrado neste grupo.
               </p>
            ) : (
               group.types.map((type) => (
                  <div
                     key={type.id}
                     className="flex flex-col gap-2 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
                  >
                     <div className="min-w-0">
                        <p className="font-medium text-gray-800 uppercase">
                           {type.long}
                           <span className="ml-2 text-xs font-normal text-gray-400">
                              {type.short}
                           </span>
                        </p>
                        <div className="mt-1 flex flex-wrap items-center gap-1">
                           {type.funcs_list.length === 0 ? (
                              <span className="text-xs text-gray-400">
                                 Nenhuma função associada
                              </span>
                           ) : (
                              type.funcs_list.map((func) => (
                                 <span
                                    key={func}
                                    className="inline-flex items-center rounded-full bg-red-50 px-2 py-0.5 text-xs font-medium text-red-700"
                                 >
                                    {getFuncLabel(func as FuncType, true)}
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
                           <FaUserGroup className="mr-1 h-3 w-3" />
                           Funções
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
                           color="red"
                           size="xs"
                           onClick={() => onDeleteType(group, type)}
                           aria-label={`Excluir tipo ${type.short}`}
                        >
                           <FaTrashCan className="h-3 w-3" />
                        </Button>
                     </div>
                  </div>
               ))
            )}
         </div>

         <div className="border-t border-gray-100 px-4 py-3">
            <Button
               color="light"
               size="sm"
               onClick={() => onAddType(group)}
               aria-label={`Adicionar tipo ao grupo ${group.short}`}
            >
               <FaPlus className="mr-2 h-3 w-3" />
               Novo tipo
            </Button>
         </div>
      </div>
   );
}
