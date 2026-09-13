"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button, Spinner } from "flowbite-react";
import { useUser, useUpdateUser, useDeleteUser } from "@/hooks/queries";
import { useToast } from "@/app/context/toast";
import { useAuth } from "@/app/context/auth";
import { useSearchParamsUpdater } from "@/hooks/useSearchParamsState";
import { PermBased } from "@/app/(home)/hooks/usePermBased";
import { formatUserSaveError } from "../userErrors";
import { UserReadView } from "./components/UserReadView";
import { UserAudit } from "./components/UserAudit";
import { UserPromotions } from "./components/UserPromotions";
import { ResetPassword } from "./components/ResetPassword";
import { DeleteUserModal } from "./components/DeleteUserModal";
import { UserDetailSkeleton } from "./components/UserDetailSkeleton";
import clsx from "clsx";
import {
   HiUser,
   HiClipboardList,
   HiTrendingUp,
   HiKey,
   HiCheckCircle,
   HiXCircle,
   HiArrowLeft,
} from "react-icons/hi";
import { MdDelete } from "react-icons/md";

const TABS = [
   { key: "dados", label: "Dados Cadastrais", icon: HiUser },
   { key: "promocoes", label: "Promoções", icon: HiTrendingUp },
   { key: "historico", label: "Histórico", icon: HiClipboardList },
   { key: "senha", label: "Redefinir Senha", icon: HiKey },
] as const;

type TabKey = (typeof TABS)[number]["key"];

