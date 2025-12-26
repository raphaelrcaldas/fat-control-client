import { memo, useMemo } from "react";
import { Spinner } from "@/components/Spinner";
import { PermissionMatrix } from "./PermissionMatrix";
import type {
   Resource,
   PermissionDetail,
   RoleDetail,
   PermissionMatrix as PermissionMatrixType,
} from "../../config/types";

interface PermissionsMatrixTabProps {
   resources: Resource[] | null;
   permissions: PermissionDetail[] | null;
   roles: RoleDetail[];
}

const buildPermissionMatrix = (
   allPermissions: PermissionDetail[],
   allRolesDetails: RoleDetail[]
): PermissionMatrixType => {
   const matrix: PermissionMatrixType = {};

   allPermissions.forEach((perm) => {
      if (!matrix[perm.resource]) {
         matrix[perm.resource] = {};
      }
      matrix[perm.resource][perm.action] = {
         permissionId: perm.id,
         description: perm.description,
         roleIds: new Set(),
      };
   });

   allRolesDetails.forEach((roleDetail) => {
      roleDetail.permissions.forEach((perm) => {
         if (matrix[perm.resource] && matrix[perm.resource][perm.action]) {
            matrix[perm.resource][perm.action].roleIds.add(roleDetail.id);
         }
      });
   });

   return matrix;
};

export const PermissionsMatrixTab = memo(function PermissionsMatrixTab({
   resources,
   permissions,
   roles,
}: PermissionsMatrixTabProps) {
   const matrix = useMemo(() => {
      if (!permissions || !roles.length) return {};
      return buildPermissionMatrix(permissions, roles);
   }, [permissions, roles]);

   if (!resources || !permissions) {
      return (
         <div className="flex h-96 items-center justify-center">
            <div className="flex flex-col items-center gap-3">
               <Spinner size="xl" />
               <span className="text-gray-600">Carregando permissões...</span>
            </div>
         </div>
      );
   }

   return (
      <div className="grid gap-4">
         <PermissionMatrix matrix={matrix} roles={roles} />
      </div>
   );
});
