"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Spinner } from "flowbite-react";
import { useUser } from "@/hooks/queries";
import { UserReadView } from "./components/UserReadView";
import { UserAudit } from "./components/UserAudit";
import { ResetPassword } from "./components/ResetPassword";
import clsx from "clsx";
import {
   HiUser,
   HiClipboardList,
   HiKey,
   HiIdentification,
   HiCheckCircle,
   HiXCircle,
} from "react-icons/hi";

const TABS = [
   { key: "dados", label: "Dados Cadastrais", icon: HiUser },
   { key: "historico", label: "Histórico", icon: HiClipboardList },
   { key: "senha", label: "Redefinir Senha", icon: HiKey },
] as const;

type TabKey = (typeof TABS)[number]["key"];

export default function UserDetailsPage() {
   const params = useParams<{ id: string }>();
   const router = useRouter();
   const userId = Number(params.id);
   const [activeTab, setActiveTab] = useState<TabKey>("dados");

   const { data: user, isLoading } = useUser(userId);

   if (isLoading) {
      return (
         <div className="flex h-96 items-center justify-center">
            <Spinner size="xl" color="failure" />
         </div>
      );
   }

   if (!user) {
      return (
         <div className="flex h-96 flex-col items-center justify-center gap-4">
            <p className="text-lg text-gray-500">Usuário não encontrado.</p>
            <button
               onClick={() => router.push("/users")}
               className="text-sm font-medium text-red-600 hover:underline"
            >
               Voltar para lista de usuários
            </button>
         </div>
      );
   }

   return (
      <div className="h-full w-full space-y-4 overflow-auto p-1">
         {/* Perfil do Usuário */}
         <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
            <div className="bg-linear-to-r from-red-500 to-red-700 px-6 py-4">
               <div className="flex items-center gap-4">
                  {/* Avatar */}
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full border-2 border-white/30 bg-white/20 backdrop-blur-sm">
                     <span className="text-xl font-bold text-white">
                        {user.p_g?.toUpperCase() || "??"}
                     </span>
                  </div>

                  {/* Nome e identificação */}
                  <div className="min-w-0 flex-1">
                     <div className="flex items-center gap-2">
                        <h1 className="truncate text-xl font-bold text-white uppercase">
                           {user.nome_guerra}
                        </h1>
                        <span className="shrink-0 rounded bg-white/20 px-2 py-0.5 text-xs font-medium text-white">
                           #{userId}
                        </span>
                     </div>
                     <p className="truncate text-sm text-red-100 capitalize">
                        {user.nome_completo}
                     </p>
                  </div>

                  {/* Info rápida (lado direito) */}
                  <div className="hidden items-center gap-3 sm:flex">
                     {user.active !== undefined && (
                        <div
                           className={clsx(
                              "flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium backdrop-blur-sm",
                              user.active
                                 ? "bg-green-500/80 text-white"
                                 : "bg-gray-500/80 text-white"
                           )}
                        >
                           {user.active ? (
                              <>
                                 <HiCheckCircle className="h-4 w-4" />
                                 Ativo
                              </>
                           ) : (
                              <>
                                 <HiXCircle className="h-4 w-4" />
                                 Inativo
                              </>
                           )}
                        </div>
                     )}
                  </div>
               </div>
            </div>

            {/* Tabs */}
            <div className="border-b border-gray-200">
               <nav className="flex gap-0 px-6" aria-label="Abas do usuário">
                  {TABS.map((tab) => (
                     <button
                        key={tab.key}
                        onClick={() => setActiveTab(tab.key)}
                        className={clsx(
                           "flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-medium transition-colors",
                           activeTab === tab.key
                              ? "border-red-500 text-red-600"
                              : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
                        )}
                     >
                        <tab.icon className="h-4 w-4" />
                        {tab.label}
                     </button>
                  ))}
               </nav>
            </div>

            {/* Conteúdo da Tab */}
            <div className="p-6">
               {activeTab === "dados" && (
                  <UserReadView user={user} userId={userId} />
               )}
               {activeTab === "historico" && <UserAudit userId={userId} />}
               {activeTab === "senha" && <ResetPassword userId={userId} />}
            </div>
         </div>
      </div>
   );
}
