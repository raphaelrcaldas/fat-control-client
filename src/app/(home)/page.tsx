"use client";

import { useAuth } from "@/app/context/auth";
import { FaUserCircle, FaShieldAlt, FaClock, FaHistory } from "react-icons/fa";
import { useEffect, useState } from "react";
import { getUserActionLogs } from "services/routes/logs";
import { formatDateTime } from "@/../utils/dateHandler";

export default function HomeApp() {
   const { user, role, userPg, userId } = useAuth();
   const [currentTime, setCurrentTime] = useState(new Date());
   const [mounted, setMounted] = useState(false);
   const [lastLogin, setLastLogin] = useState<string | null>(null);
   const [isFirstAccess, setIsFirstAccess] = useState(false);

   useEffect(() => {
      setMounted(true);
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
               setLastLogin(formatDateTime(logs[1].timestamp));
            } else {
               setIsFirstAccess(true);
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
      // px-3: no mobile o padding do layout (p-1 = 3,5px) não dá respiro; aqui
      // soma ~1rem, mesma folga da tela de carregamento. Some no sm+, onde o
      // mx-auto + max-w já garante margem.
      <div className="mx-auto w-full max-w-2xl px-3 pt-2 sm:max-w-3xl sm:px-0 sm:pt-6 lg:max-w-4xl">
         {/* Welcome Card */}
         <div className="relative overflow-hidden rounded border border-slate-200 bg-white p-5 shadow-sm sm:p-6 md:p-8">
            {/* Espinha lateral tematizada — ecoa a linguagem dos cards/Masthead */}
            <span
               aria-hidden
               className="bg-primary-600 absolute top-0 left-0 h-full w-1"
            />
            <div className="relative flex flex-col items-center gap-5 sm:flex-row sm:items-start sm:gap-6">
               {/* Avatar */}
               <div className="from-primary-500 to-primary-600 rounded-full bg-linear-to-br p-1">
                  <div className="rounded-full bg-white p-1">
                     <FaUserCircle className="text-primary-500 h-16 w-16 sm:h-20 sm:w-20 md:h-24 md:w-24" />
                  </div>
               </div>

               {/* User Info */}
               <div className="min-w-0 flex-1 text-center sm:text-left">
                  <h1 className="mb-2 text-xl tracking-tight text-gray-800 sm:text-2xl">
                     {getGreeting()},{" "}
                     <span className="font-bold uppercase">
                        {`${userPg} ${user}`}
                     </span>
                     !
                  </h1>
                  <p className="mb-4 text-sm text-gray-600 sm:text-base">
                     Seja bem-vindo ao FATCONTROL
                  </p>

                  {/* Chips em uma única linha enquanto couber: nowrap interno
                      evita que um chip quebre e force o wrap do conjunto. */}
                  <div className="flex flex-wrap justify-center gap-2 sm:justify-start">
                     <div className="bg-primary-50 flex items-center gap-2 rounded px-3 py-1.5 whitespace-nowrap">
                        <FaShieldAlt className="text-primary-500 shrink-0" />
                        <span className="text-sm font-medium text-gray-700">
                           Perfil:{" "}
                           <span className="font-semibold uppercase">
                              {role}
                           </span>
                        </span>
                     </div>
                     <div className="flex items-center gap-2 rounded bg-blue-50 px-3 py-1.5 whitespace-nowrap">
                        <FaClock className="shrink-0 text-blue-500" />
                        <span className="font-mono text-sm text-gray-700 tabular-nums">
                           {mounted
                              ? currentTime.toLocaleTimeString("pt-BR")
                              : "--:--:--"}
                        </span>
                     </div>
                     {(lastLogin || isFirstAccess) && (
                        <div className="flex items-center gap-2 rounded bg-green-50 px-3 py-1.5 whitespace-nowrap">
                           <FaHistory className="shrink-0 text-green-500" />
                           <span className="text-sm font-medium text-gray-700">
                              {isFirstAccess ? (
                                 "Primeiro acesso"
                              ) : (
                                 <>
                                    Último acesso:{" "}
                                    <span className="font-semibold">
                                       {lastLogin}
                                    </span>
                                 </>
                              )}
                           </span>
                        </div>
                     )}
                  </div>
               </div>
            </div>
         </div>
      </div>
   );
}
