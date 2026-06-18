"use client";

import { Select } from "flowbite-react";
import { FaBuilding, FaUserPen } from "react-icons/fa6";
import { type Role } from "services/routes/security/roles";
import { RoleModalShell } from "./RoleModalShell";
import type { EditingRole } from "../helpers/types";
import { useEditRoleForm } from "../hooks/useEditRoleForm";

export default function UserEditRole({
   show,
   setShow,
   roles,
   editing,
}: {
   show: boolean;
   setShow: (s: boolean) => void;
   roles: Role[];
   editing: EditingRole | null;
}) {
   const form = useEditRoleForm({
      roles,
      editing,
      show,
      onSuccess: onClose,
   });

   function onClose() {
      form.reset();
      setShow(false);
   }

   const { selectedRole, validationError, isSystemScope, isSaving } = form;

   return (
      <RoleModalShell
         show={show}
         onClose={onClose}
         icon={FaUserPen}
         title="Editar Perfil"
         subtitle={editing?.userLabel.toUpperCase()}
         error={validationError}
         isSaving={isSaving}
         confirmLabel="Salvar"
         confirmIcon={FaUserPen}
         confirmDisabled={!selectedRole}
         onConfirm={form.handleSubmit}
      >
         {/* Organização (somente leitura) */}
         <div>
            <label className="mb-2 block text-sm font-semibold text-gray-700">
               Organização
            </label>
            <div className="flex items-center gap-2 rounded border border-slate-200 bg-gray-50 p-3 text-sm font-medium text-gray-700 uppercase">
               <FaBuilding className="text-red-600" />
               {editing?.orgLabel}
            </div>
            <p className="mt-1 text-sm text-gray-500">
               Para mover de unidade, remova este perfil e adicione na outra
               unidade.
            </p>
         </div>

         {/* Seleção de Perfil */}
         <div>
            <label className="mb-2 block text-sm font-semibold text-gray-700">
               Perfil de Acesso *
            </label>
            <Select
               value={selectedRole ?? ""}
               onChange={(e) => form.pickRole(Number(e.target.value) || null)}
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
      </RoleModalShell>
   );
}
