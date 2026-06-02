"use client";

import { useEffect, useState } from "react";
import {
   Modal,
   ModalHeader,
   ModalBody,
   ModalFooter,
   Button,
   Select,
   Alert,
} from "flowbite-react";
import { FaUserPen, FaBuilding } from "react-icons/fa6";
import { FaExclamationTriangle } from "react-icons/fa";
import { updateUserRole, Role } from "services/routes/security/roles";
import { useToast } from "@/app/context/toast";

export interface EditingRole {
   userId: number;
   userLabel: string;
   organizacaoId: string | null;
   orgLabel: string;
   currentRoleId: number;
}

export default function UserEditRole({
   show,
   setShow,
   update,
   roles,
   editing,
}: {
   show: boolean;
   setShow: (s: boolean) => void;
   update?: () => void;
   roles: Role[];
   editing: EditingRole | null;
}) {
   const { push } = useToast();

   const [selectedRole, setSelectedRole] = useState<number | null>(null);
   const [isSaving, setIsSaving] = useState(false);
   const [validationError, setValidationError] = useState<string>("");

   // Vínculo de sistema (org NULL): só pode ser 'admin'
   const isSystemScope = editing?.organizacaoId === null;

   useEffect(() => {
      if (show && editing) {
         setSelectedRole(editing.currentRoleId);
         setValidationError("");
      }
   }, [show, editing]);

   function onClose() {
      setSelectedRole(null);
      setValidationError("");
      setShow(false);
   }

   async function handleSave() {
      if (!editing || !selectedRole) {
         setValidationError("Selecione um perfil");
         return;
      }

      const role = roles.find((r) => r.id === selectedRole);
      if (isSystemScope && role?.name !== "admin") {
         setValidationError(
            "Vínculo de sistema só aceita o perfil de administrador"
         );
         return;
      }

      if (selectedRole === editing.currentRoleId) {
         onClose();
         return;
      }

      setIsSaving(true);
      try {
         const result = await updateUserRole(
            selectedRole,
            editing.userId,
            editing.organizacaoId
         );
         if (result.ok) {
            push({ type: "success", message: result.message });
            update?.();
            onClose();
         } else {
            push({ type: "error", message: result.message });
            setValidationError(result.message || "Erro ao atualizar perfil");
         }
      } catch (err) {
         console.error("updateUserRole failed", err);
         const errorMsg = "Erro ao atualizar perfil. Tente novamente.";
         push({ type: "error", message: errorMsg });
         setValidationError(errorMsg);
      } finally {
         setIsSaving(false);
      }
   }

   return (
      <Modal show={show} size="lg" onClose={onClose} dismissible>
         <ModalHeader className="border-b">
            <div className="flex items-center gap-3">
               <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100">
                  <FaUserPen className="text-red-600" />
               </div>
               <div>
                  <h3 className="text-xl font-semibold">Editar Perfil</h3>
                  <p className="mt-1 text-sm font-normal text-gray-500">
                     {editing?.userLabel.toUpperCase()}
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

               {/* Organização (somente leitura) */}
               <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700">
                     Organização
                  </label>
                  <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 p-3 text-sm font-medium text-gray-700 uppercase">
                     <FaBuilding className="text-red-600" />
                     {editing?.orgLabel}
                  </div>
                  <p className="mt-1 text-sm text-gray-500">
                     Para mover de unidade, remova este perfil e adicione na
                     outra unidade.
                  </p>
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
                  >
                     <option value="">Selecione um perfil</option>
                     {roles.map((r) => (
                        <option
                           key={r.id}
                           value={r.id}
                           disabled={isSystemScope && r.name !== "admin"}
                        >
                           {r.name.toUpperCase()} - {r.description}
                        </option>
                     ))}
                  </Select>
                  {isSystemScope && (
                     <p className="mt-1 text-sm text-gray-500">
                        Vínculo de sistema: apenas o perfil de administrador é
                        permitido.
                     </p>
                  )}
               </div>
            </div>
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
                  onClick={handleSave}
                  disabled={isSaving || !selectedRole}
                  className="flex-1 sm:flex-none"
               >
                  {isSaving ? (
                     <>
                        <div className="mr-2 h-4 w-4 animate-spin rounded-full border-b-2 border-white"></div>
                        Salvando...
                     </>
                  ) : (
                     <>
                        <FaUserPen className="mr-2" />
                        Salvar
                     </>
                  )}
               </Button>
            </div>
         </ModalFooter>
      </Modal>
   );
}
