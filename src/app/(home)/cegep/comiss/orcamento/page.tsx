"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
   Button,
   Label,
   Progress,
   Select,
   Spinner,
   TextInput,
} from "flowbite-react";
import clsx from "clsx";
import { HiArrowLeft } from "react-icons/hi";
import { FaSave } from "react-icons/fa";
import { useToast } from "@/app/context/toast";
import {
   useOrcamento,
   useOrcamentoLogs,
   useCreateOrcamento,
   useUpdateOrcamento,
} from "@/hooks/queries/useOrcamento";
import { formatDateTime } from "@/../utils/dateHandler";
import { realCurrency } from "utils/financeiro";
import type { OrcamentoLog } from "services/routes/cegep/orcamento";
import { OrcamentoFormSkeleton } from "./OrcamentoFormSkeleton";
import { usePermBased } from "@/app/(home)/hooks/usePermBased";
import { getDefaultFiscalYear, getFiscalYears } from "../fiscalYears";

// Converte um inteiro de centavos para "1.234.567,89" (pt-BR com separadores)
function formatCents(cents: number): string {
   return new Intl.NumberFormat("pt-BR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
   }).format(cents / 100);
}

// Extrai apenas digitos e interpreta como centavos (mascara dinamica)
function parseDigitsToCents(raw: string): number {
   const digits = raw.replace(/\D/g, "");
   if (!digits) return 0;
   return Number(digits);
}

const ACTION_LABEL: Record<string, string> = {
   create: "Criação",
   update: "Atualização",
};

