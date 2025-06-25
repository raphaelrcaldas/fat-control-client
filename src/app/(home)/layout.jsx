"use client";

import "./global.css";
import { useState, useEffect } from "react";
import AppSideBar from "./components/sidebar";
import Providers from "../../context/providers";
import { Navbar, NavbarBrand } from "flowbite-react";
import { HiMenuAlt1 } from "react-icons/hi";
import profilePic from "@/public/assets/1_1_gt.jpg";

export default function RootLayout({ children }) {
   const [IsCollapsed, setIsCollapsed] = useState(false);
   const [alwaysOpen, setAlwaysOpen] = useState(true);

   function handleClose() {
      setIsCollapsed(!IsCollapsed);
   }

   useEffect(() => {
      typeof window !== "undefined" && window.innerWidth >= 1024
         ? setIsCollapsed(false)
         : setIsCollapsed(true);

      typeof window !== "undefined" && window.innerWidth >= 1024
         ? setAlwaysOpen(true)
         : setAlwaysOpen(false);

      const handleResize = () => {
         setAlwaysOpen(window.innerWidth >= 1024 ? true : false);
      };

      window.addEventListener("resize", handleResize);
      return () => window.removeEventListener("resize", handleResize);
   }, []);

   return (
      <html lang='pt-br'>
         <head>
            <title>FATCONTROL</title>
         </head>
         <body>
            <Providers>
               {/* Navbar fixa no topo */}
               <Navbar
                  fluid
                  rounded
                  className='fixed top-0 left-0 w-full bg-gradient-to-r from-gray-200 to-gray-300 shadow-lg z-50'
               >
                  <div className='flex items-center justify-between w-full'>
                     <div className='flex items-center'>
                        <HiMenuAlt1
                           className='size-8 mr-4 cursor-pointer text-red-600 lg:hidden'
                           onClick={handleClose}
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

               {/*Overlay */}
               {!IsCollapsed && !alwaysOpen && (
                  <div className='fixed inset-0 bg-black bg-opacity-50 z-40' />
               )}

               {/* Layout principal */}
               <div className='flex h-screen pt-12 w-full bg-gray-50'>
                  {/* Sidebar Responsiva */}
                  <div className='fixed lg:relative w-fit h-full z-40'>
                     <AppSideBar
                        isCollapsed={IsCollapsed}
                        setIsCollapsed={setIsCollapsed}
                        alwaysOpen={alwaysOpen}
                     />
                  </div>
                  <main className='p-4 pb-6 mt-6 ml-0 w-full h-full overflow-y-auto'>
                     {children}
                  </main>
               </div>
            </Providers>
         </body>
      </html>
   );
}
