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
         className={`flex w-full items-center gap-3 rounded-lg transition-colors duration-200 ${isChild ? "px-4 py-2 text-sm" : "px-4 py-3"} ${
            isActive
               ? "bg-red-100 font-semibold text-red-700"
               : isChild
                 ? "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                 : "text-gray-700 hover:bg-gray-100"
         } `}
      >
         <Icon className={`h-5 w-5 shrink-0`} />
         <span className="text-base">{item.label}</span>
      </button>
   );
}
