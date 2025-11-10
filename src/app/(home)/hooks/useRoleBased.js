import { useAuth } from "@/app/context/auth";

export const RoleBasedRoute = ({ children, requiredRoles }) => {
   const { role } = useAuth();

   if (role === "admin") {
      return children;
   }

   if (!role || !requiredRoles.includes(role)) {
      return null;
   }

   return children;
};

export const useRoleBased = () => {
   const { role } = useAuth();

   const hasRole = (requiredRoles) => {
      if (role === "admin") {
         return true;
      }

      if (!role || !requiredRoles || requiredRoles.length === 0) {
         return true;
      }

      return requiredRoles.includes(role);
   };

   return { hasRole };
};
