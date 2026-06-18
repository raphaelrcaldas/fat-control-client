import { formatSaram } from "@/constants";
import { ComissWithMiss } from "services/routes/cegep/comiss";

/**
 * Identidade do militar do comissionamento — card independente, exibido logo
 * abaixo da barra de comando do detalhe.
 */
export function ComissMilitarCard({ comiss }: { comiss: ComissWithMiss }) {
   const { user } = comiss;

   return (
      <div className="rounded border border-slate-200 bg-white px-4 py-3 text-center shadow-sm">
         <h2 className="truncate text-base font-bold tracking-wide text-slate-900 uppercase sm:text-lg">
            {user.posto.mid} {user.nome_guerra}
         </h2>
         <p className="truncate text-sm text-slate-600 capitalize">
            {user.nome_completo} ({formatSaram(user.saram)})
         </p>
      </div>
   );
}
