export const getRoleBadgeColor = (roleName: string): string => {
   const colors: Record<string, string> = {
      admin: "failure",
      moderator: "warning",
      user: "info",
      guest: "gray",
   };
   return colors[roleName.toLowerCase()] || "purple";
};
