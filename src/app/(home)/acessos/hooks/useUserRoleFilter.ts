import { useMemo, useState } from "react";
import type { UserWithRole } from "services/routes/security/roles";

/** Perfil presente na lista de vínculos, com quantos vínculos o usam. */
export interface RoleFilterOption {
   id: number;
   name: string;
   count: number;
}

/**
 * Filtros da lista de vínculos: texto (nome de guerra, posto/graduação ou
 * perfil) e perfil exato. Combinam em E.
 */
export function useUserRoleFilter(userRoles: UserWithRole[]) {
   const [filterName, setFilterName] = useState("");
   const [selectedRoleId, setRoleFilter] = useState<number | null>(null);

   // Só perfis com vínculo na lista (não o catálogo), com a contagem total —
   // a do texto não entra, para a opção não mudar a cada tecla.
   const roleOptions = useMemo<RoleFilterOption[]>(() => {
      const byId = new Map<number, RoleFilterOption>();
      for (const ur of userRoles) {
         const option = byId.get(ur.role.id);
         if (option) option.count += 1;
         else
            byId.set(ur.role.id, {
               id: ur.role.id,
               name: ur.role.name,
               count: 1,
            });
      }
      return [...byId.values()].sort((a, b) => a.name.localeCompare(b.name));
   }, [userRoles]);

   // O último vínculo do perfil filtrado pode sumir (remoção/refetch): sem
   // a opção o select ficaria sem valor e a tabela vazia, sem saída óbvia.
   const roleFilter = roleOptions.some((o) => o.id === selectedRoleId)
      ? selectedRoleId
      : null;

   // O id guardado não "ressuscita": se o perfil sumiu da lista, zera o estado
   // em vez de só mascarar a derivação (senão voltaria ao adicionar um vínculo
   // com o mesmo perfil). Ajuste no render.
   if (selectedRoleId !== null && roleFilter === null) {
      setRoleFilter(null);
   }

   const filteredUsers = useMemo(() => {
      const input = filterName.trim().toLowerCase();
      if (!input && roleFilter === null) return userRoles;

      return userRoles.filter((ur) => {
         if (roleFilter !== null && ur.role.id !== roleFilter) return false;
         if (!input) return true;
         const nomeGuerra = (ur.user.nome_guerra || "").toLowerCase();
         const pg = (ur.user.p_g || "").toLowerCase();
         const roleName = (ur.role.name || "").toLowerCase();
         return (
            nomeGuerra.includes(input) ||
            pg.includes(input) ||
            roleName.includes(input)
         );
      });
   }, [filterName, roleFilter, userRoles]);

   function clearFilters() {
      setFilterName("");
      setRoleFilter(null);
   }

   return {
      filterName,
      setFilterName,
      roleFilter,
      setRoleFilter,
      roleOptions,
      clearFilters,
      filteredUsers,
   };
}
