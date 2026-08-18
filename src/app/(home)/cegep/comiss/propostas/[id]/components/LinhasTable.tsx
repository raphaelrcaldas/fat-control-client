"use client";

import { useMemo } from "react";
import {
   Table,
   TableBody,
   TableCell,
   TableHead,
   TableHeadCell,
   TableRow,
} from "flowbite-react";
import { HiOutlineUserAdd } from "react-icons/hi";
import { realCurrency } from "utils/financeiro";
import { compareByAntiguidade } from "utils/sortByAntiguidade";
import type { LinhaDraft } from "../draftReducer";
import { calcImpactoLinhaFY, pernaEmCents } from "../propostaCalc";
import {
   SortableHeadCell,
   compareValues,
   useSortConfig,
} from "../../../components/sortableTable";
import { LinhaRow } from "./LinhaRow";

type SortKey =
   "militar" | "abertura" | "fechamento" | "exercicios" | "subtotal";

interface LinhasTableProps {
   linhas: readonly LinhaDraft[];
   cenarioNome: string;
   anoSelecionado: number;
   onEdit: (linhaId: string) => void;
   onRemove: (linhaId: string) => void;
   onAdd: () => void;
}

const COLSPAN = 6;

/** Militares do cenário ativo e o custo de cada um. */
export function LinhasTable({
   linhas,
   cenarioNome,
   anoSelecionado,
   onEdit,
   onRemove,
   onAdd,
}: LinhasTableProps) {
   const { sortConfig, requestSort } = useSortConfig<SortKey>({
      key: "militar",
      direction: "asc",
   });

   const ordenadas = useMemo(() => {
      const items = [...linhas];
      items.sort((a, b) => {
         if (sortConfig.key === "militar") {
            const cmp =
               !a.user && !b.user
                  ? 0
                  : !a.user
                    ? 1
                    : !b.user
                      ? -1
                      : compareByAntiguidade(a.user, b.user);
            return sortConfig.direction === "asc" ? cmp : -cmp;
         }

         // Cada coluna ordena pelo que ela mostra: as pernas pelo dinheiro,
         // Exercícios pelo ano, Subtotal pelo impacto no exercício em análise.
         const getValue = (l: LinhaDraft) => {
            switch (sortConfig.key) {
               case "abertura":
                  return pernaEmCents(l.base_ab, l.qtd_ab);
               case "fechamento":
                  return pernaEmCents(l.base_fc, l.qtd_fc);
               case "exercicios":
                  // Desempata pelo fechamento: a coluna mostra `ab → fc`, e sem
                  // isso linhas de mesma abertura saíam em ordem arbitrária.
                  return l.ano_ab * 10000 + l.ano_fc;
               default:
                  return calcImpactoLinhaFY(l, anoSelecionado);
            }
         };

         return compareValues(getValue(a), getValue(b), sortConfig.direction);
      });
      return items;
   }, [linhas, sortConfig, anoSelecionado]);

   // Soma da coluna Subtotal — mesmo recorte de exercício, para que somar a
   // coluna a olho bata com o total exibido ao lado do título.
   const totalCenario = useMemo(
      () =>
         linhas.reduce(
            (acc, l) => acc + calcImpactoLinhaFY(l, anoSelecionado),
            0
         ),
      [linhas, anoSelecionado]
   );

   const renderHeader = (
      label: string,
      sortKey: SortKey,
      align: "left" | "center" | "right" = "center",
      headerClass?: string
   ) => (
      <SortableHeadCell
         label={label}
         sortKey={sortKey}
         sortConfig={sortConfig}
         onSort={requestSort}
         align={align}
         headerClass={headerClass}
      />
   );

   return (
      <div className="overflow-hidden rounded bg-white shadow-sm ring-1 ring-slate-200">
         <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-slate-100 bg-slate-50/50 px-5 py-3">
            {/* Sem o nome do cenário: a barra de chips logo acima já diz qual
                está ativo, e repeti-lo aqui só alongava o título. */}
            <h2 className="font-semibold text-slate-800">
               Militares ({linhas.length})
            </h2>
            <span className="text-sm text-slate-500">
               Custo do cenário em {anoSelecionado}:{" "}
               <strong className="font-semibold text-slate-700 tabular-nums">
                  {realCurrency(totalCenario)}
               </strong>
            </span>
         </div>

         {/* `relative` para o indicador de overflow; o gradiente à direita
             avisa que a tabela continua fora da tela no mobile. */}
         <div className="relative">
            <span
               aria-hidden
               className="pointer-events-none absolute inset-y-0 right-0 z-20 w-6 bg-linear-to-l from-white to-transparent md:hidden"
            />
            <div className="overflow-x-auto">
               <Table hoverable striped>
                  <TableHead>
                     <TableRow>
                        {renderHeader(
                           "Militar",
                           "militar",
                           "left",
                           "sticky left-0 z-20 bg-slate-50 shadow-[1px_0_0_var(--color-slate-200)] hover:bg-slate-100"
                        )}
                        {/* Militar é a única coluna à esquerda (âncora); todo o
                            resto fica centralizado, em bloco. */}
                        {renderHeader("Abertura", "abertura")}
                        {renderHeader("Fechamento", "fechamento")}
                        {renderHeader("Exercícios", "exercicios")}
                        {/* O ano no rótulo evita a leitura de que a coluna
                            somaria as duas pernas em qualquer exercício. */}
                        {renderHeader(`Subtotal ${anoSelecionado}`, "subtotal")}
                        <TableHeadCell className="bg-slate-50 text-center!">
                           <span className="sr-only">Ações</span>
                        </TableHeadCell>
                     </TableRow>
                  </TableHead>
                  <TableBody className="divide-y divide-slate-200">
                     {ordenadas.map((l) => (
                        <LinhaRow
                           key={l.localId}
                           linha={l}
                           anoSelecionado={anoSelecionado}
                           onEdit={onEdit}
                           onRemove={onRemove}
                        />
                     ))}

                     {ordenadas.length === 0 && (
                        <TableRow className="bg-white">
                           <TableCell
                              colSpan={COLSPAN}
                              className="px-5 py-10 text-center"
                           >
                              <p className="text-sm font-medium text-slate-600">
                                 Nenhum militar em {cenarioNome}.
                              </p>
                              <p className="mt-1 text-sm text-slate-500">
                                 Adicione militares para ver o impacto do
                                 cenário sobre o teto do exercício.
                              </p>
                           </TableCell>
                        </TableRow>
                     )}

                     {/* Adicionar é a última linha da própria tabela: a ação
                         nasce onde o resultado aparece. */}
                     <TableRow className="bg-white">
                        <TableCell colSpan={COLSPAN} className="p-2">
                           <button
                              type="button"
                              onClick={onAdd}
                              className="focus-visible:ring-primary-500 hover:border-primary-400 hover:text-primary-700 hover:bg-primary-50/40 flex w-full items-center justify-center gap-2 rounded border border-dashed border-slate-300 px-4 py-3 text-sm font-semibold text-slate-500 transition-colors focus:outline-none focus-visible:ring-2 pointer-coarse:min-h-[44px]"
                           >
                              <HiOutlineUserAdd
                                 aria-hidden
                                 className="h-4 w-4"
                              />
                              Adicionar militares
                           </button>
                        </TableCell>
                     </TableRow>
                  </TableBody>
               </Table>
            </div>
         </div>
      </div>
   );
}
