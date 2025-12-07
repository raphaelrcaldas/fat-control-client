"use client";

import { useState } from "react";
import { IoChevronDown } from "react-icons/io5";
import SidebarItem from "./sidebarItem";
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
      (child) => pathname === child.path
   );
   const [isOpen, setIsOpen] = useState(true);

   return (
      <div className='space-y-1'>
         {/* Botão do collapse */}
         <button
            onClick={() => setIsOpen(!isOpen)}
            className={`
          w-full flex items-center justify-between gap-3 px-4 py-3 rounded-lg
          transition-colors duration-200
          ${
             hasActiveChild
                ? "bg-red-50 text-red-700"
                : "text-gray-700 hover:bg-gray-100"
          }
        `}
         >
            <div className='flex items-center gap-3'>
               <Icon className='w-5 h-5 flex-shrink-0' />
               <span className='font-medium'>{item.label}</span>
            </div>
            <IoChevronDown
               className={`w-4 h-4 transition-transform duration-200 ${
                  isOpen ? "rotate-180" : ""
               }`}
            />
         </button>

         {/* Submenu */}
         {isOpen && (
            <div className='ml-4 space-y-1 border-l-2 border-gray-200 pl-1'>
               {item.children?.map((child) => (
                  <SidebarItem
                     key={child.path}
                     item={child}
                     isMobile={isMobile}
                     isActive={pathname === child.path}
                     onClick={onClick}
                     isChild
                  />
               ))}
            </div>
         )}
      </div>
   );
}
