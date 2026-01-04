"use client";

import { useState } from "react";
import {
   Button,
   Table,
   TableHead,
   TableBody,
   TableRow,
   TableCell,
   TableHeadCell,
} from "flowbite-react";
import { IoMdInformationCircleOutline } from "react-icons/io";
import { HiCheckCircle, HiXCircle } from "react-icons/hi";
import { UserPublic } from "services/routes/users";
import { UserDetailsModal } from "./UserDetailsModal/index";
import clsx from "clsx";

interface UserTableProps {
   usuarios: UserPublic[];
   loading: boolean;
   onUpdate: () => void;
}

export function UserTable({ usuarios, loading, onUpdate }: UserTableProps) {
   const [selectedUser, setSelectedUser] = useState<UserPublic | null>(null);

   return (
      <>
         <div
            className={`hidden overflow-x-auto md:block ${loading ? "opacity-50" : "opacity-100"} transition-opacity duration-200`}
         >
            <Table hoverable>
               <TableHead>
                  <TableRow>
                     <TableHeadCell># ID</TableHeadCell>
                     <TableHeadCell>P/G</TableHeadCell>
                     <TableHeadCell>Especialidade</TableHeadCell>
                     <TableHeadCell>Nome de Guerra</TableHeadCell>
                     <TableHeadCell>Nome Completo</TableHeadCell>
                     <TableHeadCell>Unidade</TableHeadCell>
                     <TableHeadCell>Status</TableHeadCell>
                     <TableHeadCell>
                        <span className="sr-only">Ações</span>
                     </TableHeadCell>
                  </TableRow>
               </TableHead>
               <TableBody className="divide-y">
                  {usuarios.map((user) => (
                     <TableRow
                        key={user.id}
                        className="border-gray-200 bg-white"
                     >
                        <TableCell className="font-mono text-gray-400">
                           {user.id}
                        </TableCell>
                        <TableCell>{user.posto.mid}</TableCell>
                        <TableCell className="text-gray-600 uppercase">
                           {user.esp}
                        </TableCell>
                        <TableCell className="font-medium whitespace-nowrap text-gray-900 uppercase dark:text-white">
                           {user.nome_guerra}
                        </TableCell>
                        <TableCell className="text-gray-600 capitalize">
                           {user.nome_completo}
                        </TableCell>
                        <TableCell className="uppercase">
                           {user.unidade}
                        </TableCell>
                        <TableCell>
                           <div
                              className={clsx(
                                 "flex items-center gap-1 font-medium",
                                 user.active
                                    ? "text-green-600"
                                    : "text-gray-600"
                              )}
                           >
                              <HiCheckCircle className="size-4" />
                              <span className="text-sm">
                                 {user.active ? "Ativo" : "Inativo"}
                              </span>
                           </div>
                        </TableCell>
                        <TableCell className="text-right">
                           <Button
                              color="light"
                              size="sm"
                              onClick={() => setSelectedUser(user)}
                              aria-label={`Ver detalhes de ${user.nome_guerra}`}
                              title="Ver detalhes"
                           >
                              <IoMdInformationCircleOutline
                                 size={20}
                                 className="text-red-600"
                              />
                           </Button>
                        </TableCell>
                     </TableRow>
                  ))}
               </TableBody>
            </Table>
         </div>

         {selectedUser && (
            <UserDetailsModal
               show={!!selectedUser}
               setShow={(show) => !show && setSelectedUser(null)}
               updateUsers={onUpdate}
               user={selectedUser}
            />
         )}
      </>
   );
}
