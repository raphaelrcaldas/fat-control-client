import { useAuth } from "src/context/auth";

export const PermBased = ({ children, resource, requiredPerm }) => {
   const { role } = useAuth();

   if (role?.role === "admin") {
      return children;
   }

   const perms = role.perms;
   const checkPerm = perms.find(
      (p) => p.resource == resource && p.name == requiredPerm
   );

   if (!role || !checkPerm) {
      return null;
   }

   return children;
};
