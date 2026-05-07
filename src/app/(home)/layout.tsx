"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { deleteCookie } from "cookies-next";
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
   const router = useRouter();
   const pathname = usePathname();

   useEffect(() => {
      const checkMobile = () => {
         const mobile = window.innerWidth < 1024;
         setIsMobile(mobile);
         if (!mobile) setIsSidebarOpen(true);
         if (mobile) setIsSidebarOpen(false);
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

   const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

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
                  <main className="flex-1 overflow-auto p-2">
                     <PageTransition key={pathname}>{children}</PageTransition>
                  </main>
               </div>
            </div>
         </QuadsProvider>
      </AuthProvider>
   );
}
