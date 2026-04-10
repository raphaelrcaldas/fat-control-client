"use client";

import {
   Table,
   TableHead,
   TableBody,
   TableRow,
   TableCell,
   TableHeadCell,
} from "flowbite-react";
import { HiCheckCircle } from "react-icons/hi";
import { UserPublic } from "services/routes/users";
import { useRouter } from "next/navigation";
import { unidadeOptions } from "@/constants/militar/unidades";
import { formatSaram } from "@/constants/formats/saram";
import clsx from "clsx";

interface UserTableProps {
   usuarios: UserPublic[];
   loading: boolean;
}

export function UserTable({ usuarios, loading }: UserTableProps) {
   const router = useRouter();

   return (
      <div
         className={`hidden min-h-100 overflow-x-auto md:block ${loading ? "opacity-50" : "opacity-100"} transition-opacity duration-200`}
      >
         <Table hoverable theme={{body:{cell:{base:"py-1.5"}}}}>
            <TableHead>
               <TableRow>
                  <TableHeadCell># ID</TableHeadCell>
                  <TableHeadCell>P/G</TableHeadCell>
                  <TableHeadCell>Especialidade</TableHeadCell>
                  <TableHeadCell>Nome de Guerra</TableHeadCell>
                  <TableHeadCell>Nome Completo</TableHeadCell>
                  <TableHeadCell className="text-center">SARAM</TableHeadCell>
                  <TableHeadCell className="text-center">ID</TableHeadCell>
                  <TableHeadCell className="text-center">Unidade</TableHeadCell>
                  <TableHeadCell className="text-center">Status</TableHeadCell>
                  <TableHeadCell>
                     <span className="sr-only">Ações</span>
                  </TableHeadCell>
               </TableRow>
            </TableHead>
            <TableBody className="divide-y">
               {usuarios.map((user) => (
                  <TableRow key={user.id}>
                     <TableCell className="font-mono text-gray-400">
                        {user.id}
                     </TableCell>
                     <TableCell>{user.posto.mid}</TableCell>
                     <TableCell className="text-gray-600 uppercase">
                        {user.esp}
                     </TableCell>
                     <TableCell className="font-medium text-gray-800 capitalize dark:text-white">
                        {user.nome_guerra}
                     </TableCell>
                     <TableCell className="text-gray-600 capitalize">
                        {user.nome_completo}
                     </TableCell>
                     <TableCell className="text-center font-mono text-gray-500">
                        {formatSaram(user.saram)}
                     </TableCell>
                     <TableCell className="text-center font-mono text-gray-500">
                        {user.id_fab ?? "—"}
                     </TableCell>
                     <TableCell className="text-center">
                        {unidadeOptions.find((u) => u.value === user.unidade)
                           ?.label || user.unidade}
                     </TableCell>
                     <TableCell className="text-center">
                        <div
                           className={clsx(
                              "flex items-center justify-center gap-1 py-1 font-medium",
                              user.active ? "text-green-600" : "text-gray-600"
                           )}
                        >
                           <HiCheckCircle className="size-4" />
                           <span className="text-sm">
                              {user.active ? "Ativo" : "Inativo"}
                           </span>
                        </div>
                     </TableCell>
                     <TableCell className="text-center">
                        <button
                           className="text-sm font-medium text-cyan-600 hover:underline"
                           onClick={() => router.push(`/users/${user.id}`)}
                        >
                           Detalhes
                        </button>
                     </TableCell>
                  </TableRow>
               ))}
            </TableBody>
         </Table>
      </div>
   );
}
