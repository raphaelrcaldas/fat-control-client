"use client";

import { TabItem, Tabs } from "flowbite-react";
import { MdOutlineAttachMoney } from "react-icons/md";
import { IoMdPaper, IoMdSettings } from "react-icons/io";
import { RegisPage } from "./registros/register";
import { FilterPage } from "./pagamentos/filterPage";
import { ConfigPage } from "./configuracoes/configPage";
import { useSearchParamsUpdater } from "@/hooks/useSearchParamsState";

const TAB_NAMES = ["registros", "pagamentos", "configuracoes"] as const;

export default function MissPage() {
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
               <div className="rounded-2xl border border-red-100 bg-white p-4 shadow-xl">
                  <h1 className="mb-1 text-2xl font-bold text-red-600">
                     Gestão de Missões
                  </h1>
                  <p className="text-gray-600">
                     Controle completo de registros e pagamentos de missões
                  </p>
               </div>
            </div>

            {/* Tabs Section */}
            <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-xl">
               <Tabs
                  aria-label="Tabs de missões"
                  onActiveTabChange={handleTabChange}
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
               border-radius: 1rem 1rem 0 0;
               border-bottom: 2px solid #e2e8f0;
            }

            .tabs-container [role="tab"] {
               font-weight: 600;
               transition: background-color 0.3s ease;
               border-radius: 0.75rem;
               padding: 0.75rem 1.5rem;
            }

            .tabs-container [role="tab"]:hover {
               background-color: rgba(220, 38, 38, 0.1);
            }

            .tabs-container [role="tab"][aria-selected="true"] {
               background: #dc2626;
               color: white;
               box-shadow: 0 4px 12px rgba(220, 38, 38, 0.3);
            }

            .tabs-container [role="tabpanel"] {
               padding: 1rem;
            }
         `}</style>
      </div>
   );
}
