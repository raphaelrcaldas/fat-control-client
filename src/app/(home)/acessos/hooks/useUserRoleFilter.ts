import { useMemo, useState } from "react";
import useDebouncedValue from "@/hooks/useDebouncedValue";
import type { UserWithRole } from "services/routes/security/roles";

/** Filtro por nome de guerra, posto/graduação ou perfil (com debounce). */
export function useUserRoleFilter(userRoles: UserWithRole[]) {
   const [filterName, setFilterName] = useState("");
   const debouncedFilter = useDebouncedValue(filterName, 400);

   const filteredUsers = useMemo(() => {
      const input = debouncedFilter.trim().toLowerCase();
      if (!input) return userRoles;

      return userRoles.filter((ur) => {
         const nomeGuerra = (ur.user.nome_guerra || "").toLowerCase();
         const pg = (ur.user.p_g || "").toLowerCase();
         const roleName = (ur.role.name || "").toLowerCase();
         return (
            nomeGuerra.includes(input) ||
            pg.includes(input) ||
            roleName.includes(input)
         );
      });
   }, [debouncedFilter, userRoles]);

   return { filterName, setFilterName, filteredUsers };
}
