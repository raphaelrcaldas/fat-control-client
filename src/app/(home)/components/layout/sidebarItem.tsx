"use client";

import { useRouter } from "next/navigation";
import type { IconType } from "react-icons";

interface SidebarItemProps {
   item: {
      icon: IconType;
      label: string;
      path?: string;
   };
   isActive: boolean;
   onClick: () => void;
   isChild?: boolean;
   isMobile: boolean;
}

export default function SidebarItem({
   item,
   isActive,
   onClick,
   isChild = false,
   isMobile,
}: SidebarItemProps) {
   const router = useRouter();
   const Icon = item.icon;

   const handleClick = () => {
      if (item.path) {
         router.push(item.path);
         if (isMobile) {
            onClick();
         }
      }
   };

   return (
      <button
         onClick={handleClick}
         /* Sem altura mínima no item: ele atravessa a largura da gaveta, e
            uma FAIXA não é alvo compacto — na horizontal Fitts já está
            satisfeito com folga (ver `docs/ai/rules/frontend.md`). O piso de
            32px fica explícito no filho, que sem ele para em 31,5px. */
         className={`focus-visible:ring-primary-600 flex w-full items-center gap-3 rounded transition-colors duration-200 focus-visible:ring-2 focus-visible:outline-none ${isChild ? "min-h-[32px] px-4 py-2 text-sm" : "px-4 py-3"} ${
            isActive
               ? "bg-primary-100 text-primary-700 font-semibold"
               : isChild
                 ? "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                 : "text-gray-700 hover:bg-gray-100"
         } `}
      >
         <Icon className={`h-5 w-5 shrink-0`} />
         <span className={isChild ? "text-sm" : "text-base"}>{item.label}</span>
      </button>
   );
}
