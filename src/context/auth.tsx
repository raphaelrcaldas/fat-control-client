"use client";
import React, { createContext, useContext, useEffect, useState } from "react";
import { getCookie } from "cookies-next";

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
   const [token, setToken] = useState("");

   const [user, setUser] = useState("");
   const [userId, setUserId] = useState("");
   const [role, setRole] = useState({});

   useEffect(() => {
      const fetchToken = async () => {
         const token = await getCookie("token");
         if (typeof token === "string") {
            const [header, payload, assign] = token.split(".");
            const data = await JSON.parse(atob(payload));

            setToken(token);

            setUser(data.sub);
            setUserId(data.user_id);
            setRole(data.role);
         }
      };

      if (token == "") {
         fetchToken();
      }
   }, []);

   return (
      <AuthContext.Provider
         value={{ user: user, userId: userId, role: role, token: token }}
      >
         {children}
      </AuthContext.Provider>
   );
};

export function useAuth() {
   return useContext(AuthContext);
}
