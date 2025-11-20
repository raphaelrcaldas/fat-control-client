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
      <div className='grid grid-cols-1 md:grid-cols-3 gap-2 mb-8'>
         {actions.map((action) => {
            const IconComponent = action.icon;
            return (
               <button
                  key={action.route}
                  onClick={() => handleActionClick(action.route)}
                  className='group relative overflow-hidden bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 p-5 text-left border border-gray-200/60 hover:border-gray-300 hover:-translate-y-1'
               >
                  <div className='absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-gray-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300'></div>

                  <div className='relative z-10 flex items-start gap-4'>
                     <div
                        className={`p-4 rounded-2xl ${action.bgColor} transition-all duration-300 shadow-md group-hover:shadow-lg group-hover:scale-110`}
                     >
                        <IconComponent
                           className={`w-7 h-7 ${action.color} transition-transform duration-300 group-hover:rotate-6`}
                        />
                     </div>
                     <div className='flex-1 pt-1'>
                        <h3 className='font-bold text-gray-900 text-lg mb-1.5 group-hover:text-gray-700 transition-colors'>
                           {action.title}
                        </h3>
                        <p className='text-xs text-gray-600 leading-relaxed group-hover:text-gray-500 transition-colors'>
                           {action.description}
                        </p>
                     </div>
                  </div>

                  <div
                     className={`absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r ${action.color.replace(
                        "text",
                        "from"
                     )} to-transparent transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left`}
                  ></div>
               </button>
            );
         })}
      </div>
   );
}
