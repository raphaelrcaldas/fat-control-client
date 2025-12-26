"use client";

import { useRouter } from "next/navigation";
import {
   MdSort,
   MdAirplaneTicket,
   MdAirplanemodeInactive,
} from "react-icons/md";

interface QuickAction {
   title: string;
   description: string;
   icon: React.ComponentType<{ className?: string }>;
   route: string;
   color: string;
   bgColor: string;
}

export default function QuickActions() {
   const router = useRouter();

   const actions: QuickAction[] = [
      {
         title: "Pau de Sebo",
         description: "Visualizar pau de sebo operacional",
         icon: MdSort,
         route: "/sebo",
         color: "text-blue-600",
         bgColor: "bg-blue-50 group-hover:bg-blue-100",
      },
      {
         title: "Quadrinhos",
         description: "Acessar quadrinhos e escalas",
         icon: MdAirplaneTicket,
         route: "/quads",
         color: "text-purple-600",
         bgColor: "bg-purple-50 group-hover:bg-purple-100",
      },
      {
         title: "Indisponibilidade",
         description: "Gerenciar indisponibilidades",
         icon: MdAirplanemodeInactive,
         route: "/indisp",
         color: "text-orange-600",
         bgColor: "bg-orange-50 group-hover:bg-orange-100",
      },
   ];

   const handleActionClick = (route: string) => {
      router.push(route);
   };

   return (
      <div className="mb-8 grid grid-cols-1 gap-2 md:grid-cols-3">
         {actions.map((action) => {
            const IconComponent = action.icon;
            return (
               <button
                  key={action.route}
                  onClick={() => handleActionClick(action.route)}
                  className="group relative overflow-hidden rounded-2xl border border-gray-200/60 bg-white p-5 text-left shadow-lg transition-all duration-300 hover:-translate-y-1 hover:border-gray-300 hover:shadow-2xl"
               >
                  <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-gray-50/50 opacity-0 transition-opacity duration-300 group-hover:opacity-100"></div>

                  <div className="relative z-10 flex items-start gap-4">
                     <div
                        className={`rounded-2xl p-4 ${action.bgColor} shadow-md transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg`}
                     >
                        <IconComponent
                           className={`h-7 w-7 ${action.color} transition-transform duration-300 group-hover:rotate-6`}
                        />
                     </div>
                     <div className="flex-1 pt-1">
                        <h3 className="mb-1.5 text-lg font-bold text-gray-900 transition-colors group-hover:text-gray-700">
                           {action.title}
                        </h3>
                        <p className="text-xs leading-relaxed text-gray-600 transition-colors group-hover:text-gray-500">
                           {action.description}
                        </p>
                     </div>
                  </div>

                  <div
                     className={`absolute bottom-0 left-0 h-1 w-full bg-gradient-to-r ${action.color.replace(
                        "text",
                        "from"
                     )} origin-left scale-x-0 transform to-transparent transition-transform duration-300 group-hover:scale-x-100`}
                  ></div>
               </button>
            );
         })}
      </div>
   );
}
