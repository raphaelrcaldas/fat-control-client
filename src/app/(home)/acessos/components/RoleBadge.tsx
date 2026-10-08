import { getRoleTheme } from "@/constants/admin/roles";

interface RoleBadgeProps {
   roleName: string;
}

/** Chip de perfil com a cor do tema do role. */
export function RoleBadge({ roleName }: RoleBadgeProps) {
   const colors = getRoleTheme(roleName);
   return (
      <span
         title={roleName}
         className={`inline-block max-w-[96px] truncate rounded px-1.5 py-1 align-middle text-xs font-medium uppercase sm:max-w-none sm:px-2.5 sm:text-sm ${colors.bg} ${colors.text}`}
      >
         {roleName}
      </span>
   );
}
