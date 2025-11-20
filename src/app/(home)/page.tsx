"use client";

import { useAuth } from "@/app/context/auth";
import { FaUserCircle, FaShieldAlt, FaClock } from "react-icons/fa";
import {
   MdDashboard,
   MdAssignment,
   MdSettings,
   MdAirplanemodeInactive,
   MdAirplaneTicket,
   MdSort,
} from "react-icons/md";
import { useEffect, useState } from "react";
import QuickActions from "./components/quickActions";

export default function HomeApp() {
   const { user, role, userPg } = useAuth();
   const [currentTime, setCurrentTime] = useState(new Date());

   useEffect(() => {
      const timer = setInterval(() => {
         setCurrentTime(new Date());
      }, 1000);
      return () => clearInterval(timer);
   }, []);

   const getGreeting = () => {
      const hour = currentTime.getHours();
      if (hour < 12) return "Bom dia";
      if (hour < 18) return "Boa tarde";
      return "Boa noite";
   };

   return (
      <div className='min-h-full bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-8'>
         <div className='max-w-6xl mx-auto space-y-6'>
            {/* Welcome Card */}
            <div className='bg-white rounded-2xl shadow-xl p-8'>
               <div className='flex flex-col md:flex-row items-center md:items-start gap-6'>
                  {/* Avatar */}
                  <div className='relative'>
                     <div className='bg-gradient-to-br from-red-500 to-red-600 p-1 rounded-full'>
                        <div className='bg-white p-1 rounded-full'>
                           <FaUserCircle className='w-20 h-20 md:w-24 md:h-24 text-red-500' />
                        </div>
                     </div>
                  </div>

                  {/* User Info */}
                  <div className='flex-1 text-center md:text-left'>
                     <h1 className='text-xl text-gray-800 mb-2'>
                        {getGreeting()},{" "}
                        <span className='uppercase font-bold'>
                           {userPg} {user}
                        </span>
                        !
                     </h1>
                     <p className='text-gray-600 mb-4'>
                        Seja bem-vindo ao FATCONTROL
                     </p>

                     <div className='flex flex-wrap gap-3 justify-center md:justify-start'>
                        <div className='flex items-center gap-2 bg-red-50 px-4 py-2 rounded-lg'>
                           <FaShieldAlt className='text-red-500' />
                           <span className='text-sm font-medium text-gray-700'>
                              Perfil:{" "}
                              <span className='uppercase font-semibold'>
                                 {role}
                              </span>
                           </span>
                        </div>
                        <div className='flex items-center gap-2 bg-blue-50 px-4 py-2 rounded-lg'>
                           <FaClock className='text-blue-500' />
                           <span className='text-sm font-medium text-gray-700'>
                              {currentTime.toLocaleTimeString("pt-BR")}
                           </span>
                        </div>
                     </div>
                  </div>
               </div>
            </div>

            {/* Quick Actions */}
            <div className='max-w-5xl mx-auto'>
               <div className='mb-2'>
                  <h2 className='text-2xl font-bold text-gray-900 mb-2 tracking-tight'>
                     Acesso Rápido
                  </h2>
                  <div className='flex items-center gap-'>
                     <div className='h-0.5 w-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full'></div>
                     <p className='text-gray-600 font-medium ml-2'>
                        Navegue rapidamente pelas principais funcionalidades
                     </p>
                  </div>
               </div>
               <QuickActions />
            </div>

            {/* Stats or Additional Info Card */}
            {/* <div className="bg-gradient-to-r from-red-500 to-red-600 rounded-2xl shadow-xl p-8 text-white transform transition-all duration-700 delay-300">
               <h2 className="text-2xl font-bold mb-4">Dica do Dia</h2>
               <p className="text-red-50 text-lg">
                  Mantenha seus dados sempre atualizados para garantir a precisão dos
                  relatórios e análises do sistema.
               </p>
            </div> */}
         </div>
      </div>
   );
}
