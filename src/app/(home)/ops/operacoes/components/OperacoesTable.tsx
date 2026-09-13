"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
   Table,
   TableBody,
   TableCell,
   TableHead,
   TableHeadCell,
   TableRow,
} from "flowbite-react";
import { HiArrowSmDown } from "react-icons/hi";
import { isoDateToShort, minutesToTime } from "@/../utils/dateHandler";
import type { OperacaoListItem } from "services/routes/ops/operacoes";
import {
   STATUS_LABEL,
   STATUS_SPINE,
   TIPO_CHIP,
   TIPO_LABEL,
} from "./operacaoUi";

function TipoChip({ op }: { op: OperacaoListItem }) {
   return (
      <span
         className={`inline-block shrink-0 rounded px-1.5 py-0.5 text-[10px] font-bold tracking-wide uppercase ring-1 ring-inset ${TIPO_CHIP[op.tipo]}`}
      >
         {TIPO_LABEL[op.tipo]}
      </span>
   );
}

/**
 * Listagem de operações.
 *
 * Duas formas: lista no mobile (a tabela estoura 360px) e tabela de `md:` para
 * cima. O `tipo` tem coluna própria no desktop — como eixo vertical dá para
 * varrer quais são manobra e quais são exercício —, e no mobile, onde não há
 * coluna, volta a ser chip ao lado do nome.
 *
 * A ordem é a do backend (`data_inicio DESC`) e o cabeçalho só a INDICA: não há
 * parâmetro de ordenação no endpoint, então uma seta clicável prometeria o que
 * a tela não entrega.
 *
 * O alvo focável é o link do nome; o clique na linha é conforto de mouse. Linha
 * com `role="button"` embrulhando outro interativo reprova `nested-interactive`
 * no axe — ver `PropostasList`.
 */
