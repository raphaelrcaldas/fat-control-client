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

export const usePermBased = () => {
   const { role, perms } = useAuth();

   const hasPerm = (resource, requiredPerm) => {
      if (role === "admin") {
         return true;
      }

      if (!resource || !requiredPerm) {
         return true;
      }

      const checkPerm = perms?.find(
         (p) => p.resource === resource && p.name === requiredPerm
      );

      return !!checkPerm;
   };

   return { hasPerm };
};
