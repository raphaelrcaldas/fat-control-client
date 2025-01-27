"use client";
import React, { createContext, useContext, useEffect, useState } from "react";
import { getCookie } from "cookies-next";
import { decodeJWS } from "@/utils/jwtDecoder";

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
   const [user, setUser] = useState("");
   const [userId, setUserId] = useState("");

   useEffect(() => {
      const token = getCookie("token");
      decodeJWS(token).then((data) => {
         setUser(data.sub);
         setUserId(data.user_id);
      });
   }, []);

   return (
      <AuthContext.Provider value={{ user: user, userId: userId }}>
         {children}
      </AuthContext.Provider>
   );
};

export function useAuth() {
   const context = useContext(AuthContext);

   return context;
}
