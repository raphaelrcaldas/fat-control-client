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
         <div className='flex items-center justify-between mb-3'>
            <h4 className='text-sm font-semibold text-gray-700'>
               Funções do Tripulante
            </h4>
            <Button
               size='sm'
               color='blue'
               onClick={onAdd}
               className='transition-all hover:scale-105'
            >
               <FaPlus className='size-3.5 mr-1.5' />
               Adicionar Função
            </Button>
         </div>
         {funcs.length > 0 ? (
            <div className='border border-gray-200 rounded-lg overflow-hidden shadow-sm'>
               <Table className='text-center uppercase'>
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
                        <TableRow key={f.id} className='hover:bg-gray-50'>
                           <TableCell className='font-semibold'>
                              {f.func}
                           </TableCell>
                           <TableCell>
                              <span
                                 className={clsx(
                                    "px-2 py-1 rounded font-medium",
                                    {
                                       "text-emerald-600 bg-emerald-50":
                                          f.oper === "al",
                                       "text-yellow-600 bg-yellow-50":
                                          f.oper === "op" || f.oper === "ba",
                                       "text-red-600 bg-red-50":
                                          f.oper === "in",
                                    }
                                 )}
                              >
                                 {f.oper}
                              </span>
                           </TableCell>
                           <TableCell className='text-gray-600'>
                              {formatDate(f.data_op)}
                           </TableCell>
                           <TableCell>
                              <div className='flex gap-2 justify-center'>
                                 <button
                                    type='button'
                                    onClick={() => onEdit(f)}
                                    className='text-blue-600 bg-blue-50 border border-blue-200 hover:bg-blue-100 hover:border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-200 rounded-lg p-2 transition-all'
                                    title='Editar função'
                                 >
                                    <FaEdit className='size-3.5' />
                                 </button>
                                 <button
                                    type='button'
                                    onClick={() => onDelete(f)}
                                    className='text-red-600 bg-red-50 border border-red-200 hover:bg-red-100 hover:border-red-300 focus:outline-none focus:ring-2 focus:ring-red-200 rounded-lg p-2 transition-all'
                                    title='Excluir função'
                                 >
                                    <FaTrash className='size-3.5' />
                                 </button>
                              </div>
                           </TableCell>
                        </TableRow>
                     ))}
                  </TableBody>
               </Table>
            </div>
         ) : (
            <div className='p-8 text-center bg-gray-50 rounded-lg border border-gray-200'>
               <p className='text-gray-500 text-sm mb-2'>
                  Nenhuma função cadastrada
               </p>
               <p className='text-gray-400 text-xs'>
                  Clique em "Adicionar Função" para começar
               </p>
            </div>
         )}
      </div>
   );
}
