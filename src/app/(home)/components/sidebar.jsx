"use client";
import {
   MdSort,
   MdAirplaneTicket,
   MdAirplanemodeInactive,
   MdHail,
   MdOutlinePeopleAlt,
   MdHome,
   MdMoney,
} from "react-icons/md";
import { FaUsers } from "react-icons/fa6";
import { FaPaperPlane } from "react-icons/fa";
import { useRouter, usePathname } from "next/navigation";
import {
   Sidebar,
   SidebarCollapse,
   SidebarItem,
   SidebarItemGroup,
   SidebarItems,
} from "flowbite-react";
import { RoleBasedRoute } from "../hooks/useRoleBased";
import { PermBased } from "../hooks/usePermBased";
import { TbLogs } from "react-icons/tb";
import { RiAdminLine } from "react-icons/ri";
import { GiSecurityGate } from "react-icons/gi";

export default function AppSideBar({ isCollapsed, setIsCollapsed }) {
   const path = usePathname();
   const router = useRouter();

   const themeSideBar = {
      root: {
         base: "h-full bg-red-200 shadow-md",
         collapsed: {
            on: "w-[19rem]",
            off: "w-[19rem]",
         },
         inner: "h-full overflow-y-auto overflow-x-hidden rounded bg-white px-3 py-4 dark:bg-gray-800",
      },
      collapse: {
         button:
            "group flex w-full items-center rounded-lg p-2 text-base font-normal text-gray-900 transition duration-75 hover:bg-gray-200 dark:text-white dark:hover:bg-gray-700",
         icon: {
            base: "h-6 w-6 text-gray-500 transition duration-75 dark:text-gray-400 dark:group-hover:text-white",
            open: {
               off: "",
               on: "text-gray-900",
            },
         },
         label: {
            base: "ml-3 flex-1 whitespace-nowrap text-left",
            icon: {
               base: "h-6 w-6 transition delay-0 ease-in-out",
               open: {
                  on: "rotate-180",
                  off: "",
               },
            },
         },
         list: "space-y-2 py-2",
      },
      cta: {
         base: "mt-6 rounded-lg bg-gray-100 py-4",
         color: {
            blue: "bg-cyan-50",
            dark: "bg-dark-50",
            failure: "bg-red-50",
            gray: "bg-alternative-50",
            green: "bg-green-50",
            light: "bg-light-50",
            red: "bg-red-50",
            purple: "bg-purple-50",
            success: "bg-green-50",
            yellow: "bg-yellow-50",
            warning: "bg-yellow-50",
         },
      },
      item: {
         base: "flex items-center justify-center rounded-lg cursor-pointer p-2 text-base font-normal text-gray-900 hover:bg-gray-200 dark:text-white dark:hover:bg-gray-700",
         active: "bg-gray-300 dark:bg-gray-700",
         collapsed: {
            insideCollapse: "group w-full pl-8 transition duration-75",
            noIcon: "font-bold",
         },
         content: {
            base: "flex-1 whitespace-nowrap px-3",
         },
         icon: {
            base: "h-6 w-6 flex-shrink-0 text-gray-500 transition duration-75 group-hover:text-gray-900 dark:text-gray-400 dark:group-hover:text-white",
            active: "text-gray-700",
         },
         label: "",
         listItem: "",
      },
      items: {
         base: "",
      },
      itemGroup: {
         base: "mt-4 space-y-2 border-t border-gray-200 pt-4 first:mt-0 first:border-t-0 first:pt-0 dark:border-gray-700",
      },
      logo: {
         base: "mb-5 flex items-center pl-2.5",
         collapsed: {
            on: "hidden",
            off: "self-center whitespace-nowrap text-xl font-semibold dark:text-white",
         },
         img: "mr-2 h-12 w-10",
      },
   };

   const handlePush = (route) => {
      router.push(route);
      if (typeof window !== "undefined" && window.innerWidth <= 1024) {
         setIsCollapsed(true);
      }
   };

   return (
      <>
         <Sidebar
            collapsed={isCollapsed}
            theme={themeSideBar}
            collapseBehavior='hide'
         >
            <SidebarItems
               className='flex flex-col justify-start'
               style={{ height: "93%" }}
            >
               <SidebarItemGroup>
                  <SidebarItem
                     active={path === "/"}
                     icon={MdHome}
                     onClick={() => handlePush("/")}
                  >
                     Início
                  </SidebarItem>
                  <RoleBasedRoute
                     requiredRoles={[
                        "ops_avancado",
                        "ops_basico",
                        "dout_avancado",
                        "dout_basico",
                        "apoio_avancado",
                     ]}
                  >
                     <SidebarCollapse
                        open
                        icon={FaPaperPlane}
                        label='Operações'
                     >
                        <PermBased resource={"sebo"} requiredPerm={"view"}>
                           <SidebarItem
                              active={path === "/sebo"}
                              icon={MdSort}
                              onClick={() => handlePush("/sebo")}
                           >
                              Pau de Sebo
                           </SidebarItem>
                        </PermBased>
                        <PermBased resource={"quad_ops"} requiredPerm={"view"}>
                           <SidebarItem
                              active={path === "/quads"}
                              icon={MdAirplaneTicket}
                              onClick={() => handlePush("/quads")}
                           >
                              Quadrinhos
                           </SidebarItem>
                        </PermBased>
                        <PermBased
                           resource={"indisp_trips"}
                           requiredPerm={"view"}
                        >
                           <SidebarItem
                              active={path === "/indisp"}
                              icon={MdAirplanemodeInactive}
                              onClick={() => handlePush("/indisp")}
                           >
                              Indisponibilidades
                           </SidebarItem>
                        </PermBased>
                        <PermBased resource={"trips"} requiredPerm={"view"}>
                           <SidebarItem
                              active={path === "/trip"}
                              icon={MdHail}
                              onClick={() => handlePush("/trip")}
                           >
                              Tripulantes
                           </SidebarItem>
                        </PermBased>
                     </SidebarCollapse>
                  </RoleBasedRoute>
                  <SidebarCollapse open icon={FaUsers} label='Pessoal'>
                     <RoleBasedRoute requiredRoles={["apoio_avancado"]}>
                        <SidebarItem
                           active={path === "/cegep/missoes"}
                           icon={MdAirplaneTicket}
                           onClick={() => handlePush("/cegep/missoes")}
                        >
                           Missões
                        </SidebarItem>
                     </RoleBasedRoute>
                     <SidebarItem
                        active={path === "/cegep/comiss"}
                        icon={MdMoney}
                        onClick={() => handlePush("/cegep/comiss")}
                     >
                        Comissionamento
                     </SidebarItem>
                  </SidebarCollapse>
               </SidebarItemGroup>
               <SidebarItemGroup>
                  <RoleBasedRoute
                     requiredRoles={["apoio_avancado", "apoio_basico"]}
                  >
                     <SidebarItem
                        active={path === "/users"}
                        icon={MdOutlinePeopleAlt}
                        onClick={() => handlePush("/users")}
                     >
                        Usuários
                     </SidebarItem>
                  </RoleBasedRoute>
                  <RoleBasedRoute requiredRoles={[]}>
                     <SidebarCollapse icon={RiAdminLine} label='Admin'>
                        <SidebarItem
                           active={path === "/admin/roles"}
                           icon={GiSecurityGate}
                           onClick={() => handlePush("/admin/roles")}
                        >
                           Roles
                        </SidebarItem>
                        <SidebarItem
                           active={path === "/admin/logs"}
                           icon={TbLogs}
                           onClick={() => handlePush("/admin/logs")}
                        >
                           Logs
                        </SidebarItem>
                     </SidebarCollapse>
                  </RoleBasedRoute>
               </SidebarItemGroup>
            </SidebarItems>
         </Sidebar>
      </>
   );
}
