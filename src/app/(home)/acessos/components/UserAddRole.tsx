"use client";

import { Alert, Button, Label, Select } from "flowbite-react";
import { FaSearch, FaTimes, FaUserPlus } from "react-icons/fa";
import { FaCircleInfo } from "react-icons/fa6";
import { SearchUser } from "src/app/(home)/users/components/searchUser";
import {
   type RoleDetail,
   type UserWithRole,
} from "services/routes/security/roles";
import { UserPublic } from "services/routes/users";
import type { Tenant } from "services/routes/tenants";
import { RoleModalShell } from "./RoleModalShell";
import { RolePermissionsSummary } from "./RolePermissionsSummary";
import { tenantLabel } from "../helpers/tenantLabel";
import { useAddRoleForm } from "../hooks/useAddRoleForm";

export default function UserAddRole({
   show,
   setShow,
   roles,
   tenants,
   existingRoles,
}: {
   show: boolean;
   setShow: (s: boolean) => void;
   roles: RoleDetail[];
   tenants: Tenant[];
   existingRoles: UserWithRole[];
}) {
   const form = useAddRoleForm({
      roles,
      tenants,
      show,
      onSuccess: onClose,
   });

   function onClose() {
      form.reset();
      setShow(false);
   }

   const {
      selectedUser,
      selectedRole,
      selectedOrg,
      selectedOrgLabel,
      showSearch,
      setShowSearch,
      validationError,
      isSystemScope,
      orgRequired,
      activeTenants,
      scopedTenant,
      isFormValid,
      isSaving,
   } = form;

   const pickedRole = roles.find((r) => r.id === selectedRole);

   // O vínculo é único por (usuário, org): só bloqueia na busca quem já
   // tem perfil na org de destino selecionada (não em qualquer org).
   const ignoredUserIds = existingRoles
      .filter((ur) => ur.organizacao_id === selectedOrg)
      .map((ur) => ur.user.id);

   return (
      <RoleModalShell
         show={show}
         onClose={onClose}
         icon={FaUserPlus}
         title="Adicionar Perfil ao Usuário"
         subtitle="Selecione o usuário e o perfil de acesso"
         error={validationError}
         isSaving={isSaving}
         confirmLabel="Adicionar"
         confirmIcon={FaUserPlus}
         confirmDisabled={!isFormValid}
         onConfirm={form.handleSubmit}
      >
         {/* Seleção de Usuário */}
         <div
            role="group"
            aria-labelledby="add-role-user-label"
            className="space-y-2"
         >
            <p
               id="add-role-user-label"
               className="text-sm font-semibold text-slate-700"
            >
               Usuário *
            </p>
            <div className="flex items-center gap-2">
               {selectedUser ? (
                  <div className="border-primary-200 bg-primary-50 flex flex-1 items-center justify-between rounded border p-3">
                     <div className="flex items-center gap-3">
                        <div className="bg-primary-600 flex h-10 w-10 items-center justify-center rounded-full font-bold text-white uppercase shadow">
                           {selectedUser.posto.short}
                        </div>
                        <div>
                           <p className="font-semibold text-slate-800 uppercase">
                              {selectedUser.nome_guerra}
                           </p>
                           <p className="text-xs text-slate-600 uppercase">
                              {selectedUser.unidade}
                           </p>
                        </div>
                     </div>
                     <Button
                        size="xs"
                        color="light"
                        onClick={form.clearUser}
                        aria-label="Remover usuário selecionado"
                     >
                        <FaTimes />
                     </Button>
                  </div>
               ) : (
                  <div className="flex-1 rounded border border-dashed border-slate-200 bg-slate-50 p-3">
                     <p className="text-center text-sm text-slate-500">
                        Nenhum usuário selecionado
                     </p>
                  </div>
               )}
               <Button color="primary" onClick={() => setShowSearch(true)}>
                  <FaSearch className="mr-2" />
                  {selectedUser ? "Trocar" : "Buscar"}
               </Button>
            </div>
         </div>

         {/* Seleção de Organização */}
         <div className="space-y-2">
            <Label
               htmlFor="add-role-org"
               className="block text-sm font-semibold text-slate-700"
            >
               Organização *
            </Label>
            <Select
               id="add-role-org"
               value={selectedOrg ?? ""}
               disabled={!isSystemScope}
               onChange={(e) =>
                  form.pickOrg(e.target.value === "" ? null : e.target.value)
               }
            >
               {isSystemScope ? (
                  <>
                     <option value="" disabled={orgRequired}>
                        Sistema (global)
                     </option>
                     {activeTenants.map((t) => (
                        <option key={t.organizacao_id} value={t.organizacao_id}>
                           {tenantLabel(t)}
                        </option>
                     ))}
                  </>
               ) : (
                  scopedTenant && (
                     <option value={scopedTenant.organizacao_id}>
                        {tenantLabel(scopedTenant)}
                     </option>
                  )
               )}
            </Select>
            {isSystemScope ? (
               orgRequired && (
                  <p className="text-sm text-slate-500">
                     Apenas o perfil de administrador pode ser do sistema.
                     Selecione uma unidade.
                  </p>
               )
            ) : (
               <p className="text-sm text-slate-500">
                  Você administra apenas a sua unidade. O vínculo será criado
                  nela.
               </p>
            )}
         </div>

         {/* Seleção de Perfil */}
         <div className="space-y-2">
            <Label
               htmlFor="add-role-perfil"
               className="block text-sm font-semibold text-slate-700"
            >
               Perfil de Acesso *
            </Label>
            <Select
               id="add-role-perfil"
               value={selectedRole ?? ""}
               onChange={(e) => form.pickRole(Number(e.target.value) || null)}
            >
               <option value="">Selecione um perfil</option>
               {roles.map((r) => (
                  <option key={r.id} value={r.id}>
                     {r.name.toUpperCase()} - {r.description}
                  </option>
               ))}
            </Select>
            {pickedRole && (
               <RolePermissionsSummary key={pickedRole.id} role={pickedRole} />
            )}
         </div>

         {/* Preview da ação */}
         {isFormValid && (
            <Alert color="gray" icon={FaCircleInfo} role="status">
               <p className="text-sm">
                  <strong className="uppercase">
                     {selectedUser!.posto.short} {selectedUser!.nome_guerra}
                  </strong>{" "}
                  receberá o perfil{" "}
                  <strong className="uppercase">{pickedRole?.name}</strong>{" "}
                  {selectedOrg === null ? "no escopo de" : "em"}{" "}
                  <strong>{selectedOrgLabel}</strong>
               </p>
            </Alert>
         )}

         <SearchUser
            show={showSearch}
            setShow={setShowSearch}
            setUser={(u: UserPublic) => form.pickUser(u)}
            userIdsIgnr={ignoredUserIds}
         />
      </RoleModalShell>
   );
}
