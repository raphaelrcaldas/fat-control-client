"use client";

import { MdSettings } from "react-icons/md";
import { useAuth } from "@/app/context/auth";
import { CargosSection } from "./components/CargosSection";

export default function ConfigPage() {
   const { activeOrg, orgs } = useAuth();
   const org = orgs.find((o) => o.organizacao_id === activeOrg);

   return (
      <div className="space-y-2">
         <header className="relative overflow-hidden rounded border border-slate-200 bg-white px-5 py-4 shadow-sm sm:px-6 sm:py-5">
            {/* Espinha da marca — ecoa a espinha dos cards */}
            <span
               aria-hidden
               className="bg-primary-600 absolute top-0 left-0 h-full w-1"
            />

            <div className="relative flex flex-wrap items-center justify-between gap-4">
               <div className="flex min-w-0 items-center gap-4">
                  <div className="bg-primary-50 text-primary-600 ring-primary-100 grid h-12 w-12 shrink-0 place-items-center rounded-md ring-1 ring-inset">
                     <MdSettings className="h-6 w-6" />
                  </div>
                  <div className="min-w-0">
                     <span className="text-primary-600 block font-mono text-[10px] font-bold tracking-[0.3em] uppercase">
                        {org?.sigla?.toUpperCase() ?? "Organização"}
                     </span>
                     <h1 className="text-2xl leading-none font-extrabold tracking-tight text-slate-900 sm:text-[28px]">
                        Configurações
                     </h1>
                  </div>
               </div>
            </div>
         </header>

         <CargosSection />
      </div>
   );
}
