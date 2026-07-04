import { useComissSummary } from "@/hooks/queries";
import type { ComissList } from "services/routes/cegep/comiss";
import {
   Badge,
   Button,
   Label,
   Progress,
   Select,
   Table,
   TableBody,
   TableCell,
   TableHead,
   TableRow,
} from "flowbite-react";
import { useRouter } from "next/navigation";
import {
   FaPlaneArrival,
   FaPlaneDeparture,
   FaRegMoneyBillAlt,
} from "react-icons/fa";
import { HiOutlineAdjustments } from "react-icons/hi";
import { useState, useMemo } from "react";
import { formatDateFull, isoStrToDate } from "@/../utils/dateHandler";
import { realCurrency } from "utils/financeiro";
import { compareByAntiguidade } from "utils/sortByAntiguidade";
import { PermBased } from "@/app/(home)/hooks/usePermBased";
import clsx from "clsx";
import { GestaoFiscalCard } from "./components/GestaoFiscalCard";
import { GestaoFiscalSkeleton } from "./components/GestaoFiscalSkeleton";
import { ComissSubheader } from "./components/ComissSubheader";
import {
   SortableHeadCell,
   compareValues,
   useSortConfig,
} from "./components/sortableTable";
import { getDefaultFiscalYear, getFiscalYears } from "./fiscalYears";

type SortKey =
   | "militar"
   | "data_ab"
   | "data_fc"
   | "valor_ab"
   | "valor_fc"
   | "impacto"
   | "status"
   | "completude";

// Impacto: parcela do valor que efetivamente recai sobre o ano fiscal exibido
// (abertura conta se abriu no ano; fechamento conta se fechou no ano).
function computeImpacto(c: ComissList, ano: number): number {
   const anoAb = isoStrToDate(c.data_ab).getFullYear();
   const anoFc = c.data_fc ? isoStrToDate(c.data_fc).getFullYear() : null;
   return (
      (anoAb === ano ? c.valor_aj_ab : 0) + (anoFc === ano ? c.valor_aj_fc : 0)
   );
}

