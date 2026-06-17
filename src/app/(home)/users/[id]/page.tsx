"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button, Spinner } from "flowbite-react";
import { useUser, useUpdateUser, useDeleteUser } from "@/hooks/queries";
import { useToast } from "@/app/context/toast";
import { PermBased } from "@/app/(home)/hooks/usePermBased";
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
   const [activeTab, setActiveTab] = useState<TabKey>("dados");

   const [showDeleteModal, setShowDeleteModal] = useState(false);

   const { data: user, isLoading } = useUser(userId);
   const updateUser = useUpdateUser();
   const deleteUser = useDeleteUser();
   const { push } = useToast();

   async function handleDelete() {
      try {
         const result = await deleteUser.mutateAsync(userId);
         if (result.ok) {
            push({ message: "Usuário excluído com sucesso", type: "success" });
            router.push("/users");
         } else {
            push({
               message: result.message || "Erro ao excluir usuário",
               type: "error",
            });
            setShowDeleteModal(false);
         }
      } catch {
         push({ message: "Erro de conexão ao excluir usuário", type: "error" });
         setShowDeleteModal(false);
      }
   }

   async function toggleActive() {
      if (!user) return;
      const newStatus = !user.active;
      try {
         const result = await updateUser.mutateAsync({
            id: userId,
            data: { active: newStatus },
         });
         if (result.ok) {
            push({
               message: `Usuário ${newStatus ? "ativado" : "desativado"}`,
               type: "success",
            });
         } else {
            push({
               message: result.message || "Erro ao alterar status",
               type: "error",
            });
         }
      } catch {
         push({ message: "Erro ao alterar status", type: "error" });
      }
   }

   if (isLoading) {
      return <UserDetailSkeleton />;
   }

   if (!user) {
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
            <div className="bg-linear-to-r from-red-500 to-red-700 px-6 py-4">
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
                     <p className="truncate text-sm text-red-100 capitalize">
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
                              <Spinner size="sm" color="failure" />
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
                     <PermBased resource="user" requiredPerm="delete">
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
                  {TABS.map((tab) => (
                     <button
                        key={tab.key}
                        onClick={() => setActiveTab(tab.key)}
                        className={clsx(
                           "flex shrink-0 items-center gap-2 border-b-2 px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors",
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
            <div className="p-3">
               {activeTab === "dados" && (
                  <UserReadView user={user} userId={userId} />
               )}
               {activeTab === "promocoes" && <UserPromotions userId={userId} />}
               {activeTab === "historico" && <UserAudit userId={userId} />}
               {activeTab === "senha" && <ResetPassword userId={userId} />}
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