export default function OrcamentoAnualPage() {
   const router = useRouter();
   const searchParams = useSearchParams();
   const { push } = useToast();
   const { hasPerm } = usePermBased();
   const canEdit = hasPerm("orcamento", "create");

   const yearsRange = useMemo(() => getFiscalYears(), []);

   const anoParam = Number(searchParams.get("ano"));
   const initialAno = yearsRange.includes(anoParam)
      ? anoParam
      : getDefaultFiscalYear();

   const [ano, setAno] = useState<number>(initialAno);
   // Estado dos valores armazenado em centavos (inteiro) para mascara precisa
   const [totalCents, setTotalCents] = useState(0);
   const [aberturaCents, setAberturaCents] = useState(0);
   const [fechamentoCents, setFechamentoCents] = useState(0);
   const [isDirty, setIsDirty] = useState(false);

   const { data: orcamento, isLoading } = useOrcamento(ano);
   const { data: logs = [], isLoading: logsLoading } = useOrcamentoLogs(
      orcamento?.id
   );

   const createMutation = useCreateOrcamento();
   const updateMutation = useUpdateOrcamento();

   useEffect(() => {
      if (orcamento) {
         setTotalCents(Math.round(orcamento.total * 100));
         setAberturaCents(Math.round(orcamento.abertura * 100));
         setFechamentoCents(Math.round(orcamento.fechamento * 100));
      } else {
         setTotalCents(0);
         setAberturaCents(0);
         setFechamentoCents(0);
      }
      setIsDirty(false);
   }, [orcamento]);

   const totalNum = totalCents / 100;
   const aberturaNum = aberturaCents / 100;
   const fechamentoNum = fechamentoCents / 100;
   const distribuidoCents = aberturaCents + fechamentoCents;
   const distribuido = distribuidoCents / 100;
   const diffCents = totalCents - distribuidoCents;
   const diff = diffCents / 100;
   const isBalanced = diffCents === 0 && totalCents > 0;
   const pctAb = totalNum > 0 ? (aberturaNum / totalNum) * 100 : 0;
   const pctFc = totalNum > 0 ? (fechamentoNum / totalNum) * 100 : 0;
   const pctAlocado =
      totalNum > 0
         ? Math.min(100, Math.round((distribuido / totalNum) * 100))
         : 0;

   const isSaving = createMutation.isPending || updateMutation.isPending;

   async function handleSave() {
      if (totalNum <= 0) {
         push({
            title: "Valor inválido",
            message: "O orçamento total deve ser maior que zero.",
            type: "warning",
         });
         return;
      }
      if (!isBalanced) {
         push({
            title: "Distribuição inválida",
            message:
               "A soma das cotas de abertura e fechamento deve ser igual ao orçamento total.",
            type: "warning",
         });
         return;
      }

      const payload = {
         ano_ref: ano,
         total: totalNum,
         abertura: aberturaNum,
         fechamento: fechamentoNum,
      };

      try {
         if (orcamento) {
            await updateMutation.mutateAsync({
               id: orcamento.id,
               payload,
               previousAnoRef: orcamento.ano_ref,
            });
         } else {
            await createMutation.mutateAsync(payload);
         }
         setIsDirty(false);
         push({
            title: "Sucesso!",
            message: "Orçamento salvo com sucesso.",
            type: "success",
         });
      } catch (err: unknown) {
         const message =
            err instanceof Error ? err.message : "Erro ao salvar orçamento";
         push({ title: "Erro", message, type: "error" });
      }
   }

   function handleYearChange(newYear: number) {
      if (isDirty) {
         push({
            title: "Alterações não salvas",
            message:
               "Salve ou cancele as alterações antes de trocar o exercício.",
            type: "warning",
         });
         return;
      }
      setAno(newYear);
   }

   function handleMoneyChange(setter: (n: number) => void, raw: string) {
      setter(parseDigitsToCents(raw));
      setIsDirty(true);
   }

   if (!canEdit) {
      return (
         <div className="flex w-full justify-center">
            <div className="flex w-full max-w-7xl flex-col gap-4">
               <div className="flex items-center gap-2 text-sm text-gray-600">
                  <button
                     type="button"
                     onClick={() =>
                        router.push("/cegep/comiss?tab=gestao_fiscal")
                     }
                     className="inline-flex items-center gap-1 font-medium text-red-700 hover:underline"
                  >
                     <HiArrowLeft className="h-4 w-4" />
                     Gestão Fiscal
                  </button>
               </div>
               <div className="rounded border border-slate-200 bg-white p-10 text-center shadow-sm">
                  <p className="text-sm font-medium text-gray-700">
                     Você não tem permissão para editar o teto orçamentário.
                  </p>
               </div>
            </div>
         </div>
      );
   }

   return (
      <div className="flex w-full justify-center">
         <div className="flex w-full max-w-7xl flex-col gap-6">
            {/* BREADCRUMB */}
            <div className="flex items-center gap-2 text-sm text-gray-600">
               <button
                  onClick={() => router.push("/cegep/comiss?tab=gestao_fiscal")}
                  className="inline-flex items-center gap-1 font-medium text-red-700 hover:underline"
               >
                  <HiArrowLeft className="h-4 w-4" />
                  Gestão Fiscal
               </button>
               <span className="text-gray-400">/</span>
               <span className="font-medium text-gray-800">
                  Editar Teto Orçamentário
               </span>
            </div>

            {/* HEADER */}
            <div>
               <h2 className="text-xl font-bold text-gray-900">
                  Editar Teto Orçamentário
               </h2>
               <p className="text-sm text-gray-500">
                  Ajuste os valores do teto global e a distribuição de cotas
                  para o exercício fiscal selecionado.
               </p>
            </div>

            {/* CARD DE EDIÇÃO */}
            <div className="rounded border border-slate-200 bg-white p-6 shadow-sm">
               {isLoading ? (
                  <OrcamentoFormSkeleton />
               ) : (
                  <div className="space-y-6">
                     <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                        {/* ANO */}
                        <div>
                           <Label
                              htmlFor="ano"
                              className="text-xs font-bold tracking-wider text-gray-500 uppercase"
                           >
                              Exercício Fiscal
                           </Label>
                           <Select
                              id="ano"
                              className="mt-1"
                              value={ano}
                              onChange={(e) =>
                                 handleYearChange(Number(e.target.value))
                              }
                           >
                              {yearsRange.map((y) => (
                                 <option key={y} value={y}>
                                    {y}
                                 </option>
                              ))}
                           </Select>
                           <p className="mt-1 text-xs text-gray-400">
                              Selecione o ano de referência do orçamento.
                           </p>
                        </div>

                        {/* TOTAL */}
                        <div>
                           <Label
                              htmlFor="total"
                              className="text-xs font-bold tracking-wider text-gray-500 uppercase"
                           >
                              Orçamento Total (Global)
                           </Label>
                           <div className="relative mt-1">
                              <span className="absolute top-1/2 left-3 -translate-y-1/2 text-sm text-gray-500">
                                 R$
                              </span>
                              <TextInput
                                 id="total"
                                 inputMode="numeric"
                                 value={formatCents(totalCents)}
                                 onChange={(e) =>
                                    handleMoneyChange(
                                       setTotalCents,
                                       e.target.value
                                    )
                                 }
                                 className="[&_input]:pl-10 [&_input]:text-right"
                                 placeholder="0,00"
                              />
                           </div>
                           <p className="mt-1 text-xs text-gray-400">
                              Valor limite para todas as operações do ano.
                           </p>
                        </div>
                     </div>

                     <hr className="border-gray-100" />

                     <div>
                        <h3 className="mb-3 text-sm font-semibold text-gray-800">
                           Distribuição de Cotas
                        </h3>

                        <div className="rounded bg-slate-50 p-4">
                           <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                              <div>
                                 <Label
                                    htmlFor="abertura"
                                    className="text-xs font-bold tracking-wider text-gray-500 uppercase"
                                 >
                                    Cota para Aberturas
                                 </Label>
                                 <div className="relative mt-1">
                                    <span className="absolute top-1/2 left-3 -translate-y-1/2 text-sm text-gray-500">
                                       R$
                                    </span>
                                    <TextInput
                                       id="abertura"
                                       inputMode="numeric"
                                       value={formatCents(aberturaCents)}
                                       onChange={(e) =>
                                          handleMoneyChange(
                                             setAberturaCents,
                                             e.target.value
                                          )
                                       }
                                       className="[&_input]:pl-10 [&_input]:text-right"
                                       placeholder="0,00"
                                    />
                                 </div>
                                 <p className="mt-1 text-xs text-gray-500">
                                    Alocação sugerida: {Math.round(pctAb)}%
                                 </p>
                              </div>

                              <div>
                                 <Label
                                    htmlFor="fechamento"
                                    className="text-xs font-bold tracking-wider text-gray-500 uppercase"
                                 >
                                    Cota para Fechamentos
                                 </Label>
                                 <div className="relative mt-1">
                                    <span className="absolute top-1/2 left-3 -translate-y-1/2 text-sm text-gray-500">
                                       R$
                                    </span>
                                    <TextInput
                                       id="fechamento"
                                       inputMode="numeric"
                                       value={formatCents(fechamentoCents)}
                                       onChange={(e) =>
                                          handleMoneyChange(
                                             setFechamentoCents,
                                             e.target.value
                                          )
                                       }
                                       className="[&_input]:pl-10 [&_input]:text-right"
                                       placeholder="0,00"
                                    />
                                 </div>
                                 <p className="mt-1 text-xs text-gray-500">
                                    Alocação sugerida: {Math.round(pctFc)}%
                                 </p>
                              </div>
                           </div>
                        </div>
                     </div>

                     {/* BARRA DE ALOCAÇÃO */}
                     <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                           <span className="text-gray-600">
                              Total Distribuído: {realCurrency(distribuido)}
                           </span>
                           <span
                              className={clsx(
                                 "font-semibold",
                                 isBalanced
                                    ? "text-green-600"
                                    : distribuido > totalNum
                                      ? "text-red-600"
                                      : "text-yellow-600"
                              )}
                           >
                              {pctAlocado}% Alocado
                           </span>
                        </div>
                        <Progress
                           progress={pctAlocado}
                           size="lg"
                           color={
                              isBalanced
                                 ? "green"
                                 : distribuido > totalNum
                                   ? "red"
                                   : "yellow"
                           }
                        />
                        {!isBalanced && totalNum > 0 && (
                           <p className="text-xs font-medium text-red-600">
                              {diff > 0
                                 ? `Faltam ${realCurrency(diff)} para atingir o teto.`
                                 : `Excedeu o teto em ${realCurrency(-diff)}.`}
                           </p>
                        )}
                     </div>

                     {/* AÇÕES */}
                     <div className="flex justify-end gap-2">
                        <Button
                           color="gray"
                           onClick={() =>
                              router.push("/cegep/comiss?tab=gestao_fiscal")
                           }
                           disabled={isSaving}
                        >
                           Cancelar
                        </Button>
                        <Button
                           color="red"
                           onClick={handleSave}
                           disabled={isSaving || !isBalanced}
                        >
                           {isSaving ? (
                              <Spinner size="sm" color="primary" />
                           ) : (
                              <>
                                 <FaSave className="mr-2 h-4 w-4" />
                                 Salvar Alterações
                              </>
                           )}
                        </Button>
                     </div>
                  </div>
               )}
            </div>

            {/* HISTÓRICO */}
            <div className="rounded border border-slate-200 bg-white shadow-sm">
               <div className="border-b border-gray-100 bg-gray-50/50 px-5 py-3">
                  <h3 className="font-semibold text-gray-800">
                     Histórico de Alterações
                  </h3>
                  <p className="text-xs text-gray-500">
                     Mudanças de teto e cotas deste exercício fiscal.
                  </p>
               </div>
               <div className="p-5">
                  {!orcamento ? (
                     <p className="py-6 text-center text-sm text-gray-500">
                        Nenhum orçamento cadastrado para este ano.
                     </p>
                  ) : logsLoading ? (
                     <div className="flex justify-center py-8">
                        <Spinner color="primary" />
                     </div>
                  ) : logs.length === 0 ? (
                     <p className="py-6 text-center text-sm text-gray-500">
                        Sem registros de alteração.
                     </p>
                  ) : (
                     <ol className="relative space-y-4 border-s border-gray-200 ps-5">
                        {logs.map((log) => (
                           <OrcamentoLogEntry key={log.id} log={log} />
                        ))}
                     </ol>
                  )}
               </div>
            </div>
         </div>
      </div>
   );
}