export default function UserDetailsPage() {
   const params = useParams<{ id: string }>();
   const router = useRouter();
   const userId = Number(params.id);
   const [showDeleteModal, setShowDeleteModal] = useState(false);

   const deleteUser = useDeleteUser();
   // Depois de excluir, o registro nao existe mais: `null` desliga a query
   // (`enabled: !!id`) e poupa um GET condenado ao 404 na fracao de segundo
   // ate o redirecionamento.
   const { data: user, isLoading } = useUser(
      deleteUser.isSuccess ? null : userId
   );
   const updateUser = useUpdateUser();
   const { push } = useToast();
   const { role } = useAuth();
   // O backend exige `require_admin` da org ativa em reset-pwd; esconder a
   // aba evita o 403 SCOPE_FORBIDDEN que redireciona a página inteira para
   // /403 (services/Api.ts). Mesmo padrão de RoleBasedRoute/useRoleBased.
   const isAdmin = role === "admin";
   const tabs = TABS.filter((tab) => tab.key !== "senha" || isAdmin);

   // A aba vive na URL (`?tab=`), como em ops/om e cegep/missoes: link
   // compartilhável e voltar/avançar coerentes com o resto do app. "dados" é
   // o padrão e fica fora da URL; valor desconhecido — ou "senha" para quem
   // não é admin — cai em "dados" em vez de painel vazio.
   const { searchParams, setParams } = useSearchParamsUpdater();
   const tabParam = searchParams.get("tab");
   const activeTab: TabKey = tabs.some((tab) => tab.key === tabParam)
      ? (tabParam as TabKey)
      : "dados";
   const handleTabChange = (key: TabKey) =>
      setParams({ tab: key === "dados" ? undefined : key });

   async function handleDelete() {
      try {
         await deleteUser.mutateAsync(userId);
         push({ message: "Usuário excluído com sucesso", type: "success" });
         router.push("/users");
      } catch (err) {
         // A recusa do backend (vinculo com outra tabela) chega aqui como
         // `ApiError` com a mensagem dele. Antes ela caia no ramo generico e
         // virava "Erro de conexao", escondendo o motivo real da recusa.
         push({
            message:
               err instanceof Error ? err.message : "Erro ao excluir usuário",
            type: "error",
         });
         setShowDeleteModal(false);
      }
   }

   async function toggleActive() {
      if (!user) return;
      const newStatus = !user.active;
      try {
         await updateUser.mutateAsync({
            id: userId,
            data: { active: newStatus },
         });
         push({
            message: `Usuário ${newStatus ? "ativado" : "desativado"}`,
            type: "success",
         });
      } catch (err: unknown) {
         push({
            message: formatUserSaveError(err, "Erro ao alterar status"),
            type: "error",
         });
      }
   }

   if (isLoading) {
      return <UserDetailSkeleton />;
   }

   // `&& !deleteUser.isSuccess`: entre o toast de sucesso e o
   // `router.push("/users")` completar ha um render em que a query ja esta
   // desligada e `user` e undefined. Sem a guarda a tela anuncia "Usuario nao
   // encontrado" ao lado do toast que acabou de dizer que deu certo.
   if (!user && !deleteUser.isSuccess) {
      return (
         <div className="flex h-96 flex-col items-center justify-center gap-4">
            <p className="text-lg text-gray-500">Usuário não encontrado.</p>
            <Button color="light" onClick={() => router.push("/users")}>
               Voltar para lista de usuários
            </Button>
         </div>
      );
   }

   return (
      <div className="flex flex-col space-y-2">
         {/* Perfil do Usuário */}
         <div className="overflow-hidden rounded border border-slate-200 bg-white shadow-sm">
            <div className="from-primary-500 to-primary-700 bg-linear-to-r px-6 py-4">
               <div className="flex items-center gap-4">
                  {/* Voltar */}
                  <button
                     onClick={() => router.back()}
                     className="flex h-10 w-10 shrink-0 items-center justify-center rounded text-white/80 transition-colors hover:bg-white/20 hover:text-white"
                     title="Voltar"
                  >
                     <HiArrowLeft size={24} />
                  </button>

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
                     <p className="text-primary-100 truncate text-sm capitalize">
                        {user.nome_completo}
                     </p>
                  </div>

                  {/* Info rápida (lado direito) */}
                  <div className="hidden items-center gap-2 sm:flex">
                     {user.active !== undefined && (
                        <Button
                           color="light"
                           size="sm"
                           onClick={toggleActive}
                           disabled={updateUser.isPending}
                           title={
                              user.active
                                 ? "Clique para desativar"
                                 : "Clique para ativar"
                           }
                        >
                           {updateUser.isPending ? (
                              <Spinner size="sm" color="primary" />
                           ) : (
                              <>
                                 {user.active ? (
                                    <HiCheckCircle className="mr-1.5 h-4 w-4 text-green-600" />
                                 ) : (
                                    <HiXCircle className="mr-1.5 h-4 w-4 text-gray-500" />
                                 )}
                                 {user.active ? "Ativo" : "Inativo"}
                              </>
                           )}
                        </Button>
                     )}
                     <PermBased resource="users" requiredPerm="delete">
                        <Button
                           color="light"
                           size="sm"
                           onClick={() => setShowDeleteModal(true)}
                           title="Excluir usuário"
                        >
                           <MdDelete className="mr-1.5 h-4 w-4 text-red-600" />
                           Excluir
                        </Button>
                     </PermBased>
                  </div>
               </div>
            </div>

            {/* Tabs */}
            <div className="border-b border-slate-200">
               <nav
                  className="flex gap-0 overflow-x-auto px-6"
                  aria-label="Abas do usuário"
               >
                  {tabs.map((tab) => (
                     <button
                        key={tab.key}
                        onClick={() => handleTabChange(tab.key)}
                        className={clsx(
                           "flex shrink-0 items-center gap-2 border-b-2 px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors",
                           activeTab === tab.key
                              ? "border-primary-500 text-primary-600"
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
            <div className="p-3">
               {activeTab === "dados" && (
                  <UserReadView user={user} userId={userId} />
               )}
               {activeTab === "promocoes" && <UserPromotions userId={userId} />}
               {activeTab === "historico" && <UserAudit userId={userId} />}
               {activeTab === "senha" && isAdmin && (
                  <ResetPassword userId={userId} />
               )}
            </div>
         </div>

         <DeleteUserModal
            show={showDeleteModal}
            onClose={() => setShowDeleteModal(false)}
            onConfirm={handleDelete}
            isPending={deleteUser.isPending}
            userName={user.nome_guerra}
            userId={userId}
         />
      </div>
   );
}
