import { memo, useMemo } from "react";
import type { RoleDetail, PermissionMatrix as PermissionMatrixType } from "../../config/types";

interface PermissionMatrixProps {
   matrix: PermissionMatrixType;
   roles: RoleDetail[];
}

export const PermissionMatrix = memo(function PermissionMatrix({
   matrix,
   roles
}: PermissionMatrixProps) {
   // Memoizar resourceGroups para evitar recálculo
   const resourceGroups = useMemo(
      () => Object.keys(matrix).sort(),
      [matrix]
   );

   return (
      <div className='bg-white border border-gray-300'>
         <div style={{ contain: 'layout style paint', overflowX: 'auto' }}>
            <table style={{ width: '100%', tableLayout: 'fixed', borderSpacing: 0, fontSize: '0.875rem' }}>
               <thead>
                  <tr style={{ backgroundColor: '#f3f4f6', borderBottom: '2px solid #d1d5db' }}>
                     <th style={{ padding: '0.5rem 0.75rem', textAlign: 'center', fontWeight: 600, color: '#374151', borderRight: '1px solid #d1d5db', width: '100px' }}>
                        Recurso
                     </th>
                     <th style={{ padding: '0.5rem 0.75rem', textAlign: 'left', fontWeight: 600, color: '#374151', borderRight: '1px solid #d1d5db', width: '180px' }}>
                        Permissão
                     </th>
                     {roles.map((role) => (
                        <th
                           key={role.id}
                           style={{ padding: '0.5rem 0.75rem', textAlign: 'center', fontWeight: 600, fontSize: '0.75rem', color: '#374151', textTransform: 'uppercase', width: '90px' }}
                        >
                           {role.name}
                        </th>
                     ))}
                  </tr>
               </thead>
               <tbody>
                  {resourceGroups.map((resourceName) => {
                     const permissionsInResource = matrix[resourceName];
                     const permissionActions = Object.keys(
                        permissionsInResource
                     ).sort();
                     const rowSpanCount = permissionActions.length;

                     return permissionActions.map((action, idx) => {
                        const permData = permissionsInResource[action];

                        return (
                           <tr
                              key={`${resourceName}-${action}`}
                              style={{ borderBottom: '1px solid #e5e7eb' }}
                           >
                              {idx === 0 && (
                                 <td
                                    rowSpan={rowSpanCount}
                                    style={{
                                       padding: '0.5rem 0.75rem',
                                       borderRight: '1px solid #e5e7eb',
                                       verticalAlign: 'middle',
                                       textAlign: 'center',
                                       color: '#374151',
                                       fontSize: '0.75rem',
                                       fontWeight: 700,
                                       textTransform: 'uppercase'
                                    }}
                                 >
                                    {resourceName}
                                 </td>
                              )}

                              <td style={{ padding: '0.5rem 0.75rem', borderRight: '1px solid #e5e7eb' }}>
                                 <div style={{ fontWeight: 500, color: '#374151', fontSize: '0.75rem', textTransform: 'uppercase' }}>
                                    {action}
                                 </div>
                                 <div style={{ fontSize: '0.625rem', color: '#6b7280', marginTop: '0.125rem', textTransform: 'uppercase' }}>
                                    {permData.description}
                                 </div>
                              </td>

                              {roles.map((role) => {
                                 const hasPermission = permData.roleIds.has(role.id);
                                 return (
                                    <td
                                       key={role.id}
                                       style={{
                                          padding: '0.5rem 0.75rem',
                                          textAlign: 'center',
                                          fontSize: '1.125rem',
                                          fontWeight: 700,
                                          color: hasPermission ? '#16a34a' : '#dc2626'
                                       }}
                                    >
                                       {hasPermission ? "✓" : "✗"}
                                    </td>
                                 );
                              })}
                           </tr>
                        );
                     });
                  })}
               </tbody>
            </table>
         </div>
      </div>
   );
});
