import { useAuth } from "@/app/context/auth";
import type { ReactNode } from "react";

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

/**
 * Só renderiza os filhos para o admin de sistema.
 *
 * Equivale ao `require_system_admin` que o grupo `/admin/*` do backend
 * declara uma vez (`routers/admin/__init__.py`). Não confundir com
 * `PermBased`: aquele libera para qualquer `role === "admin"`, inclusive o
 * admin de uma unidade — que o backend recusaria.
 */
export const SystemAdminOnly = ({ children }: { children: ReactNode }) => {
   return useIsSystemAdmin() ? children : null;
};
