"use client";
import { getCookie } from "cookies-next";
import { useEffect, useState } from "react";

export default function HomeApp() {
   const [token, setToken] = useState(getCookie("token"));
   const [exp, setExp] = useState("");

   useEffect(() => {
      if (token) {
         const [header, payload, assign] = token.split(".");
         let expiration = JSON.parse(atob(payload)).exp;

         expiration = new Date(expiration * 1000).toLocaleString();

         setExp(expiration);
      }
   }, [token]);

   return (
      <>
         <h3>Home</h3>
         <p className='mt-6'>Token Expiration: {exp}</p>
      </>
   );
}
