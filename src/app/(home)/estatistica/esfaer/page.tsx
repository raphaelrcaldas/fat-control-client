"use client";

import { useCallback, useMemo, useState } from "react";
import { useSearchParamsUpdater } from "@/hooks/useSearchParamsState";
import clsx from "clsx";
import { Button } from "flowbite-react";
import { useEsfAerResumo } from "@/hooks/queries";
import {
   getGroupSummaries,
   parseAnoParam,
   type FocoDivergencia,
} from "./utils";
import { EsfAerHeader } from "./components/EsfAerHeader";
import { EsfAerSkeleton } from "./components/EsfAerSkeleton";
import { EsfAerGroupCards } from "./components/EsfAerGroupCards";
import { EsfAerTable } from "./components/EsfAerTable";
import { EsfAerAlertTable } from "./components/EsfAerAlertTable";
import { EsfAerChartLine } from "./components/EsfAerChartLine";
import { EsfAerChartTable } from "./components/EsfAerChartTable";
import { ImportModal } from "./components/import/ImportModal";
import { PermBased, usePermBased } from "../../hooks/usePermBased";

export default function EsfAerPage() {
   const currentYear = new Date().getFullYear();
   const [showImportModal, setShowImportModal] = useState(false);
   const { hasPerm } = usePermBased();

   const { searchParams, setParams } = useSearchParamsUpdater();
   const anoRef = parseAnoParam(searchParams.get("ano"), currentYear);
   const showSimulador = searchParams.get("simulador") === "true";

   const setAnoRef = useCallback(
      (value: number) => setParams({ ano: String(value) }),
      [setParams]
   );
   const setShowSimulador = useCallback(
      (value: boolean) => setParams({ simulador: value ? "true" : undefined }),
      [setParams]
   );

   const { data, isLoading, isFetching, isError, error, refetch } =
      useEsfAerResumo(anoRef, showSimulador);
   const isRefetching = !isLoading && isFetching;

   // O backend ja devolve itens e totais consistentes com a flag do
   // simulador; o front apenas exibe e deriva o agrupamento por grupo.
   const items = useMemo(() => data?.items ?? [], [data]);
   const totalAlocado = data?.total_alocado ?? 0;
   const totalVoado = data?.total_voado ?? 0;
   const totalSaldo = data?.total_saldo ?? 0;
   const totalMesesVoados = data?.total_meses_voados ?? Array(12).fill(0);
   const groupSummaries = useMemo(() => getGroupSummaries(items), [items]);

   // Célula pedida no painel de divergência. É derivada: some sozinha quando o
   // ano ou o simulador mudam, ou quando a célula deixa de divergir (refetch).
   const [focoSolicitado, setFocoSolicitado] = useState<FocoDivergencia | null>(
      null
   );
   const foco =
      focoSolicitado &&
      focoSolicitado.ano === anoRef &&
      focoSolicitado.simulador === showSimulador &&
      items.some(
         (i) =>
            i.id === focoSolicitado.esfaerId &&
            i.meses_voados[focoSolicitado.mes] !==
               i.meses_sagem[focoSolicitado.mes]
      )
         ? focoSolicitado
         : null;

   // Pedido que deixou de valer (ano/simulador mudou, célula parou de
   // divergir): descarta durante o render, senão voltar ao estado anterior
   // (cache) o reabriria sozinho. Ajuste de estado no render, sem useEffect.
   if (focoSolicitado && !foco) setFocoSolicitado(null);

   // Objeto novo a cada clique: clicar de novo na mesma linha refaz a rolagem
   // e reabre o popover fechado.
   const localizarDivergencia = useCallback(
      (esfaerId: number, mes: number) =>
         setFocoSolicitado({
            esfaerId,
            mes,
            ano: anoRef,
            simulador: showSimulador,
         }),
      [anoRef, showSimulador]
   );

   const fecharFoco = useCallback(
      (devolverFoco: boolean) => {
         setFocoSolicitado(null);
         if (!devolverFoco || !foco) return;
         const { esfaerId, mes } = foco;
         // O popover sai do DOM e o foco cairia no body. Só no fechamento por
         // teclado (Esc) devolve ao botão da linha do painel que o abriu: no clique
         // fora o foco programático faria o Chromium aplicar :focus-visible.
         setTimeout(() => {
            const ativo = document.activeElement;
            if (ativo && ativo !== document.body) return;
            document
               .querySelector<HTMLElement>(
                  `[data-divergencia-linha="${esfaerId}-${mes}"] button`
               )
               ?.focus({ preventScroll: true });
         }, 0);
      },
      [foco]
   );

   return (
      <div className="space-y-2">
         <EsfAerHeader
            anoRef={anoRef}
            onAnoRefChange={setAnoRef}
            showSimulador={showSimulador}
            onShowSimuladorChange={setShowSimulador}
            onImport={() => setShowImportModal(true)}
         />

         {isLoading ? (
            <EsfAerSkeleton />
         ) : isError && items.length === 0 ? (
            <div
               role="alert"
               className="flex flex-col items-center justify-center gap-1 rounded border border-slate-200 bg-white px-6 py-16 text-center shadow-sm"
            >
               <p className="text-sm font-semibold text-red-800">
                  Não foi possível carregar o esforço aéreo
               </p>
               <p className="max-w-md text-xs text-slate-500">
                  {error instanceof Error ? error.message : "Erro desconhecido"}
               </p>
               <Button
                  color="light"
                  size="sm"
                  className="mt-3"
                  onClick={() => refetch()}
                  disabled={isFetching}
               >
                  Tentar novamente
               </Button>
            </div>
         ) : items.length === 0 ? (
            <div className="flex items-center justify-center rounded border border-slate-200 bg-white py-16 shadow-sm">
               <p className="text-sm text-gray-500">
                  Nenhum esforço aéreo alocado ou voado para {anoRef}.
               </p>
            </div>
         ) : (
            <>
               {isError && (
                  <div
                     role="status"
                     className="flex flex-wrap items-center justify-between gap-2 rounded border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-800"
                  >
                     <span>
                        Não foi possível atualizar o esforço aéreo. Exibindo a
                        última consulta.
                     </span>
                     <Button
                        color="light"
                        size="sm"
                        onClick={() => refetch()}
                        disabled={isFetching}
                     >
                        Tentar novamente
                     </Button>
                  </div>
               )}
               <div
                  className={clsx(
                     "grid justify-items-center gap-2 overflow-hidden transition-opacity duration-200",
                     isRefetching && "pointer-events-none opacity-50"
                  )}
               >
                  <PermBased
                     resource="estatistica.esf_aer"
                     requiredPerm="update"
                  >
                     <EsfAerAlertTable
                        items={items}
                        foco={foco}
                        onLocalizar={localizarDivergencia}
                     />
                  </PermBased>
                  <EsfAerTable
                     items={items}
                     totalAlocado={totalAlocado}
                     totalVoado={totalVoado}
                     totalSaldo={totalSaldo}
                     totalMesesVoados={totalMesesVoados}
                     foco={foco}
                     onFecharFoco={fecharFoco}
                     destacarDivergencias={hasPerm(
                        "estatistica.esf_aer",
                        "update"
                     )}
                  />
                  <EsfAerGroupCards groups={groupSummaries} />

                  <div className="col-span-full hidden grid-cols-1 gap-4 lg:grid lg:grid-cols-3">
                     <div className="lg:col-span-2">
                        <EsfAerChartLine
                           totalAlocado={totalAlocado}
                           totalMeses={totalMesesVoados}
                        />
                     </div>
                     <div className="lg:col-span-1">
                        <EsfAerChartTable
                           totalAlocado={totalAlocado}
                           totalMeses={totalMesesVoados}
                        />
                     </div>
                  </div>
               </div>
            </>
         )}

         <ImportModal
            show={showImportModal}
            setShow={setShowImportModal}
            anoRef={anoRef}
         />
      </div>
   );
}
