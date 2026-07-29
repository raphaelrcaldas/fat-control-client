import { useAuth } from "@/app/context/auth";

/**
 * Espelha `is_system_admin` do backend (`api/fcontrol_api/security.py`): admin
 * de SISTEMA exige contexto "Sistema" (org ativa NULL) **e** papel admin nesse
 * contexto — quem alternou para uma unidade perde os poderes de sistema
 * enquanto estiver nela.
 *
 * Serve só para não oferecer uma ação que o backend recusaria: o 403
 * `SCOPE_FORBIDDEN` redireciona para /403 (ver REDIRECT_RULES em `Api.ts`), o
 * que descartaria o formulário já preenchido. A autorização continua sendo do
 * backend.
 */
export function useIsSystemAdmin(): boolean {
   const { role, activeOrg } = useAuth();
   return activeOrg === null && role?.toLowerCase() === "admin";
}
