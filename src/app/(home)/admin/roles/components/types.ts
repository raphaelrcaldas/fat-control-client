import type { UserWithRole, RoleDetail } from "services/routes/security/roles";
import type { Resource, PermissionDetail } from "services/routes/security/resources";

export interface PermissionMatrix {
   [resourceName: string]: {
      [permissionAction: string]: {
         permissionId: number;
         description: string;
         roleIds: Set<number>;
      };
   };
}

export type PermissionMatrixType = PermissionMatrix;

export type { UserWithRole, RoleDetail, Resource, PermissionDetail };
