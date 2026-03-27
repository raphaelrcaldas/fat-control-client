"use client";

import { useState, useMemo } from "react";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import type { IconType } from "react-icons";
import { useAuth } from "@/app/context/auth";
import SidebarItem from "./sidebarItem";
import SidebarCollapse from "./sidebarCollapse";
import { navItems } from "./navItems";
import { PiSignOut } from "react-icons/pi";
import { Button } from "flowbite-react";
import LoadingOverlay from "./loadingOverlay";
import { useRoleBased } from "../../hooks/useRoleBased";
import { usePermBased } from "../../hooks/usePermBased";

interface FilteredNavChild {
   icon: IconType;
   label: string;
   path: string;
   resource?: string;
   permission?: string;
   roles?: readonly string[];
}

interface FilteredNavItem {
   type: string;
   icon: IconType;
   label: string;
   path?: string;
   roles?: readonly string[];
   children?: readonly FilteredNavChild[] | FilteredNavChild[];
}

interface SidebarProps {
   isOpen: boolean;
   isMobile: boolean;
   onClose: () => void;
   onLogout: () => void;
}

export default function SidebarWithFooter({
   isOpen,
   isMobile,
   onClose,
   onLogout,
}: SidebarProps) {
   const pathname = usePathname();
   const { user, userPg, role } = useAuth();
   const { hasRole } = useRoleBased();
   const { hasPerm } = usePermBased();
   const useOverlay = isMobile;
   const [isLoggingOut, setIsLoggingOut] = useState(false);

   const handleLogout = async () => {
      setIsLoggingOut(true);
      await onLogout();
      // O loading será removido quando o componente desmontar após o logout
   };

   const filteredNavItems = useMemo(() => {
      const result: FilteredNavItem[] = [];

      for (const item of navItems) {
         // Verifica permissão baseada em roles do item principal
         if (item.roles && item.roles.length > 0) {
            if (!hasRole(item.roles)) continue;
         }

         // Se for um collapse, filtra os filhos numa única passagem
         if (item.type === "collapse" && item.children) {
            const filteredChildren = item.children.filter((child) => {
               if ("resource" in child && "permission" in child) {
                  return hasPerm(child.resource, child.permission);
               }
               if (
                  "roles" in child &&
                  Array.isArray(child.roles) &&
                  child.roles.length > 0
               ) {
                  return hasRole(child.roles);
               }
               return true;
            });

            if (filteredChildren.length > 0) {
               result.push({ ...item, children: filteredChildren });
            }
            continue;
         }

         result.push(item);
      }

      return result;
   }, [hasRole, hasPerm]);

   return (
      <>
         {isLoggingOut && <LoadingOverlay message="Saindo..." />}
         <aside
            className={clsx(
               useOverlay ? "fixed" : "sticky",
               "top-16 bottom-0 left-0 z-40 shrink-0",
               "flex flex-col overflow-hidden bg-white shadow-xl",
               "transition-all duration-200 ease-in-out",
               isOpen ? "w-64" : useOverlay ? "w-64" : "w-0",
               useOverlay && (isOpen ? "translate-x-0" : "-translate-x-full")
            )}
         >
            {/* Área de navegação com scroll */}
            <nav className="flex-1 space-y-1 overflow-y-auto p-1">
               {filteredNavItems.map((item, index) => {
                  if (item.type === "item") {
                     return (
                        <SidebarItem
                           key={item.path || index}
                           item={item}
                           isMobile={isMobile}
                           isActive={pathname === item.path}
                           onClick={onClose}
                        />
                     );
                  }

                  if (item.type === "collapse") {
                     return (
                        <SidebarCollapse
                           key={item.label + index}
                           item={item}
                           isMobile={isMobile}
                           pathname={pathname}
                           onClick={onClose}
                        />
                     );
                  }

                  return null;
               })}
            </nav>

            {/* Footer com info do usuário */}
            <div className="shrink-0 border-t border-gray-200 bg-gray-50 px-2 py-4">
               <div className="flex items-center gap-2">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-600 text-sm font-bold text-white uppercase">
                     {userPg}
                  </div>
                  <div className="min-w-0 flex-1">
                     <div className="truncate text-sm font-medium text-gray-800 uppercase">
                        {user}
                     </div>
                     <div className="text-xs text-gray-500 uppercase">
                        {role}
                     </div>
                  </div>
                  <Button
                     className="p-1"
                     onClick={handleLogout}
                     color="alternative"
                     disabled={isLoggingOut}
                  >
                     <PiSignOut size={21} />
                  </Button>
               </div>
            </div>
         </aside>
      </>
   );
}
