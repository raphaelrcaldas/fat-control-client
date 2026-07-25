export {
   getDateStatus,
   getStatusConfig,
   formatDate,
   getDaysRemaining,
} from "@/utils/dateStatus";
export type { DateStatus } from "@/utils/dateStatus";

import { getDateStatus } from "@/utils/dateStatus";
import type { UserCartaoSaude } from "services/routes/aeromedica/cartoesSaude";
import type { DateStatus } from "@/utils/dateStatus";

export function getCemalStatus(item: UserCartaoSaude): DateStatus {
   return getDateStatus(item.cartao?.cemal);
}

const SEVERITY: Record<DateStatus, number> = {
   expired: 4,
   critical: 3,
   warning: 2,
   valid: 1,
   empty: 0,
};

// Pior status entre as datas PREENCHIDAS do militar — é o que o farol da
// linha resume e o que o filtro de status seleciona.
// Datas em branco ficam de fora da conta de propósito: TOVN/IMAE só valem
// para tripulante, e deixar o "sem data" vencer apagaria o verde de quem
// está regular em tudo que preencheu.
export function getWorstStatus(item: UserCartaoSaude): DateStatus {
   const c = item.cartao;
   const preenchidos = [c?.cemal, c?.tovn, c?.imae]
      .map(getDateStatus)
      .filter((s) => s !== "empty");

   if (preenchidos.length === 0) return "empty";

   return preenchidos.reduce((pior, s) =>
      SEVERITY[s] > SEVERITY[pior] ? s : pior
   );
}
