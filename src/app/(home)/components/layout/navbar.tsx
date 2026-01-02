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
      <nav className="fixed top-0 right-0 left-0 z-50 flex h-16 items-center justify-between bg-linear-to-r from-white to-red-100 px-4 shadow-lg">
         <div className="flex items-center gap-3">
            {/* Botão menu */}
            <button
               onClick={onToggleSidebar}
               className="rounded-lg p-2 transition-colors hover:bg-red-100 focus:outline-none"
               aria-label={isSidebarOpen ? "Fechar menu" : "Abrir menu"}
            >
               {isSidebarOpen ? (
                  <MdClose className="h-7 w-7 text-red-600" />
               ) : (
                  <HiMenuAlt1 className="h-7 w-7 text-red-600" />
               )}
            </button>

            {/* Logo */}
            <div className="flex items-center gap-2">
               <Image
                  src={profilePic}
                  alt="Gordo logo"
                  className="h-10 w-8 rounded object-cover shadow-md"
               />
               <span className="block text-2xl font-bold text-gray-800">
                  FAT<span className="text-red-600">CONTROL</span>
               </span>
            </div>
         </div>
      </nav>
   );
}
