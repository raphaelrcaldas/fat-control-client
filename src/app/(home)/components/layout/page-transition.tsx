"use client";

import { useEffect, useState } from "react";

interface PageTransitionProps {
   children: React.ReactNode;
}

export default function PageTransition({ children }: PageTransitionProps) {
   const [isVisible, setIsVisible] = useState(false);

   useEffect(() => {
      const timer = setTimeout(() => {
         setIsVisible(true);
      }, 50);

      return () => clearTimeout(timer);
   }, []);

   return (
      <div
         className={`flex min-h-full w-full flex-col transition-all duration-700 ease-out ${
            isVisible ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
         }`}
      >
         {children}
      </div>
   );
}
