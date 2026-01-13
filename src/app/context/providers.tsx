import { AuthProvider } from "./auth";
import { ToastProvider } from "./toast";
import { FlowbiteThemeProvider } from "./theme";
import { QueryProvider } from "./queryProvider";

export default function Providers({ children }) {
   return (
      <QueryProvider>
         <FlowbiteThemeProvider>
            <AuthProvider>
               <ToastProvider>{children}</ToastProvider>
            </AuthProvider>
         </FlowbiteThemeProvider>
      </QueryProvider>
   );
}
