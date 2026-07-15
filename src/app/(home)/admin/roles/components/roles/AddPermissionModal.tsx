"use client";

import { useEffect, useMemo, useState } from "react";
import clsx from "clsx";
import {
   Button,
   Label,
   Modal,
   ModalBody,
   ModalFooter,
   ModalHeader,
   Select,
   Spinner,
} from "flowbite-react";
import { getRoleTheme } from "@/constants/admin/roles";
import type {
   RoleDetail,
   PermissionDetail,
} from "services/routes/security/roles";

interface AddPermissionModalProps {
   show: boolean;
   role: RoleDetail | null;
   allPermissions: PermissionDetail[] | undefined;
   isPending: boolean;
   onClose: () => void;
   onConfirm: (permissionId: number) => void;
}

export function AddPermissionModal({
   show,
   role,
   allPermissions,
   isPending,
   onClose,
   onConfirm,
}: AddPermissionModalProps) {
   const [selectedPermissionId, setSelectedPermissionId] = useState<
      number | null
   >(null);

   // Reinicia a seleção sempre que abre ou troca o perfil-alvo
   useEffect(() => {
      setSelectedPermissionId(null);
   }, [show, role?.id]);

   // Permissões ainda não concedidas ao perfil, agrupadas por recurso
   const availableGroups = useMemo(() => {
      if (!role || !allPermissions) return [];
      const currentIds = new Set(role.permissions.map((p) => p.id));
      const available = allPermissions.filter((p) => !currentIds.has(p.id));

      const grouped = new Map<string, PermissionDetail[]>();
      available.forEach((p) => {
         const group = grouped.get(p.resource) ?? [];
         group.push(p);
         grouped.set(p.resource, group);
      });
      return [...grouped.entries()].sort(([a], [b]) => a.localeCompare(b));
   }, [role, allPermissions]);

   const hasAvailable = availableGroups.length > 0;
   const theme = role ? getRoleTheme(role.name) : null;

   return (
      <Modal show={show} onClose={onClose} size="md">
         <ModalHeader>Adicionar Permissão</ModalHeader>
         <ModalBody>
            {role && theme && (
               <div className="space-y-4">
                  <div className="space-y-1">
                     <Label>Perfil</Label>
                     <div className="flex items-center gap-2">
                        <span
                           className={clsx(
                              "inline-flex items-center rounded-md px-2.5 py-0.5 text-xs font-semibold",
                              theme.bg,
                              theme.text
                           )}
                        >
                           {theme.label || role.name}
                        </span>
                        <span className="text-sm text-gray-600">
                           {role.description}
                        </span>
                     </div>
                  </div>

                  <div className="space-y-1">
                     <Label htmlFor="permission-select">Permissão</Label>
                     <Select
                        id="permission-select"
                        value={selectedPermissionId || ""}
                        onChange={(e) =>
                           setSelectedPermissionId(
                              Number(e.target.value) || null
                           )
                        }
                        required
                     >
                        <option value="">Selecione uma permissão</option>
                        {availableGroups.map(([resource, permissions]) => (
                           <optgroup key={resource} label={resource}>
                              {permissions.map((permission) => (
                                 <option
                                    key={permission.id}
                                    value={permission.id}
                                 >
                                    {permission.action}
                                    {permission.description
                                       ? ` — ${permission.description}`
                                       : ""}
                                 </option>
                              ))}
                           </optgroup>
                        ))}
                     </Select>
                     {!hasAvailable && (
                        <p className="text-sm text-gray-500">
                           Todas as permissões já foram atribuídas a este perfil
                        </p>
                     )}
                  </div>
               </div>
            )}
         </ModalBody>
         <ModalFooter>
            <Button
               color="red"
               onClick={() =>
                  selectedPermissionId && onConfirm(selectedPermissionId)
               }
               disabled={!selectedPermissionId || isPending}
            >
               {isPending ? (
                  <>
                     <Spinner color="primary" size="sm" className="mr-2" />
                     Adicionando...
                  </>
               ) : (
                  "Adicionar"
               )}
            </Button>
            <Button color="gray" onClick={onClose}>
               Cancelar
            </Button>
         </ModalFooter>
      </Modal>
   );
}
