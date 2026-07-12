"use client";

import { useState } from "react";
import clsx from "clsx";
import { setCookie } from "cookies-next";
import { FaBuilding, FaCheck, FaChevronDown } from "react-icons/fa6";
import { Dropdown, DropdownHeader, DropdownItem } from "flowbite-react";
import { useAuth } from "@/app/context/auth";
import { switchOrg } from "services/routes/auth";
import { getQueryClient } from "@/lib/queryClient";
import {
   ORG_BRAND_COOKIE,
   orgBrandFrom,
   serializeOrgBrand,
} from "@/lib/orgBrand";
import { normalizeOrgTheme, ORG_THEME_COOKIE } from "@/lib/orgTheme";
import { useToast } from "@/app/context/toast";
import type { OrgScope } from "services/routes/users";

function orgLabel(org: OrgScope): string {
   return org.sigla ? org.sigla.toUpperCase() : "Sistema";
}

export function OrgSwitcher() {
   const { activeOrg, orgs } = useAuth();
   const { push } = useToast();
   const [isSwitching, setIsSwitching] = useState(false);

   if (!orgs || orgs.length === 0) return null;

   const current = orgs.find((o) => o.organizacao_id === activeOrg) ?? orgs[0];

   async function handleSwitch(org: OrgScope) {
      if (org.organizacao_id === activeOrg) return;

      setIsSwitching(true);
      try {
         const result = await switchOrg(org.organizacao_id);
         if (result.ok && result.data?.access_token) {
            setCookie("token", result.data.access_token, {
               maxAge: 24 * 60 * 60,
               path: "/",
            });
            // Grava tema e identidade da nova org antes do reload: o SSR já
            // estampa a cor e o texto certos, sem flash.
            const cookieOptions = { maxAge: 24 * 60 * 60, path: "/" };
            setCookie(
               ORG_THEME_COOKIE,
               normalizeOrgTheme(org.tema),
               cookieOptions
            );
            setCookie(
               ORG_BRAND_COOKIE,
               serializeOrgBrand(orgBrandFrom(org)),
               cookieOptions
            );
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
         <div className="ml-2 flex shrink-0 items-center gap-2 rounded bg-white/60 px-3 py-1.5 text-sm font-semibold text-gray-700 shadow-sm">
            <FaBuilding className="text-primary-600" />
            {orgLabel(current)}
         </div>
      );
   }

   return (
      // shrink-0 + ml-2: o switcher nunca é comprimido pela marca — quem cede
      // espaço na navbar estreita é o wordmark (min-w-0/truncate no navbar).
      <div className="ml-2 shrink-0">
         <Dropdown
            dismissOnClick
            renderTrigger={() => (
               // Alvo de toque de 44px no dedo, mas TRANSPARENTE: quem cresce
               // no mobile é o botão (área clicável), não o pill visual — que
               // mantém a mesma altura compacta do desktop. Visual idêntico ao
               // badge de vínculo único, + chevron como affordance de menu.
               <button
                  type="button"
                  disabled={isSwitching}
                  className="group flex items-center focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-60 pointer-coarse:min-h-[44px]"
               >
                  <span className="group-focus-visible:ring-primary-600 flex items-center gap-2 rounded bg-white/60 px-3 py-1.5 text-sm font-semibold text-gray-700 shadow-sm transition-colors group-hover:bg-white group-focus-visible:ring-2">
                     <FaBuilding className="text-primary-600" />
                     {orgLabel(current)}
                     <FaChevronDown
                        className="h-3 w-3 text-gray-400"
                        aria-hidden
                     />
                  </span>
               </button>
            )}
         >
            <DropdownHeader>
               <span className="text-xs font-semibold tracking-wide text-gray-400 uppercase">
                  Organização ativa
               </span>
            </DropdownHeader>
            {orgs.map((org) => {
               const isActive = org.organizacao_id === activeOrg;
               return (
                  <DropdownItem
                     key={org.organizacao_id ?? "sistema"}
                     onClick={() => handleSwitch(org)}
                  >
                     <span className="flex w-full items-center justify-between gap-4">
                        <span
                           className={clsx(
                              "flex flex-col text-left",
                              isActive
                                 ? "text-primary-600 font-semibold"
                                 : "text-gray-700"
                           )}
                        >
                           <span>{orgLabel(org)}</span>
                           <span className="text-xs font-normal text-gray-400 uppercase">
                              {org.role}
                           </span>
                        </span>
                        {isActive && (
                           <FaCheck className="text-primary-600 h-3 w-3 shrink-0" />
                        )}
                     </span>
                  </DropdownItem>
               );
            })}
         </Dropdown>
      </div>
   );
}
