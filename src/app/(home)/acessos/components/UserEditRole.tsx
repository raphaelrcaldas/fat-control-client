"use client";

import { Label, Select } from "flowbite-react";
import { FaBuilding, FaUserPen } from "react-icons/fa6";
import { type RoleDetail } from "services/routes/security/roles";
import { RoleModalShell } from "./RoleModalShell";
import { RolePermissionsSummary } from "./RolePermissionsSummary";
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
   roles: RoleDetail[];
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
   const pickedRole = roles.find((r) => r.id === selectedRole);

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
         <div className="space-y-2">
            <dl className="space-y-2">
               <dt className="text-sm font-semibold text-slate-700">
                  Organização
               </dt>
               <dd className="flex items-center gap-2 rounded border border-slate-200 bg-slate-50 p-3 text-sm font-medium text-slate-700 uppercase">
                  <FaBuilding className="text-primary-600" />
                  {editing?.orgLabel}
               </dd>
            </dl>
            <p className="text-sm text-slate-500">
               Para mover de unidade, remova este perfil e adicione na outra
               unidade.
            </p>
         </div>

         {/* Seleção de Perfil */}
         <div className="space-y-2">
            <Label
               htmlFor="edit-role-perfil"
               className="block text-sm font-semibold text-slate-700"
            >
               Perfil de Acesso *
            </Label>
            <Select
               id="edit-role-perfil"
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
               <p className="text-sm text-slate-500">
                  Vínculo de sistema: apenas o perfil de administrador é
                  permitido.
               </p>
            )}
            {pickedRole && (
               <RolePermissionsSummary key={pickedRole.id} role={pickedRole} />
            )}
         </div>
      </RoleModalShell>
   );
}
