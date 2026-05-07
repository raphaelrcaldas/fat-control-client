import { ToastProvider } from "./toast";
import { FlowbiteThemeProvider } from "./theme";
import { QueryProvider } from "./queryProvider";

export default function Providers({ children }) {
   return (
      <QueryProvider>
         <FlowbiteThemeProvider>
            <ToastProvider>{children}</ToastProvider>
         </FlowbiteThemeProvider>
      </QueryProvider>
   );
}
