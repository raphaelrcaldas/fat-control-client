"use client";
import { useEffect, useState } from "react";

function computeDaysToShow(width: number): number {
   if (width >= 1920) return 11;
   if (width >= 768) return 7;
   return 3;
}

export function useDaysToShow(): number {
   const [daysToShow, setDaysToShow] = useState(7);

   useEffect(() => {
      const update = () => setDaysToShow(computeDaysToShow(window.innerWidth));
      update();
      window.addEventListener("resize", update);
      return () => window.removeEventListener("resize", update);
   }, []);

   return daysToShow;
}
