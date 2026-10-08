import type { Tenant } from "services/routes/tenants";

/** Rótulo padrão de um tenant: "SIGLA - sigla_3" (sigla_3 opcional). */
export function tenantLabel(t: Tenant): string {
   const sigla = t.organizacao.sigla.toUpperCase();
   return t.organizacao.sigla_3 ? `${sigla} - ${t.organizacao.sigla_3}` : sigla;
}

/** Rótulo da org de um vínculo: "Sistema" (org NULL) ou a sigla do tenant em maiúsculas. */
export function orgLabel(orgId: string | null, tenants: Tenant[]): string {
   if (orgId === null) return "Sistema";
   const sigla = tenants.find((t) => t.organizacao_id === orgId)?.organizacao
      .sigla;
   return (sigla ?? orgId).toUpperCase();
}
