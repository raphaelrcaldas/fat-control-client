"use client";

import { useState, type FormEvent } from "react";
import { MAX_PILOTOS } from "../../types";
import type { SimuladorEtapaForm } from "../hooks/useSimuladorMissaoDraft";
import PilotSearchDropdown from "../../components/PilotSearchDropdown";
import SessaoDadosFields from "../../components/SessaoDadosFields";
import SessaoOrdemInstrucaoFields from "../../components/SessaoOrdemInstrucaoFields";
import { SessaoPreFilledBanner } from "../../components/SessaoPreFilledBanner";

export const SESSAO_FORM_ID = "simulador-sessao-form";

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
   form,
   disabled,
   preFilled,
   onSubmit,
}: {
   form: SimuladorEtapaForm;
   disabled: boolean;
   preFilled: boolean;
   onSubmit: (event: FormEvent) => void;
}) {
   const [bannerDismissed, setBannerDismissed] = useState(false);
   if (form.isLoadingData) return <FormDataSkeleton />;
   return (
      <form id={SESSAO_FORM_ID} onSubmit={onSubmit}>
         <fieldset disabled={disabled} className="min-w-0 space-y-3">
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
                  showSearch
               />
            </div>
            <SessaoDadosFields form={form} />
            <SessaoOrdemInstrucaoFields form={form} />
         </fieldset>
      </form>
   );
}
