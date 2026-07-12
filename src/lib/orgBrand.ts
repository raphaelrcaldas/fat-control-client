/**
 * Identidade textual da organização ativa (nome + saudação).
 *
 * Mesmo mecanismo do tema (ver orgTheme.ts): a tela de carregamento precisa do
 * nome/saudação *antes* do /users/me responder, então o par é gravado no cookie
 * `org_brand` (AuthProvider/OrgSwitcher) e lido pelo root layout no SSR, que o
 * injeta via OrgBrandProvider. Sem isso, a tela piscaria o texto genérico até a
 * hidratação.
 */
export const ORG_BRAND_COOKIE = "org_brand";

export interface OrgBrand {
   /** Nome da organização (ex: "1º/1º Grupo de Transporte"). */
   nome: string;
   /** Lema da unidade; "" quando o tenant não definiu nenhum. */
   saudacao: string;
}

export const DEFAULT_ORG_BRAND: OrgBrand = {
   nome: "FATCONTROL",
   saudacao: "",
};

export function serializeOrgBrand(brand: OrgBrand): string {
   return JSON.stringify(brand);
}

/**
 * Lê o cookie (JSON) tolerando o valor percent-encoded — o `setCookie` do
 * cookies-next codifica na escrita e nem todo leitor decodifica na volta.
 */
export function parseOrgBrand(raw: string | null | undefined): OrgBrand {
   if (!raw) return DEFAULT_ORG_BRAND;

   for (const candidate of [raw, safeDecode(raw)]) {
      try {
         const parsed = JSON.parse(candidate) as Partial<OrgBrand>;
         return {
            nome: parsed.nome?.trim() || DEFAULT_ORG_BRAND.nome,
            saudacao: parsed.saudacao?.trim() || "",
         };
      } catch {
         continue;
      }
   }

   return DEFAULT_ORG_BRAND;
}

function safeDecode(value: string): string {
   try {
      return decodeURIComponent(value);
   } catch {
      return value;
   }
}