function OrcamentoLogEntry({ log }: { log: OrcamentoLog }) {
   const action = ACTION_LABEL[log.action] ?? log.action;
   const before = log.before;
   const after = log.after;

   const diffs: { label: string; before?: number; after?: number }[] = [];
   if (after) {
      const keys: (keyof typeof after)[] = ["total", "abertura", "fechamento"];
      const labels: Record<string, string> = {
         total: "Total",
         abertura: "Abertura",
         fechamento: "Fechamento",
      };
      for (const k of keys) {
         const b = before ? (before[k] as number) : undefined;
         const a = after[k] as number;
         if (b !== a) diffs.push({ label: labels[k], before: b, after: a });
      }
   }

   return (
      <li className="relative">
         <span className="absolute -inset-s-6.5 mt-1.5 flex h-3 w-3 items-center justify-center rounded-full border border-red-300 bg-red-100"></span>
         <div className="flex flex-wrap items-baseline justify-between gap-2">
            <div>
               <span className="text-sm font-semibold text-gray-800">
                  {action}
               </span>
               {log.user && (
                  <span className="ml-2 text-xs text-gray-500 uppercase">
                     por {log.user.p_g} {log.user.nome_guerra}
                  </span>
               )}
            </div>
            <time className="text-xs text-gray-400">
               {formatDateTime(log.timestamp) ?? ""}
            </time>
         </div>
         {diffs.length > 0 && (
            <ul className="mt-2 space-y-0.5 text-xs text-gray-600">
               {diffs.map((d) => (
                  <li key={d.label}>
                     <span className="font-medium text-gray-700">
                        {d.label}:
                     </span>{" "}
                     {d.before !== undefined ? (
                        <>
                           <span className="text-red-600 line-through">
                              {realCurrency(d.before)}
                           </span>{" "}
                           <span className="text-gray-400">→</span>{" "}
                           <span className="text-green-700">
                              {realCurrency(d.after ?? 0)}
                           </span>
                        </>
                     ) : (
                        <span className="text-green-700">
                           {realCurrency(d.after ?? 0)}
                        </span>
                     )}
                  </li>
               ))}
            </ul>
         )}
      </li>
   );
}
