// Esta lógica governa a visibilidade do menu inteiro (escopo system/tenant,
// roles do item e permissões dos filhos) — um erro aqui esconde módulos
// inteiros para quem deveria vê-los. Extraída do `sidebar.tsx` para ser
// testável com `hasRole`/`hasPerm` falsos, sem renderizar o sidebar (que
// arrastaria next/navigation, Flowbite e react-icons para o teste).

import type { IconType } from "react-icons";
// Só o tipo: o valor traria react-icons junto e quebraria o teste unitário.
import type { navItems } from "./navItems";

export interface FilteredNavChild {
   icon: IconType;
   label: string;
   path: string;
   resource?: string;
   permission?: string;
   roles?: readonly string[];
}

export interface FilteredNavItem {
   type: string;
   icon: IconType;
   label: string;
   path?: string;
   scope?: "system" | "tenant" | "shared";
   roles?: readonly string[];
   children?: readonly FilteredNavChild[] | FilteredNavChild[];
}

interface ContextoFiltro {
   hasRole: (roles: readonly string[]) => boolean;
   hasPerm: (resource?: string, requiredPerm?: string) => boolean;
   isSystemContext: boolean;
}

export function filtrarNavItems(
   itens: typeof navItems,
   { hasRole, hasPerm, isSystemContext }: ContextoFiltro
): FilteredNavItem[] {
   const result: FilteredNavItem[] = [];

   for (const item of itens) {
      // Gate por escopo: a org ativa define qual plano aparece.
      // "system" só no contexto Sistema; "tenant" só dentro de uma
      // unidade; "shared" (e ausência de scope) em ambos.
      if (item.scope === "system" && !isSystemContext) continue;
      if (item.scope === "tenant" && isSystemContext) continue;

      // Verifica permissão baseada em roles do item principal
      if (item.roles && item.roles.length > 0) {
         if (!hasRole(item.roles)) continue;
      }

      // Se for um collapse, filtra os filhos numa única passagem
      if (item.type === "collapse" && item.children) {
         const filteredChildren = item.children.filter((child) => {
            if ("resource" in child && "permission" in child) {
               return hasPerm(child.resource, child.permission);
            }
            if (
               "roles" in child &&
               Array.isArray(child.roles) &&
               child.roles.length > 0
            ) {
               return hasRole(child.roles);
            }
            return true;
         });

         if (filteredChildren.length > 0) {
            result.push({ ...item, children: filteredChildren });
         }
         continue;
      }

      result.push(item);
   }

   return result;
}
