"use client";

import { useAuth } from "@/app/context/auth";
import { FaUserCircle, FaShieldAlt, FaClock } from "react-icons/fa";
import { MdDashboard, MdAssignment, MdSettings } from "react-icons/md";
import { useEffect, useState } from "react";

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

   const quickActions = [
      {
         icon: <MdDashboard className='w-6 h-6' />,
         title: "Dashboard",
         description: "Visualizar métricas",
         href: "/dashboard",
      },
      {
         icon: <MdAssignment className='w-6 h-6' />,
         title: "Relatórios",
         description: "Acessar relatórios",
         href: "/reports",
      },
      {
         icon: <MdSettings className='w-6 h-6' />,
         title: "Configurações",
         description: "Gerenciar conta",
         href: "/settings",
      },
   ];
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
            {/* <div className="transform transition-all duration-700 delay-200">
               <h2 className="text-xl font-bold text-gray-800 mb-4">Ações Rápidas</h2>
               <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {quickActions.map((action, index) => (
                     <a
                        key={index}
                        href={action.href}
                        className="bg-white rounded-xl shadow-md hover:shadow-xl p-6 transition-all duration-300 hover:-translate-y-1 group cursor-pointer"
                     >
                        <div className="flex items-start gap-4">
                           <div className="bg-red-100 p-3 rounded-lg group-hover:bg-red-500 transition-colors duration-300">
                              <div className="text-red-500 group-hover:text-white transition-colors duration-300">
                                 {action.icon}
                              </div>
                           </div>
                           <div className="flex-1">
                              <h3 className="font-semibold text-gray-800 mb-1 group-hover:text-red-500 transition-colors">
                                 {action.title}
                              </h3>
                              <p className="text-sm text-gray-600">{action.description}</p>
                           </div>
                        </div>
                     </a>
                  ))}
               </div>
            </div> */}

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
