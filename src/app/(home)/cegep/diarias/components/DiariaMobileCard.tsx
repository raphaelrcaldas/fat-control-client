"use client";

import { HiPencil, HiTrash } from "react-icons/hi";
import type { DiariaValorPublic, GrupoCidadePublic } from "../types";
import { formatCurrency, formatDate, getStatusBadge, getCidadeDisplayName } from "../utils";

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
      <div className="rounded-lg border border-gray-200 bg-white p-3">
         <div className="flex items-start justify-between">
            <div className="flex-1">
               <p className="font-medium text-gray-700">{cidadeNome}</p>
               <p className="font-mono text-lg font-semibold text-green-600">
                  {formatCurrency(valor.valor)}
               </p>
            </div>
            <div className="flex gap-2">
               <button
                  onClick={() => onEdit(valor)}
                  className="rounded-lg p-2 text-gray-600 hover:bg-gray-100 hover:text-blue-600"
                  aria-label="Editar"
               >
                  <HiPencil className="h-5 w-5" />
               </button>
               <button
                  onClick={() => onDelete(valor.id)}
                  className="rounded-lg p-2 text-gray-600 hover:bg-gray-100 hover:text-red-600"
                  aria-label="Excluir"
               >
                  <HiTrash className="h-5 w-5" />
               </button>
            </div>
         </div>
         <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-gray-500">
            <span className="font-mono">
               {formatDate(valor.data_inicio)} &rarr; {formatDate(valor.data_fim)}
            </span>
            {getStatusBadge(valor.status)}
         </div>
      </div>
   );
}
