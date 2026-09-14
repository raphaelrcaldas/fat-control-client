"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import { deleteCookie } from "cookies-next";
import { usePersistedState } from "@/hooks/usePersistedState";
import Navbar from "./components/layout/navbar";
import SidebarWithFooter from "./components/layout/sidebar";
import PageTransition from "./components/layout/page-transition";
import { QuadsProvider } from "./context/quads";
import { AuthProvider } from "../context/auth";
import { getQueryClient } from "@/lib/queryClient";

interface RootLayoutProps {
   children: React.ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
   const [isSidebarOpen, setIsSidebarOpen] = useState(false);
   const [isMobile, setIsMobile] = useState(false);
   /**
    * Só a preferência do DESKTOP é lembrada. No mobile a sidebar é uma gaveta
    * sobre o conteúdo, com backdrop e scroll travado: restaurá-la aberta faria
    * a sessão começar com a tela coberta.
    */
   const [desktopSidebarOpen, setDesktopSidebarOpen] =
      usePersistedState<boolean>("sidebar:desktopOpen", true);
   const router = useRouter();
   const pathname = usePathname();

   /**
    * A preferencia entra por ref, e nao por dependencia do efeito: como
    * dependencia, cada toggle no desktop re-registraria o listener de resize e
    * reafirmaria `isSidebarOpen` a partir do valor persistido. Hoje isso e
    * inofensivo so porque o toggle grava os dois estados com o MESMO valor —
    * qualquer caminho que feche a sidebar sem espelhar na preferencia teria o
    * valor devolvido pelo efeito. Com a ref, o listener se registra uma vez e
    * o efeito nao disputa o estado com quem o alterou.
    */
   const prefRef = useRef(desktopSidebarOpen);
   prefRef.current = desktopSidebarOpen;

   useEffect(() => {
      const checkMobile = () => {
         const mobile = window.innerWidth < 1024;
         setIsMobile(mobile);
         setIsSidebarOpen(mobile ? false : prefRef.current);
      };

      checkMobile();
      window.addEventListener("resize", checkMobile);
      return () => window.removeEventListener("resize", checkMobile);
   }, []);

   useEffect(() => {
      if (isMobile && isSidebarOpen) {
         document.body.style.overflow = "hidden";
      } else {
         document.body.style.overflow = "unset";
      }
   }, [isMobile, isSidebarOpen]);

   const handleLogout = async () => {
      getQueryClient().clear();
      deleteCookie("token", { path: "/" });
      router.refresh();
   };

   const toggleSidebar = () => {
      const next = !isSidebarOpen;
      setIsSidebarOpen(next);
      // Só o desktop grava: o fechar da gaveta no mobile não é preferência.
      if (!isMobile) setDesktopSidebarOpen(next);
   };

   return (
      <AuthProvider>
         <QuadsProvider>
            <div className="flex h-screen flex-col overflow-hidden bg-gray-50">
               {/* Navbar inteligente */}
               <Navbar
                  onToggleSidebar={toggleSidebar}
                  isSidebarOpen={isSidebarOpen}
               />

               {/* Container principal - ajusta padding baseado na navbar */}
               <div className="flex flex-1 overflow-hidden pt-16">
                  {/* Backdrop */}
                  {isMobile && isSidebarOpen && (
                     <div
                        className="animate-in fade-in fixed inset-0 z-40 bg-black/50 duration-300 lg:hidden"
                        onClick={() => setIsSidebarOpen(false)}
                        aria-hidden="true"
                     />
                  )}

                  {/* Sidebar */}
                  <SidebarWithFooter
                     isOpen={isSidebarOpen}
                     isMobile={isMobile}
                     onLogout={handleLogout}
                     onClose={() => setIsSidebarOpen(false)}
                  />

                  {/* Conteúdo */}
                  <main className="flex-1 overflow-auto p-1 md:p-2">
                     <PageTransition key={pathname}>{children}</PageTransition>
                  </main>
               </div>
            </div>
         </QuadsProvider>
      </AuthProvider>
   );
}
