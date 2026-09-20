"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Spinner } from "flowbite-react";

import { useUnsavedChangesGuard } from "@/app/(home)/estatistica/etapas/missao/hooks/useUnsavedChangesGuard";
import { useSessaoForm } from "../../hooks/useSessaoForm";
import { MAX_PILOTOS } from "../../types";
import PilotSearchDropdown from "../../components/PilotSearchDropdown";
import SessaoDadosFields from "../../components/SessaoDadosFields";
import SessaoOrdemInstrucaoFields from "../../components/SessaoOrdemInstrucaoFields";
import { SimuladorEditorHeader } from "./SimuladorEditorHeader";
import { SimuladorEditorLayout } from "./SimuladorEditorLayout";
import { SimuladorSessaoSidebarItem } from "./SimuladorSessaoSidebarItem";

const NOVA_FORM_ID = "simulador-nova-missao-form";

/** Id temporario: `useSessaoForm` trata `missaoId < 0` como draft e salva via
 *  `createMissaoWithEtapas` — missao e 1ª sessao nascem juntas, numa chamada. */
const DRAFT_MISSAO_ID = -1;

interface NovaMissaoSimuladorProps {
   anoRef: number;
}

export function NovaMissaoSimulador({ anoRef }: NovaMissaoSimuladorProps) {
   const router = useRouter();
   const contentRef = useRef<HTMLDivElement>(null);
   // A navegacao pos-sucesso nao pode disparar o guard de saida.
   const savedRef = useRef(false);
   const [obs, setObs] = useState("");

   const handlePersisted = useCallback(
      (novaMissaoId: number) => {
         savedRef.current = true;
         // `replace`: voltar para um formulario ja submetido recriaria a dupla.
         router.replace(`/instrucao/simulador/missao/${novaMissaoId}`);
      },
      [router]
   );

   const form = useSessaoForm({
      show: true,
      missaoId: DRAFT_MISSAO_ID,
      anoRef,
      pilots: [],
      editEtapa: null,
      obs: obs.trim() || null,
      onClose: () => undefined,
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
      return form.sessionPilots
         .map((pilot) => `${pilot.p_g} ${pilot.nome_guerra}`)
         .join(" · ")
         .toUpperCase();
   }, [anoRef, form.sessionPilots]);

   return (
      <SimuladorEditorLayout
         contentRef={contentRef}
         sidebar={
            <aside
               aria-label="Painel da nova missão"
               className="flex h-full max-w-80 flex-col border-r border-gray-200 bg-gray-50"
            >
               <div className="flex flex-col gap-3 border-b border-gray-200 bg-white p-4">
                  <div className="min-w-0">
                     <h2 className="text-lg font-semibold text-gray-900">
                        Nova dupla
                     </h2>
                     <p className="text-xs text-gray-500">
                        Ano de referência {anoRef}
                     </p>
                  </div>
                  <label
                     htmlFor="simulador-nova-missao-obs"
                     className="sr-only"
                  >
                     Observações da missão
                  </label>
                  <textarea
                     id="simulador-nova-missao-obs"
                     value={obs}
                     onChange={(event) => setObs(event.target.value)}
                     placeholder="Observações da missão (opcional)"
                     rows={2}
                     className="focus:border-primary-400 focus:ring-primary-400 w-full resize-y rounded-md border border-gray-200 bg-gray-50 px-3 py-1.5 text-xs text-gray-700 placeholder:text-gray-400 focus:ring-1 focus:outline-none"
                  />
               </div>

               <div className="flex-1 space-y-3 overflow-y-auto p-3">
                  <SimuladorSessaoSidebarItem
                     numero={1}
                     sessao={form.preview}
                     anoRef={anoRef}
                     selected
                     isNew
                     onClick={() => contentRef.current?.scrollTo({ top: 0 })}
                  />
                  <p className="rounded border border-dashed border-gray-200 bg-white px-3 py-5 text-center text-sm text-gray-500">
                     A dupla e a primeira sessão são gravadas juntas ao salvar.
                  </p>
               </div>
            </aside>
         }
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
               saveLabel="Criar dupla"
            />
         }
         content={
            <form
               id={NOVA_FORM_ID}
               onSubmit={form.handleSubmit}
               className="space-y-3"
            >
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

               <SessaoDadosFields form={form} />
               <SessaoOrdemInstrucaoFields form={form} />

               {form.isPending && (
                  <div className="flex items-center justify-end gap-2 text-sm text-slate-500">
                     <Spinner size="sm" color="primary" />
                     Criando dupla...
                  </div>
               )}
            </form>
         }
      />
   );
}
