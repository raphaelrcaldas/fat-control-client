import type { TripCartoesOut } from "services/routes/instrucao/cartoes";
import type { CartaoStatus } from "../types";
import { DOC_FIELDS, SEVERIDADES } from "../cartoes.config";
import { getCartaoStatus } from "./cartaoStatus";

export interface DocStats {
   counts: Record<CartaoStatus, number>;
   /** Pilotos com a data lançada. */
   total: number;
   /** Efetivo inteiro — `total` + os sem data; denominador das barras. */
   efetivo: number;
}

/** Recorte da lista por UM documento e UM status — o contador clicado. */
export interface CartaoFiltro {
   doc: string;
   status: CartaoStatus;
}

/**
 * Contagem por documento sobre a lista inteira (antes do recorte): senão o
 * número que gerou o clique sumiria ao clicar. `efetivo` é o denominador comum
 * das barras, para que sejam comparáveis entre documentos.
 */
export function computeDocStats(
   pilotos: TripCartoesOut[]
): Record<string, DocStats> {
   const stats: Record<string, DocStats> = {};
   for (const f of DOC_FIELDS) {
      const counts = { danger: 0, warn: 0, ok: 0, empty: 0 };
      for (const p of pilotos) counts[getCartaoStatus(f.validade(p.cartao))]++;
      stats[f.key] = {
         counts,
         total: pilotos.length - counts.empty,
         efetivo: pilotos.length,
      };
   }
   return stats;
}

/** Lê `?doc=&status=` e só aceita o par completo e conhecido. */
export function parseFiltro(
   doc: string | null,
   status: string | null
): CartaoFiltro | null {
   if (!doc || !status) return null;
   if (!DOC_FIELDS.some((f) => f.key === doc)) return null;
   if (!SEVERIDADES.includes(status as CartaoStatus)) return null;
   return { doc, status: status as CartaoStatus };
}

export function applyFiltro(
   pilotos: TripCartoesOut[],
   filtro: CartaoFiltro | null
): TripCartoesOut[] {
   if (!filtro) return pilotos;
   const doc = DOC_FIELDS.find((f) => f.key === filtro.doc);
   if (!doc) return pilotos;
   return pilotos.filter(
      (p) => getCartaoStatus(doc.validade(p.cartao)) === filtro.status
   );
}
