"use client";

import { useEffect, useRef } from "react";
import { TabItem, Tabs, type TabsRef } from "flowbite-react";
import { HiSearch } from "react-icons/hi";
import { TbClipboardList } from "react-icons/tb";
import { TbMapPin } from "react-icons/tb";

import { useSearchParamsUpdater } from "@/hooks/useSearchParamsState";

import { MissoesPage } from "./missoes/MissoesPage";
import { LocalidadesPage } from "./localidades/LocalidadesPage";
import { PesquisaPage } from "./pesquisa/PesquisaPage";

const TAB_NAMES = ["pesquisa", "missoes", "localidades"] as const;

// Mesmo tema de `cegep/missoes`: trilho ativo na escala primary da org,
// linha única com scroll no mobile.
const tabsTheme = {
   base: "flex flex-col gap-0",
   tablist: {
      variant: {
         default:
            "flex flex-nowrap gap-1 overflow-x-auto rounded-t border-b border-slate-200 bg-slate-50 p-2 md:flex-wrap md:overflow-x-visible",
      },
      tabitem: {
         base: "flex shrink-0 items-center justify-center whitespace-nowrap text-sm font-semibold transition-colors first:ml-0 focus:outline-none disabled:cursor-not-allowed disabled:text-gray-400",
         variant: {
            default: {
               base: "rounded px-3 py-3 md:px-6",
               active: {
                  on: "bg-primary-600 text-white shadow-sm",
                  off: "text-slate-600 hover:bg-primary-600/10",
               },
            },
         },
      },
   },
   tabpanel: "p-2 sm:p-4",
};

export default function GlePage() {
   const { searchParams, setParams } = useSearchParamsUpdater();

   // `?tab=` ausente ou desconhecido cai na primeira aba — URL editada à mão
   // ou link antigo não deixa a página sem aba ativa.
   const activeTabName = searchParams.get("tab") ?? "";
   const activeTabIndex = Math.max(
      TAB_NAMES.indexOf(activeTabName as (typeof TAB_NAMES)[number]),
      0
   );

   // O `Tabs` do Flowbite lê `active` só no inicializador do `useState`: a
   // prop não re-sincroniza. Sem isto, voltar no histórico mudaria a URL e
   // deixaria a aba visível parada. O ref é a via oficial de sincronizar.
   const tabsRef = useRef<TabsRef>(null);
   const indiceAplicado = useRef(activeTabIndex);

   useEffect(() => {
      if (indiceAplicado.current === activeTabIndex) return;
      indiceAplicado.current = activeTabIndex;
      tabsRef.current?.setActiveTab(activeTabIndex);
   }, [activeTabIndex]);

   function handleTabChange(index: number) {
      // `setActiveTab` do ref dispara este mesmo callback: sem a guarda, a
      // sincronização do voltar empilharia uma entrada nova e prenderia o
      // usuário no histórico.
      if (index === activeTabIndex) return;
      indiceAplicado.current = index;
      // `push`: trocar de aba é navegação, e o usuário espera desfazer no
      // botão voltar. A aba default sai da URL para a rota limpa ser a
      // forma canônica de chegar nela.
      setParams(
         {
            tab: TAB_NAMES[index] === "pesquisa" ? undefined : TAB_NAMES[index],
         },
         { push: true }
      );
   }

   return (
      <div className="space-y-2">
         {/* Masthead — padrão canônico (ops/operacoes) */}
         <header className="relative overflow-hidden rounded border border-slate-200 bg-white px-5 py-4 shadow-sm sm:px-6 sm:py-5">
            <span
               aria-hidden
               className="bg-primary-600 absolute top-0 left-0 h-full w-1"
            />

            <div className="relative flex flex-wrap items-center justify-between gap-4">
               <div className="flex min-w-0 items-center gap-4">
                  <div className="bg-primary-50 text-primary-600 ring-primary-100 grid h-12 w-12 shrink-0 place-items-center rounded-md ring-1 ring-inset">
                     <TbMapPin className="h-6 w-6" />
                  </div>
                  <div className="min-w-0">
                     <span className="text-primary-700 block font-mono text-[10px] font-bold tracking-[0.3em] uppercase">
                        Gestão CEGEP
                     </span>
                     <h1 className="text-2xl leading-none font-extrabold tracking-tight text-slate-900 sm:text-[28px]">
                        GLE
                     </h1>
                  </div>
               </div>

               <p className="max-w-xs text-sm text-slate-500">
                  Localidades especiais e as etapas de voo que passaram por
                  elas.
               </p>
            </div>
         </header>

         <div className="overflow-hidden rounded border border-slate-200 bg-white shadow-sm">
            <Tabs
               ref={tabsRef}
               aria-label="Tabs de GLE"
               onActiveTabChange={handleTabChange}
               theme={tabsTheme}
            >
               <TabItem
                  active={activeTabIndex === 0}
                  title="Pesquisa"
                  icon={HiSearch}
               >
                  <div className="animate-fade-in">
                     <PesquisaPage />
                  </div>
               </TabItem>

               <TabItem
                  active={activeTabIndex === 1}
                  title="Missões"
                  icon={TbClipboardList}
               >
                  <div className="animate-fade-in">
                     <MissoesPage />
                  </div>
               </TabItem>
               <TabItem
                  active={activeTabIndex === 2}
                  title="Localidades"
                  icon={TbMapPin}
               >
                  <div className="animate-fade-in">
                     <LocalidadesPage />
                  </div>
               </TabItem>
            </Tabs>
         </div>
      </div>
   );
}
