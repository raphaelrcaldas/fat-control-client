import { AuthProvider } from "./auth";
import { ToastProvider } from "./toast";
import { FlowbiteThemeProvider } from "./theme";

export default function Providers({ children }) {
   return (
      <FlowbiteThemeProvider>
         <AuthProvider>
            <ToastProvider>{children}</ToastProvider>
         </AuthProvider>
      </FlowbiteThemeProvider>
   );
}
