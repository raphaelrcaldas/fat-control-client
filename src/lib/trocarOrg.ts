import { setCookie } from "cookies-next";
import { switchOrg } from "services/routes/auth";
import type { OrgScope } from "services/routes/users";
import { getQueryClient } from "@/lib/queryClient";
import { ORG_BRAND_COOKIE, orgBrandFrom, serializeOrgBrand } from "./orgBrand";
import { normalizeOrgTheme, ORG_THEME_COOKIE } from "./orgTheme";

/**
 * Troca a organização ativa e recarrega a página em `destino`.
 *
 * Usada pelo seletor da navbar (`OrgSwitcher`, destino `/`) e pelo sino,
 * quando o aviso leva a uma tela de outro contexto — o de feedback da
 * administração abre `/admin/feedback`, que só responde no contexto
 * Sistema.
 *
 * Recarrega de verdade (`location.assign`), não navega pelo router: o
 * token, o tema e a identidade da org mudam juntos, e o cache do TanStack
 * Query inteiro pertence ao contexto anterior.
 *
 * Devolve a mensagem de erro quando a troca falha; no sucesso a página vai
 * embora e a promessa não importa mais.
 */
export async function trocarOrg(
   org: OrgScope,
   destino = "/"
): Promise<string | null> {
   try {
      const result = await switchOrg(org.organizacao_id);
      if (!result.ok || !result.data?.access_token) {
         return result.message || "Erro ao trocar de organização";
      }
      const cookieOptions = { maxAge: 24 * 60 * 60, path: "/" };
      setCookie("token", result.data.access_token, cookieOptions);
      // Grava tema e identidade da nova org antes do reload: o SSR já
      // estampa a cor e o texto certos, sem flash.
      setCookie(ORG_THEME_COOKIE, normalizeOrgTheme(org.tema), cookieOptions);
      setCookie(
         ORG_BRAND_COOKIE,
         serializeOrgBrand(orgBrandFrom(org)),
         cookieOptions
      );
      getQueryClient().clear();
      window.location.assign(destino);
      return null;
   } catch (error) {
      console.error("switchOrg failed", error);
      return "Erro ao trocar de organização";
   }
}
