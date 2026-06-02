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
import type { RoleDetail } from "services/routes/security/roles";
import { getRoleTheme } from "@/constants/admin/roles";

interface RolesTableProps {
   roles: RoleDetail[];
}

export const RolesTable = memo(function RolesTable({ roles }: RolesTableProps) {
   return (
      <div className="h-fit overflow-hidden rounded-md border border-slate-300 bg-white shadow-md">
         <div className="border-b border-gray-200 bg-gray-50 p-4">
            <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-800">
               <FaUserShield />
               Perfis Disponíveis
            </h3>
         </div>
         <div className="overflow-x-auto">
            <Table hoverable>
               <TableHead>
                  <TableRow>
                     <TableHeadCell>Perfil</TableHeadCell>
                     <TableHeadCell>Descrição</TableHeadCell>
                  </TableRow>
               </TableHead>
               <TableBody className="divide-y divide-gray-200">
                  {roles.map((r) => {
                     const theme = getRoleTheme(r.name);
                     return (
                        <TableRow
                           key={r.id}
                           className="bg-white hover:bg-gray-50"
                        >
                           <TableCell>
                              <span
                                 className={`inline-block w-fit rounded-full px-3 py-1 text-xs font-medium uppercase ${theme.bg} ${theme.text}`}
                              >
                                 {r.name}
                              </span>
                           </TableCell>
                           <TableCell className="text-sm text-gray-600 uppercase">
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
