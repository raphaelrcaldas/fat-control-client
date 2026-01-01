"use client";

import { useEffect, useState } from "react";
import {
   Modal,
   ModalHeader,
   ModalBody,
   ModalFooter,
   Button,
   Select,
   Badge,
   Alert,
} from "flowbite-react";
import {
   FaUserPlus,
   FaSearch,
   FaTimes,
   FaCheckCircle,
   FaExclamationTriangle,
} from "react-icons/fa";
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
   const [validationError, setValidationError] = useState<string>("");

   function onClose() {
      setSelectedUser(null);
      setSelectedRole(null);
      setValidationError("");
      setShow(false);
   }

   function validateForm() {
      if (!selectedUser) {
         setValidationError("Selecione um usuário");
         return false;
      }
      if (!selectedRole) {
         setValidationError("Selecione um perfil");
         return false;
      }
      setValidationError("");
      return true;
   }

   async function handleAdd() {
      if (!validateForm()) return;

      setIsSaving(true);
      try {
         const res = await addUserRole(selectedRole!, selectedUser!.id);
         const data = await res.json();
         if (res.ok) {
            push({ type: "success", message: data.detail });
            update?.();
            onClose();
         } else {
            push({ type: "error", message: data.detail });
            setValidationError(data.detail);
         }
      } catch (err) {
         const errorMsg = "Erro ao adicionar perfil. Tente novamente.";
         push({ type: "error", message: errorMsg });
         setValidationError(errorMsg);
      } finally {
         setIsSaving(false);
      }
   }

   const isFormValid = selectedUser && selectedRole;

   return (
      <>
         <Modal show={show} size="lg" onClose={onClose} dismissible>
            <ModalHeader className="border-b">
               <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100">
                     <FaUserPlus className="text-red-600" />
                  </div>
                  <div>
                     <h3 className="text-xl font-semibold">
                        Adicionar Perfil ao Usuário
                     </h3>
                     <p className="mt-1 text-sm font-normal text-gray-500">
                        Selecione o usuário e o perfil de acesso
                     </p>
                  </div>
               </div>
            </ModalHeader>

            <ModalBody>
               <div className="flex flex-col gap-3">
                  {validationError && (
                     <Alert color="failure" icon={FaExclamationTriangle}>
                        <span className="font-medium">Erro:</span>{" "}
                        {validationError}
                     </Alert>
                  )}

                  {/* Seleção de Usuário */}
                  <div>
                     <label className="mb-2 block text-sm font-semibold text-gray-700">
                        Usuário *
                     </label>
                     <div className="flex items-center gap-2">
                        {selectedUser ? (
                           <div className="flex flex-1 items-center justify-between rounded-lg border border-blue-200 bg-blue-50 p-3">
                              <div className="flex items-center gap-3">
                                 <div className="flex h-10 w-10 items-center justify-center rounded-full bg-lienar-to-br from-blue-500 to-blue-600 font-bold text-white uppercase shadow">
                                    {selectedUser.posto.short}
                                 </div>
                                 <div>
                                    <p className="font-semibold text-gray-800 uppercase">
                                       {selectedUser.posto.short}{" "}
                                       {selectedUser.nome_guerra}
                                    </p>
                                    <p className="text-xs text-gray-500 uppercase">
                                       {selectedUser.unidade}
                                    </p>
                                 </div>
                              </div>
                              <Button
                                 size="xs"
                                 color="light"
                                 onClick={() => setSelectedUser(null)}
                              >
                                 <FaTimes />
                              </Button>
                           </div>
                        ) : (
                           <div className="flex-1 rounded-lg border border-dashed border-gray-200 bg-gray-50 p-3">
                              <p className="text-center text-sm text-gray-500">
                                 Nenhum usuário selecionado
                              </p>
                           </div>
                        )}
                        <Button color="red" onClick={() => setShowSearch(true)}>
                           <FaSearch className="mr-2" />
                           {selectedUser ? "Trocar" : "Buscar"}
                        </Button>
                     </div>
                  </div>

                  {/* Seleção de Perfil */}
                  <div>
                     <label className="mb-2 block text-sm font-semibold text-gray-700">
                        Perfil de Acesso *
                     </label>
                     <Select
                        value={selectedRole ?? ""}
                        onChange={(e) => {
                           setSelectedRole(Number(e.target.value) || null);
                           setValidationError("");
                        }}
                        color={selectedRole ? "gray" : "gray"}
                        className={selectedRole ? "border-blue-300" : ""}
                     >
                        <option value="">Selecione um perfil</option>
                        {roles.map((r) => (
                           <option key={r.id} value={r.id}>
                              {r.name.toUpperCase()} - {r.description}
                           </option>
                        ))}
                     </Select>
                     {selectedRole && (
                        <Alert color="warning" className="mt-2">
                           <div className="flex items-start gap-2">
                              <FaCheckCircle className="mt-0.5 shrink-0" />
                              <div>Perfil selecionado</div>
                           </div>
                        </Alert>
                     )}
                  </div>

                  {/* Preview da ação */}
                  {isFormValid && (
                     <Alert color="warning">
                        <div className="flex items-start gap-2">
                           <FaCheckCircle className="mt-0.5 shrink-0" />
                           <div className="text-sm">
                              <p className="mb-1 font-semibold">Confirmação:</p>
                              <p>
                                 O usuário{" "}
                                 <strong className="uppercase">
                                    {selectedUser!.posto.short}{" "}
                                    {selectedUser!.nome_guerra}
                                 </strong>{" "}
                                 receberá o perfil{" "}
                                 <strong className="uppercase">
                                    {
                                       roles.find((r) => r.id === selectedRole)
                                          ?.name
                                    }
                                 </strong>
                              </p>
                           </div>
                        </div>
                     </Alert>
                  )}
               </div>

               <SearchUser
                  show={showSearch}
                  setShow={setShowSearch}
                  setUser={(u: UserPublic) => {
                     setSelectedUser(u);
                     setValidationError("");
                  }}
                  userIdsIgnr={usersIgnr}
               />
            </ModalBody>

            <ModalFooter className="border-t">
               <div className="flex w-full gap-2 sm:ml-auto sm:w-auto">
                  <Button
                     color="light"
                     onClick={onClose}
                     disabled={isSaving}
                     className="flex-1 sm:flex-none"
                  >
                     Cancelar
                  </Button>
                  <Button
                     color="red"
                     onClick={handleAdd}
                     disabled={isSaving || !isFormValid}
                     className="flex-1 sm:flex-none"
                  >
                     {isSaving ? (
                        <>
                           <div className="mr-2 h-4 w-4 animate-spin rounded-full border-b-2 border-white"></div>
                           Salvando...
                        </>
                     ) : (
                        <>
                           <FaUserPlus className="mr-2" />
                           Adicionar
                        </>
                     )}
                  </Button>
               </div>
            </ModalFooter>
         </Modal>
      </>
   );
}
