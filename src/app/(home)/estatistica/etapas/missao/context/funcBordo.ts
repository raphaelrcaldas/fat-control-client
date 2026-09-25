import type { FuncaoPosicao } from "services/routes/funcs";

import type { DraftAssignedTrip, DraftPoolTrip } from "./types";

/**
 * Posicao a bordo de quem entra numa funcao da etapa (arrasto do pool ou
 * busca inline).
 *
 * 1. Quem ja voou na missao na mesma funcao herda a posicao da etapa
 *    anterior; os demais ficam com a primeira posicao da funcao.
 * 2. Se ela ja estiver ocupada na funcao, vai para a proxima livre do MESMO
 *    tipo. Piloto tem varias titulares (1P, 2P, O3): o segundo piloto nasce
 *    2P em vez de repetir 1P, que a API recusa. Loadmaster tem uma titular
 *    so (LM): o segundo continua LM — nao vira instrutor (IG).
 * 3. Sem posicao livre do tipo, fica a escolhida.
 *
 * O "mesmo tipo" vem do catalogo, nao de uma lista de posicoes de piloto.
 */
export function escolherFuncBordo({
   func,
   posicoes,
   fallback,
   anterior,
   atribuidos,
}: {
   func: string;
   posicoes: FuncaoPosicao[];
   /** Posicao quando a funcao nao tem catalogo (`defaultBordo`). */
   fallback: string;
   anterior?: DraftPoolTrip;
   atribuidos: DraftAssignedTrip[];
}): string {
   if (posicoes.length === 0) return fallback;

   const herdada =
      anterior?.lastFunc === func &&
      posicoes.some((p) => p.cod === anterior.lastFuncBordo)
         ? anterior.lastFuncBordo!
         : null;
   const escolhida = herdada ?? posicoes[0].cod;

   const ocupadas = new Set(
      atribuidos.filter((t) => t.func === func).map((t) => t.funcBordo)
   );
   if (!ocupadas.has(escolhida)) return escolhida;

   const tipo = posicoes.find((p) => p.cod === escolhida)?.tipo;
   const livre = posicoes.find((p) => p.tipo === tipo && !ocupadas.has(p.cod));
   return livre?.cod ?? escolhida;
}
