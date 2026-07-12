"use client";

import { FaShieldHalved } from "react-icons/fa6";
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
   // Logo do shell herda o brasão estático da org ativa. No escopo Sistema
   // (sem unidade) entra o selo de escudo no lugar do brasão; org com sigla
   // mas sem brasão registrado continua só com o wordmark, sem fallback.
   const brasao = brasaoUrl(activeOrg);
   const isSistema = activeOrg === null;

   return (
      <nav
         aria-label="Barra superior"
         className="to-primary-100 fixed top-0 right-0 left-0 z-50 flex h-16 items-center justify-between bg-linear-to-r from-white px-4 shadow-lg"
      >
         <div className="flex items-center gap-3">
            {/* Alvo de 44px só em ponteiro grosso (dedo). No mouse a precisão é
                outra — o mínimo WCAG ali é 24px — e inflar o shell no desktop
                custaria densidade sem ganho. Em px, e não rem: a raiz é 87.5%. */}
            <button
               onClick={onToggleSidebar}
               className="hover:bg-primary-100 focus-visible:ring-primary-600 flex items-center justify-center rounded transition-colors focus-visible:ring-2 focus-visible:outline-none pointer-coarse:min-h-[44px] pointer-coarse:min-w-[44px]"
               aria-label={isSidebarOpen ? "Fechar menu" : "Abrir menu"}
               aria-expanded={isSidebarOpen}
            >
               {isSidebarOpen ? (
                  <MdClose className="text-primary-600 h-7 w-7" />
               ) : (
                  <HiMenuAlt1 className="text-primary-600 h-7 w-7" />
               )}
            </button>

            {/* Logo */}
            <div className="flex items-center gap-2">
               {brasao ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                     src={brasao}
                     alt={`Brasão ${activeOrg?.toUpperCase() ?? ""}`.trim()}
                     className="h-10 w-10 rounded object-contain shadow-md"
                  />
               ) : (
                  isSistema && (
                     <div
                        role="img"
                        aria-label="Escopo de sistema — sem unidade"
                        title="Escopo de sistema — sem unidade"
                        className="grid h-10 w-10 shrink-0 place-items-center rounded-md bg-slate-100 text-slate-600 shadow ring-1 ring-slate-200 ring-inset"
                     >
                        <FaShieldHalved className="h-5 w-5" />
                     </div>
                  )
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