export function OperacoesTable({ items }: { items: OperacaoListItem[] }) {
   const router = useRouter();

   return (
      <>
         {/* ----------------------------- mobile ----------------------------- */}
         <ul className="flex flex-col divide-y divide-slate-100 md:hidden">
            {items.map((op) => (
               <li key={op.id} className="flex items-stretch">
                  {/* Espinha: mesma marca de status da tabela, e o rótulo
                      acessível vive nela desde que o ponto saiu. */}
                  <span
                     title={STATUS_LABEL[op.status]}
                     className={`w-1 shrink-0 ${STATUS_SPINE[op.status]}`}
                  >
                     <span className="sr-only">{STATUS_LABEL[op.status]}</span>
                  </span>
                  <div className="flex min-w-0 flex-1 flex-col gap-1.5 px-3 py-2.5">
                     <div className="flex min-w-0 items-center gap-2">
                        <Link
                           href={`/ops/operacoes/${op.id}`}
                           title={op.nome}
                           className="focus-visible:ring-primary-500 min-w-0 truncate rounded text-[15px] font-bold tracking-tight text-slate-900 uppercase focus:outline-none focus-visible:ring-2"
                        >
                           {op.nome}
                        </Link>
                        <TipoChip op={op} />
                     </div>

                     {/* Sem cidade a linha some: travessão solto no estreito
                         é ruído, e o card encurta em vez de mostrar nada. */}
                     {op.cidade && (
                        <span className="truncate text-xs text-slate-500">
                           {op.cidade.nome} — {op.cidade.uf}
                        </span>
                     )}

                     <div className="flex items-baseline justify-between gap-2">
                        <span className="font-mono text-xs whitespace-nowrap text-slate-600 tabular-nums">
                           {isoDateToShort(op.data_inicio)} →{" "}
                           {isoDateToShort(op.data_fim)} · {op.dias}d
                        </span>
                        {op.etapas > 0 ? (
                           <span className="flex shrink-0 items-baseline gap-1.5">
                              <span className="font-mono text-sm font-bold text-slate-900 tabular-nums">
                                 {minutesToTime(op.horas)}
                              </span>
                              <span className="font-mono text-[11px] text-slate-500 tabular-nums">
                                 {op.etapas} et
                              </span>
                           </span>
                        ) : (
                           <span className="shrink-0 text-xs text-slate-500">
                              sem voo lançado
                           </span>
                        )}
                     </div>
                  </div>
               </li>
            ))}
         </ul>

         {/* ----------------------------- desktop ---------------------------- */}
         <div className="hidden overflow-x-auto md:block">
            <Table hoverable>
               <TableHead>
                  <TableRow>
                     <TableHeadCell className="w-1 p-0">
                        <span className="sr-only">Status</span>
                     </TableHeadCell>
                     <TableHeadCell className="px-3 normal-case">
                        Operação
                     </TableHeadCell>
                     <TableHeadCell className="w-px px-3 normal-case">
                        Tipo
                     </TableHeadCell>
                     <TableHeadCell className="hidden px-3 normal-case lg:table-cell">
                        Local
                     </TableHeadCell>
                     {/* A seta fica em `Início`, que é por onde o backend
                         ordena (`data_inicio DESC`) — não no par inteiro. */}
                     <TableHeadCell className="w-px px-3 whitespace-nowrap normal-case">
                        <span className="inline-flex items-center gap-1">
                           Início
                           <HiArrowSmDown
                              aria-label="ordenado da mais recente para a mais antiga"
                              className="h-3.5 w-3.5 text-slate-400"
                           />
                        </span>
                     </TableHeadCell>
                     <TableHeadCell className="w-px px-3 whitespace-nowrap normal-case">
                        Fim
                     </TableHeadCell>
                     <TableHeadCell className="w-px px-3 text-right normal-case">
                        Dias
                     </TableHeadCell>
                     <TableHeadCell className="w-px px-3 text-right normal-case">
                        Horas
                     </TableHeadCell>
                     <TableHeadCell className="w-px px-3 text-right normal-case">
                        Etapas
                     </TableHeadCell>
                     <TableHeadCell className="w-px px-3 text-right normal-case">
                        Anv
                     </TableHeadCell>
                  </TableRow>
               </TableHead>
               <TableBody className="divide-y divide-slate-100">
                  {items.map((op) => (
                     <TableRow
                        key={op.id}
                        className="cursor-pointer bg-white"
                        onClick={() => router.push(`/ops/operacoes/${op.id}`)}
                     >
                        {/* Espinha de status: única marca de status da linha
                            desde que o ponto saiu, então carrega o rótulo
                            acessível — pintura sozinha não chega ao leitor. */}
                        <TableCell
                           title={STATUS_LABEL[op.status]}
                           className={`w-1 p-0 ${STATUS_SPINE[op.status]}`}
                        >
                           <span className="sr-only">
                              {STATUS_LABEL[op.status]}
                           </span>
                        </TableCell>
                        {/* `max-w-0` + truncate: em `td` o algoritmo auto ignora
                            max-width, então o corte tem de vir do bloco interno. */}
                        <TableCell className="max-w-0 px-3">
                           <Link
                              href={`/ops/operacoes/${op.id}`}
                              title={op.nome}
                              onClick={(e) => e.stopPropagation()}
                              className="focus-visible:ring-primary-500 block truncate rounded font-bold tracking-tight text-slate-900 uppercase focus:outline-none focus-visible:ring-2"
                           >
                              {op.nome}
                           </Link>
                        </TableCell>
                        <TableCell className="w-px px-3">
                           <TipoChip op={op} />
                        </TableCell>
                        <TableCell className="hidden max-w-0 px-3 text-slate-600 lg:table-cell">
                           {op.cidade ? (
                              <span
                                 className="block truncate"
                                 title={`${op.cidade.nome} — ${op.cidade.uf}`}
                              >
                                 {op.cidade.nome} — {op.cidade.uf}
                              </span>
                           ) : (
                              <span className="text-slate-300">—</span>
                           )}
                        </TableCell>
                        <TableCell className="w-px px-3 font-mono whitespace-nowrap text-slate-700 tabular-nums">
                           {isoDateToShort(op.data_inicio)}
                        </TableCell>
                        <TableCell className="w-px px-3 font-mono whitespace-nowrap text-slate-700 tabular-nums">
                           {isoDateToShort(op.data_fim)}
                        </TableCell>
                        <TableCell className="w-px px-3 text-right font-mono text-slate-500 tabular-nums">
                           {op.dias}
                        </TableCell>
                        {/* Sem etapa associada não há zero: o travessão diz
                            "nada lançado", que é diferente de "voou 00:00". */}
                        <TableCell className="w-px px-3 text-right font-mono font-bold text-slate-900 tabular-nums">
                           {op.etapas > 0 ? (
                              minutesToTime(op.horas)
                           ) : (
                              <span className="font-normal text-slate-300">
                                 —
                              </span>
                           )}
                        </TableCell>
                        <TableCell className="w-px px-3 text-right font-mono text-slate-600 tabular-nums">
                           {op.etapas > 0 ? (
                              op.etapas
                           ) : (
                              <span className="text-slate-300">—</span>
                           )}
                        </TableCell>
                        <TableCell className="w-px px-3 text-right font-mono text-slate-600 tabular-nums">
                           {op.anv > 0 ? (
                              op.anv
                           ) : (
                              <span className="text-slate-300">—</span>
                           )}
                        </TableCell>
                     </TableRow>
                  ))}
               </TableBody>
            </Table>
         </div>
      </>
   );
}
