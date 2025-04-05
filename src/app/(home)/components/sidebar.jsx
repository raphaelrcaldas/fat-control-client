"use client";
import {
   MdSort,
   MdAirplaneTicket,
   MdAirplanemodeInactive,
   MdHail,
   MdOutlinePeopleAlt,
   MdDashboard,
} from "react-icons/md";
import { FaUsers } from "react-icons/fa6";
import { FaPaperPlane } from "react-icons/fa";
import { useRouter, usePathname } from "next/navigation";
import { Button, Sidebar, Spinner } from "flowbite-react";
import { useAuth } from "src/context/auth";
import { deleteCookie } from "cookies-next";

export default function AppSideBar({
   isCollapsed,
   setIsCollapsed,
   alwaysOpen,
}) {
   const path = usePathname();
   const router = useRouter();

   const { user, scopes } = useAuth();

   const themeSideBar = {
      root: {
         base: "h-full bg-white shadow-md transition-all duration-300 ease-in-out",
         collapsed: {
            on: "w-16",
            off: "w-64",
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
         base: "mt-6 rounded-lg bg-gray-100 p-4 dark:bg-gray-700",
         color: {
            blue: "bg-cyan-50 dark:bg-cyan-900",
            dark: "bg-dark-50 dark:bg-dark-900",
            failure: "bg-red-50 dark:bg-red-900",
            gray: "bg-alternative-50 dark:bg-alternative-900",
            green: "bg-green-50 dark:bg-green-900",
            light: "bg-light-50 dark:bg-light-900",
            red: "bg-red-50 dark:bg-red-900",
            purple: "bg-purple-50 dark:bg-purple-900",
            success: "bg-green-50 dark:bg-green-900",
            yellow: "bg-yellow-50 dark:bg-yellow-900",
            warning: "bg-yellow-50 dark:bg-yellow-900",
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
            active: "text-gray-700 dark:text-gray-100",
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

   const logout = () => {
      deleteCookie("token");
      router.push("/login");
   };

   // const handlePush = (route) => {
   //    router.push(route);
   //    setOpenBar(false);
   // };

   // function checkScope(scope) {
   //    return scopes.includes(scope);
   // }

   return (
      <>
         <Sidebar
            collapsed={alwaysOpen ? false : isCollapsed}
            theme={themeSideBar}
            collapseBehavior='hide'
         >
            <Sidebar.Items
               className='flex flex-col justify-start'
               style={{ height: "93%" }}
            >
               <Sidebar.ItemGroup>
                  {/* <Sidebar.Item
                  active={path === "/dashboard"}
                  icon={MdDashboard}
                  onClick={() => router.push("/dashboard")}
               >
                  Dashboard
               </Sidebar.Item> */}
                  <Sidebar.Collapse open icon={FaPaperPlane} label='Operações'>
                     <Sidebar.Item
                        active={path === "/sebo"}
                        icon={MdSort}
                        onClick={() => router.push("/sebo")}
                     >
                        Pau de Sebo
                     </Sidebar.Item>
                     <Sidebar.Item
                        active={path === "/quads"}
                        icon={MdAirplaneTicket}
                        onClick={() => router.push("/quads")}
                     >
                        Quadrinhos
                     </Sidebar.Item>
                     <Sidebar.Item
                        active={path === "/indisp"}
                        icon={MdAirplanemodeInactive}
                        onClick={() => router.push("/indisp")}
                     >
                        Indisp
                     </Sidebar.Item>
                     <Sidebar.Item
                        active={path === "/trip"}
                        icon={MdHail}
                        onClick={() => router.push("/trip")}
                     >
                        Tripulantes
                     </Sidebar.Item>
                  </Sidebar.Collapse>
                  {/* <Sidebar.Collapse icon={FaUsers} label='Pessoal'>
                  
               </Sidebar.Collapse> */}
               </Sidebar.ItemGroup>
               <Sidebar.ItemGroup>
                  <Sidebar.Item
                     // className={!checkScope("adm") && "hidden"}
                     active={path === "/users"}
                     icon={MdOutlinePeopleAlt}
                     onClick={() => router.push("/users")}
                  >
                     Usuários
                  </Sidebar.Item>
               </Sidebar.ItemGroup>
               <Sidebar.CTA className='mt-auto bg-red-200 shadow-md'>
                  <div className='flex items-center justify-evenly'>
                     {user ? (
                        <span className='font-semibold text-center uppercase'>
                           {user}
                        </span>
                     ) : (
                        <Spinner
                           color='failure'
                           aria-label='Failure spinner example'
                        />
                     )}

                     <Button
                        className='flex-shrink-0'
                        color='light'
                        pill
                        onClick={logout}
                     >
                        Sair
                     </Button>
                  </div>
               </Sidebar.CTA>
            </Sidebar.Items>
         </Sidebar>
      </>
   );
}
