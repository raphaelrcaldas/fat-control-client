"use client";

import { HiMenuAlt1 } from "react-icons/hi";
import { MdClose } from "react-icons/md";
import { OrgSwitcher } from "./OrgSwitcher";
import { useAuth } from "@/app/context/auth";
import { brasaoUrl } from "@/lib/orgBrasao";

interface NavbarProps {
   onToggleSidebar: () => void;
   isSidebarOpen: boolean;
}

export default function Navbar({
   onToggleSidebar,
   isSidebarOpen,
}: NavbarProps) {
   const { activeOrg } = useAuth();
   // Logo do shell herda o brasão estático da org ativa; sem brasão (ou
   // escopo Sistema) o shell fica só com o wordmark FATCONTROL, sem fallback.
   const brasao = brasaoUrl(activeOrg);

   return (
      <nav className="to-primary-100 fixed top-0 right-0 left-0 z-50 flex h-16 items-center justify-between bg-linear-to-r from-white px-4 shadow-lg">
         <div className="flex items-center gap-3">
            {/* Botão menu */}
            <button
               onClick={onToggleSidebar}
               className="hover:bg-primary-100 rounded-lg p-2 transition-colors focus:outline-none"
               aria-label={isSidebarOpen ? "Fechar menu" : "Abrir menu"}
            >
               {isSidebarOpen ? (
                  <MdClose className="text-primary-600 h-7 w-7" />
               ) : (
                  <HiMenuAlt1 className="text-primary-600 h-7 w-7" />
               )}
            </button>

            {/* Logo */}
            <div className="flex items-center gap-2">
               {brasao && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                     src={brasao}
                     alt={`Brasão ${activeOrg?.toUpperCase() ?? ""}`.trim()}
                     className="h-10 w-10 rounded object-contain shadow-md"
                  />
               )}
               <span className="block text-2xl font-bold text-gray-800">
                  FAT<span className="text-primary-600">CONTROL</span>
               </span>
            </div>
         </div>

         <OrgSwitcher />
      </nav>
   );
}
