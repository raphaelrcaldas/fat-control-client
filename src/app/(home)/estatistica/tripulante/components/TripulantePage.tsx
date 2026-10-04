"use client";

import { useState, useEffect, useRef } from "react";
import { Button, Select, Tabs, TabItem, type TabsRef } from "flowbite-react";
import { HiOutlineSearch } from "react-icons/hi";
import { MdHail } from "react-icons/md";
import { useSearchParamsUpdater } from "@/hooks/useSearchParamsState";
import { usePermBased } from "@/app/(home)/hooks/usePermBased";
import PermDenied from "@/app/components/permDenied";
import { TripulanteSearchModal } from "./TripulanteSearchModal";
import { RelatorioAnualPanel } from "./RelatorioAnualPanel";
import { RelatorioMensalPanel } from "./RelatorioMensalPanel";

const MAX_INT32 = 2_147_483_647;
const MESES = [
   "Janeiro",
   "Fevereiro",
   "Março",
   "Abril",
   "Maio",
   "Junho",
   "Julho",
   "Agosto",
   "Setembro",
   "Outubro",
   "Novembro",
   "Dezembro",
];

// Select na mesma altura e fonte do `Button size="sm"` (h-9, text-sm), em todos os
// breakpoints: o `sm` do Flowbite troca a fonte por breakpoint e destoa do botão.
// Desabilitado (ano único), continua legível: sem opacidade reduzida, texto no
// tom normal e sem a seta, que prometeria uma escolha.
const anoSelectTheme = {
   field: {
      select: {
         base: "disabled:bg-none disabled:text-slate-900 disabled:opacity-100",
         sizes: { sm: "h-9 py-0 pr-8 pl-3 text-sm" },
      },
   },
};

// O tema padrão do Flowbite zera o outline sem repor indicador: sem o ring,
// a aba focada por teclado não muda visualmente.
const tabsTheme = {
   tablist: {
      tabitem: {
         base: "rounded-t focus-visible:ring-2 focus-visible:ring-primary-600 focus-visible:ring-inset",
         variant: {
            underline: {
               base: "rounded-t",
               active: { on: "rounded-t" },
            },
         },
      },
   },
};

function parseTripId(raw: string | null): number | null {
   const id = Number(raw);
   return Number.isInteger(id) && id > 0 && id <= MAX_INT32 ? id : null;
}

