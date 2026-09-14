"use client";

import { memo, useMemo } from "react";
import {
   Table,
   TableHead,
   TableBody,
   TableRow,
   TableCell,
   Progress,
} from "flowbite-react";
import { isoDateToString } from "utils/dateHandler";
import clsx from "clsx";
import { ComissList } from "services/routes/cegep/comiss";
import { useRouter } from "next/navigation";
import { compareByAntiguidade } from "utils/sortByAntiguidade";
import {
   comissDiasNumericos,
   deriveComissDias,
   progressColor,
   spineColor,
} from "../comissDerivacoes";
import { COMISS_TABLE_THEME } from "../comissTableTheme";
import { ComissCard } from "./ComissCard";
import { TipoComissChip, ModuloComissChip } from "./comissChips";
import {
   SortableHeadCell,
   compareValues,
   useSortConfig,
} from "@/components/ui/SortableTable";

interface TableComissProps {
   cmtos: ComissList[];
}

type SortKey =
   | "militar"
   | "data_ab"
   | "data_fc"
   | "tipo"
   | "completude"
   | "modulo"
   | "previsto"
   | "computado"
   | "restante";

export const TableComiss = memo(function TableComiss({
   cmtos,
}: TableComissProps) {
   const { sortConfig, requestSort } = useSortConfig<SortKey>({
      key: "militar",
      direction: "asc",
   });

   const sortedCmtos = useMemo(() => {
      const sortableItems = [...cmtos];
      sortableItems.sort((a, b) => {
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

         let aValue: unknown;
         let bValue: unknown;

         if (
            sortConfig.key === "previsto" ||
            sortConfig.key === "computado" ||
            sortConfig.key === "restante"
         ) {
            // A conta sai de `comissDiasNumericos`, a mesma que alimenta o que
            // a linha exibe: copiada aqui, o primeiro ajuste de arredondamento
            // faria a lista ordenar por um numero diferente do que ela mostra.
            aValue = comissDiasNumericos(a)[sortConfig.key];
            bValue = comissDiasNumericos(b)[sortConfig.key];
         } else if (sortConfig.key === "tipo") {
            aValue = a.dias_cumprir ? 1 : 0;
            bValue = b.dias_cumprir ? 1 : 0;
         } else {
            aValue = a[sortConfig.key as keyof ComissList];
            bValue = b[sortConfig.key as keyof ComissList];
         }

         return compareValues(aValue, bValue, sortConfig.direction);
      });
      return sortableItems;
   }, [cmtos, sortConfig]);

   const renderHeader = (
      label: string,
      sortKey: SortKey,
      align: "left" | "center" | "right" = "center",
      widthClass?: string
   ) => (
      <SortableHeadCell
         label={label}
         sortKey={sortKey}
         sortConfig={sortConfig}
         onSort={requestSort}
         align={align}
         headerClass={clsx(
            "bg-slate-50 whitespace-nowrap hover:bg-slate-100",
            widthClass
         )}
      />
   );

   return (
      <div className="overflow-hidden rounded bg-white shadow ring-1 ring-slate-200">
         {/* Mobile: as nove colunas estouravam 674px alem da viewport, e o
             progresso — o motivo de abrir a tela — ficava atras do arrasto. */}
         <ul className="divide-y divide-slate-100 md:hidden">
            {sortedCmtos.map((comiss) => (
               <li key={comiss.id}>
                  <ComissCard comiss={comiss} />
               </li>
            ))}
         </ul>

         <div className="hidden overflow-x-auto md:block">
            <Table hoverable striped theme={COMISS_TABLE_THEME}>
               <TableHead>
                  <TableRow>
                     {/* Unica coluna elastica: fica com toda a folga que as
                         demais (`w-px`, largura do conteudo) nao usam. */}
                     {renderHeader("Militar", "militar", "left")}
                     {renderHeader("Abertura", "data_ab")}
                     {renderHeader("Fechamento", "data_fc")}
                     {renderHeader("Tipo", "tipo")}
                     {renderHeader("Progresso", "completude")}
                     {renderHeader("Módulo", "modulo")}
                     {/* Sem o sufixo "dias" nas celulas: repetido em tres
                         colunas de cada linha, o rotulo era ruido que disputava
                         largura com o proprio numero. */}
                     {renderHeader("Previsto", "previsto")}
                     {renderHeader("Computado", "computado")}
                     {/* O indicador de ordenacao fica em `-right-5` e, na ultima
                         coluna, escapa do padding da celula: 6px de estouro na
                         tabela inteira. Com `align="right"` ele vai para a
                         esquerda do rotulo e volta para dentro. */}
                     {renderHeader("Restante", "restante", "right")}
                  </TableRow>
               </TableHead>
               <TableBody className="divide-y divide-gray-200">
                  {sortedCmtos.map((comiss) => (
                     <TableComissRow key={comiss.id} comiss={comiss} />
                  ))}
               </TableBody>
            </Table>
         </div>
      </div>
   );
});

