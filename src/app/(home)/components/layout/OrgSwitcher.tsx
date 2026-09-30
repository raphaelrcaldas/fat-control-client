"use client";

import { useEffect, useRef, useState } from "react";
import clsx from "clsx";
import { FaBuilding, FaCheck, FaChevronDown } from "react-icons/fa6";
import { Dropdown, DropdownHeader, DropdownItem } from "flowbite-react";
import { useAuth } from "@/app/context/auth";
import { trocarOrg } from "@/lib/trocarOrg";
import { useToast } from "@/app/context/toast";
import type { OrgScope } from "services/routes/users";
import LoadingOverlay from "./loadingOverlay";

function orgLabel(org: OrgScope): string {
   return org.sigla ? org.sigla.toUpperCase() : "Sistema";
}

export function OrgSwitcher() {
   const { activeOrg, orgs } = useAuth();
   const { push } = useToast();
   const [switchingTo, setSwitchingTo] = useState<OrgScope | null>(null);
   const wrapperRef = useRef<HTMLDivElement>(null);
   const devolverFoco = useRef(false);

   // Depois de uma falha o foco volta ao gatilho — sem isto ele caía no
   // `body` quando o dialog fechava. Tem que ser em efeito: no render do
   // `setSwitchingTo(null)` o botão ainda está `disabled`. Busca pelo
   // wrapper porque o `Dropdown` clona o gatilho com o `ref` dele (o nosso
   // sobrescreveria o do posicionamento).
   useEffect(() => {
      if (switchingTo || !devolverFoco.current) return;
      devolverFoco.current = false;
      wrapperRef.current?.querySelector("button")?.focus();
   }, [switchingTo]);

   // Sem escolha a fazer (0 ou 1 vínculo), não há o que trocar: nem selo.
   if (!orgs || orgs.length <= 1) return null;

   const current = orgs.find((o) => o.organizacao_id === activeOrg) ?? orgs[0];

   async function handleSwitch(org: OrgScope) {
      if (org.organizacao_id === activeOrg) return;

      setSwitchingTo(org);
      const erro = await trocarOrg(org);
      if (erro) {
         push({ type: "error", message: erro });
         devolverFoco.current = true;
         setSwitchingTo(null);
      }
   }

   return (
      // shrink-0 + ml-2: o switcher nunca é comprimido pela marca — quem cede
      // espaço na navbar estreita é o wordmark (min-w-0/truncate no navbar).
      <div ref={wrapperRef} className="ml-2 shrink-0">
         {/* Fica até a página ir embora: no sucesso `trocarOrg` recarrega e
             nunca devolve o controle, então não há `setSwitchingTo(null)`. */}
         {switchingTo && (
            <LoadingOverlay
               message={`Trocando para ${orgLabel(switchingTo)}...`}
            />
         )}
         <Dropdown
            dismissOnClick
            renderTrigger={() => (
               // O botão é a área clicável e fica TRANSPARENTE; o pill visual
               // dentro dele mantém a mesma altura compacta em qualquer
               // ponteiro (régua única de 24px, ver `docs/ai/rules/
               // frontend.md`). O chevron é a affordance de menu.
               <button
                  type="button"
                  disabled={!!switchingTo}
                  className="group flex items-center focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-60"
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
