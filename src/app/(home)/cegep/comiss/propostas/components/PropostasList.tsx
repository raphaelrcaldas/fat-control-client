"use client";

import {
   Dropdown,
   DropdownItem,
   Table,
   TableBody,
   TableCell,
   TableHead,
   TableHeadCell,
   TableRow,
} from "flowbite-react";
import { HiDotsVertical, HiOutlineTrash } from "react-icons/hi";
import { PermBased } from "@/app/(home)/hooks/usePermBased";
import { formatDateTime } from "@/../utils/dateHandler";
import type { PropostaListItem } from "services/routes/cegep/propostas";

interface PropostasListProps {
   propostas: PropostaListItem[];
   onOpen: (id: number) => void;
   onDelete: (proposta: PropostaListItem) => void;
}

/**
 * Lista de propostas. Componente puro: só exibe e emite —
 * quem carrega, cria e exclui é a `PropostasTab`.
 *
 * Duas formas: cards no mobile (a tabela estourava a largura da tela) e tabela
 * de `md:` para cima. Nas duas, o alvo focável é o BOTÃO do nome — linha com
 * `role="button"` embrulhando o botão de excluir reprova `nested-interactive`
 * no axe. O clique na linha/card fica só como conforto de mouse.
 */
export function PropostasList({
   propostas,
   onOpen,
   onDelete,
}: PropostasListProps) {
   return (
      <>
         <ul className="flex flex-col gap-2 md:hidden">
            {propostas.map((p) => (
               <li
                  key={p.id}
                  className="rounded border border-slate-200 bg-white shadow-sm"
               >
                  <div
                     className="flex items-start justify-between gap-2 px-3 py-2"
                     onClick={() => onOpen(p.id)}
                  >
                     <div className="min-w-0 flex-1">
                        <button
                           type="button"
                           aria-label={`Abrir proposta ${p.nome}`}
                           onClick={(e) => {
                              e.stopPropagation();
                              onOpen(p.id);
                           }}
                           className="focus-visible:ring-primary-500 flex max-w-full min-w-0 items-center rounded text-left font-medium text-slate-900 focus:outline-none focus-visible:ring-2 pointer-coarse:min-h-[44px]"
                        >
                           <span className="truncate">{p.nome}</span>
                        </button>
                        <p className="text-sm text-slate-600">
                           {p.ano_ref} · {p.cenarios_count}{" "}
                           {p.cenarios_count === 1 ? "cenário" : "cenários"} ·
                           atualizado em {formatDateTime(p.updated_at) ?? "—"}
                        </p>
                     </div>

                     {/* O menu não pode abrir a proposta ao ser tocado. */}
                     <PermBased
                        resource="cegep.comiss.propostas"
                        requiredPerm="delete"
                     >
                        <div onClick={(e) => e.stopPropagation()}>
                           <Dropdown
                              size="sm"
                              color="light"
                              arrowIcon={false}
                              label={
                                 <span className="flex items-center">
                                    <HiDotsVertical
                                       aria-hidden
                                       className="h-4 w-4"
                                    />
                                    <span className="sr-only">
                                       Ações da proposta {p.nome}
                                    </span>
                                 </span>
                              }
                           >
                              <DropdownItem
                                 className="text-red-700"
                                 onClick={() => onDelete(p)}
                              >
                                 Excluir proposta
                              </DropdownItem>
                           </Dropdown>
                        </div>
                     </PermBased>
                  </div>
               </li>
            ))}
         </ul>

         <div className="hidden overflow-hidden rounded bg-white shadow-sm ring-1 ring-slate-200 md:block">
            <div className="overflow-x-auto">
               <Table hoverable striped>
                  <TableHead>
                     <TableRow>
                        <TableHeadCell className="bg-slate-50">
                           Proposta
                        </TableHeadCell>
                        <TableHeadCell className="bg-slate-50 text-center">
                           Exercício
                        </TableHeadCell>
                        <TableHeadCell className="bg-slate-50 text-center">
                           Cenários
                        </TableHeadCell>
                        <TableHeadCell className="bg-slate-50 text-center">
                           Atualizado em
                        </TableHeadCell>
                        <TableHeadCell className="bg-slate-50 text-center">
                           <span className="sr-only">Ações</span>
                        </TableHeadCell>
                     </TableRow>
                  </TableHead>
                  <TableBody className="divide-y divide-slate-200">
                     {propostas.map((p) => (
                        <TableRow
                           key={p.id}
                           className="cursor-pointer bg-white"
                           onClick={() => onOpen(p.id)}
                        >
                           <TableCell className="font-medium whitespace-nowrap text-slate-900">
                              <button
                                 type="button"
                                 aria-label={`Abrir proposta ${p.nome}`}
                                 onClick={(e) => {
                                    e.stopPropagation();
                                    onOpen(p.id);
                                 }}
                                 className="focus-visible:ring-primary-500 block max-w-full truncate rounded text-left focus:outline-none focus-visible:ring-2"
                              >
                                 {p.nome}
                              </button>
                           </TableCell>
                           <TableCell className="text-center font-medium whitespace-nowrap text-slate-700 tabular-nums">
                              {p.ano_ref}
                           </TableCell>
                           <TableCell className="text-center whitespace-nowrap text-slate-600 tabular-nums">
                              {p.cenarios_count}
                           </TableCell>
                           <TableCell className="text-center whitespace-nowrap text-slate-500">
                              {formatDateTime(p.updated_at) ?? "—"}
                           </TableCell>
                           <TableCell className="text-right whitespace-nowrap">
                              {/* Mesmo alvo da lixeira das linhas do cenário
                                  (`LinhaRow`): ícone nu que só ganha fundo no
                                  hover — botão emoldurado numa coluna de ação
                                  repetida pesa mais que a própria linha. */}
                              <PermBased
                                 resource="cegep.comiss.propostas"
                                 requiredPerm="delete"
                              >
                                 <button
                                    type="button"
                                    title="Excluir proposta"
                                    aria-label={`Excluir proposta ${p.nome}`}
                                    onClick={(e) => {
                                       e.stopPropagation();
                                       onDelete(p);
                                    }}
                                    className="inline-flex h-7 w-7 items-center justify-center rounded text-slate-500 transition-colors hover:bg-red-50 hover:text-red-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 pointer-coarse:h-[44px] pointer-coarse:w-[44px]"
                                 >
                                    <HiOutlineTrash
                                       aria-hidden
                                       className="h-4 w-4"
                                    />
                                 </button>
                              </PermBased>
                           </TableCell>
                        </TableRow>
                     ))}
                  </TableBody>
               </Table>
            </div>
         </div>
      </>
   );
}
