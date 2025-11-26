import { getRoleTheme } from "../config/roleThemes";

/**
 * Mapeia o tema customizado de role para as cores do Flowbite Badge
 * Usado no RolesTable para exibir badges usando os componentes Flowbite
 */
export const getRoleBadgeColor = (roleName: string): string => {
   const theme = getRoleTheme(roleName);

   // Mapeia cores customizadas para cores do Flowbite Badge
   const colorMap: Record<string, string> = {
      "bg-red-100": "failure",      // Admin
      "bg-purple-100": "purple",    // Gerente
      "bg-blue-100": "info",        // Supervisor
      "bg-green-100": "success",    // Usuario
      "bg-gray-100": "gray",        // Default
   };

   return colorMap[theme.bg] || "purple";
};
