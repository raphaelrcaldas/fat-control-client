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