export function TripulantePage() {
   const currentYear = new Date().getFullYear();
   const { searchParams, setParams } = useSearchParamsUpdater();
   const anoParam = Number(searchParams.get("ano"));
   const ano =
      Number.isInteger(anoParam) && anoParam >= 2026 && anoParam <= currentYear
         ? anoParam
         : currentYear;
   const tripId = parseTripId(searchParams.get("trip_id"));
   const mesParam = Number(searchParams.get("mes"));
   const mes =
      Number.isInteger(mesParam) && mesParam >= 1 && mesParam <= 12
         ? mesParam
         : new Date().getMonth() + 1;
   const mensal = searchParams.get("periodo") === "mensal";
   const indice = mensal ? 0 : 1;
   const tabsRef = useRef<TabsRef>(null);
   const tabsContainerRef = useRef<HTMLDivElement>(null);
   const indiceAplicado = useRef(indice);
   useEffect(() => {
      if (indiceAplicado.current !== indice) {
         indiceAplicado.current = indice;
         tabsRef.current?.setActiveTab(indice);
      }
      // Flowbite inicia todos os tabs com tabindex=-1. O ativo precisa
      // entrar na navegação por teclado, inclusive após voltar pela URL.
      tabsContainerRef.current
         ?.querySelectorAll<HTMLButtonElement>("[role=tab]")
         .forEach((tab, i) => {
            tab.tabIndex = i === indice ? 0 : -1;
         });
   }, [indice]);
   const [showSearch, setShowSearch] = useState(false);
   const { hasPerm } = usePermBased();
   const permitido = hasPerm("ops.tripulantes", "view");
   if (!permitido) return <PermDenied />;

   return (
      <div className="min-w-0 space-y-2">
         <header className="relative overflow-hidden rounded border border-slate-200 bg-white px-5 py-4 shadow-sm sm:px-6 sm:py-5">
            <span
               aria-hidden
               className="bg-primary-600 absolute top-0 left-0 h-full w-1"
            />
            <div className="relative flex min-w-0 items-center gap-4">
               <div className="bg-primary-50 text-primary-600 ring-primary-100 grid h-12 w-12 shrink-0 place-items-center rounded-md ring-1 ring-inset">
                  <MdHail aria-hidden className="h-6 w-6" />
               </div>
               <div className="min-w-0">
                  <span className="text-primary-600 block font-mono text-[10px] font-bold tracking-[0.3em] uppercase">
                     Estatística
                  </span>
                  <h1 className="text-2xl leading-tight font-extrabold tracking-tight text-slate-900 sm:text-[28px]">
                     Tripulante
                  </h1>
               </div>
            </div>
         </header>
         <section
            aria-label="Filtros do relatório"
            className="flex flex-wrap items-end gap-x-3 gap-y-2 rounded border border-slate-200 bg-white px-4 py-2.5 shadow-sm"
         >
            {mensal && (
               <Select
                  id="mes-relatorio"
                  aria-label="Mês do relatório"
                  sizing="sm"
                  value={mes}
                  onChange={(event) => setParams({ mes: event.target.value })}
                  theme={anoSelectTheme}
                  clearTheme={{ field: { select: { sizes: { sm: true } } } }}
                  className="w-32"
               >
                  {MESES.map((nome, i) => (
                     <option key={nome} value={i + 1}>
                        {nome}
                     </option>
                  ))}
               </Select>
            )}
            <div className="w-20">
               <Select
                  id="ano-relatorio"
                  aria-label="Ano do relatório"
                  sizing="sm"
                  value={ano}
                  onChange={(event) => setParams({ ano: event.target.value })}
                  disabled={currentYear <= 2026}
                  theme={anoSelectTheme}
                  clearTheme={{ field: { select: { sizes: { sm: true } } } }}
               >
                  {Array.from(
                     { length: currentYear - 2026 + 1 },
                     (_, i) => currentYear - i
                  ).map((year) => (
                     <option key={year} value={year}>
                        {year}
                     </option>
                  ))}
               </Select>
            </div>
            <Button
               id="selecionar-tripulante"
               color="light"
               size="sm"
               onClick={() => setShowSearch(true)}
               className="shrink-0 gap-2"
            >
               <HiOutlineSearch aria-hidden className="h-4 w-4 shrink-0" />
               {tripId ? "Trocar tripulante" : "Buscar tripulante"}
            </Button>
         </section>
         <div
            ref={tabsContainerRef}
            onKeyDownCapture={(event) => {
               if (
                  !["ArrowLeft", "ArrowRight", "Home", "End"].includes(
                     event.key
                  )
               )
                  return;
               const tabs = Array.from(
                  event.currentTarget.querySelectorAll<HTMLButtonElement>(
                     "[role=tab]"
                  )
               );
               const focused = tabs.indexOf(event.target as HTMLButtonElement);
               if (focused < 0) return;
               const next =
                  event.key === "Home"
                     ? 0
                     : event.key === "End"
                       ? tabs.length - 1
                       : (focused +
                            (event.key === "ArrowRight" ? 1 : -1) +
                            tabs.length) %
                         tabs.length;
               event.preventDefault();
               event.stopPropagation();
               tabs.forEach((tab, i) => {
                  tab.tabIndex = i === next ? 0 : -1;
               });
               tabs[next].focus();
            }}
         >
            <Tabs
               ref={tabsRef}
               aria-label="Período do relatório"
               variant="underline"
               theme={tabsTheme}
               onActiveTabChange={(novoIndice) => {
                  if (indiceAplicado.current === novoIndice) return;
                  indiceAplicado.current = novoIndice;
                  setParams(
                     { periodo: novoIndice === 0 ? "mensal" : undefined },
                     { push: true }
                  );
               }}
            >
               <TabItem title="Mensal" active={mensal}>
                  {mensal && (
                     <RelatorioMensalPanel
                        tripId={tripId}
                        ano={ano}
                        mes={mes}
                        onBuscar={() => setShowSearch(true)}
                     />
                  )}
               </TabItem>
               <TabItem active={!mensal} title="Anual">
                  {!mensal && (
                     <RelatorioAnualPanel
                        tripId={tripId}
                        ano={ano}
                        onBuscar={() => setShowSearch(true)}
                     />
                  )}
               </TabItem>
            </Tabs>
         </div>
         <TripulanteSearchModal
            show={showSearch}
            selectedTripId={tripId}
            onClose={() => setShowSearch(false)}
            onSelect={(selected) => {
               setParams({ trip_id: String(selected.id) }, { push: true });
            }}
         />
      </div>
   );
}
