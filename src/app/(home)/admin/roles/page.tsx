"use client";

import { FaShieldHalved, FaCubes, FaKey } from "react-icons/fa6";
import { Tabs, TabItem } from "flowbite-react";
import RolesTab from "./components/roles/RolesTab";
import ResourcesTab from "./components/resources/ResourcesTab";
import PermissionsTab from "./components/permissions/PermissionsTab";

export default function RolePage() {
   return (
      <div className="grid gap-4 p-2">
         <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-red-100 dark:bg-red-900/40">
               <FaShieldHalved className="h-5 w-5 text-red-700 dark:text-red-300" />
            </div>
            <div>
               <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Controle de Acesso
               </h1>
               <p className="text-sm text-gray-500 dark:text-gray-400">
                  Gerencie perfis, recursos e permissões do sistema
               </p>
            </div>
         </div>

         <Tabs aria-label="Tabs de catálogo de acesso" variant="underline">
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
