"use client";

import { TabItem, Tabs } from "flowbite-react";
import { MdOutlineAttachMoney } from "react-icons/md";
import { IoMdPaper } from "react-icons/io";
import { RegisPage } from "./registros/register";
import { FilterPage } from "./pagamentos/filterPage";
import { useState } from "react";
import { FilterProvider } from "../context/filterContext";
import { RegisterProvider } from "../context/registerContext";

export default function MissPage() {
   const [activeTab, setActiveTab] = useState(0);

   return (
      <div className="min-h-screen  bg-gradient-to-br from-gray-50 via-blue-50 to-gray-100">
         <div className="mx-auto p-2">
            {/* Header Section */}
            <div className="mb-4">
               <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-3xl opacity-10 blur-3xl"></div>
                  <div className="relative bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 border border-blue-100">
                     <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent mb-3">
                        Gestão de Missões
                     </h1>
                     <p className="text-gray-600 text-lg">
                        Controle completo de registros e pagamentos de missões
                     </p>
                  </div>
               </div>
            </div>

            {/* Tabs Section */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
               <Tabs
                  aria-label='Tabs de missões'
                  variant='underline'
                  onActiveTabChange={setActiveTab}
                  className="tabs-container"
               >
                  <TabItem
                     active={activeTab === 0}
                     title='Registros'
                     icon={IoMdPaper}
                     className="transition-all duration-300"
                  >
                     <div className="animate-fadeIn">
                        <RegisterProvider>
                           <RegisPage />
                        </RegisterProvider>
                     </div>
                  </TabItem>

                  <TabItem
                     active={activeTab === 1}
                     title='Pagamentos'
                     icon={MdOutlineAttachMoney}
                     className="transition-all duration-300"
                  >
                     <div className="animate-fadeIn">
                        <FilterProvider>
                           <FilterPage active={activeTab === 1} />
                        </FilterProvider>
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
               background: linear-gradient(to right, #f8fafc, #f1f5f9);
               padding: 0.5rem;
               border-radius: 1rem 1rem 0 0;
               border-bottom: 2px solid #e2e8f0;
            }

            .tabs-container [role="tab"] {
               font-weight: 600;
               transition: all 0.3s ease;
               border-radius: 0.75rem;
               padding: 0.75rem 1.5rem;
            }

            .tabs-container [role="tab"]:hover {
               background-color: rgba(59, 130, 246, 0.1);
            }

            .tabs-container [role="tab"][aria-selected="true"] {
               background: linear-gradient(135deg, #3b82f6, #06b6d4);
               color: white;
               box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
            }

            .tabs-container [role="tabpanel"] {
               padding: 2rem;
            }
         `}</style>
      </div>
   );
}
