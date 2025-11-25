import { memo } from "react";
import { UsersTable } from "./UsersTable";
import { RolesTable } from "./RolesTable";
import type { UserWithRole, RoleDetail } from "./types";

interface UsersTabProps {
   filteredUsers: UserWithRole[];
   roles: RoleDetail[];
   filterName: string;
   isUpdating: boolean;
   onFilterChange: (value: string) => void;
   onRefresh: () => void;
   onAddUser: () => void;
   onRoleChange: (userId: number, roleId: string) => void;
   onDevLogin: (userId: number) => void;
   onDeleteRole: (userId: number, roleId: number, userName: string) => void;
}

export const UsersTab = memo(function UsersTab({
   filteredUsers,
   roles,
   filterName,
   isUpdating,
   onFilterChange,
   onRefresh,
   onAddUser,
   onRoleChange,
   onDevLogin,
   onDeleteRole,
}: UsersTabProps) {
   return (
      <div className='grid lg:grid-cols-3 gap-4'>
         <div className='lg:col-span-2'>
            <UsersTable
               filteredUsers={filteredUsers}
               roles={roles}
               filterName={filterName}
               isUpdating={isUpdating}
               onFilterChange={onFilterChange}
               onRefresh={onRefresh}
               onAddUser={onAddUser}
               onRoleChange={onRoleChange}
               onDevLogin={onDevLogin}
               onDeleteRole={onDeleteRole}
            />
         </div>
         <div>
            <RolesTable roles={roles} />
         </div>
      </div>
   );
});
