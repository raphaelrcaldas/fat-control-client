import { useState } from "react";
import { Modal, ModalBody, Badge } from "flowbite-react";
import { UserRegister } from "./userForm";
import { UserAudit } from "./UserAudit";
import { UserPublic, UserFull } from "services/routes/users";
import { ResetPassword } from "./resetPwd";
import {
   HiUser,
   HiClipboardList,
   HiKey,
   HiX,
   HiIdentification,
   HiCheckCircle,
   HiXCircle,
} from "react-icons/hi";

interface UserDetailsModalProps {
   show: boolean;
   setShow: (v: boolean) => void;
   updateUsers: () => void;
   user: UserPublic | UserFull | null;
}

export function UserDetailsModal({
   show,
   setShow,
   updateUsers,
   user,
}: UserDetailsModalProps) {
   function onClose() {
      setShow(false);
   }

   const [activeTab, setActiveTab] = useState(0);

   const tabs = [
      { id: 0, label: "Dados Cadastrais", icon: HiUser },
      { id: 1, label: "Histórico de Alterações", icon: HiClipboardList },
      { id: 2, label: "Redefinir Senha", icon: HiKey },
   ];

   // Type guards e helpers
   const userId = "id" in user ? (user as UserPublic).id : undefined;

   return (
      <Modal show={show} size="4xl" onClose={onClose} dismissible>
         <div className="relative flex max-h-[90vh] flex-col">
            {/* Header customizado com lineare - compacto */}
            <div className="shrink-0 rounded-t-lg bg-linear-to-r from-red-500 to-red-700 p-4 text-white">
               <button
                  onClick={onClose}
                  className="absolute top-3 right-3 z-10 rounded-lg p-1.5 transition-colors hover:bg-white/20"
                  aria-label="Fechar"
               >
                  <HiX className="h-5 w-5" />
               </button>

               <div className="flex items-center gap-3">
                  {/* Avatar compacto */}
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full border-3 border-white/30 bg-white/20 shadow-lg backdrop-blur-sm">
                     <span className="text-xl font-bold">
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

                     <p className="mb-2 truncate text-sm text-red-100 capitalize">
                        {user?.nome_completo}
                     </p>

                     {/* Badges de informações rápidas - mais compactas */}
                     <div className="flex flex-wrap gap-1.5">
                        <div className="flex items-center gap-1 rounded bg-white/20 px-2 py-1 text-xs backdrop-blur-sm">
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
            </div>

            <ModalBody className="flex flex-1 flex-col overflow-hidden p-0">
               {/* Tabs personalizadas */}
               <div className="shrink-0 border-b border-gray-200 px-6 pt-4">
                  <nav className="-mb-px flex gap-1" aria-label="Tabs">
                     {tabs.map((tab) => {
                        const Icon = tab.icon;
                        const isActive = activeTab === tab.id;
                        return (
                           <button
                              key={tab.id}
                              onClick={() => setActiveTab(tab.id)}
                              className={`flex items-center gap-2 border-b-2 px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
                                 isActive
                                    ? "border-red-600 bg-red-50 text-red-600"
                                    : "border-transparent text-gray-500 hover:border-gray-300 hover:bg-gray-50 hover:text-gray-700"
                              } rounded-t-lg`}
                           >
                              <Icon
                                 className={`h-4 w-4 ${
                                    isActive ? "text-red-600" : "text-gray-400"
                                 }`}
                              />
                              <span>{tab.label}</span>
                           </button>
                        );
                     })}
                  </nav>
               </div>

               <div className="flex-1 overflow-y-auto px-6 py-4">
                  {/* Mantém todos renderizados mas esconde com display */}
                  <div className={`${activeTab === 0 ? "block" : "hidden"}`}>
                     {userId && (
                        <UserRegister
                           userId={userId}
                           updateUsers={updateUsers}
                        />
                     )}
                  </div>

                  <div className={`${activeTab === 1 ? "block" : "hidden"}`}>
                     <UserAudit userId={userId} />
                  </div>

                  <div className={`${activeTab === 2 ? "block" : "hidden"}`}>
                     {userId && <ResetPassword userId={userId} />}
                  </div>
               </div>
            </ModalBody>
         </div>
      </Modal>
   );
}
