"use client";

import { useEffect, useState } from "react";

interface PageTransitionProps {
   children: React.ReactNode;
}

export default function PageTransition({ children }: PageTransitionProps) {
   const [isVisible, setIsVisible] = useState(false);

   useEffect(() => {
      // Start invisible
      setIsVisible(false);

      // Trigger animation after mounting
      const timer = setTimeout(() => {
         setIsVisible(true);
      }, 50);

      return () => clearTimeout(timer);
   }, [children]);

   return (
      <div
         className={`h-full w-full transition-all duration-700 ease-out transform ${
            isVisible
               ? "translate-y-0 opacity-100"
               : "translate-y-4 opacity-0"
         }`}
      >
         {children}
      </div>
   );
}
