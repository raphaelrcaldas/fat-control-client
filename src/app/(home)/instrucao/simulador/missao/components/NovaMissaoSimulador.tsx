"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Spinner } from "flowbite-react";

import { useUnsavedChangesGuard } from "@/app/(home)/estatistica/etapas/missao/hooks/useUnsavedChangesGuard";
import { useSessaoForm } from "../../hooks/useSessaoForm";
import { MAX_PILOTOS, SIM_ANV } from "../../types";
import { sortPilotos } from "../../helpers/sessoes";
import MissaoObsField from "../../components/MissaoObsField";
import PilotSearchDropdown from "../../components/PilotSearchDropdown";
import SessaoDadosFields from "../../components/SessaoDadosFields";
import SessaoOrdemInstrucaoFields from "../../components/SessaoOrdemInstrucaoFields";
import { SimuladorEditorHeader } from "./SimuladorEditorHeader";
import { SimuladorEditorLayout } from "./SimuladorEditorLayout";
import {
   SIDEBAR_DRAWER_ID,
   SimuladorSidebarDrawer,
} from "./SimuladorSidebarDrawer";
import { MissaoSidebar } from "@/app/(home)/estatistica/etapas/missao/components/MissaoSidebar";

const NOVA_FORM_ID = "simulador-nova-missao-form";

interface NovaMissaoSimuladorProps {
   anoRef: number;
}

export function NovaMissaoSimulador({ anoRef }: NovaMissaoSimuladorProps) {
   const router = useRouter();
   const contentRef = useRef<HTMLDivElement>(null);
   const sidebarTriggerRef = useRef<HTMLButtonElement>(null);
   // A navegacao pos-sucesso nao pode disparar o guard de saida.
   const savedRef = useRef(false);
   const [obs, setObs] = useState("");
   const [sidebarOpen, setSidebarOpen] = useState(false);

   const handlePersisted = useCallback(
      (novaMissaoId: number) => {
         savedRef.current = true;
         // `replace`: voltar para um formulario ja submetido recriaria a dupla.
         router.replace(`/instrucao/simulador/missao/${novaMissaoId}`);
      },
      [router]
   );

   // Missao e 1ª sessao nascem juntas, numa unica chamada transacional.
   const form = useSessaoForm({
      anoRef,
      obs: obs.trim() || null,
      onPersistDraft: handlePersisted,
   });

   const isDirty = form.isDirty || obs.trim().length > 0;

   // Fechar a aba / recarregar com dados preenchidos perde tudo: nada foi
   // gravado ainda. Cobre tambem clique em link interno, como no editor de
   // etapas. `savedRef` evita o aviso ao navegar apos o submit ter sucesso.
   useUnsavedChangesGuard({ enabled: isDirty && !savedRef.current });

   const subtitle = useMemo(() => {
      if (form.sessionPilots.length === 0) {
         return `Ano ${anoRef} · selecione os pilotos da dupla`;
      }
      return sortPilotos(form.sessionPilots)
         .map((pilot) => `${pilot.p_g} ${pilot.nome_guerra}`)
         .join(" · ")
         .toUpperCase();
   }, [anoRef, form.sessionPilots]);

   const sidebarNode = (
      <MissaoSidebar
         ariaLabel="Painel da nova missão"
         tituloMissao="Nova dupla"
         obsValue={obs}
         onObsChange={setObs}
         disabled={form.isPending}
         parte1Label="Ficha"
         onSelectEtapa={() => {
            setSidebarOpen(false);
            contentRef.current?.scrollTo({ top: 0 });
         }}
         etapas={[
            {
               localId: "nova-sessao",
               numero: "01",
               data: form.preview.data,
               origem: form.preview.origem || "----",
               destino: form.preview.destino || "----",
               anv: SIM_ANV,
               depHora: form.preview.dep || "--:--",
               arrHora: form.preview.arr || "--:--",
               tvooMin: form.preview.tvoo,
               status:
                  form.dateOutOfYear ||
                  (form.preview.dep && form.preview.arr && !form.tvooValid)
                     ? "verificar"
                     : form.canSubmit
                       ? "ok"
                       : "rascunho",
               sagem: form.preview.sagem,
               parte1: form.preview.parte1,
               selected: true,
               isNew: true,
            },
         ]}
      />
   );

   return (
      <>
         <SimuladorEditorLayout
            contentRef={contentRef}
            sidebar={sidebarNode}
            header={
               <SimuladorEditorHeader
                  title="Nova dupla"
                  subtitle={subtitle}
                  formId={NOVA_FORM_ID}
                  canDelete={false}
                  canSave={form.canSubmit}
                  isSaving={form.isPending}
                  onBack={() => {
                     if (
                        isDirty &&
                        !savedRef.current &&
                        !window.confirm(
                           "Há mudanças não salvas. Sair mesmo assim?"
                        )
                     )
                        return;
                     router.push("/instrucao/simulador");
                  }}
                  onOpenSidebar={() => setSidebarOpen(true)}
                  sidebarTriggerRef={sidebarTriggerRef}
                  sidebarOpen={sidebarOpen}
                  sidebarId={SIDEBAR_DRAWER_ID}
                  saveLabel="Criar dupla"
               />
            }
            content={
               <form
                  id={NOVA_FORM_ID}
                  onSubmit={form.handleSubmit}
                  className="space-y-3"
               >
                  <fieldset disabled={form.isPending} className="space-y-3">
                     <div className="space-y-3 rounded border border-slate-200 bg-white p-4 shadow-sm">
                        <div className="flex items-center justify-between gap-3">
                           <h2 className="text-sm font-semibold text-slate-800">
                              Pilotos da dupla
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

                     <section
                        aria-label="Observações da missão"
                        className="space-y-2 rounded border border-slate-200 bg-white p-4 shadow-sm lg:hidden"
                     >
                        <MissaoObsField
                           id="simulador-nova-missao-obs-mobile"
                           value={obs}
                           onChange={setObs}
                           labelVisible
                           rows={3}
                           className="resize-y text-sm"
                        />
                     </section>

                     <SessaoDadosFields form={form} />
                     <SessaoOrdemInstrucaoFields form={form} />
                  </fieldset>

                  {form.isPending && (
                     <div className="flex items-center justify-end gap-2 text-sm text-slate-500">
                        <Spinner size="sm" color="primary" />
                        Criando dupla...
                     </div>
                  )}
               </form>
            }
         />
         <SimuladorSidebarDrawer
            open={sidebarOpen}
            onClose={() => setSidebarOpen(false)}
            returnFocusRef={sidebarTriggerRef}
         >
            {sidebarNode}
         </SimuladorSidebarDrawer>
      </>
   );
}
