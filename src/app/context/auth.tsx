"use client";
import React, { createContext, useContext, useEffect, useState } from "react";
import { getMe } from "services/routes/users";
import { AppLoadingScreen } from "src/app/(home)/components/appLoadingScreen";
import PermDenied from "../components/permDenied";

interface PermType {
   name: string;
   resource: string;
}

interface AuthContextType {
   user: string | null;
   userId: string | null;
   role: string | null;
   perms: PermType[];
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
   children: React.ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
   const [user, setUser] = useState<string | null>(null);
   const [userId, setUserId] = useState<string | null>(null);
   const [role, setRole] = useState<string | null>(null);
   const [perms, setPerms] = useState<PermType[]>([]);
   const [loading, setLoading] = useState(true);

   useEffect(() => {
      const fetchUser = async () => {
         try {
            const data = await getMe();

            setUser(`${data.posto} ${data.nome_guerra}`);
            setUserId(data.id);
            setRole(data.role);
            setPerms(data.permissions || []);
         } catch (error) {
            console.error("Falha na autenticação do cliente:", error);
         } finally {
            setLoading(false);
         }
      };

      fetchUser();
   }, []);

   if (loading) {
      return <AppLoadingScreen />;
   }

   if (!role) {
      return <PermDenied />;
   }

   return (
      <AuthContext.Provider
         value={{ user: user, userId: userId, role: role, perms: perms }}
      >
         {children}
      </AuthContext.Provider>
   );
};

export function useAuth() {
   const context = useContext(AuthContext);
   if (context === undefined) {
      throw new Error("useAuth deve ser usado dentro de um AuthProvider");
   }
   return context;
}
