"use client";

import { useAuth } from "@/app/context/auth";

export default function HomeApp() {
   const { user, role } = useAuth();

   return (
      <>
         <div className='grid justify-items-center h-full p-4'>
            <div className='p-4 w-2/3 lg:w-1/3 flex flex-col rounded-md shadow-lg text-center h-fit bg-red-50'>
               <span className='text-base'>Bem vindo</span>
               <span className='text-lg uppercase font-semibold'>{user}</span>
               <span className='text-base uppercase'>Perfil: {role}</span>
            </div>
         </div>
      </>
   );
}
