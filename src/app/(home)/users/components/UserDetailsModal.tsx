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
      <Modal show={show} size='4xl' onClose={onClose}>
         <div className='relative flex flex-col max-h-[90vh]'>
            {/* Header customizado com gradiente - compacto */}
            <div className='bg-gradient-to-r from-red-500 to-red-700 text-white p-4 rounded-t-lg flex-shrink-0'>
               <button
                  onClick={onClose}
                  className='absolute top-3 right-3 p-1.5 hover:bg-white/20 rounded-lg transition-colors z-10'
                  aria-label='Fechar'
               >
                  <HiX className='w-5 h-5' />
               </button>

               <div className='flex items-center gap-3'>
                  {/* Avatar compacto */}
                  <div className='w-14 h-14 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center border-3 border-white/30 shadow-lg flex-shrink-0'>
                     <span className='text-xl font-bold'>
                        {user?.p_g?.toUpperCase() || "??"}
                     </span>
                  </div>

                  {/* Informações principais */}
                  <div className='flex-1 min-w-0'>
                     <div className='flex items-center gap-2 mb-1'>
                        <h2 className='text-xl font-bold uppercase truncate'>
                           {user?.nome_guerra}
                        </h2>
                        {userId && (
                           <Badge
                              color='success'
                              className='text-xs flex-shrink-0'
                           >
                              #{userId}
                           </Badge>
                        )}
                     </div>

                     <p className='text-red-100 text-sm capitalize mb-2 truncate'>
                        {user?.nome_completo}
                     </p>

                     {/* Badges de informações rápidas - mais compactas */}
                     <div className='flex flex-wrap gap-1.5'>
                        <div className='flex items-center gap-1 bg-white/20 backdrop-blur-sm px-2 py-1 rounded text-xs'>
                           <HiIdentification className='w-3.5 h-3.5' />
                           <span className='font-medium uppercase'>
                              {user?.unidade}
                           </span>
                        </div>
                        {user?.active !== undefined && (
                           <div
                              className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${
                                 user.active
                                    ? "bg-green-500/90 text-white"
                                    : "bg-gray-500/90 text-white"
                              }`}
                           >
                              {user.active ? (
                                 <>
                                    <HiCheckCircle className='w-3.5 h-3.5' />
                                    <span>Ativo</span>
                                 </>
                              ) : (
                                 <>
                                    <HiXCircle className='w-3.5 h-3.5' />
                                    <span>Inativo</span>
                                 </>
                              )}
                           </div>
                        )}
                     </div>
                  </div>
               </div>
            </div>

            <ModalBody className='flex-1 overflow-hidden flex flex-col p-0'>
               {/* Tabs personalizadas */}
               <div className='border-b border-gray-200 px-6 pt-4 flex-shrink-0'>
                  <nav className='flex -mb-px gap-1' aria-label='Tabs'>
                     {tabs.map((tab) => {
                        const Icon = tab.icon;
                        const isActive = activeTab === tab.id;
                        return (
                           <button
                              key={tab.id}
                              onClick={() => setActiveTab(tab.id)}
                              className={`
                                 flex items-center gap-2 px-3 py-2.5 border-b-2 font-medium text-sm transition-all duration-200
                                 ${
                                    isActive
                                       ? "border-red-600 text-red-600 bg-red-50"
                                       : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 hover:bg-gray-50"
                                 }
                                 rounded-t-lg
                              `}
                           >
                              <Icon
                                 className={`w-4 h-4 ${
                                    isActive ? "text-red-600" : "text-gray-400"
                                 }`}
                              />
                              <span>{tab.label}</span>
                           </button>
                        );
                     })}
                  </nav>
               </div>

               <div className='flex-1 overflow-y-auto px-6 py-4'>
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
