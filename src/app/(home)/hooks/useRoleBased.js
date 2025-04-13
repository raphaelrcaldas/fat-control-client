import { useAuth } from "src/context/auth";

export const RoleBasedRoute = ({ children, requiredRoles }) => {
   const { role } = useAuth();

   if (!role || !requiredRoles.includes(role.role)) {
      return null;
   }

   return children;
};
