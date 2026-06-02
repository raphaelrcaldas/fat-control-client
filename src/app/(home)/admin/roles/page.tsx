"use client";

import { FaShieldHalved, FaCubes, FaKey } from "react-icons/fa6";
import { Tabs, TabItem } from "flowbite-react";
import RolesTab from "./components/roles/RolesTab";
import ResourcesTab from "./components/resources/ResourcesTab";
import PermissionsTab from "./components/permissions/PermissionsTab";

export default function RolePage() {
   return (
      <div className="grid gap-4 p-2">
         <Tabs aria-label="Tabs de catálogo de acesso" variant="underline">
            <TabItem active title="Roles" icon={FaShieldHalved}>
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