const TableComissRow = memo(function TableComissRow({
   comiss,
}: {
   comiss: ComissList;
}) {
   const router = useRouter();
   const user = comiss.user;

   const { dataAbertura, dataFechamento } = useMemo(
      () => ({
         dataAbertura: isoDateToString(comiss.data_ab),
         dataFechamento: isoDateToString(comiss.data_fc),
      }),
      [comiss.data_ab, comiss.data_fc]
   );

   const { previsto, computado, restante, restanteNegativo } = useMemo(
      () => deriveComissDias(comiss),
      [comiss]
   );

   const nomeMilitar = `${user?.p_g ?? ""} ${user?.nome_guerra ?? ""}`.trim();

   const abrir = () => router.push(`/cegep/comiss/${comiss.id}`);

   return (
      <TableRow
         role="button"
         tabIndex={0}
         aria-label={`Abrir comissionamento de ${user?.nome_guerra ?? "militar"}`}
         onClick={abrir}
         onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
               e.preventDefault();
               abrir();
            }
         }}
         className="focus-visible:ring-primary-500 cursor-pointer bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-inset"
      >
         {/* Unica coluna elastica: o nome trunca com `title` em vez de quebrar
             em duas linhas e desalinhar a altura da linha. O limite vai no
             `<span>`, nao no `<td>`: com `table-layout: auto` o `max-width` da
             celula zera a largura preferida da coluna, e o nome trunca cedo
             enquanto sobra folga nas colunas numericas.

             A espinha (borda esquerda, como a do masthead) substituiu o dot,
             que ficava no meio do fluxo disputando alinhamento com o nome. Ela
             codifica o MODULO, com o fechado sobrepondo — ver `spineColor`.
             Vai na borda da propria celula porque num `<td>` o `position:
             relative` nao e contexto confiavel para um filho absoluto com
             `h-full`: a barra simplesmente nao pintava. */}
         <TableCell
            className={clsx(
               "border-l-4 font-medium text-gray-900",
               spineColor(comiss)
            )}
         >
            <span
               className="block max-w-40 truncate uppercase xl:max-w-72"
               title={nomeMilitar}
            >
               {nomeMilitar}
            </span>
         </TableCell>

         <TableCell className="w-px text-center whitespace-nowrap">
            <span className="font-mono text-sm text-slate-600">
               {dataAbertura}
            </span>
         </TableCell>

         <TableCell className="w-px text-center whitespace-nowrap">
            <span className="font-mono text-sm text-slate-600">
               {dataFechamento}
            </span>
         </TableCell>

         <TableCell className="w-px text-center whitespace-nowrap">
            <TipoComissChip periodo={!!comiss.dias_cumprir} />
         </TableCell>

         <TableCell className="w-px">
            {/* Percentual ao lado da barra, nao acima: empilhado, o par ocupava
                duas alturas de texto e era o que puxava a linha para cima. */}
            <div className="flex items-center justify-center gap-2">
               <Progress
                  progress={comiss.completude}
                  color={progressColor(comiss)}
                  size="sm"
                  /* Sem isto o Flowbite anuncia cada barra como "progressbar",
                     sem contexto nenhum. `labelText` fica falso, entao o texto
                     vai so para o nome acessivel. */
                  textLabel={`Completude ${comiss.completude}%`}
                  className="w-20 xl:w-24"
               />
               <span className="w-9 shrink-0 text-right text-xs font-medium text-gray-600 tabular-nums">
                  {comiss.completude}%
               </span>
            </div>
         </TableCell>

         <TableCell className="w-px text-center whitespace-nowrap">
            <ModuloComissChip modulo={comiss.modulo} />
         </TableCell>

         {/* Peso e cor dao a hierarquia das tres colunas de dias: o previsto e
             a referencia contratada (leve, cinza), o computado e o que ja foi
             cumprido (medio, escuro) e o restante e o dado de acao — o unico em
             negrito, e em ambar quando ainda ha muito a cumprir. */}
         <TableCell className="w-px text-center font-normal whitespace-nowrap text-slate-500 tabular-nums">
            {previsto}
         </TableCell>

         <TableCell className="w-px text-center font-medium whitespace-nowrap text-slate-700 tabular-nums">
            {computado}
         </TableCell>

         <TableCell
            className={clsx(
               "w-px text-center font-bold whitespace-nowrap tabular-nums",
               restanteNegativo ? "text-red-600" : "text-slate-900"
            )}
         >
            {restante}
         </TableCell>
      </TableRow>
   );
});
