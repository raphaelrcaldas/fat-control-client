/**
 * Aviso (não-bloqueante) sobre o histórico de promoções:
 * - sem registros: incentiva o cadastro do histórico de carreira;
 * - com registros divergentes: alerta que p_g/ult_promo não conferem.
 */

import { HiExclamation, HiInformationCircle } from "react-icons/hi";
import type { UserFull } from "services/routes/users";
import { formatDateFull } from "utils/dateHandler";
import { postoGradRecords } from "@/constants/militar/postos";
import { useUserPromos } from "@/hooks/queries";

export function PromoHistoryNotice({
   user,
   userId,
}: {
   user: UserFull;
   userId: number;
}) {
   const {
      data: promosData,
      isLoading,
      isError,
      isFetching,
      refetch,
   } = useUserPromos(userId);

   // Sem skeleton de propósito: o aviso é condicional (na maioria dos
   // cadastros nem aparece), e reservar espaço deixaria um vão em branco.
   if (isLoading) return null;

   // Falha sem histórico: dizer "Nenhuma promoção registrada" seria mentira.
   if (!promosData) {
      if (!isError) return null;
      return (
         <p
            role="status"
            className="flex items-center gap-2 rounded border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs text-slate-500"
         >
            <span className="min-w-0 flex-1 truncate">
               Não foi possível verificar o histórico de promoções
            </span>
            <button
               type="button"
               onClick={() => refetch()}
               disabled={isFetching}
               className="min-h-[24px] shrink-0 font-semibold text-slate-900 underline underline-offset-2 disabled:opacity-50"
            >
               Tentar novamente
            </button>
         </p>
      );
   }

   const promos = promosData;

   if (promos.length === 0) {
      return (
         <div className="flex items-start gap-3 rounded border border-sky-200 bg-sky-50 px-4 py-3">
            <HiInformationCircle className="mt-0.5 h-5 w-5 shrink-0 text-sky-500" />
            <div className="min-w-0 text-sm text-sky-800">
               <p className="font-semibold">Nenhuma promoção registrada</p>
               <p className="mt-1 text-sky-700">
                  Este militar ainda não possui histórico de progressão de
                  carreira. Registre as promoções na aba{" "}
                  <span className="font-semibold">Promoções</span> para manter a
                  antiguidade e os cálculos do sistema consistentes.
               </p>
            </div>
         </div>
      );
   }

   const latest = promos[0]; // já ordenado por data_promo desc
   const pgMismatch = user.p_g !== latest.p_g;
   const dateMismatch =
      (user.ult_promo || null) !== (latest.data_promo || null);

   if (!pgMismatch && !dateMismatch) return null;

   const latestPostoLabel =
      postoGradRecords.find((p) => p.short === latest.p_g)?.mid || latest.p_g;

   return (
      <div className="flex items-start gap-3 rounded border border-amber-300 bg-amber-50 px-4 py-3">
         <HiExclamation className="mt-0.5 h-5 w-5 shrink-0 text-amber-500" />
         <div className="min-w-0 text-sm text-amber-800">
            <p className="font-semibold">
               Cadastro divergente do histórico de promoções
            </p>
            <ul className="mt-1 list-inside list-disc space-y-0.5 text-amber-700">
               {pgMismatch && (
                  <li>
                     Posto/Graduação atual difere da última promoção registrada
                     ({latestPostoLabel.toUpperCase()}).
                  </li>
               )}
               {dateMismatch && (
                  <li>
                     Última Promoção não confere com a data do histórico (
                     {formatDateFull(latest.data_promo)}).
                  </li>
               )}
            </ul>
         </div>
      </div>
   );
}
