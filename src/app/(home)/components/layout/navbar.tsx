"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { FaShieldHalved } from "react-icons/fa6";
import { HiMenuAlt1 } from "react-icons/hi";
import { MdClose, MdOutlineRateReview } from "react-icons/md";
import { OrgSwitcher } from "./OrgSwitcher";
import { useAuth } from "@/app/context/auth";
import { brasaoUrl } from "@/lib/orgBrasao";
import { EnviarFeedbackModal } from "@/components/feedback/EnviarFeedbackModal";

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

   const [feedbackAberto, setFeedbackAberto] = useState(false);
   // O feedback nasce colado na tela onde a pessoa está: é isso que
   // transforma "o sistema travou" em "a escala travou ao filtrar por
   // função". Na própria caixa de feedbacks não há tela de origem útil.
   const pathname = usePathname();
   const rotaOrigem = pathname === "/admin/feedback" ? null : pathname;

   return (
      <nav
         aria-label="Barra superior"
         className="to-primary-100 fixed top-0 right-0 left-0 z-50 flex h-16 items-center justify-between bg-linear-to-r from-white px-4 shadow-lg"
      >
         {/* min-w-0: deixa o bloco da marca ceder espaço ao OrgSwitcher em vez
             de empurrá-lo — em 360px os dois somavam a viewport inteira. */}
         <div className="flex min-w-0 items-center gap-2 sm:gap-3">
            <button
               onClick={onToggleSidebar}
               className="hover:bg-primary-100 focus-visible:ring-primary-600 flex items-center justify-center rounded transition-colors focus-visible:ring-2 focus-visible:outline-none"
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
                     className="h-10 w-10 object-contain drop-shadow-sm"
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
               <span className="block truncate text-xl font-bold text-gray-800 sm:text-2xl">
                  FAT<span className="text-primary-600">CONTROL</span>
               </span>
            </div>
         </div>

         <div className="flex items-center gap-1">
            {/* Some no contexto Sistema: o backend congela o `uae` a partir
                da org ativa, então sem unidade não há a quem endereçar. */}
            {!isSistema && (
               <button
                  type="button"
                  onClick={() => setFeedbackAberto(true)}
                  aria-label="Enviar feedback"
                  title="Enviar feedback"
                  className="hover:bg-primary-100 focus-visible:ring-primary-600 flex items-center justify-center rounded p-1.5 transition-colors focus-visible:ring-2 focus-visible:outline-none"
               >
                  <MdOutlineRateReview className="text-primary-600 h-6 w-6" />
               </button>
            )}
            <OrgSwitcher />
         </div>

         <EnviarFeedbackModal
            show={feedbackAberto}
            onClose={() => setFeedbackAberto(false)}
            rota={rotaOrigem}
         />
      </nav>
   );
}
