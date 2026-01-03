"use client";

/**
 * Modal de detalhes do usuário com tabs
 * Centraliza edição de dados, auditoria e reset de senha
 */

import {
   Modal,
   ModalHeader,
   ModalBody,
   Badge,
   Tabs,
   TabItem,
} from "flowbite-react";
import { UserAudit } from "../UserAudit";
import { UserPublic, UserFull } from "services/routes/users";
import { ResetPassword } from "../resetPwd";
import { UserForm } from "./UserForm";
import {
   HiUser,
   HiClipboardList,
   HiKey,
   HiIdentification,
   HiCheckCircle,
   HiXCircle,
} from "react-icons/hi";

// ========================================
// Tipos
// ========================================

interface UserDetailsModalProps {
   show: boolean;
   setShow: (v: boolean) => void;
   updateUsers: () => void;
   user: UserPublic | UserFull | null;
}

// ========================================
// Componente Principal
// ========================================

export function UserDetailsModal({
   show,
   setShow,
   updateUsers,
   user,
}: UserDetailsModalProps) {
   // Type guards e helpers
   const userId = "id" in user ? (user as UserPublic).id : undefined;

   function onClose() {
      setShow(false);
   }

   return (
      <Modal show={show} size="4xl" onClose={onClose} dismissible>
         {/* Header customizado com gradiente */}
         <ModalHeader className="rounded-t-lg bg-linear-to-r from-red-500 to-red-700 p-4 text-white">
            <div className="flex items-center gap-3 text-red-100">
               {/* Avatar compacto */}
               <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full border-3 border-white/30 bg-white/20 shadow-lg backdrop-blur-sm">
                  <span className="text-xl font-bold text-red-100">
                     {user?.p_g?.toUpperCase() || "??"}
                  </span>
               </div>

               {/* Informações principais */}
               <div className="min-w-0 flex-1">
                  <div className="mb-1 flex items-center gap-2">
                     <h2 className="truncate text-xl font-bold uppercase">
                        {user?.nome_guerra}
                     </h2>
                     {userId && (
                        <Badge color="success" className="shrink-0 text-xs">
                           #{userId}
                        </Badge>
                     )}
                  </div>

                  <p className="mb-2 truncate text-sm capitalize">
                     {user?.nome_completo}
                  </p>

                  {/* Badges de informações rápidas */}
                  <div className="flex flex-wrap gap-1.5">
                     <div className="flex items-center gap-1 rounded bg-white/20 px-2 py-1 text-xs">
                        <HiIdentification className="h-3.5 w-3.5" />
                        <span className="font-medium uppercase">
                           {user?.unidade}
                        </span>
                     </div>
                     {user?.active !== undefined && (
                        <div
                           className={`flex items-center gap-1 rounded px-2 py-1 text-xs font-medium ${
                              user.active
                                 ? "bg-green-500/90 text-white"
                                 : "bg-gray-500/90 text-white"
                           }`}
                        >
                           {user.active ? (
                              <>
                                 <HiCheckCircle className="h-3.5 w-3.5" />
                                 <span>Ativo</span>
                              </>
                           ) : (
                              <>
                                 <HiXCircle className="h-3.5 w-3.5" />
                                 <span>Inativo</span>
                              </>
                           )}
                        </div>
                     )}
                  </div>
               </div>
            </div>
         </ModalHeader>

         <ModalBody className="p-0">
            <Tabs aria-label="Abas do usuário" variant="underline">
               <TabItem active title="Dados Cadastrais" icon={HiUser}>
                  <div className="h-112.5 overflow-y-auto p-6">
                     {userId && (
                        <UserForm userId={userId} updateUsers={updateUsers} />
                     )}
                  </div>
               </TabItem>
               <TabItem title="Histórico de Alterações" icon={HiClipboardList}>
                  <div className="h-112.5 overflow-y-auto p-6">
                     <UserAudit userId={userId} />
                  </div>
               </TabItem>
               <TabItem title="Redefinir Senha" icon={HiKey}>
                  <div className="h-112.5 overflow-y-auto p-6">
                     {userId && <ResetPassword userId={userId} />}
                  </div>
               </TabItem>
            </Tabs>
         </ModalBody>
      </Modal>
   );
}
