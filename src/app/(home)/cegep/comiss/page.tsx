"use client";

import {
   useSearchParamsUpdater,
   getStringParam,
} from "@/hooks/useSearchParamsState";
import { useRouter } from "next/navigation";
import { ListaPage } from "./listaPage";
import { GestaoFiscalPage } from "./gestaoFiscal";
import { PermBased, usePermBased } from "@/app/(home)/hooks/usePermBased";

const TAB_NAMES = ["registros", "gestao_fiscal"] as const;

export default function ComissPage() {
   const router = useRouter();
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
      <div className="flex h-full flex-col bg-gray-50">
         <div className="mx-auto w-full p-1">
            {/* Custom Tabs Navigation Header */}
            <div className="mb-2 flex rounded border border-gray-200 bg-white p-1 shadow-sm">
               <button
                  onClick={() => handleTabChange("registros")}
                  className={`flex flex-1 items-center justify-center gap-2 rounded py-2.5 text-sm font-semibold transition-all ${
                     activeTabIndex === 0
                        ? "bg-red-50 text-red-700 shadow-sm ring-1 ring-red-100 ring-inset"
                        : "text-gray-500 hover:bg-gray-50 hover:text-gray-700"
                  }`}
               >
                  <svg
                     className="h-5 w-5"
                     fill="none"
                     stroke="currentColor"
                     viewBox="0 0 24 24"
                  >
                     <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                     />
                  </svg>
                  Registros
               </button>
               {canViewFiscal && (
                  <button
                     onClick={() => handleTabChange("gestao_fiscal")}
                     className={`flex flex-1 items-center justify-center gap-2 rounded py-2.5 text-sm font-semibold transition-all ${
                        activeTabIndex === 1
                           ? "bg-red-50 text-red-700 shadow-sm ring-1 ring-red-100 ring-inset"
                           : "text-gray-500 hover:bg-gray-50 hover:text-gray-700"
                     }`}
                  >
                     <svg
                        className="h-5 w-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                     >
                        <path
                           strokeLinecap="round"
                           strokeLinejoin="round"
                           strokeWidth={2}
                           d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                        />
                     </svg>
                     Gestão Fiscal
                  </button>
               )}
            </div>

            {/* Tab Panel Content */}
            <div className="animate-fadeIn">
               {activeTabIndex === 0 && <ListaPage />}
               {activeTabIndex === 1 && (
                  <PermBased resource="orcamento" requiredPerm="view">
                     <GestaoFiscalPage />
                  </PermBased>
               )}
            </div>
         </div>

         <style jsx global>{`
            @keyframes fadeIn {
               from {
                  opacity: 0;
                  transform: translateY(5px);
               }
               to {
                  opacity: 1;
                  transform: translateY(0);
               }
            }
            .animate-fadeIn {
               animation: fadeIn 0.3s ease-out;
            }
         `}</style>
      </div>
   );
}
