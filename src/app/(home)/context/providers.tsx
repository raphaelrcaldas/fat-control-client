import { SeboProvider } from "./sebo";
import { IndispProvider } from "./indisp";
import { QuadsProvider } from "./quads";

export default function Providers({ children }) {
   return (
      <IndispProvider>
         <QuadsProvider>
            <SeboProvider>{children}</SeboProvider>
         </QuadsProvider>
      </IndispProvider>
   );
}
