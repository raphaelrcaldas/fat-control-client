import clsx from "clsx";
import { formatSaram } from "@/constants";
import { ComissWithMiss } from "services/routes/cegep/comiss";
import { spineColor } from "../../comissDerivacoes";
import { StatusComissChip, TipoComissChip } from "../comissChips";

/**
 * Identidade do militar do comissionamento — card independente, exibido logo
 * abaixo da barra de comando do detalhe.
 *
 * Carrega a espinha e os chips da listagem: quem chega aqui vindo da lista
 * reencontra a mesma marca de estado, e situação e tipo passam a ser legíveis
 * no topo, sem descer até a seção de Classificação.
 */
export function ComissMilitarCard({ comiss }: { comiss: ComissWithMiss }) {
   const { user } = comiss;

   return (
      <div
         className={clsx(
            "flex flex-wrap items-center justify-between gap-x-4 gap-y-2 rounded border border-l-4 border-slate-200 bg-white px-4 py-3 shadow-sm",
            spineColor(comiss)
         )}
      >
         <div className="min-w-0 flex-1">
            <h2 className="truncate text-base font-bold tracking-wide text-slate-900 uppercase sm:text-lg">
               {user.posto.mid} {user.nome_guerra}
            </h2>
            <p className="truncate text-sm text-slate-600 capitalize">
               {user.nome_completo} ({formatSaram(user.saram)})
            </p>
         </div>

         <div className="flex shrink-0 items-center gap-2">
            <TipoComissChip periodo={!!comiss.dias_cumprir} />
            <StatusComissChip status={comiss.status} />
         </div>
      </div>
   );
}
