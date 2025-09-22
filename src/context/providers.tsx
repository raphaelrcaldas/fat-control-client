import { AuthProvider } from "./auth";
import { SelectProvider } from "./select";
import { ToastProvider } from "./toast";

export default function Providers({children}){

    return (
        <AuthProvider>
            <SelectProvider>
                <ToastProvider>
                    {children}
                </ToastProvider>
            </SelectProvider>
        </AuthProvider>
    )
}