import {
   Button,
   Table,
   TableBody,
   TableCell,
   TableHead,
   TableHeadCell,
   TableRow,
} from "flowbite-react";
import { FaPlus, FaEdit, FaTrash } from "react-icons/fa";
import clsx from "clsx";
import { formatDate } from "../../utils/formatDate";
import type { CrewFunc } from "../../types/trip.types";

type FuncListProps = {
   funcs: CrewFunc[];
   onAdd: () => void;
   onEdit: (func: CrewFunc) => void;
   onDelete: (func: CrewFunc) => void;
};

export function FuncList({ funcs, onAdd, onEdit, onDelete }: FuncListProps) {
   return (
      <div>
         <div className="mb-3 flex items-center justify-between">
            <h4 className="text-sm font-semibold text-gray-700">
               Funções do Tripulante
            </h4>
            <Button
               size="sm"
               color="blue"
               onClick={onAdd}
               className="transition-all hover:scale-105"
            >
               <FaPlus className="mr-1.5 size-3.5" />
               Adicionar Função
            </Button>
         </div>
         {funcs.length > 0 ? (
            <div className="overflow-hidden rounded-lg border border-gray-200 shadow-sm">
               <Table className="text-center uppercase">
                  <TableHead>
                     <TableRow>
                        <TableHeadCell>Função</TableHeadCell>
                        <TableHeadCell>Oper</TableHeadCell>
                        <TableHeadCell>Data Op</TableHeadCell>
                        <TableHeadCell>Ações</TableHeadCell>
                     </TableRow>
                  </TableHead>
                  <TableBody>
                     {funcs.map((f) => (
                        <TableRow key={f.id} className="hover:bg-gray-50">
                           <TableCell className="font-semibold">
                              {f.func}
                           </TableCell>
                           <TableCell>
                              <span
                                 className={clsx(
                                    "rounded px-2 py-1 font-medium",
                                    {
                                       "bg-emerald-50 text-emerald-600":
                                          f.oper === "al",
                                       "bg-yellow-50 text-yellow-600":
                                          f.oper === "op" || f.oper === "ba",
                                       "bg-red-50 text-red-600":
                                          f.oper === "in",
                                    }
                                 )}
                              >
                                 {f.oper}
                              </span>
                           </TableCell>
                           <TableCell className="text-gray-600">
                              {formatDate(f.data_op)}
                           </TableCell>
                           <TableCell>
                              <div className="flex justify-center gap-2">
                                 <button
                                    type="button"
                                    onClick={() => onEdit(f)}
                                    className="rounded-lg border border-blue-200 bg-blue-50 p-2 text-blue-600 transition-all hover:border-blue-300 hover:bg-blue-100 focus:ring-2 focus:ring-blue-200 focus:outline-none"
                                    title="Editar função"
                                 >
                                    <FaEdit className="size-3.5" />
                                 </button>
                                 <button
                                    type="button"
                                    onClick={() => onDelete(f)}
                                    className="rounded-lg border border-red-200 bg-red-50 p-2 text-red-600 transition-all hover:border-red-300 hover:bg-red-100 focus:ring-2 focus:ring-red-200 focus:outline-none"
                                    title="Excluir função"
                                 >
                                    <FaTrash className="size-3.5" />
                                 </button>
                              </div>
                           </TableCell>
                        </TableRow>
                     ))}
                  </TableBody>
               </Table>
            </div>
         ) : (
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-8 text-center">
               <p className="mb-2 text-sm text-gray-500">
                  Nenhuma função cadastrada
               </p>
               <p className="text-xs text-gray-400">
                  Clique em "Adicionar Função" para começar
               </p>
            </div>
         )}
      </div>
   );
}
