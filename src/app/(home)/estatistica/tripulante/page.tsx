import { Suspense } from "react";
import { TripulantePage } from "./components/TripulantePage";

export default function Page() {
   return (
      <Suspense fallback={null}>
         <TripulantePage />
      </Suspense>
   );
}
