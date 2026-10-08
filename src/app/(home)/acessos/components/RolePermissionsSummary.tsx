"use client";

import { useId, useState } from "react";
import clsx from "clsx";
import { Button } from "flowbite-react";
import {
   getActionChipTheme,
   groupPermissionsByResource,
} from "@/constants/admin/roles";
import type { RoleDetail } from "services/routes/security/roles";

/** Acima disto o resumo nasce recolhido: o modal não vira rolagem longa. */
const MAX_OPEN_RESOURCES = 4;

/**
 * O que o perfil concede, agrupado por recurso. Quem monta deve passar
 * `key={role.id}` para o estado "expandido" voltar ao padrão a cada perfil.
 */
export function RolePermissionsSummary({ role }: { role: RoleDetail }) {
   const listId = useId();
   const [expanded, setExpanded] = useState(false);

   const boxClass =
      "space-y-2 rounded border border-slate-200 bg-slate-50 p-3 text-sm text-slate-600";

   // Administrador passa por bypass no backend: a lista de permissões do
   // cadastro não é o que ele de fato pode, então não a exibimos.
   if (role.name.toLowerCase() === "admin") {
      return (
         <p className={boxClass}>
            Administrador tem acesso total; não depende das permissões
            cadastradas.
         </p>
      );
   }

   const groups = Object.entries(groupPermissionsByResource(role.permissions));

   if (groups.length === 0) {
      return <p className={boxClass}>Nenhuma permissão.</p>;
   }

   const total = groups.reduce((sum, [, perms]) => sum + perms.length, 0);
   const collapsible = groups.length > MAX_OPEN_RESOURCES;
   const open = !collapsible || expanded;

   return (
      <div className={boxClass}>
         <div className="flex items-center justify-between gap-2">
            <p className="text-xs font-semibold text-slate-700">Permissões</p>
            {collapsible && (
               <Button
                  size="xs"
                  color="light"
                  className="shrink-0"
                  aria-expanded={expanded}
                  aria-controls={expanded ? listId : undefined}
                  onClick={() => setExpanded((v) => !v)}
               >
                  {expanded ? "Ocultar" : `Ver as ${total} permissões`}
               </Button>
            )}
         </div>

         {open && (
            <dl id={listId} className="space-y-1.5">
               {groups.map(([resource, perms]) => (
                  <div
                     key={resource}
                     className="flex flex-col gap-0.5 sm:flex-row sm:items-start sm:gap-2"
                  >
                     <dt
                        className="truncate py-0.5 text-xs font-medium text-slate-700 sm:w-[160px] sm:shrink-0"
                        title={resource}
                     >
                        {resource}
                     </dt>
                     <dd className="flex min-w-0 flex-1 flex-wrap gap-1">
                        {perms.map((p) => {
                           const chip = getActionChipTheme(p.action);
                           return (
                              <span
                                 key={p.id}
                                 title={p.description}
                                 className={clsx(
                                    "rounded border px-1.5 py-0.5 text-xs font-medium whitespace-nowrap",
                                    chip.bg,
                                    chip.text,
                                    chip.border
                                 )}
                              >
                                 {p.action}
                              </span>
                           );
                        })}
                     </dd>
                  </div>
               ))}
            </dl>
         )}
      </div>
   );
}
