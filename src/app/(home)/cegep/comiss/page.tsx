"use client";

import {
   useSearchParamsUpdater,
   getStringParam,
} from "@/hooks/useSearchParamsState";
import clsx from "clsx";
import { HiClipboardList, HiChartPie } from "react-icons/hi";
import { ListaPage } from "./listaPage";
import { GestaoFiscalPage } from "./gestaoFiscal";
import { PermBased, usePermBased } from "@/app/(home)/hooks/usePermBased";

const TAB_NAMES = ["registros", "gestao_fiscal"] as const;

export default function ComissPage() {
   const { searchParams, setParams } = useSearchParamsUpdater();
   const { hasPerm } = usePermBased();

   const canViewFiscal = hasPerm("orcamento", "view");

   const activeTabName = getStringParam(searchParams, "tab", "registros");
   const requestedTabIndex = Math.max(
      TAB_NAMES.indexOf(activeTabName as (typeof TAB_NAMES)[number]),
      0
   );
   // Sem permissao, ignora ?tab=gestao_fiscal e cai em "registros"
   const activeTabIndex =
      requestedTabIndex === 1 && !canViewFiscal ? 0 : requestedTabIndex;

   function handleTabChange(tabName: string) {
      setParams({
         tab: tabName === "registros" ? undefined : tabName,
      });
   }

   return (
      <div className="flex flex-col space-y-2">
         {/* Masthead — referencia canonica (ops/operacoes) */}
         <header className="relative overflow-hidden rounded border border-slate-200 bg-white px-5 py-4 shadow-sm sm:px-6 sm:py-5">
            <span
               aria-hidden
               className="absolute top-0 left-0 h-full w-1 bg-red-600"
            />

            <div className="relative flex flex-wrap items-center justify-between gap-4">
               <div className="flex min-w-0 items-center gap-4">
                  <div className="grid h-12 w-12 shrink-0 place-items-center rounded-md bg-red-50 text-red-600 ring-1 ring-red-100 ring-inset">
                     <HiClipboardList className="h-6 w-6" />
                  </div>
                  <div className="min-w-0">
                     <span className="block font-mono text-[10px] font-bold tracking-[0.3em] text-red-500 uppercase">
                        Gestão CEGEP
                     </span>
                     <h1 className="text-2xl leading-none font-extrabold tracking-tight text-slate-900 sm:text-[28px]">
                        Comissionamentos
                     </h1>
                  </div>
               </div>
            </div>
         </header>

         {/* Navegacao por abas — sobria */}
         <div className="flex gap-1 rounded border border-slate-200 bg-white p-1 shadow-sm">
            <TabButton
               active={activeTabIndex === 0}
               icon={<HiClipboardList className="h-5 w-5" />}
               label="Registros"
               onClick={() => handleTabChange("registros")}
            />
            {canViewFiscal && (
               <TabButton
                  active={activeTabIndex === 1}
                  icon={<HiChartPie className="h-5 w-5" />}
                  label="Gestão Fiscal"
                  onClick={() => handleTabChange("gestao_fiscal")}
               />
            )}
         </div>

         {/* Conteudo da aba */}
         {activeTabIndex === 0 && <ListaPage />}
         {activeTabIndex === 1 && (
            <PermBased resource="orcamento" requiredPerm="view">
               <GestaoFiscalPage />
            </PermBased>
         )}
      </div>
   );
}

interface TabButtonProps {
   active: boolean;
   icon: React.ReactNode;
   label: string;
   onClick: () => void;
}

function TabButton({ active, icon, label, onClick }: TabButtonProps) {
   return (
      <button
         type="button"
         onClick={onClick}
         className={clsx(
            "flex flex-1 items-center justify-center gap-2 rounded py-2.5 text-sm font-semibold transition-colors",
            active
               ? "bg-red-50 text-red-700 ring-1 ring-red-100 ring-inset"
               : "text-slate-500 hover:bg-slate-50 hover:text-slate-700"
         )}
      >
         {icon}
         {label}
      </button>
   );
}
