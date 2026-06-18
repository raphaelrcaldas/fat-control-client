import { getRoleTheme } from "@/constants/admin/roles";

interface RoleBadgeProps {
   roleName: string;
}

/** Chip de perfil com a cor do tema do role. */
export function RoleBadge({ roleName }: RoleBadgeProps) {
   const colors = getRoleTheme(roleName);
   return (
      <span
         className={`inline-flex items-center rounded px-2.5 py-1 text-sm font-medium uppercase ${colors.bg} ${colors.text}`}
      >
         {roleName}
      </span>
   );
}
