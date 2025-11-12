"use client";

import { useState, useMemo } from "react";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import { useAuth } from "@/app/context/auth";
import SidebarItem from "./sidebarItem";
import SidebarCollapse from "./sidebarCollapse";
import { navItems } from "./navItems";
import { PiSignOut } from "react-icons/pi";
import { Button } from "flowbite-react";
import LoadingOverlay from "./loadingOverlay";
import { useRoleBased } from "../../hooks/useRoleBased";
import { usePermBased } from "../../hooks/usePermBased";

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
      return navItems.filter((item) => {
         // Verifica permissão baseada em roles do item principal
         if (item.roles && item.roles.length > 0) {
            if (!hasRole(item.roles)) {
               return false;
            }
         }

         // Se for um collapse, filtra os filhos
         if (item.type === "collapse" && item.children) {
            const filteredChildren = item.children.filter((child: any) => {
               // Verifica permissão por resource e permission
               if (child.resource && child.permission) {
                  return hasPerm(child.resource, child.permission);
               }

               // Verifica permissão por roles
               if (child.roles && child.roles.length > 0) {
                  return hasRole(child.roles);
               }

               return true;
            });

            // Retorna o item com os filhos filtrados, ou não retorna se não houver filhos visíveis
            if (filteredChildren.length > 0) {
               return true;
            }

            return false;
         }

         return true;
      }).map((item) => {
         // Cria uma cópia do item com os filhos filtrados
         if (item.type === "collapse" && item.children) {
            const filteredChildren = item.children.filter((child: any) => {
               if (child.resource && child.permission) {
                  return hasPerm(child.resource, child.permission);
               }

               if (child.roles && child.roles.length > 0) {
                  return hasRole(child.roles);
               }

               return true;
            });

            return {
               ...item,
               children: filteredChildren,
            };
         }

         return item;
      });
   }, [hasRole, hasPerm]);

   return (
      <>
         {isLoggingOut && <LoadingOverlay message="Saindo..." />}
         <aside
            className={clsx(
               useOverlay ? "fixed" : "sticky",
               "top-16 left-0 bottom-0 z-40 flex-shrink-0",
               "flex flex-col bg-white shadow-xl overflow-hidden",
               "transition-all duration-200 ease-in-out",
               isOpen ? "w-64" : useOverlay ? "w-64" : "w-0",
               useOverlay && (isOpen ? "translate-x-0" : "-translate-x-full")
            )}
         >
            {/* Área de navegação com scroll */}
            <nav className='flex-1 overflow-y-auto p-1 space-y-1'>
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
            <div className='py-4 px-2 border-t border-gray-200 flex-shrink-0 bg-gray-50'>
            <div className='flex items-center gap-2'>
               <div className='w-10 h-10 bg-red-600 rounded-full uppercase flex items-center justify-center text-white text-sm font-bold'>
                  {userPg}
               </div>
               <div className='flex-1 min-w-0'>
                  <div className='font-medium text-gray-800 text-sm truncate uppercase'>
                     {user}
                  </div>
                  <div className='text-xs text-gray-500 uppercase'>{role}</div>
               </div>
               <Button className='p-1' onClick={handleLogout} color='alternative' disabled={isLoggingOut}>
                  <PiSignOut size={21} />
               </Button>
            </div>
            </div>
         </aside>
      </>
   );
}
