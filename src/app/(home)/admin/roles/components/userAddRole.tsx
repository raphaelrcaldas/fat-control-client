"use client";

import { useEffect, useState } from "react";
import {
   Modal,
   ModalHeader,
   ModalBody,
   ModalFooter,
   Button,
   Select,
} from "flowbite-react";
import { SearchUser } from "src/app/(home)/users/components/searchUser";
import { addUserRole, Role } from "services/routes/security/roles";
import { UserPublic } from "services/routes/users";
import { useToast } from "@/app/context/toast";

export default function UserAddRole({
   show,
   setShow,
   update,
   usersIgnr,
   roles,
}: {
   show: boolean;
   setShow: (s: boolean) => void;
   update?: () => void;
   usersIgnr: number[];
   roles: Role[];
}) {
   const { push } = useToast();

   const [showSearch, setShowSearch] = useState(false);
   const [selectedUser, setSelectedUser] = useState<UserPublic | null>(null);
   const [selectedRole, setSelectedRole] = useState<number | null>(null);
   const [isSaving, setIsSaving] = useState(false);

   function onClose() {
      setSelectedUser(null);
      setSelectedRole(null);
      setShow(false);
   }

   async function handleAdd() {
      if (!selectedUser || !selectedRole) {
         push({ type: "error", message: "Selecione o usuário e o perfil." });
         return;
      }

      setIsSaving(true);
      try {
         const res = await addUserRole(selectedRole, selectedUser.id);
         const data = await res.json();
         if (res.ok) {
            push({ type: "success", message: data.detail });
            onClose();
         } else {
            push({ type: "error", message: data.detail });
         }
         update();
      } catch (err) {
         push({ type: "error", message: "Erro ao adicionar perfil." });
      } finally {
         setIsSaving(false);
      }
   }

   return (
      <>
         <Modal show={show} size='md' onClose={onClose}>
            <ModalHeader>Adicionar Perfil ao Usuário</ModalHeader>
            <ModalBody>
               <div className='flex flex-col gap-3'>
                  <div>
                     <label className='block text-sm font-medium text-gray-700'>
                        Usuário
                     </label>
                     <div className='flex gap-2 mt-1 items-center'>
                        <span className='p-2 w-full uppercase'>
                           {selectedUser
                              ? `${selectedUser.posto.short} ${selectedUser.nome_guerra}`
                              : ""}
                        </span>
                        <Button
                           color='light'
                           onClick={() => setShowSearch(true)}
                        >
                           Buscar
                        </Button>
                     </div>
                  </div>

                  <div>
                     <label className='block text-sm font-medium text-gray-700'>
                        Perfil
                     </label>
                     <Select
                        value={selectedRole ?? ""}
                        onChange={(e) =>
                           setSelectedRole(Number(e.target.value))
                        }
                     >
                        <option value=''>Selecione</option>
                        {roles.map((r) => (
                           <option key={r.id} value={r.id}>
                              {r.name.toUpperCase()}
                           </option>
                        ))}
                     </Select>
                  </div>
               </div>

               <SearchUser
                  show={showSearch}
                  setShow={setShowSearch}
                  setUser={(u: UserPublic) => setSelectedUser(u)}
                  userIdsIgnr={usersIgnr}
               />
            </ModalBody>
            <ModalFooter>
               <div className='flex gap-2'>
                  <Button color='light' onClick={onClose} disabled={isSaving}>
                     Fechar
                  </Button>
                  <Button color='blue' onClick={handleAdd} disabled={isSaving}>
                     {isSaving ? "Salvando..." : "Adicionar"}
                  </Button>
               </div>
            </ModalFooter>
         </Modal>
      </>
   );
}
