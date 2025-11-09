"use client";

import { HiMenuAlt1 } from "react-icons/hi";
import { MdClose } from "react-icons/md";
import Image from "next/image";
import profilePic from "public/assets/1_1_gt.jpg";

interface NavbarProps {
   user: string;
   onToggleSidebar: () => void;
   isSidebarOpen: boolean;
}

export default function Navbar({
   onToggleSidebar,
   isSidebarOpen,
}: NavbarProps) {
   return (
      <nav className='fixed top-0 left-0 right-0 h-16 bg-gradient-to-r from-white to-red-100 shadow-lg z-50 flex items-center justify-between px-4'>
         <div className='flex items-center gap-3'>
            {/* Botão menu */}
            <button
               onClick={onToggleSidebar}
               className='p-2 rounded-lg hover:bg-red-100 transition-colors focus:outline-none'
               aria-label={isSidebarOpen ? "Fechar menu" : "Abrir menu"}
            >
               {isSidebarOpen ? (
                  <MdClose className='w-7 h-7 text-red-600' />
               ) : (
                  <HiMenuAlt1 className='w-7 h-7 text-red-600' />
               )}
            </button>

            {/* Logo */}
            <div className='flex items-center gap-2'>
               <Image
                  src={profilePic}
                  alt='Gordo logo'
                  className='h-10 w-8 rounded shadow-md object-cover'
               />
               <span className='font-bold text-gray-800 text-2xl block'>
                  FAT<span className='text-red-600'>CONTROL</span>
               </span>
            </div>
         </div>
      </nav>
   );
}