export function GestaoFiscalPage() {
   const yearsRange = useMemo(() => getFiscalYears(), []);

   const [ano, setAno] = useState<number>(getDefaultFiscalYear());
   const router = useRouter();

   const { data, isLoading, isFetching } = useComissSummary(ano);

   const { sortConfig, requestSort } = useSortConfig<SortKey>({
      key: "data_ab",
      direction: "desc",
   });

   const sortedComissionamentos = useMemo(() => {
      if (!data?.comissionamentos) return [];
      const sortableItems = [...data.comissionamentos];
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

         const getValue = (c: ComissList) => {
            switch (sortConfig.key) {
               case "valor_ab":
                  return c.valor_aj_ab;
               case "valor_fc":
                  return c.valor_aj_fc;
               case "impacto":
                  return computeImpacto(c, ano);
               default:
                  return c[sortConfig.key as keyof ComissList];
            }
         };

         return compareValues(getValue(a), getValue(b), sortConfig.direction);
      });
      return sortableItems;
   }, [data?.comissionamentos, sortConfig, ano]);

   const renderHeader = (
      label: string,
      sortKey: SortKey,
      align: "left" | "center" = "center"
   ) => (
      <SortableHeadCell
         label={label}
         sortKey={sortKey}
         sortConfig={sortConfig}
         onSort={requestSort}
         align={align}
      />
   );

   return (
      <div className="flex flex-col gap-2">
         {/* Subheader da aba — renderizado de cara (shell imediato) */}
         <ComissSubheader
            actions={
               <>
                  <div className="flex items-center gap-2">
                     <Label
                        htmlFor="exercicio"
                        className="text-sm text-slate-600"
                     >
                        Exercício
                     </Label>
                     <Select
                        id="exercicio"
                        sizing="sm"
                        value={ano}
                        onChange={(e) => setAno(Number(e.target.value))}
                        className="min-w-28"
                     >
                        {yearsRange.map((y) => (
                           <option key={y} value={y}>
                              {y}
                           </option>
                        ))}
                     </Select>
                  </div>
                  <PermBased resource="orcamento" requiredPerm="create">
                     <Button
                        size="sm"
                        color="red"
                        onClick={() =>
                           router.push(`/cegep/comiss/orcamento?ano=${ano}`)
                        }
                        title="Editar teto orçamentário"
                     >
                        <HiOutlineAdjustments className="mr-2 h-4 w-4" />
                        Editar Teto
                     </Button>
                  </PermBased>
               </>
            }
         >
            <h2 className="text-base font-semibold text-slate-900">
               Gestão Fiscal
            </h2>
            <p className="text-sm text-slate-500">
               Acompanhamento e controle orçamentário anual.
            </p>
         </ComissSubheader>

         {isLoading ? (
            <GestaoFiscalSkeleton />
         ) : !data ? (
            <div className="flex justify-center py-20 text-slate-500">
               Erro ao carregar dados orçamentários.
            </div>
         ) : (
            <div
               className={clsx(
                  "flex flex-col gap-2 transition-opacity",
                  isFetching && "opacity-50"
               )}
            >
               {/* EMPTY STATE — sem orçamento cadastrado para o ano */}
               {!data.orcamento_id && (
                  <div className="flex flex-col items-center gap-3 rounded border border-dashed border-slate-300 bg-slate-50 py-10 text-center">
                     <FaRegMoneyBillAlt className="h-8 w-8 text-slate-300" />
                     <p className="text-sm font-medium text-slate-600">
                        Nenhum orçamento cadastrado para {ano}.
                     </p>
                     <PermBased resource="orcamento" requiredPerm="create">
                        <Button
                           size="sm"
                           color="red"
                           onClick={() =>
                              router.push(`/cegep/comiss/orcamento?ano=${ano}`)
                           }
                        >
                           Cadastrar Teto Orçamentário
                        </Button>
                     </PermBased>
                  </div>
               )}

               {/* DASHBOARD CARDS — só exibe quando há orçamento */}
               {data.orcamento_id && (
                  <div className="grid grid-cols-1 gap-2 md:grid-cols-3">
                     <GestaoFiscalCard
                        label="Orçamento Total (Ano)"
                        icon={<FaRegMoneyBillAlt />}
                        stats={data.total}
                     />
                     <GestaoFiscalCard
                        label="Fechamentos (Términos)"
                        icon={<FaPlaneArrival />}
                        stats={data.fechamento}
                     />
                     <GestaoFiscalCard
                        label="Aberturas (Inícios)"
                        icon={<FaPlaneDeparture />}
                        stats={data.abertura}
                     />
                  </div>
               )}

               {/* TABELA DE REGISTROS DO ANO */}
               <div className="overflow-hidden rounded bg-white shadow-sm ring-1 ring-slate-200">
                  <div className="border-b border-slate-100 bg-slate-50/50 px-5 py-3">
                     <h3 className="font-semibold text-slate-800">
                        Comissionamentos que compõem o período (
                        {data.comissionamentos.length})
                     </h3>
                  </div>
                  <div className="overflow-x-auto">
                     <Table hoverable striped>
                        <TableHead>
                           <TableRow>
                              {renderHeader("Militar", "militar", "left")}
                              {renderHeader("Abertura", "data_ab")}
                              {renderHeader("Fechamento", "data_fc")}
                              {renderHeader("Valor Ab.", "valor_ab")}
                              {renderHeader("Valor Fc.", "valor_fc")}
                              {renderHeader("Impacto", "impacto")}
                              {renderHeader("Status", "status")}
                              {renderHeader("Completude", "completude")}
                           </TableRow>
                        </TableHead>
                        <TableBody className="divide-y divide-slate-200">
                           {sortedComissionamentos.map((c) => {
                              const anoAb = isoStrToDate(
                                 c.data_ab
                              ).getFullYear();
                              const anoFc = c.data_fc
                                 ? isoStrToDate(c.data_fc).getFullYear()
                                 : null;
                              const impacto = computeImpacto(c, ano);

                              const abrir = () =>
                                 router.push(`/cegep/comiss/${c.id}`);

                              return (
                                 <TableRow
                                    key={c.id}
                                    role="button"
                                    tabIndex={0}
                                    aria-label={`Abrir comissionamento de ${
                                       c.user?.nome_guerra ?? "militar"
                                    }`}
                                    className="cursor-pointer bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-inset"
                                    onClick={abrir}
                                    onKeyDown={(e) => {
                                       if (e.key === "Enter" || e.key === " ") {
                                          e.preventDefault();
                                          abrir();
                                       }
                                    }}
                                 >
                                    <TableCell className="font-medium whitespace-nowrap text-slate-900">
                                       <div className="uppercase">
                                          {c.user?.p_g} {c.user?.nome_guerra}
                                       </div>
                                    </TableCell>
                                    <TableCell className="text-center whitespace-nowrap">
                                       <div
                                          className={clsx(
                                             "font-medium",
                                             anoAb !== ano &&
                                                "font-normal text-slate-400 opacity-60 grayscale"
                                          )}
                                       >
                                          {formatDateFull(c.data_ab)}
                                       </div>
                                    </TableCell>
                                    <TableCell className="text-center whitespace-nowrap">
                                       <div
                                          className={clsx(
                                             "font-medium",
                                             anoFc !== ano &&
                                                "font-normal text-slate-400 opacity-60 grayscale"
                                          )}
                                       >
                                          {c.data_fc
                                             ? formatDateFull(c.data_fc)
                                             : "-"}
                                       </div>
                                    </TableCell>
                                    <TableCell className="text-center whitespace-nowrap">
                                       <span
                                          className={clsx(
                                             anoAb !== ano &&
                                                "text-slate-400 opacity-60 grayscale"
                                          )}
                                       >
                                          {realCurrency(c.valor_aj_ab)}
                                       </span>
                                    </TableCell>
                                    <TableCell className="text-center whitespace-nowrap">
                                       <span
                                          className={clsx(
                                             anoFc !== ano &&
                                                "text-slate-400 opacity-60 grayscale"
                                          )}
                                       >
                                          {c.valor_aj_fc > 0
                                             ? realCurrency(c.valor_aj_fc)
                                             : "-"}
                                       </span>
                                    </TableCell>
                                    <TableCell className="text-center font-semibold whitespace-nowrap text-slate-900">
                                       {realCurrency(impacto)}
                                    </TableCell>
                                    <TableCell className="text-center whitespace-nowrap">
                                       <div className="flex justify-center">
                                          <Badge
                                             color={
                                                c.status === "aberto"
                                                   ? "success"
                                                   : c.status === "fechado"
                                                     ? "gray"
                                                     : "warning"
                                             }
                                             className="w-min"
                                          >
                                             {c.status.toUpperCase()}
                                          </Badge>
                                       </div>
                                    </TableCell>
                                    <TableCell className="text-center whitespace-nowrap">
                                       <div className="inline-flex flex-col items-center gap-1">
                                          <span className="text-xs font-bold text-slate-700">
                                             {c.completude}%
                                          </span>
                                          <div className="w-20">
                                             <Progress
                                                progress={c.completude}
                                                size="sm"
                                                color={
                                                   c.status === "fechado"
                                                      ? "gray"
                                                      : c.modulo
                                                        ? "green"
                                                        : "red"
                                                }
                                             />
                                          </div>
                                       </div>
                                    </TableCell>
                                 </TableRow>
                              );
                           })}
                           {sortedComissionamentos.length === 0 && (
                              <TableRow>
                                 <TableCell
                                    colSpan={8}
                                    className="py-8 text-center text-slate-500"
                                 >
                                    Nenhum dado orçamentário registrado neste
                                    ano de exercício.
                                 </TableCell>
                              </TableRow>
                           )}
                        </TableBody>
                     </Table>
                  </div>
               </div>
            </div>
         )}
      </div>
   );
}
