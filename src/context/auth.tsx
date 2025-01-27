"use client";
import React, { createContext, useContext, useEffect, useState } from "react";
import { getCookie } from "cookies-next";

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
   const [user, setUser] = useState("");
   const [userId, setUserId] = useState("");

   useEffect(() => {
      const fetchToken = async () => {
         const token = await getCookie("token");
         if (typeof token === "string") {
            const [header, payload, assign] = token.split(".");
            const data = JSON.parse(atob(payload));

            setUser(data.sub);
            setUserId(data.user_id);
         }
      };

      fetchToken();
   }, []);

   return (
      <AuthContext.Provider value={{ user: user, userId: userId }}>
         {children}
      </AuthContext.Provider>
   );
};

export function useAuth() {
   return useContext(AuthContext);
}
