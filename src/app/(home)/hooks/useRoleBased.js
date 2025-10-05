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
