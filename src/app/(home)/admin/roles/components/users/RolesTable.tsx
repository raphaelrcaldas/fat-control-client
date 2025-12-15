import { memo } from "react";
import {
   Table,
   TableBody,
   TableCell,
   TableHead,
   TableHeadCell,
   TableRow,
} from "flowbite-react";
import { FaUserShield } from "react-icons/fa6";
import type { RoleDetail } from "../../config/types";
import { getRoleTheme } from "../../config/roleThemes";

interface RolesTableProps {
   roles: RoleDetail[];
}

export const RolesTable = memo(function RolesTable({ roles }: RolesTableProps) {
   return (
      <div className='bg-white rounded-lg shadow-md overflow-hidden h-fit'>
         <div className='p-4 border-b bg-gray-50'>
            <h3 className='text-lg font-semibold text-gray-800 flex items-center gap-2'>
               <FaUserShield />
               Perfis Disponíveis
            </h3>
         </div>
         <div className='overflow-x-auto'>
            <Table hoverable>
               <TableHead>
                  <TableRow>
                     <TableHeadCell>Perfil</TableHeadCell>
                     <TableHeadCell>Descrição</TableHeadCell>
                  </TableRow>
               </TableHead>
               <TableBody className='divide-y'>
                  {roles.map((r) => {
                     const theme = getRoleTheme(r.name);
                     return (
                        <TableRow
                           key={r.id}
                           className='bg-white hover:bg-gray-50'
                        >
                           <TableCell>
                              <span
                                 className={`uppercase w-fit inline-block px-3 py-1 rounded-full text-xs font-medium ${theme.bg} ${theme.text}`}
                              >
                                 {r.name}
                              </span>
                           </TableCell>
                           <TableCell className='text-sm text-gray-600 uppercase'>
                              {r.description || "Sem descrição"}
                           </TableCell>
                        </TableRow>
                     );
                  })}
               </TableBody>
            </Table>
         </div>
      </div>
   );
});
