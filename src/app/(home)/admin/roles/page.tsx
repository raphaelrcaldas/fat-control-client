"use client";

import { FaShieldHalved, FaCubes, FaKey } from "react-icons/fa6";
import { Tabs, TabItem } from "flowbite-react";
import RolesTab from "./components/roles/RolesTab";
import ResourcesTab from "./components/resources/ResourcesTab";
import PermissionsTab from "./components/permissions/PermissionsTab";

// Tabs underline enriquecidas: aba ativa com leve fundo vermelho + espinha
// inferior vermelha (ecoa o Masthead); hover sóbrio em slate.
const tabsTheme = {
   base: "flex flex-col gap-4",
   tablist: {
      base: "flex text-center",
      variant: {
         underline: "-mb-px flex flex-wrap gap-1 border-b border-slate-200",
      },
      tabitem: {
         base: "flex items-center justify-center gap-2 rounded-t px-4 py-2.5 text-sm font-medium transition-colors first:ml-0 focus:outline-none disabled:cursor-not-allowed disabled:text-gray-400",
         variant: {
            underline: {
               base: "rounded-t",
               active: {
                  on: "border-b-2 border-red-600 bg-red-50 font-semibold text-red-700",
                  off: "border-b-2 border-transparent text-slate-500 hover:border-slate-300 hover:bg-slate-50 hover:text-slate-700",
               },
            },
         },
         icon: "h-4 w-4",
      },
   },
   tabpanel: "focus:outline-none",
};

export default function RolePage() {
   return (
      <div className="space-y-2">
         <header className="relative overflow-hidden rounded border border-slate-200 bg-white px-5 py-4 shadow-sm sm:px-6 sm:py-5">
            {/* Espinha vermelha — ecoa a espinha dos cards */}
            <span
               aria-hidden
               className="absolute top-0 left-0 h-full w-1 bg-red-600"
            />

            <div className="relative flex min-w-0 items-center gap-4">
               <div className="grid h-12 w-12 shrink-0 place-items-center rounded-md bg-red-50 text-red-600 ring-1 ring-red-100 ring-inset">
                  <FaShieldHalved className="h-6 w-6" />
               </div>
               <div className="min-w-0">
                  <span className="block font-mono text-[10px] font-bold tracking-[0.3em] text-red-500 uppercase">
                     Administração
                  </span>
                  <h1 className="text-2xl leading-none font-extrabold tracking-tight text-slate-900 sm:text-[28px]">
                     Controle de Acesso
                  </h1>
                  <span className="mt-1 block text-sm text-gray-500">
                     Gerencie perfis, recursos e permissões do sistema
                  </span>
               </div>
            </div>
         </header>

         <Tabs
            aria-label="Tabs de catálogo de acesso"
            variant="underline"
            theme={tabsTheme}
         >
            <TabItem active title="Perfis" icon={FaShieldHalved}>
               <RolesTab />
            </TabItem>

            <TabItem title="Recursos" icon={FaCubes}>
               <ResourcesTab />
            </TabItem>

            <TabItem title="Permissões" icon={FaKey}>
               <PermissionsTab />
            </TabItem>
         </Tabs>
      </div>
   );
}
