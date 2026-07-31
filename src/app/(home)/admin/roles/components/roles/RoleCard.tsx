"use client";

import clsx from "clsx";
import { Button } from "flowbite-react";
import { FaChevronDown, FaPlus, FaShieldHalved } from "react-icons/fa6";
import {
   getRoleTheme,
   groupPermissionsByResource,
} from "@/constants/admin/roles";
import type {
   PermissionDetail,
   RoleDetail,
} from "services/routes/security/roles";
import { PermissionChip } from "./PermissionChip";

interface RoleCardProps {
   role: RoleDetail;
   totalPermissions: number;
   isExpanded: boolean;
   onToggle: () => void;
   onAddPermission: () => void;
   onRemovePermission: (permission: PermissionDetail) => void;
   removeDisabled?: boolean;
}

export function RoleCard({
   role,
   totalPermissions,
   isExpanded,
   onToggle,
   onAddPermission,
   onRemovePermission,
   removeDisabled,
}: RoleCardProps) {
   const theme = getRoleTheme(role.name);
   const grantedCount = new Set(role.permissions.map((p) => p.id)).size;
   const coverage =
      totalPermissions > 0
         ? Math.round((grantedCount / totalPermissions) * 100)
         : 0;
   const groupedPermissions = groupPermissionsByResource(role.permissions);
   const panelId = `role-panel-${role.id}`;
   const label = theme.label || role.name;

   return (
      <div
         className={clsx(
            "overflow-hidden rounded border bg-white shadow-sm transition-colors",
            isExpanded ? "border-slate-300" : "border-slate-200"
         )}
      >
         {/* h2 ao redor do gatilho: dá ao índice do leitor de tela o nome do
             perfil, e não nove "Permissões concedidas" idênticos */}
         <h2>
            <button
               onClick={onToggle}
               aria-expanded={isExpanded}
               aria-controls={panelId}
               // Sem isto o nome acessível sai concatenado ("Apoio
               // Avançado22/82setor de pessoal")
               aria-label={`${label} — ${grantedCount} de ${totalPermissions} permissões`}
               className={clsx(
                  // Grade explícita: identidade e números ficam vizinhos à
                  // esquerda; só o chevron é empurrado para a borda
                  // Largura fixa no texto (não `max-content`) para os números
                  // ficarem na mesma coluna nos 9 cards — eles são comparados
                  // entre si, e é para isso que existe o `tabular-nums`
                  "grid w-full grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 p-4 text-left transition-colors sm:grid-cols-[auto_minmax(0,22rem)_auto_1fr_auto] sm:gap-4",
                  theme.hover
               )}
            >
               <div
                  className={clsx(
                     "flex h-10 w-10 shrink-0 items-center justify-center rounded-md",
                     theme.bg
                  )}
               >
                  <FaShieldHalved className={clsx("h-4 w-4", theme.text)} />
               </div>

               <div className="min-w-0 space-y-1">
                  <div className="flex items-center gap-2">
                     <span
                        className={clsx(
                           "inline-flex items-center rounded-md px-2.5 py-0.5 text-sm font-semibold",
                           theme.bg,
                           theme.text
                        )}
                     >
                        {label}
                     </span>
                     {/* No mobile a barra some, mas o número não: é o dado que
                         diz o alcance do perfil */}
                     <span className="text-xs font-semibold text-gray-700 tabular-nums sm:hidden">
                        {grantedCount}
                        <span className="font-normal text-gray-600">
                           /{totalPermissions}
                        </span>
                     </span>
                  </div>
                  <p className="ml-1 truncate text-sm text-gray-600">
                     {role.description}
                  </p>
               </div>

               <div className="hidden w-40 shrink-0 space-y-1.5 sm:block">
                  <div className="flex items-baseline justify-between text-xs">
                     <span className="font-semibold text-gray-700 tabular-nums">
                        {grantedCount}
                        <span className="font-normal text-gray-600">
                           /{totalPermissions}
                        </span>
                     </span>
                     <span className="text-gray-600">
                        {grantedCount === 1 ? "permissão" : "permissões"}
                     </span>
                  </div>
                  {/* Barra neutra: num painel de segurança, perfil mais amplo
                      não é "mais completo" — verde elogiaria privilégio */}
                  <div className="h-1.5 overflow-hidden rounded-full bg-slate-200">
                     <div
                        className="h-full rounded-full bg-slate-500 transition-all duration-500"
                        style={{ width: `${coverage}%` }}
                     />
                  </div>
               </div>

               <span aria-hidden className="hidden sm:block" />

               <FaChevronDown
                  className={clsx(
                     "h-4 w-4 shrink-0 text-gray-500 transition-transform duration-200",
                     isExpanded && "rotate-180"
                  )}
               />
            </button>
         </h2>

         <div
            id={panelId}
            // Colapsado, o painel tem altura 0 mas seus botões continuariam
            // focáveis: `inert` tira do Tab e do leitor de tela
            inert={!isExpanded}
            className={clsx(
               "grid transition-[grid-template-rows] duration-300 ease-out motion-reduce:transition-none",
               isExpanded ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
            )}
         >
            <div className="overflow-hidden">
               <div className="space-y-3 border-t border-slate-200 bg-gray-50 p-4">
                  <div className="flex items-center justify-between">
                     <h3 className="text-xs font-semibold tracking-wide text-gray-600 uppercase">
                        Permissões concedidas
                     </h3>
                     <Button
                        size="xs"
                        color="light"
                        onClick={onAddPermission}
                        className="pointer-coarse:min-h-[44px]"
                     >
                        <FaPlus className="mr-2 h-3 w-3" />
                        Adicionar
                     </Button>
                  </div>

                  {role.permissions.length === 0 ? (
                     <p className="text-sm text-gray-500">
                        Nenhuma permissão atribuída a este perfil
                     </p>
                  ) : (
                     <div className="space-y-2.5">
                        {Object.entries(groupedPermissions).map(
                           ([resource, permissions]) => (
                              <div
                                 key={resource}
                                 className="flex flex-col gap-1.5 sm:flex-row sm:items-baseline sm:gap-3"
                              >
                                 <span className="shrink-0 text-xs font-semibold tracking-wide text-gray-500 uppercase sm:w-36">
                                    {resource}
                                 </span>
                                 <div className="flex flex-wrap gap-2">
                                    {permissions.map((permission) => (
                                       <PermissionChip
                                          key={permission.id}
                                          permission={permission}
                                          onRemove={() =>
                                             onRemovePermission(permission)
                                          }
                                          disabled={removeDisabled}
                                       />
                                    ))}
                                 </div>
                              </div>
                           )
                        )}
                     </div>
                  )}
               </div>
            </div>
         </div>
      </div>
   );
}
