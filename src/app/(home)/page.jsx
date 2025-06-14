"use client";

import { useAuth } from "src/context/auth";

export default function HomeApp() {
   const { user, role } = useAuth();

   return (
      <>
         {user && role ? (
            <div className='grid justify-items-center h-full'>
               <div className='p-4 w-2/3 lg:w-1/3 flex flex-col rounded-md shadow-lg text-center h-fit bg-red-100'>
                  <span className='text-base'>Bem vindo</span>
                  <span className='text-lg uppercase font-semibold'>
                     {user}
                  </span>
                  <span className='text-base uppercase'>
                     Perfil: {role.role}
                  </span>
               </div>
               {/* <a target='_blank' href='/omis/677'>
            PDF
         </a> */}
            </div>
         ) : (
            <NoPermission />
         )}
      </>
   );
}

function NoPermission() {
   return (
      <div className='flex flex-col items-center justify-center h-screen'>
         <h1 className='text-2xl font-bold text-gray-700'>Acesso Negado</h1>
         <p className='text-base uppercase'>
            Você não tem permissão para acessar esta página.
         </p>
      </div>
   );
}
