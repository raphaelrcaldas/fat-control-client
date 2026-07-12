"use client";

import { createContext, useContext } from "react";
import { DEFAULT_ORG_BRAND, type OrgBrand } from "@/lib/orgBrand";

const OrgBrandContext = createContext<OrgBrand>(DEFAULT_ORG_BRAND);

/**
 * Disponibiliza o nome/saudação da org ativa já no primeiro render (valor vem
 * do cookie lido pelo root layout no servidor). Fica acima do AuthProvider de
 * propósito: a tela de carregamento é exibida enquanto o /users/me carrega.
 */
export function OrgBrandProvider({
   brand,
   children,
}: {
   brand: OrgBrand;
   children: React.ReactNode;
}) {
   return (
      <OrgBrandContext.Provider value={brand}>
         {children}
      </OrgBrandContext.Provider>
   );
}

export function useOrgBrand(): OrgBrand {
   return useContext(OrgBrandContext);
}
