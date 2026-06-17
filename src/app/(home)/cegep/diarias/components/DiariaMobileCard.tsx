"use client";

import { Tooltip } from "flowbite-react";
import { HiPencil, HiTrash } from "react-icons/hi";
import { PermBased } from "../../../hooks/usePermBased";
import type { DiariaValorPublic, GrupoCidadePublic } from "../types";
import {
   formatCurrency,
   formatDiariaDate,
   getStatusBadge,
   getCidadeDisplayName,
} from "../utils";

interface DiariaMobileCardProps {
   valor: DiariaValorPublic;
   cidades: GrupoCidadePublic[];
   onEdit: (valor: DiariaValorPublic) => void;
   onDelete: (id: number) => void;
}

export function DiariaMobileCard({
   valor,
   cidades,
   onEdit,
   onDelete,
}: DiariaMobileCardProps) {
   const cidadeNome = getCidadeDisplayName(valor.grupo_cid, cidades);

   return (
      <div className="rounded border border-slate-200 bg-white p-3 shadow-sm">
         <div className="flex items-start justify-between">
            <div className="flex-1">
               <p className="font-medium text-gray-700">{cidadeNome}</p>
               <p className="font-mono text-lg font-semibold text-green-600">
                  {formatCurrency(valor.valor)}
               </p>
            </div>
            <div className="flex gap-1">
               <PermBased resource="diarias" requiredPerm="update">
                  <Tooltip content="Editar valor">
                     <button
                        type="button"
                        onClick={() => onEdit(valor)}
                        className="rounded p-2 text-gray-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
                        aria-label="Editar valor de diária"
                     >
                        <HiPencil className="h-5 w-5" />
                     </button>
                  </Tooltip>
               </PermBased>
               <PermBased resource="diarias" requiredPerm="delete">
                  <Tooltip content="Excluir valor">
                     <button
                        type="button"
                        onClick={() => onDelete(valor.id)}
                        className="rounded p-2 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-600"
                        aria-label="Excluir valor de diária"
                     >
                        <HiTrash className="h-5 w-5" />
                     </button>
                  </Tooltip>
               </PermBased>
            </div>
         </div>
         <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-gray-500">
            <span className="font-mono">
               {formatDiariaDate(valor.data_inicio)} &rarr;{" "}
               {formatDiariaDate(valor.data_fim)}
            </span>
            {getStatusBadge(valor.status)}
         </div>
      </div>
   );
}
