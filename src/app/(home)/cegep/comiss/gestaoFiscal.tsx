import { useComissSummary } from "@/hooks/queries";
import type { ComissList } from "services/routes/cegep/comiss";
const formatCurrency = (val: number) =>
   new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
   }).format(val);
import {
   Badge,
   Button,
   Progress,
   Select,
   Spinner,
   Table,
   TableBody,
   TableCell,
   TableHead,
   TableHeadCell,
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
import { formatDateFull } from "@/../utils/dateHandler";
import { compareByAntiguidade } from "utils/sortByAntiguidade";
import { PermBased } from "@/app/(home)/hooks/usePermBased";
import { HiChevronUp, HiChevronDown, HiSelector } from "react-icons/hi";
import clsx from "clsx";

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
   const anoAb = new Date(c.data_ab).getFullYear();
   const anoFc = c.data_fc ? new Date(c.data_fc).getFullYear() : null;
   return (
      (anoAb === ano ? c.valor_aj_ab : 0) + (anoFc === ano ? c.valor_aj_fc : 0)
   );
}

export function GestaoFiscalPage() {
   const currentY = new Date().getFullYear();
   const yearsRange = Array.from(
      { length: 5 },
      (_, i) => currentY - 1 + i
   ).filter((y) => y >= 2026);
   if (!yearsRange.includes(currentY)) yearsRange.unshift(currentY);

   const [ano, setAno] = useState<number>(Math.max(2026, currentY));
   const router = useRouter();

   const { data, isLoading } = useComissSummary(ano);

   const [sortConfig, setSortConfig] = useState<{
      key: SortKey;
      direction: "asc" | "desc";
   }>({ key: "data_ab", direction: "desc" });

   const sortedComissionamentos = useMemo(() => {
      if (!data?.comissionamentos) return [];
      let sortableItems = [...data.comissionamentos];
      sortableItems.sort((a, b) => {
         let aValue: any;
         let bValue: any;

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

         aValue = getValue(a);
         bValue = getValue(b);

         if (aValue === bValue) return 0;
         if (aValue == null) return sortConfig.direction === "asc" ? 1 : -1;
         if (bValue == null) return sortConfig.direction === "asc" ? -1 : 1;

         if (aValue < bValue) return sortConfig.direction === "asc" ? -1 : 1;
         if (aValue > bValue) return sortConfig.direction === "asc" ? 1 : -1;
         return 0;
      });
      return sortableItems;
   }, [data?.comissionamentos, sortConfig, ano]);

   const requestSort = (key: SortKey) => {
      let direction: "asc" | "desc" = "asc";
      if (sortConfig.key === key && sortConfig.direction === "asc") {
         direction = "desc";
      }
      setSortConfig({ key, direction });
   };

   const renderHeader = (
      label: string,
      sortKey: SortKey,
      align: "left" | "center" = "center"
   ) => {
      const isActive = sortConfig.key === sortKey;
      return (
         <TableHeadCell
            className={clsx(
               "group cursor-pointer bg-gray-50 transition-colors select-none hover:bg-gray-100",
               align === "center" ? "text-center!" : "text-left!"
            )}
            style={{ textAlign: align }}
            onClick={() => requestSort(sortKey)}
         >
            <span className="relative inline-flex items-center justify-center">
               <span>{label}</span>
               <span className="absolute -right-5 flex h-full items-center">
                  {isActive ? (
                     sortConfig.direction === "asc" ? (
                        <HiChevronUp className="h-4 w-4 text-red-600" />
                     ) : (
                        <HiChevronDown className="h-4 w-4 text-red-600" />
                     )
                  ) : (
                     <HiSelector className="h-4 w-4 text-gray-400 opacity-0 transition-opacity group-hover:opacity-100" />
                  )}
               </span>
            </span>
         </TableHeadCell>
      );
   };

   return (
      <div className="animate-fadeIn flex flex-col gap-4">
         {/* CABEÇALHO */}
         <div className="flex flex-col border-b border-gray-100 py-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
               <h2 className="text-xl font-bold text-gray-900">
                  Gestão Fiscal de Comissionamentos
               </h2>
               <p className="text-sm text-gray-500">
                  Acompanhamento e controle orçamentário anual.
               </p>
            </div>
            <div className="mt-4 flex items-center gap-3 sm:mt-0">
               <div className="flex items-center gap-2">
                  <label className="text-sm font-medium text-gray-600">
                     Exercício
                  </label>
                  <Select
                     sizing="sm"
                     value={ano}
                     onChange={(e) => setAno(Number(e.target.value))}
                     className="min-w-28 shadow-sm"
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
            </div>
         </div>

         {isLoading ? (
            <div className="flex justify-center py-20">
               <Spinner size="xl" color="failure" />
            </div>
         ) : !data ? (
            <div className="flex justify-center py-20 text-gray-500">
               Erro ao carregar dados orçamentários.
            </div>
         ) : (
            <>
               {/* EMPTY STATE — sem orçamento cadastrado para o ano */}
               {!data.orcamento_id && (
                  <div className="flex flex-col items-center gap-3 rounded border border-dashed border-gray-300 bg-gray-50 py-10 text-center">
                     <FaRegMoneyBillAlt className="h-8 w-8 text-gray-300" />
                     <p className="text-sm font-medium text-gray-600">
                        Nenhum orçamento cadastrado para {ano}.
                     </p>
                     <Button
                        size="sm"
                        color="red"
                        onClick={() =>
                           router.push(`/cegep/comiss/orcamento?ano=${ano}`)
                        }
                     >
                        Cadastrar Teto Orçamentário
                     </Button>
                  </div>
               )}

               {/* DASHBOARD CARDS — só exibe quando há orçamento */}
               {data.orcamento_id && (
                  <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                     {/* ORÇAMENTO TOTAL */}
                     <div className="group relative overflow-hidden rounded border border-gray-200 bg-white p-5 shadow-sm">
                        {/* Glass decor */}
                        <div className="pointer-events-none absolute -top-6 -right-6 h-24 w-24 rounded-full bg-red-50 opacity-60 transition-transform group-hover:scale-110"></div>
                        <div className="mb-2 flex items-start justify-between">
                           <span className="block text-xs font-bold tracking-wider text-gray-500 uppercase">
                              Orçamento Total (Ano)
                           </span>
                           <FaRegMoneyBillAlt className="text-gray-400" />
                        </div>
                        <div className="mb-4 text-3xl font-extrabold text-gray-900 drop-shadow-sm">
                           {formatCurrency(data.total.orcamento)}
                        </div>
                        <div className="mb-1 flex justify-between text-sm text-gray-500">
                           <span>Consumido / Previsto</span>
                           <div className="flex gap-1 font-semibold text-gray-700">
                              <span className="text-green-600">
                                 {Math.round(
                                    (data.total.soma / data.total.orcamento) *
                                       100
                                 )}
                                 %
                              </span>
                              {data.total.previsao ? (
                                 <span className="text-yellow-500">
                                    {Math.round(
                                       (data.total.previsao /
                                          data.total.orcamento) *
                                          100
                                    )}
                                    %
                                 </span>
                              ) : null}
                           </div>
                        </div>
                        <div className="flex h-2.5 w-full overflow-hidden rounded-full bg-gray-100">
                           <div
                              className="h-full rounded-l-full bg-green-500"
                              style={{
                                 width: `${(data.total.soma / data.total.orcamento) * 100}%`,
                              }}
                           ></div>
                           {data.total.previsao ? (
                              <div
                                 className="h-full bg-yellow-400"
                                 style={{
                                    width: `${(data.total.previsao / data.total.orcamento) * 100}%`,
                                 }}
                              ></div>
                           ) : null}
                        </div>
                        <div className="mt-3 flex gap-4 text-[10px] font-bold tracking-wide uppercase">
                           <div className="flex items-center gap-1.5 text-green-700">
                              <span className="h-2 w-2 rounded-full bg-green-500"></span>
                              Pago {formatCurrency(data.total.soma)}
                           </div>
                           <div className="flex items-center gap-1.5 text-yellow-700">
                              <span className="h-2 w-2 rounded-full bg-yellow-400"></span>
                              Previsto{" "}
                              {formatCurrency(data.total.previsao || 0)}
                           </div>
                           <div className="ml-auto flex items-center gap-1.5 text-blue-700">
                              <span className="h-2 w-2 rounded-full bg-blue-500"></span>
                              Disponível{" "}
                              {formatCurrency(
                                 data.total.orcamento -
                                    data.total.soma -
                                    (data.total.previsao || 0)
                              )}
                           </div>
                        </div>
                     </div>

                     {/* FECHAMENTOS */}
                     <div className="group relative overflow-hidden rounded border border-gray-200 bg-white p-5 shadow-sm">
                        {/* Glass decor */}
                        <div className="pointer-events-none absolute -top-6 -right-6 h-24 w-24 rounded-full bg-red-50 opacity-60 transition-transform group-hover:scale-110"></div>
                        <div className="mb-2 flex items-start justify-between">
                           <span className="block text-xs font-bold tracking-wider text-gray-500 uppercase">
                              Fechamentos (Términos)
                           </span>
                           <FaPlaneArrival className="text-gray-400" />
                        </div>
                        <div className="mb-4 text-3xl font-extrabold text-gray-900 drop-shadow-sm">
                           {formatCurrency(data.fechamento.orcamento)}
                        </div>
                        <div className="mb-1 flex justify-between text-sm text-gray-500">
                           <span>Consumido / Previsto</span>
                           <div className="flex gap-1 font-semibold text-gray-700">
                              <span className="text-green-600">
                                 {Math.round(
                                    (data.fechamento.soma /
                                       data.fechamento.orcamento) *
                                       100
                                 )}
                                 %
                              </span>
                              {data.fechamento.previsao ? (
                                 <span className="text-yellow-500">
                                    {Math.round(
                                       (data.fechamento.previsao /
                                          data.fechamento.orcamento) *
                                          100
                                    )}
                                    %
                                 </span>
                              ) : null}
                           </div>
                        </div>
                        <div className="flex h-2.5 w-full overflow-hidden rounded-full bg-gray-100">
                           <div
                              className="h-full rounded-l-full bg-green-500"
                              style={{
                                 width: `${(data.fechamento.soma / data.fechamento.orcamento) * 100}%`,
                              }}
                           ></div>
                           {data.fechamento.previsao ? (
                              <div
                                 className="h-full bg-yellow-400"
                                 style={{
                                    width: `${(data.fechamento.previsao / data.fechamento.orcamento) * 100}%`,
                                 }}
                              ></div>
                           ) : null}
                        </div>
                        <div className="mt-3 flex gap-4 text-[10px] font-bold tracking-wide uppercase">
                           <div className="flex items-center gap-1.5 text-green-700">
                              <span className="h-2 w-2 rounded-full bg-green-500"></span>
                              Pago {formatCurrency(data.fechamento.soma)}
                           </div>
                           <div className="flex items-center gap-1.5 text-yellow-700">
                              <span className="h-2 w-2 rounded-full bg-yellow-400"></span>
                              Previsto{" "}
                              {formatCurrency(data.fechamento.previsao || 0)}
                           </div>
                           <div className="ml-auto flex items-center gap-1.5 text-blue-700">
                              <span className="h-2 w-2 rounded-full bg-blue-500"></span>
                              Disponível{" "}
                              {formatCurrency(
                                 data.fechamento.orcamento -
                                    data.fechamento.soma -
                                    (data.fechamento.previsao || 0)
                              )}
                           </div>
                        </div>
                     </div>

                     {/* ABERTURAS */}
                     <div className="group relative overflow-hidden rounded border border-gray-200 bg-white p-5 shadow-sm">
                        {/* Glass decor */}
                        <div className="pointer-events-none absolute -top-6 -right-6 h-24 w-24 rounded-full bg-red-50 opacity-60 transition-transform group-hover:scale-110"></div>
                        <div className="mb-2 flex items-start justify-between">
                           <span className="block text-xs font-bold tracking-wider text-gray-500 uppercase">
                              Aberturas (Inícios)
                           </span>
                           <FaPlaneDeparture className="text-gray-400" />
                        </div>
                        <div className="mb-4 text-3xl font-extrabold text-gray-900 drop-shadow-sm">
                           {formatCurrency(data.abertura.orcamento)}
                        </div>
                        <div className="mb-1 flex justify-between text-sm text-gray-500">
                           <span>Consumido / Previsto</span>
                           <div className="flex gap-1 font-semibold text-gray-700">
                              <span className="text-green-600">
                                 {Math.round(
                                    (data.abertura.soma /
                                       data.abertura.orcamento) *
                                       100
                                 )}
                                 %
                              </span>
                           </div>
                        </div>
                        <div className="flex h-2.5 w-full overflow-hidden rounded-full bg-gray-100">
                           <div
                              className="h-full rounded-full bg-green-500"
                              style={{
                                 width: `${(data.abertura.soma / data.abertura.orcamento) * 100}%`,
                              }}
                           ></div>
                        </div>
                        <div className="mt-3 flex justify-between text-[10px] font-bold tracking-wide uppercase">
                           <div className="flex items-center gap-1.5 text-green-700">
                              <span className="h-2 w-2 rounded-full bg-green-500"></span>
                              Pago {formatCurrency(data.abertura.soma)}
                           </div>
                           <div className="ml-auto flex items-center gap-1.5 text-blue-700">
                              <span className="h-2 w-2 rounded-full bg-blue-500"></span>
                              Disponível{" "}
                              {formatCurrency(
                                 data.abertura.orcamento - data.abertura.soma
                              )}
                           </div>
                        </div>
                     </div>
                  </div>
               )}

               {/* TABELA DE REGISTROS DO ANO */}
               <div className="overflow-hidden rounded bg-white shadow-sm ring-1 ring-gray-200">
                  <div className="border-b border-gray-100 bg-gray-50/50 px-5 py-3">
                     <h3 className="font-semibold text-gray-800">
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
                        <TableBody className="divide-y divide-gray-200">
                           {sortedComissionamentos.map((c) => {
                              const anoAb = new Date(c.data_ab).getFullYear();
                              const anoFc = c.data_fc
                                 ? new Date(c.data_fc).getFullYear()
                                 : null;
                              const impacto = computeImpacto(c, ano);

                              return (
                                 <TableRow
                                    key={c.id}
                                    className="cursor-pointer bg-white"
                                    onClick={() =>
                                       router.push(`/cegep/comiss/${c.id}`)
                                    }
                                 >
                                    <TableCell className="font-medium whitespace-nowrap text-gray-900">
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
                                          {formatCurrency(c.valor_aj_ab)}
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
                                             ? formatCurrency(c.valor_aj_fc)
                                             : "-"}
                                       </span>
                                    </TableCell>
                                    <TableCell className="text-center font-semibold whitespace-nowrap text-gray-900">
                                       {formatCurrency(impacto)}
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
                                          <span className="text-xs font-bold text-gray-700">
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
                                    className="py-8 text-center text-gray-500"
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
            </>
         )}
      </div>
   );
}
