import { useAuth } from "@/app/context/auth";
import type { ReactNode } from "react";

interface PermBasedProps {
   children: ReactNode;
   resource: string;
   requiredPerm: string;
}

export const PermBased = ({
   children,
   resource,
   requiredPerm,
}: PermBasedProps) => {
   const { role, perms } = useAuth();

   if (role === "admin") {
      return children;
   }

   const checkPerm = perms.find(
      (p) => p.resource === resource && p.name === requiredPerm
   );

   if (!role || !checkPerm) {
      return null;
   }

   return children;
};

export const usePermBased = () => {
   const { role, perms } = useAuth();

   const hasPerm = (resource?: string, requiredPerm?: string) => {
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
