"use client";

import {
   Button,
   Checkbox,
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
import { useUnidadeOptions } from "@/hooks/queries";
import { formatSaram } from "@/constants/formats/saram";
import type { ExportCart } from "@/components/export/useExportCart";
import clsx from "clsx";

interface UserTableProps {
   usuarios: UserPublic[];
   cart: ExportCart<UserPublic>;
}

export function UserTable({ usuarios, cart }: UserTableProps) {
   const router = useRouter();
   const unidadeOptions = useUnidadeOptions();

   const pageIds = usuarios.map((u) => u.id);
   const selectedOnPage = pageIds.filter((id) => cart.has(id)).length;
   const allOnPage = usuarios.length > 0 && selectedOnPage === usuarios.length;

   // O checkbox do cabecalho tem escopo de PAGINA, nao do filtro inteiro —
   // a acao de escopo amplo mora na barra acima da tabela, dita por extenso.
   const togglePage = () => {
      if (allOnPage) cart.removeMany(pageIds);
      else cart.addMany(usuarios);
   };

   return (
      <div className="mx-2 hidden min-h-100 overflow-x-auto rounded border border-slate-200 bg-white shadow-sm lg:block">
         <Table
            hoverable
            theme={{
               body: { cell: { base: "py-1" } },
               head: { cell: { base: "bg-white border-b border-slate-200" } },
            }}
         >
            <TableHead>
               <TableRow>
                  <TableHeadCell className="w-10 px-3">
                     <Checkbox
                        className="size-[20px] pointer-coarse:size-[44px]"
                        color="primary"
                        checked={allOnPage}
                        ref={(el) => {
                           // Estado indeterminado: parte da pagina marcada.
                           if (el) {
                              el.indeterminate =
                                 selectedOnPage > 0 && !allOnPage;
                           }
                        }}
                        onChange={togglePage}
                        aria-label={
                           allOnPage
                              ? "Desmarcar todos desta página"
                              : "Selecionar todos desta página"
                        }
                     />
                  </TableHeadCell>
                  <TableHeadCell>P/G</TableHeadCell>
                  <TableHeadCell>Quadro</TableHeadCell>
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
               {usuarios.map((user) => {
                  const checked = cart.has(user.id);
                  return (
                     <TableRow
                        key={user.id}
                        className={clsx(checked && "bg-primary-50/60")}
                     >
                        <TableCell className="px-3">
                           <Checkbox
                              className="size-[20px] pointer-coarse:size-[44px]"
                              color="primary"
                              checked={checked}
                              onChange={() => cart.toggle(user)}
                              aria-label={`Selecionar ${user.nome_guerra}`}
                           />
                        </TableCell>
                        <TableCell>{user.posto.mid}</TableCell>
                        <TableCell className="text-gray-600 uppercase">
                           {user.quadro || "—"}
                        </TableCell>
                        <TableCell className="text-gray-600 uppercase">
                           {user.esp || "—"}
                        </TableCell>
                        <TableCell className="font-medium text-gray-800 capitalize dark:text-white">
                           {user.nome_guerra}
                        </TableCell>
                        <TableCell className="text-gray-600 capitalize">
                           {user.nome_completo}
                        </TableCell>
                        <TableCell className="text-center font-mono whitespace-nowrap text-gray-500">
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
                                 // green-700: o 600 media 3.22:1 sobre branco —
                                 // abaixo do piso AA (4.5:1) para texto de 12px
                                 user.active
                                    ? "text-green-700"
                                    : "text-gray-600"
                              )}
                           >
                              <HiCheckCircle className="size-4" />
                              <span className="text-sm">
                                 {user.active ? "Ativo" : "Inativo"}
                              </span>
                           </div>
                        </TableCell>
                        <TableCell className="text-center">
                           <Button
                              color="light"
                              size="xs"
                              onClick={() => router.push(`/users/${user.id}`)}
                           >
                              Detalhes
                           </Button>
                        </TableCell>
                     </TableRow>
                  );
               })}
            </TableBody>
         </Table>
      </div>
   );
}
