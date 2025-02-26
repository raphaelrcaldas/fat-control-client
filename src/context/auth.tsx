"use client";
import React, { createContext, useContext, useEffect, useState } from "react";
import { getCookie } from "cookies-next";

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
   const [token, setToken] = useState("");

   const [user, setUser] = useState("");
   const [userId, setUserId] = useState("");
   const [scopes, setScopes] = useState([]);

   useEffect(() => {
      const fetchToken = async () => {
         const token = await getCookie("token");
         if (typeof token === "string") {
            const [header, payload, assign] = token.split(".");
            const data = await JSON.parse(atob(payload));

            setToken(token);

            setUser(data.sub);
            setUserId(data.user_id);
            setScopes(data.scopes);
         }
      };

      fetchToken();
   }, []);

   return (
      <AuthContext.Provider
         value={{ user: user, userId: userId, scopes: scopes, token: token }}
      >
         {children}
      </AuthContext.Provider>
   );
};

export function useAuth() {
   return useContext(AuthContext);
}
