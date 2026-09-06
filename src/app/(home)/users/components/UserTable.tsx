"use client";

import {
   Checkbox,
   Table,
   TableHead,
   TableBody,
   TableRow,
   TableCell,
   TableHeadCell,
} from "flowbite-react";
import Link from "next/link";
import { HiChevronRight } from "react-icons/hi";
import { UserPublic } from "services/routes/users";
import { useUnidadeOptions } from "@/hooks/queries";
import { formatSaram } from "@/constants/formats/saram";
import type { ExportCart } from "@/components/export/useExportCart";
import clsx from "clsx";

interface UserTableProps {
   usuarios: UserPublic[];
   cart: ExportCart<UserPublic>;
}

export function UserTable({ usuarios, cart }: UserTableProps) {
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

   // Sem moldura propria: a tabela ocupa o card da pagina de ponta a ponta,
   // como a de tripulantes. Antes era um card dentro do card, e a margem
   // lateral roubava a largura que faltava as colunas.
   return (
      <div className="hidden min-h-100 overflow-x-auto lg:block">
         <Table
            hoverable
            theme={{
               body: { cell: { base: "px-4 py-1" } },
               head: {
                  cell: {
                     base: "bg-gray-50 px-4",
                  },
               },
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
                  <TableHeadCell className="whitespace-nowrap">
                     P/G
                  </TableHeadCell>
                  <TableHeadCell className="whitespace-nowrap">
                     Quadro
                  </TableHeadCell>
                  <TableHeadCell className="whitespace-nowrap">
                     Especialidade
                  </TableHeadCell>
                  <TableHeadCell className="whitespace-nowrap">
                     Nome de Guerra
                  </TableHeadCell>
                  <TableHeadCell className="whitespace-nowrap">
                     Nome Completo
                  </TableHeadCell>
                  <TableHeadCell className="text-center whitespace-nowrap">
                     SARAM
                  </TableHeadCell>
                  <TableHeadCell className="text-center whitespace-nowrap">
                     ID
                  </TableHeadCell>
                  <TableHeadCell className="text-center whitespace-nowrap">
                     Unidade
                  </TableHeadCell>
                  <TableHeadCell className="text-center whitespace-nowrap">
                     Status
                  </TableHeadCell>
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
                        <TableCell className="text-sm font-medium whitespace-nowrap text-slate-600 uppercase">
                           {user.posto.short}
                        </TableCell>
                        <TableCell className="text-gray-600 uppercase">
                           {user.quadro || "—"}
                        </TableCell>
                        <TableCell className="text-gray-600 uppercase">
                           {user.esp || "—"}
                        </TableCell>
                        <TableCell className="font-medium text-gray-800 capitalize dark:text-white">
                           <span
                              className="block max-w-36 truncate"
                              title={user.nome_guerra}
                           >
                              {user.nome_guerra}
                           </span>
                        </TableCell>
                        <TableCell className="text-gray-600 capitalize">
                           <span
                              className="block max-w-56 truncate"
                              title={user.nome_completo ?? undefined}
                           >
                              {user.nome_completo}
                           </span>
                        </TableCell>
                        <TableCell className="text-center font-mono whitespace-nowrap text-gray-500">
                           {formatSaram(user.saram)}
                        </TableCell>
                        <TableCell className="text-center font-mono text-gray-500">
                           {user.id_fab ?? "—"}
                        </TableCell>
                        <TableCell className="text-center whitespace-nowrap">
                           {unidadeOptions.find((u) => u.value === user.unidade)
                              ?.label || user.unidade}
                        </TableCell>
                        <TableCell className="text-center">
                           {/* Ponto em vez de icone: o check de 16px repetido
                               em cinquenta linhas virava um carimbo, e a cor
                               ja diz o estado. O texto fica em slate — verde
                               no rotulo dobrava o mesmo sinal. */}
                           <span className="inline-flex items-center gap-1.5 text-sm">
                              <span
                                 aria-hidden
                                 className={clsx(
                                    "size-1.5 rounded-full",
                                    user.active
                                       ? "bg-emerald-500"
                                       : "bg-slate-400"
                                 )}
                              />
                              <span
                                 className={clsx(
                                    user.active
                                       ? "text-slate-600"
                                       : "text-slate-500"
                                 )}
                              >
                                 {user.active ? "Ativo" : "Inativo"}
                              </span>
                           </span>
                        </TableCell>
                        <TableCell className="text-right">
                           <Link
                              href={`/users/${user.id}`}
                              aria-label={`Detalhes de ${user.nome_guerra}`}
                              title={`Detalhes de ${user.nome_guerra}`}
                              className="hover:border-primary-300 hover:text-primary-700 focus-visible:outline-primary-600 inline-flex items-center justify-center rounded border border-slate-200 p-1.5 text-slate-500 transition-colors outline-none focus-visible:outline-[2px] focus-visible:outline-offset-[2px] focus-visible:[outline-style:solid] pointer-coarse:min-h-[44px] pointer-coarse:min-w-[44px]"
                           >
                              <HiChevronRight className="h-4 w-4" />
                           </Link>
                        </TableCell>
                     </TableRow>
                  );
               })}
            </TableBody>
         </Table>
      </div>
   );
}
