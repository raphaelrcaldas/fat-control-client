"use client";
import React, { createContext, useContext, useEffect, useState } from "react";
import { getCookie, setCookie } from "cookies-next";
import { refreshToken } from "@/services/routes/auth";

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
   const [user, setUser] = useState("");
   const [userId, setUserId] = useState("");
   const [token, setToken] = useState("");

   useEffect(() => {
      const fetchToken = async () => {
         const token = await getCookie("token");
         if (typeof token === "string") {
            const [header, payload, assign] = token.split(".");
            const data = JSON.parse(atob(payload));

            setUser(data.sub);
            setUserId(data.user_id);
            setToken(token);
         }
      };

      const checkTokenExpiration = () => {
         if (token) {
            const [header, payload, assign] = token.split(".");
            const data = JSON.parse(atob(payload));
            const exp = data.exp * 1000; // Convert to milliseconds
            const now = Date.now();
            const tenMinutes = 10 * 60 * 1000;

            if (exp - now < tenMinutes) {
               getNewToken();
            }
         }
      };

      const getNewToken = async () => {
         // Implement your refresh token logic here
         const response = await refreshToken(token);
         const data = await response.json();
         const newToken = data.access_token;

         if (newToken) {
            setCookie("token", newToken);
            setToken(newToken);
         }
      };

      fetchToken();
      const interval = setInterval(checkTokenExpiration, 5 * 60 * 1000); // Check every 5 minutes

      return () => clearInterval(interval);
   }, [token]);

   return (
      <AuthContext.Provider value={{ user: user, userId: userId }}>
         {children}
      </AuthContext.Provider>
   );
};

export function useAuth() {
   return useContext(AuthContext);
}
