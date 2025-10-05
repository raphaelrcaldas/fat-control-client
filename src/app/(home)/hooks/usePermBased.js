import { useAuth } from "@/app/context/auth";

export const PermBased = ({ children, resource, requiredPerm }) => {
   const { role, perms } = useAuth();

   if (role === "admin") {
      return children;
   }

   const checkPerm = perms.find(
      (p) => p.resource == resource && p.name == requiredPerm
   );

   if (!role || !checkPerm) {
      return null;
   }

   return children;
};
