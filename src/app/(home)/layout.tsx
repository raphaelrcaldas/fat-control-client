"use client";

import { useState } from "react";
import AppSideBar from "./components/sidebar";
import { Navbar, NavbarBrand } from "flowbite-react";
import Providers from "./context/providers";
import { HiMenuAlt1 } from "react-icons/hi";
import profilePic from "public/assets/1_1_gt.jpg";

interface RootLayoutProps {
   children: React.ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
   const [IsCollapsed, setIsCollapsed] = useState(false);

   function handleClose() {
      setIsCollapsed(!IsCollapsed);
   }

   return (
      <Providers>
         <Navbar
            fluid
            rounded
            className='fixed top-0 left-0 w-full bg-gradient-to-r from-white to-red-100 shadow-lg z-50'
         >
            <div className='flex items-center justify-between w-full'>
               <div className='flex items-center'>
                  <HiMenuAlt1
                     className='size-8 mr-4 cursor-pointer text-red-600'
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

         <div className='flex h-full w-full pt-14'>
            <div className='fixed lg:relative w-fit h-full z-40'>
               <AppSideBar
                  isCollapsed={IsCollapsed}
                  setIsCollapsed={setIsCollapsed}
               />
            </div>
            <main className='p-2 h-full w-full overflow-auto'>{children}</main>
         </div>
      </Providers>
   );
}
