"use client";

import { Alert, Button, Select } from "flowbite-react";
import { FaCheckCircle, FaSearch, FaTimes, FaUserPlus } from "react-icons/fa";
import { SearchUser } from "src/app/(home)/users/components/searchUser";
import { type Role } from "services/routes/security/roles";
import { UserPublic } from "services/routes/users";
import type { Tenant } from "services/routes/tenants";
import { RoleModalShell } from "./RoleModalShell";
import { tenantLabel } from "../helpers/tenantLabel";
import { useAddRoleForm } from "../hooks/useAddRoleForm";

export default function UserAddRole({
   show,
   setShow,
   roles,
   tenants,
   existingUserIds,
}: {
   show: boolean;
   setShow: (s: boolean) => void;
   roles: Role[];
   tenants: Tenant[];
   existingUserIds: number[];
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
         <div>
            <label className="mb-2 block text-sm font-semibold text-gray-700">
               Usuário *
            </label>
            <div className="flex items-center gap-2">
               {selectedUser ? (
                  <div className="flex flex-1 items-center justify-between rounded border border-blue-200 bg-blue-50 p-3">
                     <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-linear-to-br from-blue-500 to-blue-600 font-bold text-white uppercase shadow">
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
                     <Button size="xs" color="light" onClick={form.clearUser}>
                        <FaTimes />
                     </Button>
                  </div>
               ) : (
                  <div className="flex-1 rounded border border-dashed border-slate-200 bg-gray-50 p-3">
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

         {/* Seleção de Organização */}
         <div>
            <label className="mb-2 block text-sm font-semibold text-gray-700">
               Organização *
            </label>
            <Select
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
                  <p className="mt-1 text-sm text-gray-500">
                     Apenas o perfil de administrador pode ser do sistema.
                     Selecione uma unidade.
                  </p>
               )
            ) : (
               <p className="mt-1 text-sm text-gray-500">
                  Você administra apenas a sua unidade. O vínculo será criado
                  nela.
               </p>
            )}
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
                  <option key={r.id} value={r.id}>
                     {r.name.toUpperCase()} - {r.description}
                  </option>
               ))}
            </Select>
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
                           {roles.find((r) => r.id === selectedRole)?.name}
                        </strong>
                     </p>
                  </div>
               </div>
            </Alert>
         )}

         <SearchUser
            show={showSearch}
            setShow={setShowSearch}
            setUser={(u: UserPublic) => form.pickUser(u)}
            userIdsIgnr={existingUserIds}
         />
      </RoleModalShell>
   );
}
