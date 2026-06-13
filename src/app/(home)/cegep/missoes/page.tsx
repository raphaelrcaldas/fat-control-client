"use client";

import { TabItem, Tabs } from "flowbite-react";
import { MdOutlineAttachMoney } from "react-icons/md";
import { IoMdPaper, IoMdSettings } from "react-icons/io";
import { RegisPage } from "./registros/register";
import { FilterPage } from "./pagamentos/filterPage";
import { ConfigPage } from "./configuracoes/configPage";
import { useSearchParamsUpdater } from "@/hooks/useSearchParamsState";
import { useRouter } from "next/navigation";

const TAB_NAMES = ["registros", "pagamentos", "configuracoes"] as const;

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
      <div className="min-h-screen bg-gray-50">
         <div className="mx-auto p-1">
            {/* Header Section */}
            <div className="mb-4">
               <div className="flex items-center justify-between rounded border border-slate-300 bg-white p-4 shadow-sm">
                  <div>
                     <h1 className="mb-1 text-2xl font-bold text-red-600">
                        Gestão de Missões
                     </h1>
                     <p className="text-gray-600">
                        Controle registros e pagamentos de missões
                     </p>
                  </div>
                  <button
                     type="button"
                     onClick={() => router.push("/cegep/missoes/new")}
                     className="flex items-center gap-2 rounded bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700"
                  >
                     <svg
                        className="h-4 w-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                     >
                        <path
                           strokeLinecap="round"
                           strokeLinejoin="round"
                           strokeWidth={2}
                           d="M12 4v16m8-8H4"
                        />
                     </svg>
                     <span className="hidden sm:inline">Nova Missão</span>
                  </button>
               </div>
            </div>

            {/* Tabs Section */}
            <div className="overflow-hidden rounded border border-slate-300 bg-white shadow-sm">
               <Tabs
                  aria-label="Tabs de missões"
                  onActiveTabChange={handleTabChange}
                  theme={{ base: "gap-0", tabpanel: "py-1" }}
                  className="tabs-container"
               >
                  <TabItem
                     active={activeTabIndex === 0}
                     title="Registros"
                     icon={IoMdPaper}
                  >
                     <div className="animate-fadeIn">
                        <RegisPage />
                     </div>
                  </TabItem>

                  <TabItem
                     active={activeTabIndex === 1}
                     title="Pagamentos"
                     icon={MdOutlineAttachMoney}
                  >
                     <div className="animate-fadeIn">
                        <FilterPage active={activeTabIndex === 1} />
                     </div>
                  </TabItem>

                  <TabItem
                     active={activeTabIndex === 2}
                     title="Configurações"
                     icon={IoMdSettings}
                  >
                     <div className="animate-fadeIn">
                        <ConfigPage />
                     </div>
                  </TabItem>
               </Tabs>
            </div>
         </div>

         <style jsx global>{`
            @keyframes fadeIn {
               from {
                  opacity: 0;
                  transform: translateY(10px);
               }
               to {
                  opacity: 1;
                  transform: translateY(0);
               }
            }

            .animate-fadeIn {
               animation: fadeIn 0.4s ease-out;
            }

            .tabs-container [role="tablist"] {
               background: #f8fafc;
               padding: 0.5rem;
               border-radius: 0.25rem 0.25rem 0 0;
               border-bottom: 1px solid #cbd5e1;
            }

            .tabs-container [role="tab"] {
               font-weight: 600;
               transition: background-color 0.3s ease;
               border-radius: 0.25rem;
               padding: 0.75rem 1.5rem;
            }

            .tabs-container [role="tab"]:hover {
               background-color: rgba(220, 38, 38, 0.1);
            }

            .tabs-container [role="tab"][aria-selected="true"] {
               background: #dc2626;
               color: white;
               box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
            }

            .tabs-container [role="tabpanel"] {
               padding: 1rem;
            }
         `}</style>
      </div>
   );
}
