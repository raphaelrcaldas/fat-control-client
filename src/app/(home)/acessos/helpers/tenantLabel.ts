import type { Tenant } from "services/routes/tenants";

/** Rótulo padrão de um tenant: "SIGLA - sigla_3" (sigla_3 opcional). */
export function tenantLabel(t: Tenant): string {
   const sigla = t.organizacao.sigla.toUpperCase();
   return t.organizacao.sigla_3 ? `${sigla} - ${t.organizacao.sigla_3}` : sigla;
}
