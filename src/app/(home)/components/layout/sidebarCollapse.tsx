"use client";

import { IoChevronDown } from "react-icons/io5";
import SidebarItem from "./sidebarItem";
import { usePersistedState } from "@/hooks/usePersistedState";
import type { IconType } from "react-icons";

interface SidebarCollapseProps {
   item: {
      icon: IconType;
      label: string;
      type?: string;
      roles?: readonly string[];
      children?: ReadonlyArray<{
         icon: IconType;
         label: string;
         path: string;
         resource?: string;
         permission?: string;
         roles?: readonly string[];
      }>;
   };
   isMobile: boolean;
   pathname: string;
   onClick: () => void;
}

export default function SidebarCollapse({
   item,
   pathname,
   onClick,
   isMobile = false,
}: SidebarCollapseProps) {
   const Icon = item.icon;
   const hasActiveChild = item.children?.some(
      (child) =>
         pathname === child.path || pathname.startsWith(child.path + "/")
   );
   const [isOpen, setIsOpen] = usePersistedState<boolean>(
      `sidebar:${item.label}`,
      true
   );

   return (
      <div className="space-y-1">
         {/* Botão do collapse */}
         <button
            onClick={() => setIsOpen(!isOpen)}
            className={`flex w-full items-center justify-between gap-3 rounded-lg px-4 py-3 transition-colors duration-200 ${
               hasActiveChild
                  ? "bg-primary-50 text-primary-700"
                  : "text-gray-700 hover:bg-gray-100"
            } `}
         >
            <div className="flex items-center gap-3">
               <Icon className="h-5 w-5 shrink-0" />
               <span className="font-medium">{item.label}</span>
            </div>
            <IoChevronDown
               className={`h-4 w-4 transition-transform duration-200 ${
                  isOpen ? "rotate-180" : ""
               }`}
            />
         </button>

         {/* Submenu */}
         <div
            className={`grid transition-[grid-template-rows] duration-200 ease-in-out ${
               isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
            }`}
         >
            <div className="overflow-hidden">
               <div className="ml-4 space-y-1 border-l-2 border-gray-200 pl-1">
                  {item.children?.map((child) => (
                     <SidebarItem
                        key={child.path}
                        item={child}
                        isMobile={isMobile}
                        isActive={
                           pathname === child.path ||
                           pathname.startsWith(child.path + "/")
                        }
                        onClick={onClick}
                        isChild
                     />
                  ))}
               </div>
            </div>
         </div>
      </div>
   );
}
