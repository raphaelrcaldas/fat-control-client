"use client";

import { useEffect, useRef, useState } from "react";
import { setCookie } from "cookies-next";
import { FaBuilding, FaCheck, FaChevronDown } from "react-icons/fa6";
import { useAuth } from "@/app/context/auth";
import { switchOrg } from "services/routes/auth";
import { getQueryClient } from "@/lib/queryClient";
import { normalizeOrgTheme, ORG_THEME_COOKIE } from "@/lib/orgTheme";
import { useToast } from "@/app/context/toast";
import type { OrgScope } from "services/routes/users";

function orgLabel(org: OrgScope): string {
   return org.sigla ? org.sigla.toUpperCase() : "Sistema";
}

export function OrgSwitcher() {
   const { activeOrg, orgs } = useAuth();
   const { push } = useToast();
   const [isOpen, setIsOpen] = useState(false);
   const [isSwitching, setIsSwitching] = useState(false);
   const ref = useRef<HTMLDivElement>(null);

   useEffect(() => {
      function handleClickOutside(e: MouseEvent) {
         if (ref.current && !ref.current.contains(e.target as Node)) {
            setIsOpen(false);
         }
      }
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
         document.removeEventListener("mousedown", handleClickOutside);
   }, []);

   if (!orgs || orgs.length === 0) return null;

   const current = orgs.find((o) => o.organizacao_id === activeOrg) ?? orgs[0];

   async function handleSwitch(org: OrgScope) {
      setIsOpen(false);
      if (org.organizacao_id === activeOrg) return;

      setIsSwitching(true);
      try {
         const result = await switchOrg(org.organizacao_id);
         if (result.ok && result.data?.access_token) {
            setCookie("token", result.data.access_token, {
               maxAge: 24 * 60 * 60,
               path: "/",
            });
            // Grava o tema da nova org antes do reload: o SSR já estampa a
            // cor certa no <html>, sem flash.
            setCookie(ORG_THEME_COOKIE, normalizeOrgTheme(org.tema), {
               maxAge: 24 * 60 * 60,
               path: "/",
            });
            getQueryClient().clear();
            window.location.assign("/");
         } else {
            push({
               type: "error",
               message: result.message || "Erro ao trocar de organização",
            });
            setIsSwitching(false);
         }
      } catch (error) {
         console.error("switchOrg failed", error);
         push({ type: "error", message: "Erro ao trocar de organização" });
         setIsSwitching(false);
      }
   }

   // Vínculo único: apenas exibe o escopo atual (sem dropdown)
   if (orgs.length === 1) {
      return (
         <div className="flex items-center gap-2 rounded-lg bg-white/60 px-3 py-1.5 text-sm font-semibold text-gray-700 shadow-sm">
            <FaBuilding className="text-primary-600" />
            {orgLabel(current)}
         </div>
      );
   }

   return (
      <div className="relative" ref={ref}>
         <button
            type="button"
            onClick={() => setIsOpen((o) => !o)}
            disabled={isSwitching}
            className="flex items-center gap-2 rounded-lg bg-white/70 px-3 py-1.5 text-sm font-semibold text-gray-700 shadow-sm transition-colors hover:bg-white disabled:opacity-60"
            aria-haspopup="listbox"
            aria-expanded={isOpen}
         >
            <FaBuilding className="text-primary-600" />
            {orgLabel(current)}
            <FaChevronDown
               className={`h-3 w-3 transition-transform ${isOpen ? "rotate-180" : ""}`}
            />
         </button>

         {isOpen && (
            <div
               className="absolute right-0 z-50 mt-1 w-56 overflow-hidden rounded-lg border border-gray-200 bg-white shadow-lg"
               role="listbox"
            >
               <div className="border-b border-gray-100 px-3 py-2 text-xs font-semibold tracking-wide text-gray-400 uppercase">
                  Organização ativa
               </div>
               {orgs.map((org) => {
                  const isActive = org.organizacao_id === activeOrg;
                  return (
                     <button
                        key={org.organizacao_id ?? "sistema"}
                        type="button"
                        onClick={() => handleSwitch(org)}
                        className={`flex w-full items-center justify-between px-3 py-2 text-left text-sm hover:bg-gray-50 ${
                           isActive
                              ? "text-primary-600 font-semibold"
                              : "text-gray-700"
                        }`}
                        role="option"
                        aria-selected={isActive}
                     >
                        <span className="flex flex-col">
                           <span>{orgLabel(org)}</span>
                           <span className="text-xs text-gray-400 uppercase">
                              {org.role}
                           </span>
                        </span>
                        {isActive && <FaCheck className="h-3 w-3" />}
                     </button>
                  );
               })}
            </div>
         )}
      </div>
   );
}
