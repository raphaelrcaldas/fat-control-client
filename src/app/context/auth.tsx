"use client";
import React, { createContext, useContext, useEffect, useState } from "react";
import { deleteCookie, setCookie } from "cookies-next";
import { getMe, type OrgScope } from "services/routes/users";
import { AppLoadingScreen } from "src/app/(home)/components/appLoadingScreen";
import { normalizeOrgTheme, ORG_THEME_COOKIE } from "@/lib/orgTheme";
import PermDenied from "../components/permDenied";

interface PermType {
   name: string;
   resource: string;
}

interface AuthContextType {
   userPg: string | null;
   user: string | null;
   userId: number | null;
   role: string | null;
   perms: PermType[];
   activeOrg: string | null;
   orgs: OrgScope[];
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
   children: React.ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
   const [user, setUser] = useState<string | null>(null);
   const [userPg, setUserPg] = useState<string | null>(null);
   const [userId, setUserId] = useState<number | null>(null);
   const [role, setRole] = useState<string | null>(null);
   const [perms, setPerms] = useState<PermType[]>([]);
   const [activeOrg, setActiveOrg] = useState<string | null>(null);
   const [orgs, setOrgs] = useState<OrgScope[]>([]);
   const [loading, setLoading] = useState(true);
   const [fetchFailed, setFetchFailed] = useState(false);
   const [retryNonce, setRetryNonce] = useState(0);

   useEffect(() => {
      let cancelled = false;

      const fetchUser = async () => {
         const maxAttempts = 4;
         for (let attempt = 0; attempt < maxAttempts; attempt++) {
            try {
               const data = await getMe();
               if (cancelled) return;
               if (!data) throw new Error("Resposta vazia de /users/me");

               setUser(data.nome_guerra);
               setUserPg(data.posto);
               setUserId(data.id);
               setRole(data.role);
               setPerms(data.permissions || []);
               setActiveOrg(data.active_org ?? null);
               setOrgs(data.orgs || []);
               setFetchFailed(false);
               setLoading(false);
               return;
            } catch (error) {
               if (cancelled) return;
               if (attempt === maxAttempts - 1) {
                  console.error("Falha na autenticação do cliente:", error);
                  setFetchFailed(true);
                  setLoading(false);
                  return;
               }
               const delay = Math.min(1000 * 2 ** attempt, 8000);
               await new Promise((r) => setTimeout(r, delay));
            }
         }
      };

      setLoading(true);
      setFetchFailed(false);
      fetchUser();
      return () => {
         cancelled = true;
      };
   }, [retryNonce]);

   // Reconcilia o tema da org ativa com o que o SSR estampou no <html>.
   // No 1º login (sem cookie ainda) o SSR usa o default; aqui aplicamos o
   // tema real e persistimos o cookie para os próximos carregamentos. A troca
   // de org já grava o cookie antes do reload (ver OrgSwitcher), então este
   // efeito só corrige o boot inicial.
   useEffect(() => {
      if (loading) return;
      const tema = normalizeOrgTheme(
         orgs.find((o) => o.organizacao_id === activeOrg)?.tema
      );
      if (document.documentElement.getAttribute("data-org-theme") !== tema) {
         document.documentElement.setAttribute("data-org-theme", tema);
      }
      setCookie(ORG_THEME_COOKIE, tema, {
         maxAge: 24 * 60 * 60,
         path: "/",
      });
   }, [loading, activeOrg, orgs]);

   if (loading) {
      return <AppLoadingScreen />;
   }

   if (fetchFailed) {
      return (
         <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-gray-50 p-4">
            <div className="rounded-xl border border-red-200 bg-white p-8 text-center shadow-lg">
               <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
                  <svg
                     className="h-8 w-8 text-red-600"
                     fill="none"
                     stroke="currentColor"
                     viewBox="0 0 24 24"
                  >
                     <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
                     />
                  </svg>
               </div>
               <h2 className="mb-2 text-xl font-bold text-gray-800">
                  Erro ao carregar dados
               </h2>
               <p className="mb-6 text-sm text-gray-600">
                  Não foi possível carregar seus dados. Tente novamente ou faça
                  login novamente.
               </p>
               <div className="flex flex-col gap-3">
                  <button
                     onClick={() => setRetryNonce((n) => n + 1)}
                     className="rounded-lg bg-red-600 px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-red-700"
                  >
                     Tentar novamente
                  </button>
                  <button
                     onClick={() => {
                        deleteCookie("token", { path: "/" });
                        window.location.href = "/";
                     }}
                     className="rounded-lg border border-gray-300 bg-white px-6 py-2.5 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50"
                  >
                     Sair
                  </button>
               </div>
            </div>
         </div>
      );
   }

   if (!role) {
      return <PermDenied />;
   }

   return (
      <AuthContext.Provider
         value={{
            userPg: userPg,
            user: user,
            userId: userId,
            role: role,
            perms: perms,
            activeOrg: activeOrg,
            orgs: orgs,
         }}
      >
         {children}
      </AuthContext.Provider>
   );
};

export function useAuth() {
   const context = useContext(AuthContext);
   if (context === undefined) {
      throw new Error("useAuth deve ser usado dentro de um AuthProvider");
   }
   return context;
}
