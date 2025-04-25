"use client";

import { useAuth } from "src/context/auth";

// import { getCookie } from "cookies-next";
// import { useEffect, useState } from "react";

export default function HomeApp() {
   const { user, role } = useAuth();

   // const [token, setToken] = useState(getCookie("token"));
   // const [exp, setExp] = useState("");

   // useEffect(() => {
   //    if (token) {
   //       const [header, payload, assign] = token.split(".");
   //       let expiration = JSON.parse(atob(payload)).exp;

   //       expiration = new Date(expiration * 1000).toLocaleString();

   //       setExp(expiration);
   //    }
   // }, [token]);

   return (
      <div className='grid justify-items-center h-full'>
         <div className='p-4 w-2/3 lg:w-1/3 flex flex-col rounded-md shadow-lg text-center h-fit bg-red-100'>
            <span className='text-base'>Bem vindo</span>
            <span className='text-lg uppercase font-semibold'>{user}</span>
            <span className='text-base'>Perfil: {role.role.toUpperCase()}</span>
         </div>
         {/* <a target='_blank' href='/omis/677'>
            PDF
         </a> */}
      </div>
   );
}
