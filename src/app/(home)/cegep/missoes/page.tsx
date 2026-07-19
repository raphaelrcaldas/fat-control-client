"use client";

import { TabItem, Tabs, Button } from "flowbite-react";
import { HiPlus, HiCalculator } from "react-icons/hi";
import { MdOutlineAttachMoney } from "react-icons/md";
import { IoMdPaper, IoMdSettings } from "react-icons/io";
import { RegisPage } from "./registros/register";
import { FilterPage } from "./pagamentos/filterPage";
import { ConfigPage } from "./configuracoes/configPage";
import { CalculadoraPage } from "./calculadora/calculadoraPage";
import { useSearchParamsUpdater } from "@/hooks/useSearchParamsState";
import { useRouter } from "next/navigation";
import { PermBased } from "@/app/(home)/hooks/usePermBased";

const TAB_NAMES = [
   "registros",
   "pagamentos",
   "calculadora",
   "configuracoes",
] as const;

// Trilho ativo temático (escala primary-* da org).
const tabsTheme = {
   base: "flex flex-col gap-0",
   tablist: {
      variant: {
         default:
            "flex-wrap gap-1 rounded-t border-b border-slate-200 bg-slate-50 p-2",
      },
      tabitem: {
         base: "flex items-center justify-center text-sm font-semibold transition-colors first:ml-0 focus:outline-none disabled:cursor-not-allowed disabled:text-gray-400",
         variant: {
            default: {
               base: "rounded px-6 py-3",
               active: {
                  on: "bg-primary-600 text-white shadow-sm",
                  off: "text-slate-600 hover:bg-primary-600/10",
               },
            },
         },
      },
   },
   tabpanel: "p-4",
};

export default function MissPage() {
   const router = useRouter();
   const { searchParams, setParams } = useSearchParamsUpdater();

   const activeTabName = searchParams.get("tab") || "registros";
   const activeTabIndex = Math.max(
      TAB_NAMES.indexOf(activeTabName as (typeof TAB_NAMES)[number]),
      0
   );

   function handleTabChange(index: number) {
      setParams({
         tab: TAB_NAMES[index] === "registros" ? undefined : TAB_NAMES[index],
      });
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
                     <IoMdPaper className="h-6 w-6" />
                  </div>
                  <div className="min-w-0">
                     <span className="text-primary-700 block font-mono text-[10px] font-bold tracking-[0.3em] uppercase">
                        Gestão CEGEP
                     </span>
                     <h1 className="text-2xl leading-none font-extrabold tracking-tight text-slate-900 sm:text-[28px]">
                        Missões
                     </h1>
                  </div>
               </div>

               <PermBased resource="missoes_cegep" requiredPerm="create">
                  <Button
                     color="primary"
                     onClick={() => router.push("/cegep/missoes/new")}
                     className="font-semibold whitespace-nowrap"
                  >
                     <HiPlus className="mr-2 h-4 w-4" />
                     Nova Missão
                  </Button>
               </PermBased>
            </div>
         </header>

         {/* Tabs */}
         <div className="overflow-hidden rounded border border-slate-200 bg-white shadow-sm">
            <Tabs
               aria-label="Tabs de missões"
               onActiveTabChange={handleTabChange}
               theme={tabsTheme}
            >
               <TabItem
                  active={activeTabIndex === 0}
                  title="Registros"
                  icon={IoMdPaper}
               >
                  <div className="animate-fade-in">
                     <RegisPage />
                  </div>
               </TabItem>

               <TabItem
                  active={activeTabIndex === 1}
                  title="Pagamentos"
                  icon={MdOutlineAttachMoney}
               >
                  <div className="animate-fade-in">
                     <FilterPage active={activeTabIndex === 1} />
                  </div>
               </TabItem>

               <TabItem
                  active={activeTabIndex === 2}
                  title="Calculadora"
                  icon={HiCalculator}
               >
                  <div className="animate-fade-in">
                     <CalculadoraPage />
                  </div>
               </TabItem>

               <TabItem
                  active={activeTabIndex === 3}
                  title="Configurações"
                  icon={IoMdSettings}
               >
                  <div className="animate-fade-in">
                     <ConfigPage />
                  </div>
               </TabItem>
            </Tabs>
         </div>
      </div>
   );
}
