import type { OrgBrand } from "@/lib/orgBrand";
import { ToastProvider } from "./toast";
import { FlowbiteThemeProvider } from "./theme";
import { OrgBrandProvider } from "./orgBrand";
import { QueryProvider } from "./queryProvider";

interface ProvidersProps {
   orgBrand: OrgBrand;
   children: React.ReactNode;
}

export default function Providers({ orgBrand, children }: ProvidersProps) {
   return (
      <QueryProvider>
         <FlowbiteThemeProvider>
            <OrgBrandProvider brand={orgBrand}>
               <ToastProvider>{children}</ToastProvider>
            </OrgBrandProvider>
         </FlowbiteThemeProvider>
      </QueryProvider>
   );
}
