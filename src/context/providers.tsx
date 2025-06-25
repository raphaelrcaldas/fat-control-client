import { AuthProvider } from "./auth";
import { SelectProvider } from "./select";

export default function Providers({children}){

    return (
        <AuthProvider>
            <SelectProvider>
                {children}
            </SelectProvider>
        </AuthProvider>
    )
}