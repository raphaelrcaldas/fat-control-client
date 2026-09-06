"use client";

import { useCallback, useMemo, useState } from "react";
import { Button, Spinner } from "flowbite-react";
import { HiCheck, HiClock, HiMoon, HiSun, HiX } from "react-icons/hi";
import { GiOwl } from "react-icons/gi";
import { ExportCartBar } from "@/components/export/ExportCartBar";
import type { ExportCart } from "@/components/export/useExportCart";
import { useBulkUpdateEtapas } from "@/hooks/queries/useEtapas";
import { minutesToTime } from "@/../utils/dateHandler";
import type { EtapaFlatItem } from "services/routes/estatistica/etapas";
import { PermBased } from "@/app/(home)/hooks/usePermBased";
import { useToast } from "@/app/context/toast";
import { ConfirmModal } from "@/components/ui/ConfirmModal";

interface EtapasSelectionBarProps {
   cart: ExportCart<EtapaFlatItem>;
   visibleSelectedCount: number;
   onExport: () => void;
   hidden: boolean;
}

interface PendingBulkAction {
   field: "sagem" | "parte1";
   value: boolean;
}

export function EtapasSelectionBar({
   cart,
   visibleSelectedCount,
   onExport,
   hidden,
}: EtapasSelectionBarProps) {
   const bulkUpdate = useBulkUpdateEtapas();
   const { push } = useToast();
   const [pendingBulkAction, setPendingBulkAction] =
      useState<PendingBulkAction | null>(null);

   const hiddenSelectedCount = cart.count - visibleSelectedCount;

   const totalTvoo = useMemo(
      () => cart.items.reduce((sum, etapa) => sum + etapa.tvoo, 0),
      [cart.items]
   );

   const oiTotals = useMemo(() => {
      const totals = { d: 0, n: 0, v: 0 };
      for (const etapa of cart.items) {
         for (const oi of etapa.oi_etapas) totals[oi.reg] += oi.tvoo;
      }
      return totals;
   }, [cart.items]);

   const handleBulkUpdate = useCallback(
      (field: "sagem" | "parte1", value: boolean) => {
         const ids = cart.items.map((etapa) => etapa.id);
         bulkUpdate.mutate(
            { ids, data: { [field]: value } },
            {
               onSuccess: (result) => {
                  const label = field === "sagem" ? "SAGEM" : "Parte 1";
                  if (!result.ok) {
                     push({
                        title: "Erro ao atualizar etapas",
                        message:
                           result.message ??
                           `Não foi possível atualizar ${label}.`,
                        type: "error",
                     });
                     return;
                  }
                  push({
                     title: "Etapas atualizadas",
                     message: `${label} ${value ? "marcado" : "desmarcado"} em ${ids.length} etapa(s).`,
                     type: "success",
                  });
                  cart.clear();
               },
               onError: (error) => {
                  push({
                     title: "Erro ao atualizar etapas",
                     message:
                        error instanceof Error
                           ? error.message
                           : "Não foi possível concluir a atualização.",
                     type: "error",
                  });
               },
            }
         );
      },
      [bulkUpdate, cart, push]
   );

   const requestBulkUpdate = useCallback(
      (field: "sagem" | "parte1", value: boolean) => {
         if (hiddenSelectedCount > 0) {
            setPendingBulkAction({ field, value });
            return;
         }
         handleBulkUpdate(field, value);
      },
      [handleBulkUpdate, hiddenSelectedCount]
   );

   const details = (
      <div className="flex shrink-0 items-center gap-2 text-sm font-semibold text-slate-800">
         <span className="flex items-center gap-1">
            <HiClock className="h-4 w-4 text-blue-600" />
            {minutesToTime(totalTvoo)}
         </span>
         {(oiTotals.d > 0 || oiTotals.n > 0 || oiTotals.v > 0) && (
            <span className="hidden items-center gap-2 lg:flex">
               {oiTotals.d > 0 && (
                  <span className="flex items-center gap-1 text-amber-600">
                     <HiSun className="h-4 w-4" />
                     {minutesToTime(oiTotals.d)}
                  </span>
               )}
               {oiTotals.n > 0 && (
                  <span className="flex items-center gap-1 text-indigo-600">
                     <HiMoon className="h-4 w-4" />
                     {minutesToTime(oiTotals.n)}
                  </span>
               )}
               {oiTotals.v > 0 && (
                  <span className="flex items-center gap-1 text-emerald-600">
                     <GiOwl className="h-4 w-4" />
                     {minutesToTime(oiTotals.v)}
                  </span>
               )}
            </span>
         )}
      </div>
   );

   const bulkToggle = (label: string, field: "sagem" | "parte1") => (
      <div className="hidden h-9 w-32 items-center justify-between gap-1 rounded border border-slate-200 bg-white px-1.5 shadow lg:flex pointer-coarse:min-h-[44px] pointer-coarse:w-[156px]">
         <span className="text-sm font-medium whitespace-nowrap text-slate-500">
            {label}
         </span>
         <Button
            size="xs"
            color="light"
            onClick={() => requestBulkUpdate(field, true)}
            disabled={bulkUpdate.isPending}
            aria-label={`Marcar ${label} nas etapas selecionadas`}
            className="h-7 w-7 min-w-0 border-emerald-200 bg-emerald-50 p-0 text-emerald-700 shadow hover:bg-emerald-100"
         >
            <HiCheck className="h-4 w-4" />
         </Button>
         <Button
            size="xs"
            color="light"
            onClick={() => requestBulkUpdate(field, false)}
            disabled={bulkUpdate.isPending}
            aria-label={`Desmarcar ${label} nas etapas selecionadas`}
            className="h-7 w-7 min-w-0 border-amber-200 bg-amber-50 p-0 text-amber-700 shadow hover:bg-amber-100"
         >
            <HiX className="h-4 w-4" />
         </Button>
      </div>
   );

   const extraActions = (
      <>
         <PermBased resource="estatistica.etapas" requiredPerm="update">
            {bulkToggle("SAGEM", "sagem")}
            {bulkToggle("Parte 1", "parte1")}
         </PermBased>
         {bulkUpdate.isPending && <Spinner size="xs" color="primary" />}
      </>
   );

   const pendingLabel =
      pendingBulkAction?.field === "sagem" ? "SAGEM" : "Parte 1";

   return (
      <>
         <ExportCartBar
            cart={cart}
            onExport={onExport}
            noun={{ one: "etapa", many: "etapas" }}
            details={details}
            extraActions={extraActions}
            desktopOnly={false}
            compact
            hidden={hidden || pendingBulkAction !== null}
         />

         <ConfirmModal
            show={pendingBulkAction !== null}
            title={`Atualizar ${pendingLabel}`}
            description={
               <>
                  A ação será aplicada às {cart.count} etapas selecionadas,
                  incluindo {hiddenSelectedCount} que não aparecem na
                  visualização atual. Deseja continuar?
               </>
            }
            confirmButtonText={
               pendingBulkAction?.value
                  ? `Marcar ${pendingLabel}`
                  : `Desmarcar ${pendingLabel}`
            }
            onClose={() => setPendingBulkAction(null)}
            onConfirm={() => {
               if (pendingBulkAction) {
                  handleBulkUpdate(
                     pendingBulkAction.field,
                     pendingBulkAction.value
                  );
               }
               setPendingBulkAction(null);
            }}
         />
      </>
   );
}
