import type { UserPublic } from "services/routes/users";
import { type LinhaDraft, newLocalId } from "./draftReducer";

/** Quantidades default de ajuda de custo (abertura leva 2, fechamento 1). */
export const QTD_AB_PADRAO = 2;
export const QTD_FC_PADRAO = 1;

/**
 * Linha nova pré-preenchida com o que o planejador quase sempre confirmaria:
 * base = remuneração cadastrada do militar nas duas pernas, 2 ajudas na
 * abertura e 1 no fechamento, abertura e fechamento no exercício da proposta.
 * Tudo editável no modal — isto é chute informado, não regra.
 *
 * `base` chega pronta (e não a remuneração crua) porque quem sabe se o valor
 * pôde ser buscado é a página: militar sem remuneração cadastrada — ou
 * planejador sem permissão para vê-la — nasce com 0 e o modal cobra o valor.
 */
export function novaLinhaDefaults(
   user: UserPublic,
   base: number,
   anoRef: number
): LinhaDraft {
   return {
      id: null,
      localId: newLocalId(),
      user_id: user.id,
      user,
      base_ab: base,
      qtd_ab: QTD_AB_PADRAO,
      ano_ab: anoRef,
      base_fc: base,
      qtd_fc: QTD_FC_PADRAO,
      ano_fc: anoRef,
   };
}
