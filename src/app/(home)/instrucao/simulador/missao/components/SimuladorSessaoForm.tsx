"use client";

import { useEffect, useMemo, useState } from "react";
import { Spinner } from "flowbite-react";

import { todayIso } from "@/../utils/dateHandler";
import type { EtapaItem } from "services/routes/estatistica/etapas";
import type { DuplaPilot } from "../../types";
import { MAX_PILOTOS } from "../../types";
import { useSessaoForm } from "../../hooks/useSessaoForm";
import type { SessaoFormState } from "../../helpers/sessaoDraft";
import PilotSearchDropdown from "../../components/PilotSearchDropdown";
import SessaoDadosFields from "../../components/SessaoDadosFields";
import SessaoOrdemInstrucaoFields from "../../components/SessaoOrdemInstrucaoFields";
import { SessaoPreFilledBanner } from "../../components/SessaoPreFilledBanner";

export const SESSAO_FORM_ID = "simulador-sessao-form";

interface SimuladorSessaoFormProps {
   missaoId: number;
   pilotos: DuplaPilot[];
   editEtapa: EtapaItem | null;
   ultimaEtapa: EtapaItem | null;
   /** Ano dominante da missao, usado como referencia de validacao. */
   anoMissao: number | null;
   onSaved: (etapaId: number) => void;
   onFormStateChange: (state: SessaoFormState) => void;
}

function FormDataSkeleton() {
   return (
      <div
         role="status"
         aria-label="Carregando dados do formulário"
         className="animate-pulse space-y-3"
      >
         <div className="h-24 rounded border border-slate-200 bg-white shadow-sm" />
         <div className="h-40 rounded border border-slate-200 bg-white shadow-sm" />
         <div className="h-24 rounded border border-slate-200 bg-white shadow-sm" />
      </div>
   );
}

export function SimuladorSessaoForm({
   missaoId,
   pilotos,
   editEtapa,
   ultimaEtapa,
   anoMissao,
   onSaved,
   onFormStateChange,
}: SimuladorSessaoFormProps) {
   // NAO derive da etapa em edicao: uma sessao gravada com ano errado
   // (digitacao, ex. 0006) se autoaprovaria na validacao e prenderia o
   // seletor ao ano errado. A ancora e o ano dominante da missao.
   const anoRef = useMemo(() => {
      if (anoMissao) return anoMissao;
      const referenceDate = ultimaEtapa?.data ?? todayIso();
      return Number(referenceDate.slice(0, 4));
   }, [anoMissao, ultimaEtapa?.data]);

   // O componente e remontado por `key` a cada troca de sessao, entao o
   // estado volta a `false` sozinho ao abrir a proxima.
   const [bannerDismissed, setBannerDismissed] = useState(false);
   const preFilled = editEtapa === null && ultimaEtapa !== null;

   const form = useSessaoForm({
      show: true,
      missaoId,
      anoRef,
      pilots: pilotos,
      editEtapa,
      ultimaEtapa,
      onClose: () => undefined,
      onSaved,
   });

   useEffect(() => {
      onFormStateChange({
         canSubmit: form.canSubmit,
         isPending: form.isPending,
         isDirty: form.isDirty,
         preview: form.preview,
      });
   }, [
      form.canSubmit,
      form.isPending,
      form.isDirty,
      form.preview,
      onFormStateChange,
   ]);

   if (form.isLoadingData) {
      return <FormDataSkeleton />;
   }

   return (
      <form
         id={SESSAO_FORM_ID}
         onSubmit={form.handleSubmit}
         className="space-y-3"
      >
         <SessaoPreFilledBanner
            visible={preFilled && !bannerDismissed}
            onDismiss={() => setBannerDismissed(true)}
         />

         <div className="space-y-3 rounded border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between gap-3">
               <h2 className="text-sm font-semibold text-slate-800">
                  Tripulação da sessão
               </h2>
               <span className="rounded border border-slate-200 bg-slate-50 px-2 py-0.5 text-xs font-semibold text-slate-600">
                  {form.sessionPilots.length} / {MAX_PILOTOS}
               </span>
            </div>
            <PilotSearchDropdown
               pilots={form.sessionPilots}
               onAdd={form.addPilot}
               onRemove={form.removePilot}
               onUpdateFuncBordo={form.updateFuncBordo}
               showSearch={pilotos.length === 0}
            />
         </div>

         <SessaoDadosFields form={form} />
         <SessaoOrdemInstrucaoFields form={form} />

         {form.isPending && (
            <div className="flex items-center justify-end gap-2 text-sm text-slate-500">
               <Spinner size="sm" color="primary" />
               Salvando sessão...
            </div>
         )}
      </form>
   );
}
