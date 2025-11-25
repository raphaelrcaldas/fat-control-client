import { memo } from "react";
import { Spinner } from "@/components/Spinner";
import { PermissionMatrix } from "./PermissionMatrix";
import type { Resource, PermissionDetail, RoleDetail, PermissionMatrix as PermissionMatrixType } from "./types";

interface PermissionsMatrixTabProps {
   isLoading: boolean;
   resources: Resource[] | null;
   permissions: PermissionDetail[] | null;
   matrix: PermissionMatrixType;
   roles: RoleDetail[];
}

export const PermissionsMatrixTab = memo(function PermissionsMatrixTab({
   isLoading,
   resources,
   permissions,
   matrix,
   roles,
}: PermissionsMatrixTabProps) {
   if (isLoading || !resources || !permissions) {
      return (
         <div className='flex items-center justify-center h-96'>
            <div className='flex flex-col items-center gap-3'>
               <Spinner size='xl' />
               <span className='text-gray-600'>Carregando permissões...</span>
            </div>
         </div>
      );
   }

   return (
      <div className='grid gap-4'>
         <PermissionMatrix matrix={matrix} roles={roles} />
      </div>
   );
});
