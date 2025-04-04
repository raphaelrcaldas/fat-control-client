"use client";

import { useState } from "react";
import { AuthProvider } from "../../context/auth";
import { MsgProvider } from "../../context/infoMsg";
import AppSideBar from "./components/sidebar";
import "./global.css";
import { Navbar, NavbarBrand } from "flowbite-react";
import { HiMenuAlt1 } from "react-icons/hi";
import profilePic from "@/public/assets/1_1_gt.jpg";

export default function RootLayout({ children }) {
   const [isSidebarOpen, setIsSidebarOpen] = useState(
      typeof window !== "undefined" && window.innerWidth >= 1024 ? true : false
   );

   const toggleSidebar = () => {
      setIsSidebarOpen(!isSidebarOpen);
   };

   return (
      <html lang='pt-br'>
         <head>
            <title>1º/1º GT - FAT Control</title>
         </head>
         <body>
            <AuthProvider>
               <MsgProvider>
                  {/* Navbar fixa no topo */}
                  <Navbar
                     fluid
                     rounded
                     className='fixed top-0 left-0 w-full bg-gradient-to-r from-gray-200 to-gray-300 shadow-lg z-50'
                  >
                     <div className='flex items-center justify-between w-full'>
                        <div className='flex items-center'>
                           <HiMenuAlt1
                              className='size-8 mr-4 cursor-pointer text-red-600'
                              onClick={toggleSidebar}
                           />
                           <NavbarBrand>
                              <img
                                 src={profilePic.src}
                                 alt='Gordo logo'
                                 className='mr-3 h-8 sm:h-10 shadow-md'
                              />
                              <span className='self-center  whitespace-nowrap text-xl font-bold text-gray-800'>
                                 FAT
                                 <span className='text-red-600'>CONTROL</span>
                              </span>
                           </NavbarBrand>
                        </div>
                     </div>
                  </Navbar>

                  {/* Layout principal */}
                  <div className='flex h-screen pt-16 bg-gray-50'>
                     {/* Sidebar Responsiva */}
                     <div className='fixed md:relative h-full z-40'>
                        <AppSideBar
                           openBar={isSidebarOpen}
                           setOpenBar={setIsSidebarOpen}
                        />
                     </div>
                     <main className='px-4 mt-6 ml-0 w-full'>
                        {children}
                     </main>
                  </div>
               </MsgProvider>
            </AuthProvider>
         </body>
      </html>
   );
}
