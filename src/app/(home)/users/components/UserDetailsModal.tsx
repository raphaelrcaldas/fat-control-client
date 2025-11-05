import { useState } from "react";
import { Modal, ModalBody, ModalHeader, TabItem, Tabs } from "flowbite-react";
import { UserRegister } from "./userForm";
import { UserAudit } from "./UserAudit";
import { UserPublic } from "services/routes/users";
import { ResetPassword } from "./resetPwd";

interface UserDetailsModalProps {
   show: boolean;
   setShow: (v: boolean) => void;
   updateUsers: () => void;
   user: UserPublic | null;
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
   return (
      <Modal show={show} size='4xl' onClose={onClose} popup>
         <ModalHeader>
            <div className='flex flex-col uppercase'>
               <span className='font-bold text-lg'>
                  {user.posto.mid} {user?.nome_guerra}
               </span>
               <span className='text-sm text-gray-500'>
                  {user?.nome_completo}
               </span>
            </div>
         </ModalHeader>
         <ModalBody>
            <div className='py-2 h-96'>
               <Tabs
                  aria-label='Tabs de usuário'
                  variant='default'
                  onActiveTabChange={setActiveTab}
               >
                  <TabItem title='Cadastro' active={activeTab === 0}>
                     <UserRegister userId={user.id} updateUsers={updateUsers} />
                  </TabItem>
                  <TabItem title='Auditoria' active={activeTab === 1}>
                     {activeTab === 1 && (
                        <UserAudit userId={user.id ?? undefined} />
                     )}
                  </TabItem>
                  {/* <TabItem title='Alterar Senha' active={activeTab === 2}>
                     {activeTab === 2 && user.id && <ChangePassword />}
                  </TabItem> */}
                  <TabItem title='Senha' active={activeTab === 3}>
                     <ResetPassword userId={user.id} />
                  </TabItem>
               </Tabs>
            </div>
         </ModalBody>
      </Modal>
   );
}
