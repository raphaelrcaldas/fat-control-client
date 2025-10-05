import { AuthProvider } from "./auth";
import { ToastProvider } from "./toast";

export default function Providers({ children }) {
   return (
      <AuthProvider>
         <ToastProvider>{children}</ToastProvider>
      </AuthProvider>
   );
}
