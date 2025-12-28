"use client";

import { HiPencil, HiTrash } from "react-icons/hi";
import type { DiariaValorPublic, GrupoCidadePublic } from "../types";
import {
   formatCurrency,
   formatDate,
   getStatusBadge,
   getCidadeDisplayName,
} from "../utils";

interface DiariaTableProps {
   valores: DiariaValorPublic[];
   cidadesByGrupo: Map<number, GrupoCidadePublic[]>;
   onEdit: (valor: DiariaValorPublic) => void;
   onDelete: (id: number) => void;
}

export function DiariaTable({
   valores,
   cidadesByGrupo,
   onEdit,
   onDelete,
}: DiariaTableProps) {
   return (
      <div className="hidden overflow-x-auto md:block">
         <table className="w-full text-left text-sm text-gray-600">
            <thead className="border-b border-gray-200 bg-white text-xs text-gray-700 uppercase">
               <tr>
                  <th className="px-3 py-2">Grupo Cidade</th>
                  <th className="px-3 py-2">Valor</th>
                  <th className="px-3 py-2">Inicio</th>
                  <th className="px-3 py-2">Fim</th>
                  <th className="px-3 py-2">Status</th>
                  <th className="px-3 py-2"></th>
               </tr>
            </thead>
            <tbody>
               {valores.map((valor) => {
                  const cidades = cidadesByGrupo.get(valor.grupo_cid) || [];
                  const cidadeNome = getCidadeDisplayName(
                     valor.grupo_cid,
                     cidades
                  );

                  return (
                     <tr
                        key={valor.id}
                        className="border-b border-gray-100 bg-white hover:bg-gray-50"
                     >
                        <td className="px-3 py-2">
                           <span className="text-gray-700">{cidadeNome}</span>
                        </td>
                        <td className="px-3 py-2">
                           <span className="font-mono font-semibold text-green-600">
                              {formatCurrency(valor.valor)}
                           </span>
                        </td>
                        <td className="px-3 py-2 font-mono text-gray-600">
                           {formatDate(valor.data_inicio)}
                        </td>
                        <td className="px-3 py-2 font-mono text-gray-600">
                           {formatDate(valor.data_fim)}
                        </td>
                        <td className="px-3 py-2">
                           {getStatusBadge(valor.status)}
                        </td>
                        <td className="px-3 py-2">
                           <div className="flex gap-2">
                              <button
                                 onClick={() => onEdit(valor)}
                                 className="text-gray-600 hover:text-blue-600"
                                 aria-label="Editar"
                              >
                                 <HiPencil className="h-5 w-5" />
                              </button>
                              <button
                                 onClick={() => onDelete(valor.id)}
                                 className="text-gray-600 hover:text-red-600"
                                 aria-label="Excluir"
                              >
                                 <HiTrash className="h-5 w-5" />
                              </button>
                           </div>
                        </td>
                     </tr>
                  );
               })}
            </tbody>
         </table>
      </div>
   );
}
