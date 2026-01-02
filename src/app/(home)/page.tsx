"use client";

import { useAuth } from "@/app/context/auth";
import { FaUserCircle, FaShieldAlt, FaClock, FaHistory } from "react-icons/fa";
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
import { getUserActionLogs } from "services/routes/logs";

export default function HomeApp() {
   const { user, role, userPg, userId } = useAuth();
   const [currentTime, setCurrentTime] = useState(new Date());
   const [lastLogin, setLastLogin] = useState<string | null>(null);

   useEffect(() => {
      const timer = setInterval(() => {
         setCurrentTime(new Date());
      }, 1000);
      return () => clearInterval(timer);
   }, []);

   useEffect(() => {
      const fetchLastLogin = async () => {
         if (!userId) return;
         try {
            const logs = await getUserActionLogs({
               user_id: Number(userId),
               action: "login",
            });
            // O primeiro log é o login atual, pegamos o segundo (penúltimo login)
            if (logs.length > 1) {
               const previousLogin = logs[1];
               const date = new Date(previousLogin.timestamp);
               setLastLogin(
                  date.toLocaleDateString("pt-BR", {
                     day: "2-digit",
                     month: "2-digit",
                     year: "numeric",
                     hour: "2-digit",
                     minute: "2-digit",
                  })
               );
            } else {
               setLastLogin("Primeiro acesso");
            }
         } catch (error) {
            console.error("Erro ao buscar último login:", error);
         }
      };
      fetchLastLogin();
   }, [userId]);

   const getGreeting = () => {
      const hour = currentTime.getHours();
      if (hour < 12) return "Bom dia";
      if (hour < 18) return "Boa tarde";
      return "Boa noite";
   };

   return (
      <div className="min-h-full bg-linear-to-br from-gray-50 to-gray-100 p-4 md:p-8">
         <div className="mx-auto max-w-6xl space-y-6">
            {/* Welcome Card */}
            <div className="rounded-2xl bg-white p-8 shadow-xl">
               <div className="flex flex-col items-center gap-6 md:flex-row md:items-start">
                  {/* Avatar */}
                  <div className="relative">
                     <div className="rounded-full bg-linear-to-br from-red-500 to-red-600 p-1">
                        <div className="rounded-full bg-white p-1">
                           <FaUserCircle className="h-20 w-20 text-red-500 md:h-24 md:w-24" />
                        </div>
                     </div>
                  </div>

                  {/* User Info */}
                  <div className="flex-1 text-center md:text-left">
                     <h1 className="mb-2 text-xl text-gray-800">
                        {getGreeting()},{" "}
                        <span className="font-bold uppercase">
                           {userPg} {user}
                        </span>
                        !
                     </h1>
                     <p className="mb-4 text-gray-600">
                        Seja bem-vindo ao FATCONTROL
                     </p>

                     <div className="flex flex-wrap justify-center gap-3 md:justify-start">
                        <div className="flex items-center gap-2 rounded-lg bg-red-50 px-4 py-2">
                           <FaShieldAlt className="text-red-500" />
                           <span className="text-sm font-medium text-gray-700">
                              Perfil:{" "}
                              <span className="font-semibold uppercase">
                                 {role}
                              </span>
                           </span>
                        </div>
                        <div className="flex items-center gap-2 rounded-lg bg-blue-50 px-4 py-2">
                           <FaClock className="text-blue-500" />
                           <span className="text-sm font-medium text-gray-700">
                              {currentTime.toLocaleTimeString("pt-BR")}
                           </span>
                        </div>
                        {lastLogin && (
                           <div className="flex items-center gap-2 rounded-lg bg-green-50 px-4 py-2">
                              <FaHistory className="text-green-500" />
                              <span className="text-sm font-medium text-gray-700">
                                 Último acesso:{" "}
                                 <span className="font-semibold">
                                    {lastLogin}
                                 </span>
                              </span>
                           </div>
                        )}
                     </div>
                  </div>
               </div>
            </div>

            {/* Quick Actions */}
            {/* <div className='max-w-5xl mx-auto'>
               <div className='mb-2'>
                  <h2 className='text-2xl font-bold text-gray-900 mb-2 tracking-tight'>
                     Acesso Rápido
                  </h2>
                  <div className='flex items-center gap-'>
                     <div className='h-0.5 w-12 bg-linear-to-r from-blue-600 to-purple-600 rounded-full'></div>
                     <p className='text-gray-600 font-medium ml-2'>
                        Navegue rapidamente pelas principais funcionalidades
                     </p>
                  </div>
               </div>
               <QuickActions />
            </div> */}

            {/* Stats or Additional Info Card */}
            {/* <div className="bg-linear-to-r from-red-500 to-red-600 rounded-2xl shadow-xl p-8 text-white transform transition-all duration-700 delay-300">
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
